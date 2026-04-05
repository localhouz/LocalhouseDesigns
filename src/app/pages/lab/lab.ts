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

// ── Interfaces ─────────────────────────────────────────────────────────────────
interface ContribDay { contributionCount: number; date: string; }
interface Repo {
  name: string;
  description: string | null;
  url: string;
  openGraphImageUrl: string | null;
  usesCustomOpenGraphImage: boolean;
  primaryLanguage: { name: string; color: string } | null;
  defaultBranchRef: {
    target: {
      history: { totalCount: number };
      historyByWeek?: { nodes: Array<{ committedDate: string }> };
    }
  } | null;
  updatedAt: string;
  createdAt: string;
  diskUsage: number | null;
  issues: { totalCount: number };
  repositoryTopics: { nodes: Array<{ topic: { name: string } }> };
  languages: { edges: Array<{ size: number; node: { name: string; color: string } }>; totalSize: number } | null;
}
interface GitHubData {
  contributionsCollection: {
    contributionCalendar: { totalContributions: number; weeks: Array<{ contributionDays: ContribDay[] }> };
  };
  repositories: { nodes: Repo[] };
}
interface PlanetEntry {
  pivot: THREE.Object3D;
  mesh: THREE.Mesh;
  atmosphereMesh: THREE.Mesh;
  speed: number;
  orbitR: number;
  data: { name: string; lang: string; commits: number; updated: string; url: string; description: string };
}

// ── Language palette ───────────────────────────────────────────────────────────
const LANG_COLOR: Record<string, number> = {
  TypeScript: 0x4a9eff, JavaScript: 0xf1e05a, HTML: 0xe34c26,
  CSS: 0x8844cc, SCSS: 0xc6538c, Python: 0x4b8bbe,
  Rust: 0xdea584, Go: 0x00add8, Shell: 0x89e051,
};
const DEFAULT_COLOR = 0x7c3aed;

// ── Atmosphere color by language ───────────────────────────────────────────────
const ATMO_COLOR: Record<string, number> = {
  TypeScript: 0x2255aa, JavaScript: 0x998800, HTML: 0x882200,
  CSS: 0x551188, SCSS: 0x882266, Python: 0x224488,
  Rust: 0x886644, Go: 0x006688, Shell: 0x335522,
};

// ── Sun shaders ────────────────────────────────────────────────────────────────
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
    vec2 i=floor(v+dot(v,C.yy)); vec2 x0=v-i+dot(i,C.xx);
    vec2 i1=(x0.x>x0.y)?vec2(1,0):vec2(0,1);
    vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1; i=mod289v2(i);
    vec3 p=permute3(permute3(i.y+vec3(0,i1.y,1))+i.x+vec3(0,i1.x,1));
    vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);
    m=m*m; m=m*m; vec3 xn=2.*fract(p*C.www)-1.; vec3 h=abs(xn)-.5;
    vec3 a0=xn-floor(xn+.5); m*=1.79284291-.85373472*(a0*a0+h*h);
    vec3 g; g.x=a0.x*x0.x+h.x*x0.y; g.yz=a0.yz*x12.xz+h.yz*x12.yw;
    return 130.*dot(m,g);
  }
  void main(){
    vec2 uv=vUv*3.; float n=snoise(uv+uTime*.12);
    n+=.5*snoise(uv*2.1-uTime*.25); n+=.25*snoise(uv*4.3+uTime*.40);
    n=(n/1.75+1.)*.5;
    vec3 hot=vec3(1.,.98,.55),mid=vec3(1.,.65,.05),cool=vec3(.95,.22,0.);
    vec3 col=mix(cool,mid,smoothstep(0.,.5,n)); col=mix(col,hot,smoothstep(.5,1.,n));
    float fr=1.-max(dot(vNormal,vec3(0,0,1)),0.); col=mix(col,hot,.25*fr);
    gl_FragColor=vec4(col,1.);
  }
`;

// ── Procedural planet surface shader ──────────────────────────────────────────
const PLANET_VERT = /* glsl */`
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vWorldPos = (modelMatrix * vec4(position,1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }
`;
const PLANET_FRAG = /* glsl */`
  uniform float uTime;
  uniform vec3  uColor;
  uniform vec3  uColor2;
  uniform float uTurbulence;
  uniform vec3  uSunPos;
  varying vec2  vUv;
  varying vec3  vNormal;
  varying vec3  vWorldPos;

  vec3 mod289v3(vec3 x){return x-floor(x*(1./289.))*289.;}
  vec2 mod289v2(vec2 x){return x-floor(x*(1./289.))*289.;}
  vec3 permute3(vec3 x){return mod289v3(((x*34.)+1.)*x);}
  float snoise(vec2 v){
    const vec4 C=vec4(.211324865,.366025404,-.577350269,.024390244);
    vec2 i=floor(v+dot(v,C.yy)); vec2 x0=v-i+dot(i,C.xx);
    vec2 i1=(x0.x>x0.y)?vec2(1,0):vec2(0,1);
    vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1; i=mod289v2(i);
    vec3 p=permute3(permute3(i.y+vec3(0,i1.y,1))+i.x+vec3(0,i1.x,1));
    vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);
    m=m*m; m=m*m; vec3 xn=2.*fract(p*C.www)-1.; vec3 h=abs(xn)-.5;
    vec3 a0=xn-floor(xn+.5); m*=1.79284291-.85373472*(a0*a0+h*h);
    vec3 g; g.x=a0.x*x0.x+h.x*x0.y; g.yz=a0.yz*x12.xz+h.yz*x12.yw;
    return 130.*dot(m,g);
  }

  void main(){
    vec2 uv = vUv * 4.0;
    float n  = snoise(uv + uTime * uTurbulence * 0.04);
    n += 0.5  * snoise(uv * 2.0 - uTime * uTurbulence * 0.07);
    n += 0.25 * snoise(uv * 5.0 + uTime * uTurbulence * 0.12);
    n = (n / 1.75 + 1.0) * 0.5;

    vec3 col = mix(uColor, uColor2, smoothstep(0.35, 0.65, n));

    // Diffuse lighting from sun
    vec3 toSun = normalize(uSunPos - vWorldPos);
    float diff = max(dot(vNormal, toSun), 0.0) * 0.8 + 0.2;
    col *= diff;

    // Fresnel rim
    float fr = 1.0 - max(dot(vNormal, vec3(0,0,1)), 0.0);
    col = mix(col, uColor * 1.8, pow(fr, 3.5) * 0.6);

    gl_FragColor = vec4(col, 1.0);
  }
`;

// ── Atmosphere shader (rim glow) ───────────────────────────────────────────────
const ATMO_VERT = /* glsl */`
  varying vec3 vNormal;
  void main(){
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }
`;
const ATMO_FRAG = /* glsl */`
  uniform vec3 uColor;
  varying vec3 vNormal;
  void main(){
    float fr = 1.0 - abs(dot(vNormal, vec3(0,0,1)));
    float intensity = pow(fr, 2.0) * 0.9;
    gl_FragColor = vec4(uColor * intensity, intensity * 0.7);
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

  loading   = signal(true);
  error     = signal<string | null>(null);
  total     = signal(0);
  repoCount = signal(0);

  // Hover tooltip
  hovered = signal<{ name: string; lang: string; commits: number; updated: string; description: string } | null>(null);
  tipPos  = signal({ x: 0, y: 0 });

  // Fly-to focus panel
  focused = signal<{ name: string; lang: string; commits: number; updated: string; url: string; description: string } | null>(null);

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private composer!: EffectComposer;
  private clock     = new THREE.Clock();
  private sunMat!:    THREE.ShaderMaterial;
  private animId    = 0;
  private planets:    PlanetEntry[] = [];
  private planetShaders: THREE.ShaderMaterial[] = [];

  private raycaster      = new THREE.Raycaster();
  private mouseNdc       = new THREE.Vector2(-999, -999);
  private introStart     = 0;
  private lastHoveredName = '';
  private texLoader      = new THREE.TextureLoader();

  // Fly-to state
  private flyTarget:   THREE.Vector3 | null = null;
  private flyFrom:     THREE.Vector3 | null = null;
  private flyProgress  = 1.0;
  private isFocused    = false;
  private homeCamPos   = new THREE.Vector3(0, 24, 48);

  private readonly INTRO_DUR = 4.0;
  private readonly CAM_FROM  = new THREE.Vector3(0, 2.5, 7);

  ngOnInit() {
    const base = 'https://localhousedesigns.netlify.app';
    this.seo.setPage({
      title: 'Lab | Localhouse Designs — Commit Solar System',
      description: 'GitHub repos rendered as a live 3D solar system. Each planet is a real repo — texture sourced from the site preview. Built with Three.js WebGL.',
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
    if (this.isFocused) return;
    this.raycaster.setFromCamera(this.mouseNdc, this.camera);
    const hits = this.raycaster.intersectObjects(this.planets.map(p => p.mesh));
    if (!hits.length) return;

    const planet = this.planets.find(pl => pl.mesh === hits[0].object);
    if (!planet) return;

    // Fly to planet — position camera at 3× planet radius from surface
    const wp = new THREE.Vector3();
    planet.mesh.getWorldPosition(wp);
    const radius = (planet.mesh.geometry as THREE.SphereGeometry).parameters?.radius ?? 0.5;
    const dir = wp.clone().normalize(); // direction from sun to planet
    this.flyFrom     = this.camera.position.clone();
    this.flyTarget   = wp.clone().add(dir.multiplyScalar(radius * 3.5 + 2.5));
    this.flyProgress = 0;
    this.isFocused   = true;
    this.controls.enabled = false;

    this.zone.run(() => this.focused.set(planet.data));
  }

  closeFocus() {
    this.flyFrom     = this.camera.position.clone();
    this.flyTarget   = this.homeCamPos.clone();
    this.flyProgress = 0;
    this.isFocused   = false;
    this.zone.run(() => this.focused.set(null));
  }

  // ── Init ──────────────────────────────────────────────────────────────────────
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
    this.scene.fog = new THREE.FogExp2(0x02040a, 0.003);

    this.camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 600);
    this.camera.position.copy(this.CAM_FROM);
    this.camera.lookAt(0, 0, 0);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enabled = false;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 130;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.12;

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.composer.addPass(new UnrealBloomPass(new THREE.Vector2(w, h), 0.5, 0.3, 0.85));
  }

  // ── Scene ─────────────────────────────────────────────────────────────────────
  private buildScene(data: GitHubData) {
    this.buildNebula();
    this.buildStars();
    this.buildSun();
    this.buildAsteroidBelt(data.contributionsCollection.contributionCalendar.weeks);
    this.buildPlanets(data.repositories.nodes);
  }

  private buildNebula() {
    // Large dim spheres with additive blending to fake volumetric nebula
    const colors = [0x0a0535, 0x05102a, 0x150a30, 0x081818];
    const positions: [number,number,number,number][] = [
      [60, 30, -80, 55], [-70, -20, -60, 45], [40, -50, 60, 50], [-50, 40, 70, 40]
    ];
    positions.forEach(([x,y,z,r], i) => {
      const geo = new THREE.SphereGeometry(r, 16, 16);
      const mat = new THREE.MeshBasicMaterial({
        color: colors[i], transparent: true, opacity: 0.18,
        side: THREE.BackSide, depthWrite: false, blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      this.scene.add(mesh);
    });
  }

  private buildStars() {
    const count = 6000;
    const pos   = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 100 + Math.random() * 100;
      pos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i*3+2] = r * Math.cos(phi);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
      color: 0xffffff, size: 0.18, transparent: true, opacity: 0.7, sizeAttenuation: true,
    })));
  }

  private buildSun() {
    this.sunMat = new THREE.ShaderMaterial({
      vertexShader: SUN_VERT, fragmentShader: SUN_FRAG,
      uniforms: { uTime: { value: 0 } },
    });
    this.scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.5, 64, 64), this.sunMat));

    const halos: [number, number][] = [[1.9, 0.10], [2.6, 0.05], [3.6, 0.025]];
    for (const [scale, opacity] of halos) {
      this.scene.add(new THREE.Mesh(
        new THREE.SphereGeometry(scale, 32, 32),
        new THREE.MeshBasicMaterial({
          color: 0xff6600, transparent: true, opacity, side: THREE.BackSide, depthWrite: false,
        }),
      ));
    }
    this.scene.add(new THREE.PointLight(0xfff0cc, 4, 0, 1.5));
    this.scene.add(new THREE.AmbientLight(0x0a1020, 1.5));
  }

  private buildAsteroidBelt(weeks: Array<{ contributionDays: ContribDay[] }>) {
    const positions: number[] = [], colors: number[] = [];
    const accent = new THREE.Color(0xff3c00), dim = new THREE.Color(0x1a1005);
    const INNER = 4.2, OUTER = 5.4;

    weeks.forEach((week, wi) => {
      const baseAngle = (wi / 52) * Math.PI * 2;
      week.contributionDays.forEach(day => {
        if (!day.contributionCount) return;
        const pc = Math.min(day.contributionCount * 4, 50);
        for (let i = 0; i < pc; i++) {
          const r = INNER + Math.random() * (OUTER - INNER);
          const a = baseAngle + (Math.random() - 0.5) * 0.25;
          positions.push(Math.cos(a)*r, (Math.random()-.5)*.3, Math.sin(a)*r);
          const c = dim.clone().lerp(accent, Math.min(day.contributionCount/12, 1));
          colors.push(c.r, c.g, c.b);
        }
      });
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(new Float32Array(colors), 3));
    this.scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.04, vertexColors: true, transparent: true, opacity: 0.8, sizeAttenuation: true, depthWrite: false,
    })));
  }

  private buildPlanets(repos: Repo[]) {
    const now        = Date.now();
    const allCommits = repos.map(r => r.defaultBranchRef?.target.history.totalCount ?? 0);
    const maxCommits = Math.max(...allCommits, 1);

    repos.slice(0, 18).forEach((repo, i) => {
      const commits    = repo.defaultBranchRef?.target.history.totalCount ?? 1;
      const langName   = repo.primaryLanguage?.name ?? '';
      const colHex     = LANG_COLOR[langName] ?? DEFAULT_COLOR;
      const atmoHex    = ATMO_COLOR[langName] ?? 0x334488;
      const radius     = 0.22 + (commits / maxCommits) * 0.55;
      const orbitR     = 5.5 + i * 1.9;
      const daysSince  = (now - new Date(repo.updatedAt).getTime()) / 86_400_000;
      const ageDays    = (now - new Date(repo.createdAt).getTime()) / 86_400_000;
      const speed      = Math.max(0.00008, 0.0012 / Math.pow(Math.max(daysSince, 1), 0.4));
      const turbulence = Math.min(daysSince < 30 ? 2.0 : daysSince < 180 ? 1.0 : 0.3, 2.0);
      const startAngle = Math.random() * Math.PI * 2;

      // Orbit ring
      const ringPts: THREE.Vector3[] = [];
      for (let j = 0; j <= 128; j++) {
        const a = (j / 128) * Math.PI * 2;
        ringPts.push(new THREE.Vector3(Math.cos(a) * orbitR, 0, Math.sin(a) * orbitR));
      }
      this.scene.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(ringPts),
        new THREE.LineBasicMaterial({ color: 0x1a2a44, transparent: true, opacity: 0.3 }),
      ));

      // Planet mesh — texture if custom OG image, else procedural shader
      let planetMat: THREE.Material;

      if (repo.usesCustomOpenGraphImage && repo.openGraphImageUrl) {
        const tex = this.texLoader.load(repo.openGraphImageUrl);
        tex.colorSpace = THREE.SRGBColorSpace;
        planetMat = new THREE.MeshStandardMaterial({
          map: tex, roughness: 0.7, metalness: 0.1,
          emissiveMap: tex, emissive: new THREE.Color(0x111111),
        });
      } else {
        // Pick a second color — slightly darker/shifted version of primary
        const c1 = new THREE.Color(colHex);
        const c2 = c1.clone().offsetHSL(0.08, -0.2, -0.15);
        const weathering = Math.min(ageDays / 365, 1.0);
        const mat = new THREE.ShaderMaterial({
          vertexShader:   PLANET_VERT,
          fragmentShader: PLANET_FRAG,
          uniforms: {
            uTime:        { value: 0 },
            uColor:       { value: c1 },
            uColor2:      { value: c2.lerp(new THREE.Color(0x442211), weathering * 0.4) },
            uTurbulence:  { value: turbulence },
            uSunPos:      { value: new THREE.Vector3(0, 0, 0) },
          },
        });
        this.planetShaders.push(mat);
        planetMat = mat;
      }

      const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 48), planetMat);
      mesh.userData['repoUrl'] = repo.url;

      // Atmosphere glow
      const atmoMat = new THREE.ShaderMaterial({
        vertexShader: ATMO_VERT,
        fragmentShader: ATMO_FRAG,
        uniforms: { uColor: { value: new THREE.Color(atmoHex) } },
        transparent: true, side: THREE.BackSide, depthWrite: false,
        blending: THREE.NormalBlending,
      });
      const atmosphereMesh = new THREE.Mesh(
        new THREE.SphereGeometry(radius * 1.08, 32, 32), atmoMat,
      );

      const pivot = new THREE.Object3D();
      pivot.rotation.y = startAngle;
      mesh.position.set(orbitR, 0, 0);
      atmosphereMesh.position.set(orbitR, 0, 0);
      pivot.add(mesh);
      pivot.add(atmosphereMesh);
      this.scene.add(pivot);

      this.planets.push({
        pivot, mesh, atmosphereMesh, speed, orbitR,
        data: {
          name:        repo.name,
          lang:        langName || 'Unknown',
          commits,
          updated:     new Date(repo.updatedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          url:         repo.url,
          description: repo.description ?? '',
        },
      });
    });
  }

  // ── Animation ─────────────────────────────────────────────────────────────────
  private animate = () => {
    this.animId = requestAnimationFrame(this.animate);
    const t = this.clock.getElapsedTime();

    // Intro pull-back
    const introP = Math.min((t - this.introStart) / this.INTRO_DUR, 1);
    if (introP < 1) {
      const ease = 1 - Math.pow(1 - introP, 3);
      this.camera.position.lerpVectors(this.CAM_FROM, this.homeCamPos, ease);
      this.camera.lookAt(0, 0, 0);
    } else if (!this.isFocused && !this.controls.enabled) {
      this.controls.enabled = true;
    }

    // Fly-to animation
    if (this.flyTarget && this.flyFrom && this.flyProgress < 1) {
      this.flyProgress = Math.min(this.flyProgress + 0.012, 1);
      const ease = 1 - Math.pow(1 - this.flyProgress, 4);
      this.camera.position.lerpVectors(this.flyFrom, this.flyTarget, ease);
      this.camera.lookAt(0, 0, 0);
      if (this.flyProgress >= 1 && !this.isFocused) {
        this.controls.enabled = true;
      }
    }

    // Sun
    if (this.sunMat) this.sunMat.uniforms['uTime'].value = t;

    // Planet shaders
    for (const mat of this.planetShaders) {
      mat.uniforms['uTime'].value = t;
    }

    // Orbits (pause when focused on a planet)
    if (!this.isFocused) {
      for (const planet of this.planets) {
        planet.pivot.rotation.y += planet.speed;
        planet.mesh.rotation.y  += 0.002;
        planet.atmosphereMesh.rotation.y += 0.002;
      }
    }

    this.controls.update();

    // Hover
    if (!this.isFocused) {
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
    }

    this.composer.render();
  };

  private onMouse = (e: MouseEvent) => {
    this.mouseNdc.set(
      (e.clientX / window.innerWidth) * 2 - 1,
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
