import {
  AfterViewInit, Component, ElementRef, inject, NgZone,
  OnDestroy, OnInit, signal, ViewChild,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SeoService } from '../../shared/seo/seo.service';

// ── Data interfaces ────────────────────────────────────────────────────────────
interface ContribDay { contributionCount: number; date: string; }
interface Repo {
  name: string;
  description: string | null;
  url: string;
  primaryLanguage: { name: string; color: string } | null;
  defaultBranchRef: { target: { history: { totalCount: number } } } | null;
  updatedAt: string;
}
interface GitHubData {
  contributionsCollection: {
    contributionCalendar: { totalContributions: number; weeks: Array<{ contributionDays: ContribDay[] }> };
  };
  repositories: { nodes: Repo[] };
}

// ── Language → color ───────────────────────────────────────────────────────────
const LANG_COLOR: Record<string, number> = {
  TypeScript: 0x4a9eff, JavaScript: 0xf1e05a, HTML: 0xe34c26,
  CSS: 0x8844cc, SCSS: 0xc6538c, Python: 0x4b8bbe,
  Rust: 0xdea584, Go: 0x00add8, Shell: 0x89e051,
};
const DEFAULT_COLOR = 0x7c3aed;

// ── Sun GLSL shaders ───────────────────────────────────────────────────────────
const SUN_VERT = /* glsl */`
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SUN_FRAG = /* glsl */`
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;

  vec3 mod289v3(vec3 x){return x-floor(x*(1./289.))*289.;}
  vec2 mod289v2(vec2 x){return x-floor(x*(1./289.))*289.;}
  vec3 permute3(vec3 x){return mod289v3(((x*34.)+1.)*x);}

  float snoise(vec2 v){
    const vec4 C=vec4(.211324865,.366025404,-.577350269,.024390244);
    vec2 i=floor(v+dot(v,C.yy));
    vec2 x0=v-i+dot(i,C.xx);
    vec2 i1=(x0.x>x0.y)?vec2(1,0):vec2(0,1);
    vec4 x12=x0.xyxy+C.xxzz;
    x12.xy-=i1;
    i=mod289v2(i);
    vec3 p=permute3(permute3(i.y+vec3(0,i1.y,1))+i.x+vec3(0,i1.x,1));
    vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);
    m=m*m; m=m*m;
    vec3 xn=2.*fract(p*C.www)-1.;
    vec3 h=abs(xn)-.5;
    vec3 a0=xn-floor(xn+.5);
    m*=1.79284291-.85373472*(a0*a0+h*h);
    vec3 g;
    g.x=a0.x*x0.x+h.x*x0.y;
    g.yz=a0.yz*x12.xz+h.yz*x12.yw;
    return 130.*dot(m,g);
  }

  void main(){
    vec2 uv = vUv * 3.0;
    float n  = snoise(uv + uTime * 0.12);
    n += 0.5  * snoise(uv * 2.1 - uTime * 0.25);
    n += 0.25 * snoise(uv * 4.3 + uTime * 0.40);
    n = (n / 1.75 + 1.0) * 0.5;

    vec3 hot  = vec3(1.00, 0.98, 0.55);
    vec3 mid  = vec3(1.00, 0.65, 0.05);
    vec3 cool = vec3(0.95, 0.22, 0.00);
    vec3 col  = mix(cool, mid,  smoothstep(0.0, 0.5, n));
    col       = mix(col,  hot,  smoothstep(0.5, 1.0, n));

    float fresnel = 1.0 - max(dot(vNormal, vec3(0,0,1)), 0.0);
    col = mix(col, hot, 0.25 * fresnel);

    gl_FragColor = vec4(col, 1.0);
  }
`;

// ── Component ──────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-lab',
  imports: [DecimalPipe],
  templateUrl: './lab.html',
  styleUrl: './lab.scss',
})
export class LabComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas') private canvasRef!: ElementRef<HTMLCanvasElement>;

  private seo  = inject(SeoService);
  private http = inject(HttpClient);
  private zone = inject(NgZone);

  loading = signal(true);
  error   = signal<string | null>(null);
  total   = signal(0);
  repoCount = signal(0);
  hovered = signal<{ name: string; lang: string; commits: number; updated: string } | null>(null);
  tipPos  = signal({ x: 0, y: 0 });

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private composer!: EffectComposer;
  private clock = new THREE.Clock();
  private sunMat!: THREE.ShaderMaterial;
  private animId = 0;

  private planets: Array<{
    pivot: THREE.Object3D;
    mesh: THREE.Mesh;
    speed: number;
    data: { name: string; lang: string; commits: number; updated: string; url: string };
  }> = [];

  private raycaster = new THREE.Raycaster();
  private mouseNdc  = new THREE.Vector2(-999, -999);
  private introStart = 0;
  private lastHoveredName = '';

  private readonly INTRO_DUR  = 4.0;
  private readonly CAM_FROM   = new THREE.Vector3(0, 2.5, 7);
  private readonly CAM_TO     = new THREE.Vector3(0, 24, 48);

  ngOnInit() {
    const base = 'https://localhousedesigns.netlify.app';
    this.seo.setPage({
      title: 'Lab | Localhouse Designs — Commit Solar System',
      description: 'GitHub contribution history rendered as a live 3D solar system. Each repo is a planet. Built with Three.js WebGL.',
      url: `${base}/lab`,
    });
  }

  ngAfterViewInit() {
    this.initRenderer();
    window.addEventListener('mousemove', this.onMouse);
    window.addEventListener('resize', this.onResize);

    this.http.get<GitHubData>('/.netlify/functions/github-stats').subscribe({
      next: data => {
        this.buildScene(data);
        this.zone.run(() => {
          this.total.set(data.contributionsCollection.contributionCalendar.totalContributions);
          this.repoCount.set(data.repositories.nodes.length);
          this.loading.set(false);
        });
        this.introStart = this.clock.getElapsedTime();
        this.zone.runOutsideAngular(() => this.animate());
      },
      error: () => {
        this.zone.run(() => {
          this.error.set('Could not load GitHub data. Is GITHUB_TOKEN set in Netlify environment variables?');
          this.loading.set(false);
        });
      },
    });
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animId);
    this.renderer?.dispose();
    window.removeEventListener('mousemove', this.onMouse);
    window.removeEventListener('resize', this.onResize);
  }

  handleClick() {
    this.raycaster.setFromCamera(this.mouseNdc, this.camera);
    const hits = this.raycaster.intersectObjects(this.planets.map(p => p.mesh));
    if (hits.length > 0) {
      const url = hits[0].object.userData['repoUrl'] as string;
      if (url) window.open(url, '_blank', 'noopener');
    }
  }

  // ── Renderer / camera / post-fx init ──────────────────────────────────────
  private initRenderer() {
    const canvas = this.canvasRef.nativeElement;
    const w = window.innerWidth, h = window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x02040a);
    this.scene.fog = new THREE.FogExp2(0x02040a, 0.004);

    this.camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 600);
    this.camera.position.copy(this.CAM_FROM);
    this.camera.lookAt(0, 0, 0);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enabled = false;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 4;
    this.controls.maxDistance = 130;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.15;

    // Post-processing
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 1.6, 0.6, 0.0);
    this.composer.addPass(bloom);
  }

  // ── Scene construction ─────────────────────────────────────────────────────
  private buildScene(data: GitHubData) {
    this.buildStars();
    this.buildSun();
    this.buildAsteroidBelt(data.contributionsCollection.contributionCalendar.weeks);
    this.buildPlanets(data.repositories.nodes);
  }

  private buildStars() {
    const count = 5000;
    const pos   = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 120 + Math.random() * 80;
      pos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i*3+2] = r * Math.cos(phi);
      sizes[i]   = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
      color: 0xffffff, size: 0.15, transparent: true, opacity: 0.75, sizeAttenuation: true,
    })));
  }

  private buildSun() {
    this.sunMat = new THREE.ShaderMaterial({
      vertexShader: SUN_VERT,
      fragmentShader: SUN_FRAG,
      uniforms: { uTime: { value: 0 } },
    });
    const sun = new THREE.Mesh(new THREE.SphereGeometry(1.5, 64, 64), this.sunMat);
    this.scene.add(sun);

    // Glow halos (BackSide spheres with additive blending)
    const halos: [number, number][] = [[1.9, 0.10], [2.6, 0.05], [3.6, 0.025]];
    for (const [scale, opacity] of halos) {
      this.scene.add(new THREE.Mesh(
        new THREE.SphereGeometry(scale, 32, 32),
        new THREE.MeshBasicMaterial({
          color: 0xff6600, transparent: true, opacity, side: THREE.BackSide, depthWrite: false,
        }),
      ));
    }

    // Light emitted from sun
    this.scene.add(new THREE.PointLight(0xfff0cc, 12, 0, 1.2));
    this.scene.add(new THREE.AmbientLight(0x0a1020, 1.0));
  }

  private buildAsteroidBelt(weeks: Array<{ contributionDays: ContribDay[] }>) {
    const positions: number[] = [];
    const colors:    number[] = [];
    const accent = new THREE.Color(0xff3c00);
    const dim    = new THREE.Color(0x1a1005);
    const INNER  = 4.8, OUTER = 6.2;

    weeks.forEach((week, wi) => {
      const baseAngle = (wi / 52) * Math.PI * 2;
      week.contributionDays.forEach(day => {
        if (!day.contributionCount) return;
        const particleCount = Math.min(day.contributionCount * 4, 50);
        for (let i = 0; i < particleCount; i++) {
          const r = INNER + Math.random() * (OUTER - INNER);
          const a = baseAngle + (Math.random() - 0.5) * 0.25;
          positions.push(
            Math.cos(a) * r,
            (Math.random() - 0.5) * 0.3,
            Math.sin(a) * r,
          );
          const t = Math.min(day.contributionCount / 12, 1);
          const c = dim.clone().lerp(accent, t);
          colors.push(c.r, c.g, c.b);
        }
      });
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(new Float32Array(colors), 3));
    this.scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.045, vertexColors: true, transparent: true, opacity: 0.8, sizeAttenuation: true, depthWrite: false,
    })));
  }

  private buildPlanets(repos: Repo[]) {
    const now        = Date.now();
    const allCommits = repos.map(r => r.defaultBranchRef?.target.history.totalCount ?? 0);
    const maxCommits = Math.max(...allCommits, 1);

    repos.slice(0, 18).forEach((repo, i) => {
      const commits   = repo.defaultBranchRef?.target.history.totalCount ?? 1;
      const langName  = repo.primaryLanguage?.name ?? '';
      const colHex    = LANG_COLOR[langName] ?? DEFAULT_COLOR;
      const radius    = 0.18 + (commits / maxCommits) * 0.60;
      const orbitR    = 8 + i * 3.2;
      const daysSince = (now - new Date(repo.updatedAt).getTime()) / 86_400_000;
      const speed     = Math.max(0.00015, 0.0028 / Math.pow(Math.max(daysSince, 1), 0.4));
      const startAngle = Math.random() * Math.PI * 2;

      // Orbit ring
      const ringPts: THREE.Vector3[] = [];
      for (let j = 0; j <= 128; j++) {
        const a = (j / 128) * Math.PI * 2;
        ringPts.push(new THREE.Vector3(Math.cos(a) * orbitR, 0, Math.sin(a) * orbitR));
      }
      this.scene.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(ringPts),
        new THREE.LineBasicMaterial({ color: 0x1a2a44, transparent: true, opacity: 0.35 }),
      ));

      // Planet mesh
      const mat = new THREE.MeshStandardMaterial({
        color: colHex, emissive: colHex, emissiveIntensity: 0.25,
        roughness: 0.65, metalness: 0.15,
      });
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 32), mat);
      mesh.userData['repoUrl'] = repo.url;

      const pivot = new THREE.Object3D();
      pivot.rotation.y = startAngle;
      mesh.position.set(orbitR, 0, 0);
      pivot.add(mesh);
      this.scene.add(pivot);

      this.planets.push({
        pivot, mesh, speed,
        data: {
          name:    repo.name,
          lang:    langName || 'Unknown',
          commits,
          updated: new Date(repo.updatedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          url:     repo.url,
        },
      });
    });
  }

  // ── Animation loop ─────────────────────────────────────────────────────────
  private animate = () => {
    this.animId = requestAnimationFrame(this.animate);
    const t = this.clock.getElapsedTime();

    // Camera intro pull-back
    const p = Math.min((t - this.introStart) / this.INTRO_DUR, 1);
    if (p < 1) {
      const ease = 1 - Math.pow(1 - p, 3);
      this.camera.position.lerpVectors(this.CAM_FROM, this.CAM_TO, ease);
      this.camera.lookAt(0, 0, 0);
    } else if (!this.controls.enabled) {
      this.controls.enabled = true;
    }

    // Sun shader
    if (this.sunMat) this.sunMat.uniforms['uTime'].value = t;

    // Orbit
    for (const planet of this.planets) {
      planet.pivot.rotation.y += planet.speed;
      planet.mesh.rotation.y  += 0.003;
    }

    this.controls.update();

    // Hover detection
    this.raycaster.setFromCamera(this.mouseNdc, this.camera);
    const hits = this.raycaster.intersectObjects(this.planets.map(p => p.mesh));
    if (hits.length > 0) {
      const planet = this.planets.find(pl => pl.mesh === hits[0].object);
      if (planet) {
        const wp = new THREE.Vector3();
        hits[0].object.getWorldPosition(wp);
        const sp = wp.clone().project(this.camera);
        const x  = (sp.x * 0.5 + 0.5) * window.innerWidth;
        const y  = (-sp.y * 0.5 + 0.5) * window.innerHeight;
        if (planet.data.name !== this.lastHoveredName) {
          this.lastHoveredName = planet.data.name;
          this.zone.run(() => this.hovered.set(planet.data));
        }
        this.zone.run(() => this.tipPos.set({ x, y }));
      }
    } else if (this.lastHoveredName) {
      this.lastHoveredName = '';
      this.zone.run(() => this.hovered.set(null));
    }

    this.composer.render();
  };

  private onMouse = (e: MouseEvent) => {
    this.mouseNdc.set(
      (e.clientX / window.innerWidth)  *  2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1,
    );
  };

  private onResize = () => {
    const w = window.innerWidth, h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
  };
}
