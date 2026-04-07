import { Component, ElementRef, inject, OnInit, signal, ViewChildren, QueryList, AfterViewInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import * as THREE from 'three';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-services',
  imports: [RouterLink],
  templateUrl: './services.html',
  styleUrl: './services.scss'
})
export class ServicesComponent implements OnInit, AfterViewInit, OnDestroy {
  private seo = inject(SeoService);
  @ViewChildren('miniCanvas') miniCanvases!: QueryList<ElementRef<HTMLCanvasElement>>;
  signalCount = signal(0);
  schemaUrl = signal('');
  schemaResult = signal<string | null>(null);
  schemaLoading = signal(false);
  private animIds: number[] = [];
  private renderer3: THREE.WebGLRenderer | null = null;

  services = [
    {
      num: '01',
      title: 'Angular Development',
      desc: 'Standalone components, signals, lazy loading, view transitions. We build Angular apps the way Angular intended — clean, fast, and maintainable. Not just functional, but architected for scale.',
      items: ['Standalone components', 'Signals & computed state', 'Lazy-loaded routes', 'View transitions API', 'Responsive design', 'Accessibility (WCAG)'],
      demo: 'product',
    },
    {
      num: '02',
      title: 'SEO & GEO',
      desc: 'Traditional search ranking and AI-powered search optimization. FAQPage, HowTo, Product, LocalBusiness, and Service schemas. We make sure both Google and ChatGPT know who you are.',
      items: ['JSON-LD structured data', 'FAQPage & HowTo schemas', 'Product & LocalBusiness markup', 'Per-page meta & OG tags', 'Sitemap & robots.txt', 'Google Search Console setup'],
      demo: 'serp',
    },
    {
      num: '03',
      title: 'WebGL & Three.js',
      desc: 'Custom GLSL shaders, particle systems, 3D scenes. From a subtle animated hero to a full generative experience — the browser as a canvas. Every pixel computed on the GPU.',
      items: ['Three.js scenes', 'GLSL shaders', 'Particle systems', 'Post-processing', 'OrbitControls', 'InstancedMesh'],
      demo: 'webgl',
    },
    {
      num: '04',
      title: 'Enterprise & ERP',
      desc: 'Real experience inside Business Central, SAP, and Infor SyteLine — not as a consultant reading documentation, but as an end user who felt the gaps firsthand. That means we know where the data lives, what operations teams actually need access to, and how to build tooling that fits the reality of manufacturing and supply chain work without fighting the system it needs to talk to.',
      items: ['Microsoft Business Central', 'SAP integration', 'Infor SyteLine', 'Mobile floor apps', 'BOM systems & automation', 'Internal ops dashboards'],
      demo: null,
    },
    {
      num: '05',
      title: 'Performance & Deploy',
      desc: 'Deploy your way. Netlify, custom DNS migration, serverless functions, CI/CD — frontend or backend, we handle the full stack. Lighthouse scores and Core Web Vitals aren\'t vanity metrics, they\'re what search engines and users actually experience.',
      items: ['Netlify deployments', 'DNS migration & custom domains', 'Serverless functions', 'CI/CD pipelines', 'Core Web Vitals audit', 'SSL provisioning'],
      demo: null,
    },
    {
      num: '06',
      title: 'Analytics & Tracking',
      desc: 'GA4, Google Search Console, rich results validation. You can\'t improve what you don\'t measure. We wire in full tracking from day one so you always know what\'s working.',
      items: ['GA4 setup & configuration', 'Search Console verification', 'Rich results validation', 'Event tracking', 'Conversion goals', 'Real-time reporting'],
      demo: null,
    },
  ];

  // ── Demo 1: Live product card ─────────────────────────────────────────────
  productName    = signal('Hot Sauce Co.');
  productTagline = signal('Small batch. Big heat.');

  // ── Demo 2: SERP preview ──────────────────────────────────────────────────
  serpBusiness = signal('Your Business');
  serpDesc     = signal('We do the thing you need, better than anyone else. Based in Northern California.');
  serpUrl      = signal('yourbusiness.com');

  serpTitle()   { return this.serpBusiness() || 'Your Business'; }
  serpSnippet() { return this.serpDesc() || 'Your description appears here in Google search results.'; }
  serpDisplay() {
    const u = this.serpUrl() || 'yourbusiness.com';
    return u.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }

  ngAfterViewInit() {
    this.miniCanvases.forEach(ref => this.initCardWebGL(ref.nativeElement));
  }

  ngOnDestroy() {
    this.animIds.forEach(id => cancelAnimationFrame(id));
  }

  private initCardWebGL(canvas: HTMLCanvasElement) {
    const w = canvas.clientWidth || 340;
    const h = canvas.clientHeight || 220;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    const scene  = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a12);
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 0, 4);

    // Card geometry
    const cardGeo = new THREE.BoxGeometry(2.8, 1.7, 0.06);
    const cardMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e, roughness: 0.3, metalness: 0.6,
      emissive: new THREE.Color(0x0d0d1a), emissiveIntensity: 1,
    });
    const card = new THREE.Mesh(cardGeo, cardMat);
    card.castShadow = true;
    scene.add(card);

    // Accent stripe on card face
    const stripeMat = new THREE.MeshStandardMaterial({
      color: 0xff3c00, emissive: new THREE.Color(0xff3c00), emissiveIntensity: 0.4,
      roughness: 0.2, metalness: 0.8,
    });
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.06, 0.07), stripeMat);
    stripe.position.set(0, 0.55, 0);
    card.add(stripe);

    // Floating accent dot
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xff3c00, emissive: new THREE.Color(0xff3c00), emissiveIntensity: 1 })
    );
    dot.position.set(-1.1, 0.55, 0.1);
    card.add(dot);

    // Lighting
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);
    const fillLight = new THREE.PointLight(0x7c3aed, 1.5, 10);
    fillLight.position.set(-3, -2, 2);
    scene.add(fillLight);
    const rimLight = new THREE.PointLight(0xff3c00, 1.0, 8);
    rimLight.position.set(2, -3, -1);
    scene.add(rimLight);
    scene.add(new THREE.AmbientLight(0x0a0a20, 2));

    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouseY = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
    });
    canvas.addEventListener('mouseleave', () => { mouseX = 0; mouseY = 0; });

    const animate = () => {
      const id = requestAnimationFrame(animate);
      this.animIds.push(id);
      targetX += (mouseX * 0.35 - targetX) * 0.06;
      targetY += (mouseY * 0.2  - targetY) * 0.06;
      card.rotation.y = targetX;
      card.rotation.x = -targetY;
      const t = Date.now() * 0.001;
      dot.position.y = 0.55 + Math.sin(t * 2) * 0.04;
      fillLight.intensity = 1.5 + Math.sin(t * 0.7) * 0.3;
      renderer.render(scene, camera);
    };
    animate();
  }

  ngOnInit() {
    const base = 'https://localhousedesigns.netlify.app';
    this.seo.setPage({
      title: 'Services | Localhouse Designs — Angular, SEO/GEO, Performance, Design',
      description: 'Full-stack web services from Localhouse Designs: Angular development, SEO/GEO structured data, Netlify deployment, GA4 analytics, and design systems.',
      url: `${base}/services`,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          provider: { '@id': `${base}/#organization` },
          serviceType: 'Web Development',
          name: 'Localhouse Designs Web Services',
          url: `${base}/services`,
          description: 'Angular development, SEO/GEO, Netlify deployment, analytics, and design systems.',
          areaServed: { '@type': 'Country', name: 'United States' },
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Web & Enterprise Development Services',
            itemListElement: [
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Angular Development', description: 'Standalone components, signals, lazy loading, view transitions. Angular 21 built the right way.' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Enterprise & ERP Integration', description: 'Custom integrations and tooling for Microsoft Business Central, SAP, and Infor SyteLine.' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'SEO & GEO Optimization', description: 'JSON-LD structured data, FAQPage, Product, and Service schemas. Rank in search and AI overviews.' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'WebGL & Three.js', description: 'Custom GLSL shaders, particle systems, and 3D experiences built on Three.js.' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Performance & Deploy', description: 'Netlify deployments, DNS migration, serverless functions, CI/CD, and Core Web Vitals optimization.' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Analytics & Tracking', description: 'GA4 setup, Search Console verification, rich results validation, and conversion tracking.' } }
            ]
          }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${base}/services#webpage`,
          url: `${base}/services`,
          name: 'Services | Localhouse Designs',
          isPartOf: { '@id': `${base}/#website` },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Services', item: `${base}/services` }
            ]
          }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'What Angular services does Localhouse Designs offer?',
              acceptedAnswer: { '@type': 'Answer', text: 'Localhouse Designs builds Angular 21 applications using standalone components, reactive signals, lazy-loaded routes, the View Transitions API, and responsive SCSS design systems. Engagements range from brand sites and SPAs to full-stack applications with REST APIs and SQL databases.' }
            },
            {
              '@type': 'Question',
              name: 'What ERP systems does Localhouse Designs work with?',
              acceptedAnswer: { '@type': 'Answer', text: 'Localhouse Designs has hands-on experience with Microsoft Business Central, SAP, and Infor SyteLine. Services include custom integrations, internal dashboards, workflow automation, mobile floor apps, BOM systems, and reporting tools.' }
            },
            {
              '@type': 'Question',
              name: 'Does Localhouse Designs offer SEO and GEO services?',
              acceptedAnswer: { '@type': 'Answer', text: 'Yes. Every project includes full SEO/GEO treatment: per-page meta tags, JSON-LD structured data (FAQPage, Product, Service, BreadcrumbList), Google Search Console setup, sitemap and robots.txt, and rich results validation. GEO targeting ensures AI search engines like ChatGPT and Perplexity can accurately represent your business.' }
            },
            {
              '@type': 'Question',
              name: 'Can Localhouse Designs build WebGL experiences?',
              acceptedAnswer: { '@type': 'Answer', text: 'Yes. Localhouse Designs builds custom Three.js scenes with GLSL shaders, particle systems, post-processing (bloom, depth of field), and InstancedMesh for high-performance 3D. Work ranges from interactive hero backgrounds to full generative art experiences.' }
            },
            {
              '@type': 'Question',
              name: 'Does Localhouse Designs handle deployment and hosting?',
              acceptedAnswer: { '@type': 'Answer', text: 'Yes. Localhouse Designs handles the full deployment stack: Netlify configuration, SPA routing, www/non-www redirects, custom DNS migration, SSL, serverless Netlify Functions, and CI/CD pipeline setup. We handle the full stack from code to live URL.' }
            }
          ]
        }
      ]
    });
  }
}
