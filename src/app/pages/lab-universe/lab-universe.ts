import {
  AfterViewInit, Component, ElementRef, inject,
  NgZone, OnDestroy, OnInit, PLATFORM_ID, signal, ViewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SeoService } from '../../shared/seo/seo.service';

type Phase = 'idle' | 'exploding' | 'open';

interface Cluster {
  id: string;
  label: string;
  icon: string;
  points: string[];
  href: string;
  external: boolean;
  x: number;
  y: number;
  delay: number;
}

interface ExtCluster {
  id: string;
  label: string;
  icon: string;
  pages: Array<{ url: string; title: string }>;
}

interface ExtensionContext {
  type: 'LH_UNIVERSE_CONTEXT';
  clusters?: ExtCluster[];
}

// Slot positions — extension clusters borrow these coordinates
const SLOTS = [
  { x: 30, y: -24, delay: 200 },
  { x: 38, y:   8, delay: 350 },
  { x: 20, y:  32, delay: 500 },
  { x: -24, y: 34, delay: 400 },
  { x: -38, y:  4, delay: 250 },
  { x: -22, y: -26, delay: 150 },
];

const BASE_CLUSTERS: Cluster[] = [
  {
    id: 'services', label: 'What do you need built?', icon: '⚡',
    points: ['Angular SPA', 'ERP dashboard', 'Custom web app'],
    href: '/services', external: false,
    ...SLOTS[0],
  },
  {
    id: 'erp', label: 'ERP & operations', icon: '⚙',
    points: ['Business Central', 'Infor SyteLine', 'Floor tools'],
    href: '/insights/what-manufacturers-actually-need-from-erp-connected-tooling', external: false,
    ...SLOTS[1],
  },
  {
    id: 'work', label: 'See the work', icon: '→',
    points: ['Client case studies', 'Live prototypes', 'Real outcomes'],
    href: '/work', external: false,
    ...SLOTS[2],
  },
  {
    id: 'geo', label: 'GEO & AI search', icon: '◎',
    points: ['Structured data', 'AI visibility', 'Schema.org'],
    href: '/insights/what-geo-means-for-local-businesses', external: false,
    ...SLOTS[3],
  },
  {
    id: 'contact', label: 'Talk to Steve', icon: '◈',
    points: ['Open a chat', 'No sales pitch', 'Get an estimate'],
    href: '/contact', external: false,
    ...SLOTS[4],
  },
  {
    id: 'lab', label: 'The lab', icon: '✦',
    points: ['Three.js / WebGL', 'ERP prototypes', 'Live experiments'],
    href: '/lab', external: false,
    ...SLOTS[5],
  },
];

@Component({
  selector: 'app-lab-universe',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './lab-universe.html',
  styleUrl: './lab-universe.scss',
})
export class LabUniverseComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas') private canvasRef!: ElementRef<HTMLCanvasElement>;

  private seo      = inject(SeoService);
  private zone     = inject(NgZone);
  private router   = inject(Router);
  private platform = inject(PLATFORM_ID);

  phase           = signal<Phase>('idle');
  clustersVisible = signal(false);
  inputVisible    = signal(false);
  intentText      = '';
  clusters        = signal<Cluster[]>(BASE_CLUSTERS);

  private renderer!:  THREE.WebGLRenderer;
  private scene!:     THREE.Scene;
  private camera!:    THREE.PerspectiveCamera;
  private composer!:  EffectComposer;
  private animId      = 0;
  private startMs     = 0;   // performance.now() at init
  private explodeMs   = 0;   // performance.now() at explosion

  private dotMesh!:   THREE.Mesh;
  private burstGeo!:  THREE.BufferGeometry;
  private burstMesh!: THREE.Points;
  private velocities: THREE.Vector3[] = [];
  private isExploding = false;

  private readonly PARTICLE_COUNT = 380;
  private readonly BURST_DURATION = 2.0; // seconds

  ngOnInit() {
    this.seo.setPage({
      title: 'Universe | Localhouse Designs Lab',
      description: 'Click to map your intent — an experimental intent visualizer built with Three.js and browser context signals.',
      url: 'https://localhousedesigns.com/lab/universe',
      noIndex: true,
    });
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platform)) return;
    this.startMs = performance.now();
    this.initScene();
    window.addEventListener('resize', this.onResize);
    window.addEventListener('message', this.onExtensionMessage);
    document.body.classList.add('universe-active');
    // Signal content script to send context (handles SPA navigation case)
    document.dispatchEvent(new CustomEvent('LH_UNIVERSE_REQUEST'));
    this.zone.runOutsideAngular(() => this.animate());
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animId);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('message', this.onExtensionMessage);
    document.body.classList.remove('universe-active');
    this.renderer?.dispose();
  }

  onCanvasClick() {
    if (this.phase() !== 'idle') return;
    this.triggerExplosion();
  }

  private triggerExplosion() {
    this.phase.set('exploding');
    this.isExploding = true;
    this.explodeMs   = performance.now();

    setTimeout(() => {
      this.zone.run(() => {
        this.phase.set('open');
        this.clustersVisible.set(true);
      });
    }, (this.BURST_DURATION + 0.4) * 1000);

    setTimeout(() => {
      this.zone.run(() => this.inputVisible.set(true));
    }, (this.BURST_DURATION + 0.9) * 1000);
  }

  navigate(cluster: Cluster) {
    if (cluster.external) {
      const href = cluster.href;
      if (href.startsWith('https://') || href.startsWith('http://')) {
        window.open(href, '_blank', 'noopener noreferrer');
      }
    } else {
      this.router.navigateByUrl(cluster.href);
    }
  }

  goBack() {
    history.back();
  }

  // Extension message handler.
  // The private Chrome extension (chrome-extension/) sends this after reading
  // the user's tabs + history, clustered by topic. Replaces base clusters with
  // real browsing context — up to 4 extension clusters, rest filled from BASE_CLUSTERS.
  private onExtensionMessage = (e: MessageEvent) => {
    if (e.origin !== location.origin) return;
    const data = e.data as ExtensionContext;
    if (data?.type !== 'LH_UNIVERSE_CONTEXT' || !data.clusters?.length) return;

    this.zone.run(() => {
      const extClusters: Cluster[] = data.clusters!.slice(0, 4).map((ext, i) => ({
        id:       ext.id,
        label:    ext.label,
        icon:     ext.icon,
        points:   ext.pages.slice(0, 3).map(p => p.title || p.url),
        href:     ext.pages[0]?.url ?? '/',
        external: true,
        ...SLOTS[i],
      }));

      // Fill remaining slots with base clusters that weren't displaced
      const extIds   = new Set(extClusters.map(c => c.id));
      const fillFrom = BASE_CLUSTERS.filter(c => !extIds.has(c.id));
      const merged   = [
        ...extClusters,
        ...fillFrom.slice(0, 6 - extClusters.length).map((c, i) => ({
          ...c, ...SLOTS[extClusters.length + i],
        })),
      ];

      this.clusters.set(merged);
    });
  };

  // ─── Three.js ────────────────────────────────────────────────────────────────

  private initScene() {
    const canvas = this.canvasRef.nativeElement;
    const w = window.innerWidth, h = window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace  = THREE.SRGBColorSpace;
    this.renderer.toneMapping       = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    this.scene  = new THREE.Scene();
    this.scene.background = new THREE.Color(0x010203);

    this.camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    this.camera.position.set(0, 0, 5);
    this.camera.lookAt(0, 0, 0);

    this.buildStars();
    this.buildDot();
    this.buildBurstParticles();

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.composer.addPass(new UnrealBloomPass(
      new THREE.Vector2(w, h),
      0.9,   // strength
      0.5,   // radius
      0.55,  // threshold — only the bright dot and burst particles glow
    ));
  }

  private buildStars() {
    const count = 1400;
    const pos   = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i*3]   = (Math.random() - 0.5) * 28;
      pos[i*3+1] = (Math.random() - 0.5) * 18;
      pos[i*3+2] = (Math.random() - 0.5) * 4;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
      color: 0x6677aa, size: 0.014, transparent: true, opacity: 0.45, sizeAttenuation: true,
    })));
  }

  private buildDot() {
    this.dotMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xaabbff }),
    );
    this.scene.add(this.dotMesh);
  }

  private buildBurstParticles() {
    const positions = new Float32Array(this.PARTICLE_COUNT * 3);
    const colors    = new Float32Array(this.PARTICLE_COUNT * 3);

    for (let i = 0; i < this.PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.6 + Math.random() * 4.0;
      this.velocities.push(new THREE.Vector3(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        (Math.random() - 0.5) * 0.5,
      ));
      // White-blue → purple, faster = more purple
      const t       = speed / 4.6;
      colors[i*3]   = 0.65 + 0.35 * (1 - t);
      colors[i*3+1] = 0.72 + 0.28 * (1 - t);
      colors[i*3+2] = 1.0;
    }

    this.burstGeo = new THREE.BufferGeometry();
    this.burstGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.burstGeo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

    this.burstMesh = new THREE.Points(this.burstGeo, new THREE.PointsMaterial({
      size: 0.04, vertexColors: true, transparent: true, opacity: 0,
      sizeAttenuation: true, depthWrite: false,
    }));
    this.scene.add(this.burstMesh);
  }

  private animate = () => {
    this.animId = requestAnimationFrame(this.animate);
    const t = (performance.now() - this.startMs) / 1000; // seconds since init

    if (!this.isExploding) {
      this.dotMesh.scale.setScalar(1 + 0.3 * Math.sin(t * 1.9));
      (this.burstMesh.material as THREE.PointsMaterial).opacity = 0;
    } else {
      const elapsed  = (performance.now() - this.explodeMs) / 1000;
      const progress = Math.min(elapsed / this.BURST_DURATION, 1);

      // Dot shrinks and disappears as particles burst
      const dotScale = Math.max(0, 1 - progress * 4);
      this.dotMesh.scale.setScalar(dotScale);
      this.dotMesh.visible = dotScale > 0.01;

      // Particles: fade in → hold → fade out
      let opacity: number;
      if      (progress < 0.12) opacity = progress / 0.12;
      else if (progress < 0.65) opacity = 1;
      else                      opacity = 1 - (progress - 0.65) / 0.35;
      (this.burstMesh.material as THREE.PointsMaterial).opacity = Math.max(0, opacity);

      // position = velocity × t × exp(-drag × t) — peaks at t = 1/drag ≈ 1.33s
      const d      = Math.exp(-0.75 * elapsed);
      const posArr = this.burstGeo.attributes['position'].array as Float32Array;
      for (let i = 0; i < this.PARTICLE_COUNT; i++) {
        posArr[i*3]   = this.velocities[i].x * elapsed * d;
        posArr[i*3+1] = this.velocities[i].y * elapsed * d;
        posArr[i*3+2] = this.velocities[i].z * elapsed * d;
      }
      this.burstGeo.attributes['position'].needsUpdate = true;
    }

    this.composer.render();
  };

  private onResize = () => {
    const w = window.innerWidth, h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
  };
}
