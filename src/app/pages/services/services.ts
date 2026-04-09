import { Component, ElementRef, inject, OnInit, PLATFORM_ID, signal, ViewChildren, QueryList, AfterViewInit, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
  private platformId = inject(PLATFORM_ID);
  @ViewChildren('miniCanvas') miniCanvases!: QueryList<ElementRef<HTMLCanvasElement>>;
  signalCount = signal(0);
  schemaUrl = signal('');
  schemaResult = signal<string | null>(null);
  schemaLoading = signal(false);
  private animIds: number[] = [];

  positioning = [
    'Based in Broken Arrow, Oklahoma and serving the Tulsa metro, the wider Oklahoma market, and remote clients across the U.S.',
    'Best fit for teams that need both clean frontend execution and operational depth.',
    'Built for discoverability in search, AI overviews, and answer engines.'
  ];

  serviceQuestions = [
    {
      question: 'Do you work with Oklahoma businesses?',
      answer: 'Yes. Localhouse Designs is based in Broken Arrow and works with businesses across Broken Arrow, Tulsa, the wider Oklahoma market, and remote clients nationwide.'
    },
    {
      question: 'What makes your SEO and GEO work different?',
      answer: 'The focus is not just metadata. It is entity clarity, structured data, answer-ready copy, internal content architecture, and pages that help search and AI systems understand what the business actually does.'
    },
    {
      question: 'Who is the ideal client?',
      answer: 'Brands that want cleaner positioning, manufacturers or operations teams that need real system understanding, and businesses that want a site that is easier to find, cite, and trust.'
    }
  ];

  serviceBreakdowns = [
    {
      title: 'Angular Development',
      intro: 'For businesses that need a fast, maintainable frontend instead of a fragile site that becomes expensive to change.',
      points: [
        'Best for brand sites, custom marketing pages, SPAs, dashboards, and internal tools.',
        'Built with reusable components, clear state, and architecture that can survive growth.',
        'Strong fit when performance, flexibility, and long-term maintainability matter.'
      ],
      outcomes: ['Faster load times', 'Cleaner component systems', 'Easier future feature work']
    },
    {
      title: 'SEO / GEO / AEO',
      intro: 'For businesses that want to be easier to find in search and easier to understand in AI-generated answers.',
      points: [
        'Covers metadata, structured data, answer-ready copy, entity clarity, and crawl signals.',
        'Focused on helping Google, AI overviews, and chat-based search systems extract the right facts.',
        'Especially valuable for local businesses, niche B2B services, and expertise-driven brands.'
      ],
      outcomes: ['Stronger entity clarity', 'Better answer-engine retrieval', 'More trustworthy search snippets']
    },
    {
      title: 'Enterprise & ERP Integration',
      intro: 'For operations teams that need tools shaped by real system experience rather than generic agency guesses.',
      points: [
        'Built around actual workflow pain points in Business Central, SAP, and Infor SyteLine environments.',
        'Useful for dashboards, automation, mobile floor apps, BOM systems, and reporting workflows.',
        'Designed to reduce friction for the people actually using the system day to day.'
      ],
      outcomes: ['Less workflow friction', 'Faster access to operational data', 'More useful internal tooling']
    }
  ];

  engagementFits = [
    {
      kind: 'Strong fit',
      bullets: [
        'You want a custom site or tool instead of forcing your business into a template.',
        'You care about search visibility, machine-readable structure, and long-term maintainability.',
        'You need someone who can bridge frontend quality with operational or ERP context.'
      ]
    },
    {
      kind: 'Usually not a fit',
      bullets: [
        'You only want the cheapest possible site with no concern for performance, structure, or growth.',
        'You need a giant agency process with multiple account layers instead of direct execution.',
        'You want generic marketing copy without technical depth or operational detail.'
      ]
    }
  ];

  proofSignals = [
    'Angular-first builds with structured-data-aware architecture',
    'Hands-on ERP familiarity across Business Central, SAP, and SyteLine',
    'Schema, sitemap, OG, and answer-engine visibility baked into planning',
    'Netlify deployment, analytics, and launch support handled in the same workflow'
  ];

  services = [
    {
      num: '01',
      title: 'Angular Development',
      desc: 'Standalone components, signals, lazy loading, view transitions. We build Angular apps the way Angular intended - clean, fast, and maintainable. Strong fit for Oklahoma businesses that want a custom site or internal tool instead of a template they will outgrow.',
      items: ['Standalone components', 'Signals & computed state', 'Lazy-loaded routes', 'View transitions API', 'Responsive design', 'Accessibility (WCAG)'],
      demo: 'product',
    },
    {
      num: '02',
      title: 'SEO & GEO',
      desc: 'Traditional search ranking and AI-powered search optimization. FAQPage, HowTo, Product, LocalBusiness, and Service schemas. Built for businesses in Broken Arrow, Tulsa, Oklahoma, and beyond that need Google and AI systems to understand who they are clearly.',
      items: ['JSON-LD structured data', 'FAQPage & HowTo schemas', 'Product & LocalBusiness markup', 'Per-page meta & OG tags', 'Sitemap & robots.txt', 'Google Search Console setup'],
      demo: 'serp',
    },
    {
      num: '03',
      title: 'WebGL & Three.js',
      desc: 'Custom GLSL shaders, particle systems, 3D scenes. From a subtle animated hero to a full generative experience - the browser as a canvas. Every pixel computed on the GPU.',
      items: ['Three.js scenes', 'GLSL shaders', 'Particle systems', 'Post-processing', 'OrbitControls', 'InstancedMesh'],
      demo: 'webgl',
    },
    {
      num: '04',
      title: 'Enterprise & ERP',
      desc: 'Real experience inside Business Central, SAP, and Infor SyteLine - not as a consultant reading documentation, but as an end user who felt the gaps firsthand. That means we know where the data lives, what operations teams actually need access to, and how to build tooling that fits the reality of manufacturing and supply chain work without fighting the system it needs to talk to.',
      items: ['Microsoft Business Central', 'SAP integration', 'Infor SyteLine', 'Mobile floor apps', 'BOM systems & automation', 'Internal ops dashboards'],
      demo: null,
    },
    {
      num: '05',
      title: 'Performance & Deploy',
      desc: 'Deploy your way. Netlify, custom DNS migration, serverless functions, CI/CD - frontend or backend, we handle the full stack. Lighthouse scores and Core Web Vitals are not vanity metrics, they are what search engines and users actually experience.',
      items: ['Netlify deployments', 'DNS migration & custom domains', 'Serverless functions', 'CI/CD pipelines', 'Core Web Vitals audit', 'SSL provisioning'],
      demo: null,
    },
    {
      num: '06',
      title: 'Analytics & Tracking',
      desc: 'GA4, Google Search Console, rich results validation. You cannot improve what you do not measure. We wire in full tracking from day one so you always know what is working.',
      items: ['GA4 setup & configuration', 'Search Console verification', 'Rich results validation', 'Event tracking', 'Conversion goals', 'Real-time reporting'],
      demo: null,
    },
  ];

  // Demo 1: Live product card
  productName = signal('Hot Sauce Co.');
  productTagline = signal('Small batch. Big heat.');

  // Demo 2: SERP preview
  serpBusiness = signal('Your Business');
  serpDesc = signal('We do the thing you need, better than anyone else. Based in Broken Arrow, Oklahoma.');
  serpUrl = signal('yourbusiness.com');

  serpTitle() { return this.serpBusiness() || 'Your Business'; }
  serpSnippet() { return this.serpDesc() || 'Your description appears here in Google search results.'; }
  serpDisplay() {
    const u = this.serpUrl() || 'yourbusiness.com';
    return u.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.miniCanvases.forEach(ref => this.initCardWebGL(ref.nativeElement));
  }

  ngOnDestroy() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.animIds.forEach(id => cancelAnimationFrame(id));
  }

  private initCardWebGL(canvas: HTMLCanvasElement) {
    const w = canvas.clientWidth || 340;
    const h = canvas.clientHeight || 220;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a12);
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 0, 4);

    const cardGeo = new THREE.BoxGeometry(2.8, 1.7, 0.06);
    const cardMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e, roughness: 0.3, metalness: 0.6,
      emissive: new THREE.Color(0x0d0d1a), emissiveIntensity: 1,
    });
    const card = new THREE.Mesh(cardGeo, cardMat);
    card.castShadow = true;
    scene.add(card);

    const stripeMat = new THREE.MeshStandardMaterial({
      color: 0xff3c00, emissive: new THREE.Color(0xff3c00), emissiveIntensity: 0.4,
      roughness: 0.2, metalness: 0.8,
    });
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.06, 0.07), stripeMat);
    stripe.position.set(0, 0.55, 0);
    card.add(stripe);

    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xff3c00, emissive: new THREE.Color(0xff3c00), emissiveIntensity: 1 })
    );
    dot.position.set(-1.1, 0.55, 0.1);
    card.add(dot);

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
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    });
    canvas.addEventListener('mouseleave', () => { mouseX = 0; mouseY = 0; });

    const animate = () => {
      const id = requestAnimationFrame(animate);
      this.animIds.push(id);
      targetX += (mouseX * 0.35 - targetX) * 0.06;
      targetY += (mouseY * 0.2 - targetY) * 0.06;
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
      title: 'Services | Broken Arrow Angular, ERP, and SEO/GEO Services',
      description: 'Angular development, ERP-aware tooling, structured-data-first SEO/GEO, performance, and deployment services from Localhouse Designs in Broken Arrow, Oklahoma, serving Tulsa and remote clients.',
      url: `${base}/services`,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          provider: { '@id': `${base}/#organization` },
          serviceType: 'Web Development',
          name: 'Localhouse Designs Web Services',
          url: `${base}/services`,
          description: 'Angular development, ERP-aware software, SEO/GEO, deployment, analytics, and design systems for businesses in Broken Arrow, Tulsa, Oklahoma, and remote markets.',
          areaServed: [
            { '@type': 'State', name: 'Oklahoma' },
            { '@type': 'Country', name: 'United States' }
          ],
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
            },
            {
              '@type': 'Question',
              name: 'Who is the best fit for Localhouse Designs services?',
              acceptedAnswer: { '@type': 'Answer', text: 'Localhouse Designs is a strong fit for businesses that want custom Angular-based sites or tools, stronger SEO/GEO/AEO foundations, and technically sound implementation shaped by real business and operations context.' }
            },
            {
              '@type': 'Question',
              name: 'Do you work with local Oklahoma businesses and remote clients?',
              acceptedAnswer: { '@type': 'Answer', text: 'Yes. Localhouse Designs is based in Broken Arrow, Oklahoma and works with local businesses across Broken Arrow and Tulsa as well as remote clients throughout the United States.' }
            }
          ]
        }
      ]
    });
  }
}
