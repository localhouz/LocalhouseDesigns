import {
  AfterViewInit, Component, ElementRef, computed, inject,
  NgZone, OnDestroy, OnInit, PLATFORM_ID, signal, ViewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';
import { SeoService } from '../../shared/seo/seo.service';

type Phase = 'idle' | 'exploding' | 'open';

interface UniversePin {
  id: string;
  title: string;
  domain: string;
  topic: string;
  href: string;
  x: number;
  y: number;
  delay: number;
  size: 'small' | 'medium' | 'large';
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

const SLOTS = [
  { x: 30, y: -24, delay: 200 },
  { x: 38, y:   8, delay: 350 },
  { x: 20, y:  32, delay: 500 },
  { x: -24, y: 34, delay: 400 },
  { x: -38, y:  4, delay: 250 },
  { x: -22, y: -26, delay: 150 },
];

const PIN_SIZES: Array<UniversePin['size']> = ['large', 'medium', 'small', 'medium', 'large', 'small'];

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
  private platform = inject(PLATFORM_ID);

  phase              = signal<Phase>('idle');
  clustersVisible    = signal(false);
  inputVisible       = signal(false);
  extensionConnected = signal(false);
  intentText         = '';
  pins               = signal<UniversePin[]>([]);
  contextMode        = computed(() => this.extensionConnected() ? 'extension context received' : 'site-only context');
  statusLine         = computed(() => this.extensionConnected()
    ? 'Visited pages from the private extension, connected by topic.'
    : 'Waiting on the private extension. A website alone cannot read your browsing history.'
  );

  private renderer!:  THREE.WebGLRenderer;
  private scene!:     THREE.Scene;
  private camera!:    THREE.PerspectiveCamera;
  private animId      = 0;
  private startMs     = 0;
  private explodeMs   = 0;

  private dotMesh!:   THREE.Mesh;
  private burstGeo!:  THREE.BufferGeometry;
  private burstMesh!: THREE.Points;
  private velocities: THREE.Vector3[] = [];
  private isExploding = false;

  private readonly PARTICLE_COUNT = 380;
  private readonly BURST_DURATION = 2.0;

  ngOnInit() {
    this.seo.setPage({
      title: 'Universe | Localhouse Designs Lab',
      description: 'Click to map your intent - an experimental browser-context visualizer built with Three.js.',
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
    document.dispatchEvent(new CustomEvent('LH_UNIVERSE_REQUEST'));
    this.zone.runOutsideAngular(() => this.animate());
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animId);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('message', this.onExtensionMessage);
    document.body.classList.remove('universe-active');
    this.renderer?.dispose();
    this.burstGeo?.dispose();
  }

  onCanvasClick() {
    if (this.phase() !== 'idle') return;
    this.triggerExplosion();
  }

  openPin(pin: UniversePin) {
    if (pin.href.startsWith('https://') || pin.href.startsWith('http://')) {
      window.open(pin.href, '_blank', 'noopener noreferrer');
    }
  }

  stringPath(pin: UniversePin, index: number) {
    const startX = 50;
    const startY = 50;
    const endX = 50 + pin.x;
    const endY = 50 + pin.y;
    const dx = endX - startX;
    const dy = endY - startY;
    const bend = (index % 2 === 0 ? 1 : -1) * (5 + (index % 4) * 2.2);
    const controlX = startX + dx * 0.52 - dy * 0.08 + bend;
    const controlY = startY + dy * 0.52 + dx * 0.08 - bend * 0.45;
    return `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
  }

  goBack() {
    history.back();
  }

  private triggerExplosion() {
    this.phase.set('exploding');
    this.isExploding = true;
    this.explodeMs = performance.now();

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

  private onExtensionMessage = (e: MessageEvent) => {
    if (e.origin !== location.origin) return;
    const data = e.data as ExtensionContext;
    if (data?.type !== 'LH_UNIVERSE_CONTEXT' || !data.clusters?.length) return;

    this.zone.run(() => {
      const pins = data.clusters!
        .flatMap(ext => ext.pages.slice(0, 4).map(page => ({ page, topic: ext.label })))
        .slice(0, 12)
        .map(({ page, topic }, i): UniversePin => {
          const slot = SLOTS[i % SLOTS.length];
          const ring = Math.floor(i / SLOTS.length);
          const offset = ring * 7;
          return {
            id: `${topic}-${i}-${page.url}`,
            title: this.cleanTitle(page.title || page.url),
            domain: this.domainFromUrl(page.url),
            topic,
            href: page.url,
            x: slot.x + (ring ? (slot.x > 0 ? -offset : offset) : 0),
            y: slot.y + (ring ? (slot.y > 0 ? -offset : offset) : 0),
            delay: slot.delay + ring * 140,
            size: PIN_SIZES[i % PIN_SIZES.length],
          };
        });

      this.pins.set(pins);
      this.extensionConnected.set(true);
    });
  };

  private cleanTitle(title: string) {
    return title.replace(/\s+/g, ' ').trim().slice(0, 92);
  }

  private domainFromUrl(url: string) {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  }

  private initScene() {
    const canvas = this.canvasRef.nativeElement;
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf4efe7);

    this.camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    this.camera.position.set(0, 0, 5);
    this.camera.lookAt(0, 0, 0);

    this.buildStars();
    this.buildDot();
    this.buildBurstParticles();
  }

  private buildStars() {
    const count = 1400;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 28;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
      color: 0x6f6870, size: 0.018, transparent: true, opacity: 0.36, sizeAttenuation: true,
    })));
  }

  private buildDot() {
    this.dotMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x0a0a14 }),
    );
    this.scene.add(this.dotMesh);
  }

  private buildBurstParticles() {
    const positions = new Float32Array(this.PARTICLE_COUNT * 3);
    const colors = new Float32Array(this.PARTICLE_COUNT * 3);

    for (let i = 0; i < this.PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.6 + Math.random() * 4.0;
      this.velocities.push(new THREE.Vector3(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        (Math.random() - 0.5) * 0.5,
      ));
      const t = speed / 4.6;
      colors[i * 3] = 0.04;
      colors[i * 3 + 1] = 0.04;
      colors[i * 3 + 2] = 0.08 + 0.14 * (1 - t);
    }

    this.burstGeo = new THREE.BufferGeometry();
    this.burstGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.burstGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.burstMesh = new THREE.Points(this.burstGeo, new THREE.PointsMaterial({
      size: 0.04, vertexColors: true, transparent: true, opacity: 0,
      sizeAttenuation: true, depthWrite: false,
    }));
    this.scene.add(this.burstMesh);
  }

  private animate = () => {
    this.animId = requestAnimationFrame(this.animate);
    const t = (performance.now() - this.startMs) / 1000;

    if (!this.isExploding) {
      this.dotMesh.scale.setScalar(1 + 0.3 * Math.sin(t * 1.9));
      (this.burstMesh.material as THREE.PointsMaterial).opacity = 0;
    } else {
      const elapsed = (performance.now() - this.explodeMs) / 1000;
      const progress = Math.min(elapsed / this.BURST_DURATION, 1);

      const dotScale = Math.max(0, 1 - progress * 4);
      this.dotMesh.scale.setScalar(dotScale);
      this.dotMesh.visible = dotScale > 0.01;

      let opacity: number;
      if (progress < 0.12) opacity = progress / 0.12;
      else if (progress < 0.65) opacity = 1;
      else opacity = 1 - (progress - 0.65) / 0.35;
      (this.burstMesh.material as THREE.PointsMaterial).opacity = Math.max(0, opacity);

      const drag = Math.exp(-0.75 * elapsed);
      const posArr = this.burstGeo.attributes['position'].array as Float32Array;
      for (let i = 0; i < this.PARTICLE_COUNT; i++) {
        posArr[i * 3] = this.velocities[i].x * elapsed * drag;
        posArr[i * 3 + 1] = this.velocities[i].y * elapsed * drag;
        posArr[i * 3 + 2] = this.velocities[i].z * elapsed * drag;
      }
      this.burstGeo.attributes['position'].needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);
  };

  private onResize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };
}
