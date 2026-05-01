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
  image?: string;
  x: number;
  y: number;
  delay: number;
  rotate: number;
  size: 'small' | 'medium' | 'large';
}

interface IntentField {
  id: string;
  label: string;
  x: number;
  y: number;
  strength: number;
  delay: number;
}

interface GhostNode {
  id: string;
  title: string;
  domain: string;
  topic: string;
  href: string;
  image?: string;
  x: number;
  y: number;
  delay: number;
}

interface SearchTrail {
  id: string;
  query: string;
  x: number;
  y: number;
  delay: number;
}

interface IntentWikiMemory {
  searches: string[];
  domains: Array<{ domain: string; count: number }>;
  eventCount: number;
  updatedAt?: string;
}

interface IntentWikiResponse {
  intents?: Array<{
    id: string;
    label: string;
    intent: string;
    confidence: number;
    evidenceCount: number;
    ghosts: Array<{ title: string; domain: string; href: string }>;
  }>;
  memory?: IntentWikiMemory;
}

interface ExtCluster {
  id: string;
  label: string;
  icon: string;
  pages: Array<{ url: string; title: string; image?: string }>;
}

interface ExtensionContext {
  type: 'LH_UNIVERSE_CONTEXT';
  clusters?: ExtCluster[];
  searches?: string[];
  bookmarks?: Array<{ url: string; title: string }>;
  domains?: Array<{ domain: string; count: number }>;
}

const SLOTS = [
  { x: -45, y: -11, delay: 120, rotate: 0 },
  { x: -45, y:  31, delay: 260, rotate: 0 },
  { x: -27, y:  -3, delay: 180, rotate: 0 },
  { x: -27, y:  39, delay: 310, rotate: 0 },
  { x:  -9, y: -14, delay: 440, rotate: 0 },
  { x:  -9, y:  28, delay: 160, rotate: 0 },
  { x:   9, y:  -3, delay: 290, rotate: 0 },
  { x:   9, y:  39, delay: 420, rotate: 0 },
  { x:  27, y: -13, delay: 200, rotate: 0 },
  { x:  27, y:  29, delay: 340, rotate: 0 },
  { x:  45, y:  -3, delay: 380, rotate: 0 },
  { x:  45, y:  39, delay: 460, rotate: 0 },
];

const PIN_SIZES: Array<UniversePin['size']> = ['large', 'medium', 'small', 'medium', 'large', 'small'];

const GHOST_SLOTS = [
  { x: -55, y: -16, delay: 680 },
  { x: -55, y:  39, delay: 780 },
  { x:  55, y: -16, delay: 880 },
  { x:  55, y:  39, delay: 980 },
];

const GHOST_SITES: Record<string, Array<{ title: string; domain: string; href: string }>> = {
  'seo & content': [
    { title: 'Technical SEO field guide', domain: 'developers.google.com', href: 'https://developers.google.com/search/docs' },
    { title: 'Schema vocabulary explorer', domain: 'schema.org', href: 'https://schema.org' },
    { title: 'Search visibility audit ideas', domain: 'ahrefs.com', href: 'https://ahrefs.com/blog/' },
  ],
  'frontend dev': [
    { title: 'Angular docs', domain: 'angular.dev', href: 'https://angular.dev' },
    { title: 'Three.js examples', domain: 'threejs.org', href: 'https://threejs.org/examples/' },
    { title: 'MDN Web APIs', domain: 'developer.mozilla.org', href: 'https://developer.mozilla.org' },
  ],
  'ai tools': [
    { title: 'OpenAI platform docs', domain: 'platform.openai.com', href: 'https://platform.openai.com/docs' },
    { title: 'Browser agent research', domain: 'github.com', href: 'https://github.com/topics/browser-agent' },
    { title: 'Perplexity search', domain: 'perplexity.ai', href: 'https://www.perplexity.ai' },
  ],
  'erp & ops': [
    { title: 'Infor SyteLine resources', domain: 'infor.com', href: 'https://www.infor.com' },
    { title: 'Microsoft Dynamics docs', domain: 'learn.microsoft.com', href: 'https://learn.microsoft.com/dynamics365/' },
    { title: 'Manufacturing operations patterns', domain: 'lean.org', href: 'https://www.lean.org' },
  ],
  learning: [
    { title: 'Deep-dive video search', domain: 'youtube.com', href: 'https://www.youtube.com' },
    { title: 'Course marketplace', domain: 'udemy.com', href: 'https://www.udemy.com' },
    { title: 'Developer Q&A', domain: 'stackoverflow.com', href: 'https://stackoverflow.com' },
  ],
};

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
  intentFields       = signal<IntentField[]>([]);
  ghostNodes         = signal<GhostNode[]>([]);
  searchTrails       = signal<SearchTrail[]>([]);
  memoryCore         = signal<IntentWikiMemory | null>(null);
  contextMode        = computed(() => this.extensionConnected() ? 'extension context received' : 'site-only context');
  statusLine         = computed(() => this.extensionConnected()
    ? 'Solid cards are visited. Soft fields are inferred intent. Ghost nodes are possible next sites.'
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
    this.loadSearchMemory();
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

  openGhost(node: GhostNode) {
    window.open(node.href, '_blank', 'noopener noreferrer');
  }

  domainMark(domain: string) {
    const clean = domain.replace(/^www\./, '').split('.')[0] || domain;
    return clean.slice(0, 2).toUpperCase();
  }

  visualTone(domain: string, topic: string) {
    const seed = `${domain}:${topic}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash * 31 + seed.charCodeAt(i)) % 360;
    }
    return `${hash}deg`;
  }

  pinImage(pin: { href: string; image?: string }) {
    if (pin.image) return pin.image;
    if (!/^https?:\/\//i.test(pin.href)) return '';
    return `https://s.wordpress.com/mshots/v1/${encodeURIComponent(pin.href)}?w=640`;
  }

  submitSearch() {
    const query = this.intentText.trim();
    if (!query) return;
    const existing = this.searchTrails();
    const trail: SearchTrail = {
      id: `${Date.now()}-${query}`,
      query: this.cleanTitle(query),
      x: existing.length % 2 === 0 ? 16 + existing.length * 3 : -16 - existing.length * 3,
      y: -6 + (existing.length % 4) * 4,
      delay: 80,
    };
    const next = [...existing.slice(-4), trail];
    this.searchTrails.set(next);
    localStorage.setItem('lh_universe_searches', JSON.stringify(next.map(t => t.query)));
    this.intentText = '';
  }

  stringPath(pin: UniversePin, index: number) {
    if (index === 0) return '';
    const start = this.pins()[index - 1];
    if (!start || start.topic !== pin.topic) return '';
    const startX = 50 + (start?.x ?? pin.x);
    const startY = 50 + (start?.y ?? pin.y);
    const endX = 50 + pin.x;
    const endY = 50 + pin.y;
    const dx = endX - startX;
    const dy = endY - startY;
    const bend = (index % 2 === 0 ? 1 : -1) * 2.4;
    const controlX = startX + dx * 0.5 - dy * 0.08 + bend;
    const controlY = startY + dy * 0.5 + dx * 0.08;
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
      const seenDomains = new Set<string>();
      const uniquePages = data.clusters!
        .flatMap(ext => ext.pages.slice(0, 6).map(page => ({ page, topic: ext.label })))
        .filter(({ page }) => {
          if (this.isLocalUrl(page.url)) return false;
          const domain = this.domainFromUrl(page.url);
          if (seenDomains.has(domain)) return false;
          seenDomains.add(domain);
          return true;
        })
        .slice(0, 10);

      const pins = uniquePages
        .map(({ page, topic }, i): UniversePin => {
          const slot = SLOTS[i % SLOTS.length];
          return {
            id: `${topic}-${i}-${page.url}`,
            title: this.cleanTitle(page.title || page.url),
            domain: this.domainFromUrl(page.url),
            topic,
            href: page.url,
            image: page.image,
            x: slot.x,
            y: slot.y,
            delay: slot.delay,
            rotate: slot.rotate,
            size: PIN_SIZES[i % PIN_SIZES.length],
          };
        });

      this.pins.set(pins);
      this.intentFields.set(this.buildIntentFields(data.clusters!));
      this.ghostNodes.set(this.buildGhostNodes(data.clusters!));
      if (data.searches?.length) this.mergeSearches(data.searches);
      void this.syncIntentWiki(data);
      this.extensionConnected.set(true);
    });
  };

  private buildIntentFields(clusters: ExtCluster[]) {
    return clusters.slice(0, 4).map((cluster, i): IntentField => {
      const related = this.pins().filter(pin => pin.topic === cluster.label);
      const slot = SLOTS[(i * 2) % SLOTS.length];
      const avgX = related.length ? related.reduce((sum, pin) => sum + pin.x, 0) / related.length : slot.x;
      const avgY = related.length ? related.reduce((sum, pin) => sum + pin.y, 0) / related.length : slot.y;
      return {
        id: cluster.id,
        label: cluster.label,
        x: avgX * 0.82,
        y: avgY * 0.82,
        strength: Math.min(1, 0.42 + cluster.pages.length * 0.08),
        delay: 180 + i * 180,
      };
    });
  }

  private buildGhostNodes(clusters: ExtCluster[]) {
    return clusters.slice(0, 4).flatMap((cluster, ci) => {
      const key = cluster.label.toLowerCase();
      const suggestions = GHOST_SITES[key] ?? [];
      return suggestions.slice(0, 1).map((site): GhostNode => {
        const slot = GHOST_SLOTS[ci % GHOST_SLOTS.length];
        return {
          id: `${cluster.id}-${site.domain}`,
          title: site.title,
          domain: site.domain,
          topic: cluster.label,
          href: site.href,
          x: slot.x,
          y: slot.y,
          delay: slot.delay,
        };
      });
    });
  }

  private async syncIntentWiki(data: ExtensionContext) {
    const fallbackMemory: IntentWikiMemory = {
      searches: this.searchTrails().map(t => t.query).slice(-12),
      domains: (data.domains ?? []).slice(0, 12),
      eventCount: (data.clusters?.length ?? 0) + (data.searches?.length ?? 0),
      updatedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch('/.netlify/functions/intent-wiki', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          clusters: data.clusters ?? [],
          searches: data.searches ?? [],
          bookmarks: data.bookmarks ?? [],
          domains: data.domains ?? [],
          memory: this.loadWikiMemory(),
        }),
      });
      if (!response.ok) throw new Error('intent wiki unavailable');
      const wiki = await response.json() as IntentWikiResponse;
      if (wiki.memory) {
        this.memoryCore.set(wiki.memory);
        localStorage.setItem('lh_universe_wiki', JSON.stringify(wiki.memory));
        if (wiki.memory.searches?.length) this.mergeSearches(wiki.memory.searches);
      }
      if (wiki.intents?.length) {
        this.ghostNodes.set(this.buildWikiGhostNodes(wiki.intents));
      }
    } catch {
      this.memoryCore.set(fallbackMemory);
      localStorage.setItem('lh_universe_wiki', JSON.stringify(fallbackMemory));
    }
  }

  private buildWikiGhostNodes(intents: NonNullable<IntentWikiResponse['intents']>) {
    return intents.slice(0, 4).flatMap((intent, ci) => {
      return intent.ghosts.slice(0, 1).map((site): GhostNode => {
        const slot = GHOST_SLOTS[ci % GHOST_SLOTS.length];
        return {
          id: `wiki-${intent.id}-${site.domain}`,
          title: site.title,
          domain: site.domain,
          topic: intent.intent,
          href: site.href,
          x: slot.x,
          y: slot.y,
          delay: slot.delay,
        };
      });
    });
  }

  private loadWikiMemory(): IntentWikiMemory | null {
    try {
      const raw = localStorage.getItem('lh_universe_wiki');
      return raw ? JSON.parse(raw) as IntentWikiMemory : null;
    } catch {
      return null;
    }
  }

  private loadSearchMemory() {
    try {
      const raw = localStorage.getItem('lh_universe_searches');
      const searches = raw ? JSON.parse(raw) as string[] : [];
      this.searchTrails.set(searches.slice(-5).map((query, i): SearchTrail => ({
        id: `stored-${i}-${query}`,
        query: this.cleanTitle(query),
        x: i % 2 === 0 ? 16 + i * 3 : -16 - i * 3,
        y: -6 + (i % 4) * 4,
        delay: 500 + i * 120,
      })));
    } catch {
      this.searchTrails.set([]);
    }
  }

  private mergeSearches(searches: string[]) {
    const current = this.searchTrails().map(t => t.query);
    const merged = [...current, ...searches.map(s => this.cleanTitle(s))]
      .filter((query, index, all) => query && all.indexOf(query) === index)
      .slice(-6);

    this.searchTrails.set(merged.map((query, i): SearchTrail => ({
      id: `search-${i}-${query}`,
      query,
      x: i % 2 === 0 ? 16 + i * 3 : -16 - i * 3,
      y: -6 + (i % 4) * 4,
      delay: 500 + i * 120,
    })));
    localStorage.setItem('lh_universe_searches', JSON.stringify(merged));
  }

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

  private isLocalUrl(url: string) {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase();
      return parsed.protocol === 'file:'
        || host === 'localhost'
        || host === '127.0.0.1'
        || host === '0.0.0.0'
        || host === '::1';
    } catch {
      return /^[a-z]:[\\/]/i.test(url);
    }
  }

  private clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
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
