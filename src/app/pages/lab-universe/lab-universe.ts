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
  groupIds: string[];
  x: number;
  y: number;
  delay: number;
  rotate: number;
  size: 'small' | 'medium' | 'large' | 'featured';
}

interface ExpressLink {
  id: string;
  label: string;
  href: string;
  score: number;
  pages: Array<{ url: string; title: string; image?: string }>;
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
  interests?: ExpressLink[];
  searches?: string[];
  bookmarks?: Array<{ url: string; title: string }>;
  domains?: Array<{ domain: string; count: number }>;
}

const COLUMN_X = [-57, -43, -29, -15, -1, 13, 27, 41, 55];
const COLUMN_START_Y = [-24, -9, -22, -7, -23, -8, -22, -6, -20];
const ROW_GAP = 25;
const MAX_HISTORY_PINS = 36;

const GHOST_SLOTS = [
  { x: -55, y: -16, delay: 680 },
  { x: -55, y:  39, delay: 780 },
  { x:  55, y: -16, delay: 880 },
  { x:  55, y:  39, delay: 980 },
];

const GHOST_SITES: Record<string, Array<{ title: string; domain: string; href: string }>> = {
  history: [],
  'recent sites': [],
  socials: [],
  'food & flavor': [],
  design: [],
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
  activeBoard        = signal('history');
  expressLinks       = signal<ExpressLink[]>([]);
  allPins            = signal<UniversePin[]>([]);
  pins               = signal<UniversePin[]>([]);
  intentFields       = signal<IntentField[]>([]);
  ghostNodes         = signal<GhostNode[]>([]);
  searchTrails       = signal<SearchTrail[]>([]);
  memoryCore         = signal<IntentWikiMemory | null>(null);
  contextMode        = computed(() => this.extensionConnected() ? 'extension context received' : 'site-only context');
  statusLine         = computed(() => this.extensionConnected()
    ? 'History is the board. Text links route into real interest groups.'
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
  private flashMesh!: THREE.Mesh;
  private ringMesh!:  THREE.Mesh;
  private velocities: THREE.Vector3[] = [];
  private isExploding = false;
  private readonly warmBg  = new THREE.Color(0xf4efe7);
  private readonly flashBg = new THREE.Color(0xfffdf8);

  private readonly PARTICLE_COUNT  = 800;
  private readonly BURST_DURATION  = 4.0;
  private readonly EXPANSION_RATIO = 0.44;
  private particleColors = new Float32Array(0);

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
    this.flashMesh?.geometry.dispose();
    (this.flashMesh?.material as THREE.Material)?.dispose();
    this.ringMesh?.geometry.dispose();
    (this.ringMesh?.material as THREE.Material)?.dispose();
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
    const next = [...existing.filter(item => item.query !== trail.query).slice(-4), trail];
    this.searchTrails.set(next);
    localStorage.setItem('lh_universe_searches', JSON.stringify(next.map(t => t.query)));
    this.resizePinsForIntent(query);
    this.intentText = '';
  }

  setBoard(link: ExpressLink, event?: Event) {
    event?.preventDefault();
    this.activeBoard.set(link.id);
    const next = link.id === 'history'
      ? this.allPins()
      : this.allPins().filter(pin => pin.groupIds.includes(link.id));
    this.setVisiblePins(next);
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
    }, (this.BURST_DURATION + 0.2) * 1000);

    setTimeout(() => {
      this.zone.run(() => this.inputVisible.set(true));
    }, (this.BURST_DURATION + 0.6) * 1000);
  }

  private onExtensionMessage = (e: MessageEvent) => {
    if (e.origin !== location.origin) return;
    const data = e.data as ExtensionContext;
    if (data?.type !== 'LH_UNIVERSE_CONTEXT' || !data.clusters?.length) return;

    this.zone.run(() => {
      const seenDomains = new Set<string>();
      const historyCluster = data.clusters!.find(ext => ext.id === 'recent') ?? null;
      const secondaryClusters = data.clusters!.filter(ext => ext.id !== 'recent');
      const groupByDomain = this.groupMemberships(secondaryClusters);
      const uniquePages = [
        ...(historyCluster?.pages ?? []).map(page => ({ page, topic: historyCluster?.label ?? 'History' })),
        ...secondaryClusters.flatMap(ext => ext.pages.slice(0, 4).map(page => ({ page, topic: ext.label }))),
      ]
        .filter(({ page }) => {
          if (this.isLocalUrl(page.url)) return false;
          const domain = this.domainFromUrl(page.url);
          if (seenDomains.has(domain)) return false;
          seenDomains.add(domain);
          return true;
        })
        .slice(0, MAX_HISTORY_PINS);

      const pins = uniquePages
        .map(({ page, topic }, i): UniversePin => {
          const slot = this.pinSlot(i);
          return {
            id: `${topic}-${i}-${page.url}`,
            title: this.cleanTitle(page.title || page.url),
            domain: this.domainFromUrl(page.url),
            topic,
            href: page.url,
            image: page.image,
            groupIds: groupByDomain.get(this.domainFromUrl(page.url)) ?? [],
            x: slot.x,
            y: slot.y,
            delay: slot.delay,
            rotate: slot.rotate,
            size: this.pinSizeForScore(this.intentScore(page, topic)),
          };
        });

      this.allPins.set(pins);
      this.expressLinks.set(this.buildExpressLinks(pins, secondaryClusters, data.interests));
      this.setBoard(this.expressLinks()[0]);
      this.intentFields.set(this.buildIntentFields(data.clusters!));
      this.ghostNodes.set(this.buildGhostNodes(data.clusters!));
      if (data.searches?.length) this.mergeSearches(data.searches);
      void this.syncIntentWiki(data);
      this.extensionConnected.set(true);
    });
  };

  private setVisiblePins(pins: UniversePin[]) {
    this.pins.set(pins.slice(0, MAX_HISTORY_PINS).map((pin, i) => {
      const slot = this.pinSlot(i);
      return {
        ...pin,
        x: slot.x,
        y: slot.y,
        delay: slot.delay,
        rotate: slot.rotate,
        size: this.pinSizeForScore(this.intentScore(pin, pin.topic)),
      };
    }));
  }

  private groupMemberships(clusters: ExtCluster[]) {
    const groups = new Map<string, string[]>();
    for (const cluster of clusters) {
      for (const page of cluster.pages) {
        const domain = this.domainFromUrl(page.url);
        const next = groups.get(domain) ?? [];
        if (!next.includes(cluster.id)) next.push(cluster.id);
        groups.set(domain, next);
      }
    }
    return groups;
  }

  private buildExpressLinks(
    pins: UniversePin[],
    clusters: ExtCluster[],
    interests: ExpressLink[] = [],
  ) {
    const links = new Map<string, ExpressLink>();
    links.set('history', {
      id: 'history',
      label: `history ${pins.length}`,
      href: '/lab/universe?board=history',
      score: pins.length,
      pages: [],
    });

    const sourceLinks = interests.length
      ? interests
      : clusters.map(cluster => ({
          id: cluster.id,
          label: cluster.label,
          href: `/lab/universe?board=${encodeURIComponent(cluster.id)}`,
          score: cluster.pages.length,
          pages: cluster.pages,
        }));

    for (const link of sourceLinks) {
      const pages = (link.pages ?? []).filter(page => !this.isLocalUrl(page.url));
      if (!pages.length) continue;
      links.set(link.id, {
        ...link,
        label: `${link.label.toLowerCase()} ${pages.length}`,
        pages,
      });
    }

    return [...links.values()].slice(0, 9);
  }

  private resizePinsForIntent(query: string) {
    const active = this.tokenize(query);
    if (!active.length) return;

    const scored = this.pins()
      .map((pin, index) => ({ pin, index, score: this.intentScore(pin, pin.topic, active) }))
      .sort((a, b) => b.score - a.score);
    const featuredIds = new Set(scored.filter(item => item.score >= 8).slice(0, 2).map(item => item.pin.id));
    const largeIds = new Set(scored.filter(item => item.score >= 5).slice(0, 5).map(item => item.pin.id));

    this.pins.update(pins => pins.map(pin => {
      const score = scored.find(item => item.pin.id === pin.id)?.score ?? 0;
      const size: UniversePin['size'] = featuredIds.has(pin.id)
        ? 'featured'
        : largeIds.has(pin.id)
          ? 'large'
          : this.pinSizeForScore(score);
      return { ...pin, size };
    }));
  }

  private buildIntentFields(clusters: ExtCluster[]) {
    return clusters.slice(0, 4).map((cluster, i): IntentField => {
      const related = this.pins().filter(pin => pin.topic === cluster.label);
      const slot = this.pinSlot(i * 2);
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

  private intentScore(
    page: { url?: string; title?: string; domain?: string },
    topic: string,
    tokens = this.activeIntentTokens(),
  ) {
    if (!tokens.length) return 1;
    const title = (page.title ?? '').toLowerCase();
    const href = (page.url ?? page['href' as keyof typeof page] ?? '').toString().toLowerCase();
    const domain = (page.domain ?? this.domainFromUrl(href)).toLowerCase();
    const haystack = `${title} ${href} ${domain} ${topic}`.toLowerCase();
    const matches = tokens.filter(token => haystack.includes(token));
    const domainMatches = tokens.filter(token => domain.includes(token));
    const titleMatches = tokens.filter(token => title.includes(token));
    return 1 + matches.length * 2 + domainMatches.length * 3 + titleMatches.length * 2;
  }

  private pinSizeForScore(score: number): UniversePin['size'] {
    if (score >= 8) return 'featured';
    if (score >= 5) return 'large';
    if (score >= 3) return 'medium';
    return 'small';
  }

  private activeIntentTokens() {
    const active = this.intentText || this.searchTrails().at(-1)?.query || '';
    return this.tokenize(active);
  }

  private tokenize(value: string) {
    return value
      .toLowerCase()
      .replace(/https?:\/\//g, ' ')
      .replace(/[^a-z0-9]+/g, ' ')
      .split(' ')
      .map(token => token.trim())
      .filter(token => token.length > 2);
  }

  private domainFromUrl(url: string) {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  }

  private pinSlot(index: number) {
    const column = index % COLUMN_X.length;
    const row = Math.floor(index / COLUMN_X.length);
    return {
      x: COLUMN_X[column],
      y: COLUMN_START_Y[column] + row * ROW_GAP,
      delay: 120 + index * 55,
      rotate: 0,
    };
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
    this.buildFlash();
    this.buildShockRing();
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

  private makeGlowTexture(): THREE.Texture {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width  = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0,    'rgba(255,255,255,1)');
    grad.addColorStop(0.35, 'rgba(255,255,255,0.75)');
    grad.addColorStop(0.7,  'rgba(255,255,255,0.2)');
    grad.addColorStop(1,    'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
  }

  private buildFlash() {
    this.flashMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0xfff6e8, transparent: true, opacity: 0, side: THREE.BackSide }),
    );
    this.scene.add(this.flashMesh);
  }

  private buildShockRing() {
    this.ringMesh = new THREE.Mesh(
      new THREE.RingGeometry(0.92, 1.0, 128),
      new THREE.MeshBasicMaterial({ color: 0xffcc66, transparent: true, opacity: 0, side: THREE.DoubleSide }),
    );
    this.scene.add(this.ringMesh);
  }

  private buildBurstParticles() {
    const positions = new Float32Array(this.PARTICLE_COUNT * 3);
    const colors    = new Float32Array(this.PARTICLE_COUNT * 3);

    for (let i = 0; i < this.PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const speed = Math.pow(Math.random(), 0.55) * 6.8 + 0.3;
      this.velocities.push(new THREE.Vector3(
        Math.cos(theta) * speed,
        Math.sin(theta) * speed,
        (Math.random() - 0.5) * speed * 0.55,
      ));
      const t = speed / 7.1;
      if (t < 0.22) {
        const b = t / 0.22;
        colors[i * 3]     = 1.0;
        colors[i * 3 + 1] = 1.0 - b * 0.08;
        colors[i * 3 + 2] = 1.0 - b * 0.38;
      } else if (t < 0.52) {
        const b = (t - 0.22) / 0.3;
        colors[i * 3]     = 1.0;
        colors[i * 3 + 1] = 0.92 - b * 0.50;
        colors[i * 3 + 2] = 0.62 - b * 0.58;
      } else if (t < 0.78) {
        const b = (t - 0.52) / 0.26;
        colors[i * 3]     = 1.0 - b * 0.28;
        colors[i * 3 + 1] = 0.42 - b * 0.36;
        colors[i * 3 + 2] = 0.04;
      } else {
        const b = (t - 0.78) / 0.22;
        colors[i * 3]     = 0.72 - b * 0.52;
        colors[i * 3 + 1] = 0.06 - b * 0.04;
        colors[i * 3 + 2] = 0.02;
      }
    }

    this.particleColors = colors.slice();
    this.burstGeo = new THREE.BufferGeometry();
    this.burstGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.burstGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.burstMesh = new THREE.Points(this.burstGeo, new THREE.PointsMaterial({
      size: 0.10, vertexColors: true, transparent: true, opacity: 0,
      sizeAttenuation: true, depthWrite: false,
      map: this.makeGlowTexture(), alphaTest: 0.005,
    }));
    this.scene.add(this.burstMesh);
  }

  private animate = () => {
    this.animId = requestAnimationFrame(this.animate);
    const t = (performance.now() - this.startMs) / 1000;

    if (!this.isExploding) {
      this.dotMesh.scale.setScalar(1 + 0.3 * Math.sin(t * 1.9));
      (this.burstMesh.material as THREE.PointsMaterial).opacity = 0;
      (this.scene.background as THREE.Color).copy(this.warmBg);
    } else {
      const elapsed  = (performance.now() - this.explodeMs) / 1000;
      const progress = Math.min(elapsed / this.BURST_DURATION, 1);

      // dot implodes
      const dotScale = Math.max(0, 1 - progress * 5);
      this.dotMesh.scale.setScalar(dotScale);
      this.dotMesh.visible = dotScale > 0.01;

      // background flash: white-hot at t=0, settles back to warm paper
      const bgFlash = Math.max(0, 1 - elapsed * 3.2);
      (this.scene.background as THREE.Color).copy(this.warmBg).lerp(this.flashBg, bgFlash);

      // flash sphere: rapid expand + fade
      this.flashMesh.scale.setScalar(Math.max(0.01, elapsed * 11));
      const flashOp = progress < 0.07
        ? (progress / 0.07) * 0.8
        : Math.max(0, 0.8 - (progress - 0.07) / 0.22);
      (this.flashMesh.material as THREE.MeshBasicMaterial).opacity = flashOp;

      // shock ring: fast expanding halo
      this.ringMesh.scale.setScalar(1 + elapsed * 10);
      const ringOp = progress < 0.05
        ? progress / 0.05
        : Math.max(0, 1 - (progress - 0.05) / 0.3);
      (this.ringMesh.material as THREE.MeshBasicMaterial).opacity = ringOp * 0.6;

      const expandEnd    = this.EXPANSION_RATIO * this.BURST_DURATION;
      const isCollapsing = elapsed > expandEnd;

      // particle opacity: fade in fast, hold through expansion, hold through most of collapse, snap off
      let pOp: number;
      if (progress < 0.1) {
        pOp = progress / 0.1;
      } else if (!isCollapsing) {
        pOp = 1;
      } else {
        const ct = (elapsed - expandEnd) / (this.BURST_DURATION - expandEnd);
        pOp = ct < 0.72 ? 1 : Math.max(0, 1 - (ct - 0.72) / 0.28);
      }
      const mat = this.burstMesh.material as THREE.PointsMaterial;
      mat.opacity = Math.max(0, pOp);
      mat.size    = 0.09 * (1 - progress * 0.65) + 0.026;

      const posArr   = this.burstGeo.attributes['position'].array as Float32Array;
      const peakDrag = Math.exp(-0.52 * expandEnd);

      if (!isCollapsing) {
        // expansion: particles fly outward with gentle drag
        const drag = Math.exp(-0.52 * elapsed);
        for (let i = 0; i < this.PARTICLE_COUNT; i++) {
          posArr[i * 3]     = this.velocities[i].x * elapsed * drag;
          posArr[i * 3 + 1] = this.velocities[i].y * elapsed * drag;
          posArr[i * 3 + 2] = this.velocities[i].z * elapsed * drag;
        }
      } else {
        // gravitational collapse: particles rush back to center, bleaching white-hot
        const ct       = Math.min((elapsed - expandEnd) / (this.BURST_DURATION - expandEnd), 1);
        const ease     = ct * ct * (3 - 2 * ct);
        const colorArr = this.burstGeo.attributes['color'].array as Float32Array;
        for (let i = 0; i < this.PARTICLE_COUNT; i++) {
          const peakX = this.velocities[i].x * expandEnd * peakDrag;
          const peakY = this.velocities[i].y * expandEnd * peakDrag;
          const peakZ = this.velocities[i].z * expandEnd * peakDrag;
          posArr[i * 3]     = peakX * (1 - ease);
          posArr[i * 3 + 1] = peakY * (1 - ease);
          posArr[i * 3 + 2] = peakZ * (1 - ease);
          colorArr[i * 3]     = this.particleColors[i * 3]     + (1 - this.particleColors[i * 3])     * ease;
          colorArr[i * 3 + 1] = this.particleColors[i * 3 + 1] + (1 - this.particleColors[i * 3 + 1]) * ease;
          colorArr[i * 3 + 2] = this.particleColors[i * 3 + 2] + (1 - this.particleColors[i * 3 + 2]) * ease;
        }
        this.burstGeo.attributes['color'].needsUpdate = true;
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
