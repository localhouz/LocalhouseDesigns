import { AfterViewInit, Component, ElementRef, inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import * as THREE from 'three';
import { SeoService } from '../../shared/seo/seo.service';
import { PreviewShellComponent } from '../../shared/preview-shell/preview-shell';

@Component({
  selector: 'app-home',
  imports: [RouterLink, PreviewShellComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  private seo = inject(SeoService);
  private platformId = inject(PLATFORM_ID);

  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private particles!: THREE.Points;
  private animId!: number;
  private mouse = { x: 0, y: 0 };

  marqueeItems = [
    'Oklahoma service businesses', 'Local SEO / GEO', 'Service page rebuilds', 'Contact path clarity',
    'Structured Data', 'Schema.org', 'Broken Arrow', 'Tulsa', 'Oklahoma City',
    'Angular 21', 'ERP-connected tooling', 'Workflow Automation'
  ];

  services = [
    { num: '01', title: 'Website Rebuilds', desc: "For service businesses stuck with vague messaging, weak structure, or platform-limited sites that don't turn visits into real inquiries." },
    { num: '02', title: 'Local SEO / GEO', desc: 'NAP clarity, structured data, FAQ coverage, service-page depth, and contact-path cleanup so search and AI systems understand the business clearly.' },
    { num: '03', title: 'Audit-First Conversion Work', desc: 'We start with what is unclear, what is slowing trust down, and what is making the next step harder than it should be.' },
    { num: '04', title: 'Operational Tooling', desc: 'Still available for ERP-connected dashboards, internal tools, and workflow automation when the problem extends beyond the website.' },
  ];

  trustFacts = [
    {
      label: 'Based in',
      value: 'Broken Arrow, Oklahoma',
      detail: 'Serving service businesses across Tulsa, Oklahoma City, and the wider Oklahoma market.'
    },
    {
      label: 'Best fit',
      value: 'Oklahoma service businesses',
      detail: 'Especially strong for businesses with outdated, vague, or platform-limited sites that need clearer lead paths.'
    },
    {
      label: 'Built for',
      value: 'Trust + local visibility',
      detail: 'Pages are structured to help Google, AI overviews, and real people understand what the business does and what to do next.'
    }
  ];

  answerBlocks = [
    {
      question: 'Where is Localhouse Designs based?',
      answer: 'Localhouse Designs is based in Broken Arrow, Oklahoma and works with service businesses across Tulsa, Oklahoma City, and the wider Oklahoma market.'
    },
    {
      question: 'What kind of projects are the best fit?',
      answer: "The strongest fit is rebuilding service-business websites that feel vague, outdated, or boxed in by templates, especially when trust and local visibility need work."
    },
    {
      question: 'Why does the ERP background matter?',
      answer: 'It means the sites are built with stronger systems thinking. Clearer flows, better structure, and a sharper sense of what people need in order to take the next step.'
    }
  ];

  insightCards = [
    {
      title: 'Why branded search ownership matters before local SEO promises',
      desc: 'A practical article on why a business should own its own name in search before making bigger SEO claims.',
      route: '/insights/why-branded-search-ownership-matters-before-local-seo-promises',
      tag: 'Entity / SEO'
    },
    {
      title: 'Why Google can find your page and still not index it',
      desc: 'A plain-English explanation of why discovered and crawled pages still get left out of the index, and what usually matters more than panic.',
      route: '/insights/why-google-can-find-your-page-and-still-not-index-it',
      tag: 'Indexing / SEO'
    },
    {
      title: 'What GEO actually means for local businesses',
      desc: 'A plain-English look at GEO, how it fits with SEO, and why local businesses should care.',
      route: '/insights/what-geo-means-for-local-businesses',
      tag: 'SEO / GEO'
    },
    {
      title: 'Why local business websites need clear service-area pages',
      desc: 'A practical look at when local pages help and when they turn into thin SEO clutter.',
      route: '/insights/why-local-business-websites-need-clear-service-area-pages',
      tag: 'Local SEO'
    },
    {
      title: 'What to put above the fold on a local service homepage',
      desc: 'A plain-English breakdown of what the first screen needs to say before someone calls, books, or leaves.',
      route: '/insights/what-to-put-above-the-fold-on-a-local-service-homepage',
      tag: 'Conversion'
    },
    {
      title: 'Why your Google Business Profile and website need to say the same thing',
      desc: 'A practical article on local trust, search consistency, and the path from profile to contact.',
      route: '/insights/why-your-google-business-profile-and-website-need-to-say-the-same-thing',
      tag: 'Local SEO'
    },
    {
      title: 'What manufacturers actually need from ERP-connected tooling',
      desc: 'A practical article on internal tooling, operational friction, and why useful systems start with real workflow needs.',
      route: '/insights/what-manufacturers-actually-need-from-erp-connected-tooling',
      tag: 'ERP / Operations'
    },
    {
      title: 'ERP Lite: Designing an operational decision surface',
      desc: 'A design and UX case study on turning ERP-heavy operations data into a readable front end for floor teams, planners, and leadership.',
      route: '/insights/erp-lite-designing-an-operational-decision-surface',
      tag: 'ERP / UX'
    },
    {
      title: 'How structured data helps AI search understand your business',
      desc: "A practical explanation of what schema actually does, what it can't do alone, and how it supports clearer machine understanding.",
      route: '/insights/how-structured-data-helps-ai-search-understand-your-business',
      tag: 'Structured Data'
    },
    {
      title: 'Why a custom site beats a booking-platform page for local search',
      desc: 'A grounded look at why custom sites create more room for local SEO, trust signals, and answer-ready content than booking-platform shells.',
      route: '/insights/why-a-custom-site-beats-a-booking-platform-page-for-local-search',
      tag: 'Local SEO'
    },
    {
      title: "Why most dashboards don't fix the workflow",
      desc: 'A practical article on why more visibility often fails to reduce friction in ERP and operations work.',
      route: '/insights/why-most-dashboards-do-not-fix-the-workflow',
      tag: 'ERP / Workflows'
    },
    {
      title: 'Why local SEO fails when the contact path is vague',
      desc: 'NAP clarity, CTA clarity, FAQ schema, and map/directions flow - the levers that decide local conversion.',
      route: '/insights/why-local-seo-fails-when-the-contact-path-is-vague',
      tag: 'Local SEO'
    },
    {
      title: 'What local service pages need to rank and get cited',
      desc: 'A grounded look at what makes a service page more useful for local SEO, AI search, and trust.',
      route: '/insights/what-local-service-pages-need-to-rank-and-get-cited',
      tag: 'Local SEO'
    },
    {
      title: 'SyteLine Mobile: making ERP access work on the floor',
      desc: 'A mobile operations case study rooted in firsthand ERP experience and the need for faster floor-level answers.',
      route: '/insights/syteline-mobile-making-erp-access-work-on-the-floor',
      tag: 'ERP / Mobile'
    }
  ];

  featuredProjects = [
    {
      title: 'North Styles',
      desc: 'Built from scratch to replace the old GlossGenius site with a custom brand site, stronger local SEO/AEO foundations, and a cleaner booking path.',
      url: 'https://north-styles.com/',
      previewUrl: 'https://north-styles.com/',
      previewDomain: 'north-styles.com',
      bg: 'linear-gradient(135deg, #091325 0%, #20365c 100%)',
      tag: 'Astro / Local SEO',
      stack: ['Astro', 'Tailwind', 'JSON-LD', 'AEO']
    },
    {
      title: 'NorCal Sauce Worx',
      desc: 'Full Angular rebuild with a clearer quote path, stronger service structure, and FAQPage + HowTo schema support.',
      url: 'https://norcalsauceworx.com',
      previewUrl: 'https://norcalsauceworx.com',
      previewDomain: 'norcalsauceworx.com',
      bg: 'linear-gradient(135deg, #1a0a00 0%, #3d1a00 100%)',
      tag: 'Angular / Netlify',
      stack: ['Angular 21', 'SCSS', 'Netlify Forms', 'JSON-LD']
    },
    {
      title: 'Prescribed Burn Sauces',
      desc: 'Brand site with stronger product structure, full schema coverage, and cleaner measurement foundations from launch.',
      url: 'https://prescribedburnsauces.com',
      previewUrl: 'https://prescribedburnsauces.com',
      previewDomain: 'prescribedburnsauces.com',
      bg: 'linear-gradient(135deg, #1a0000 0%, #3d0000 100%)',
      tag: 'Angular / Three.js',
      stack: ['Angular 21', 'Three.js', 'GA4', 'Schema.org']
    }
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.com';
    this.seo.setPage({
      title: 'Localhouse Designs | Broken Arrow Web Studio for Angular, ERP, SEO/GEO',
      description: 'Broken Arrow, Oklahoma web studio building clearer, higher-converting websites for service businesses across Oklahoma, with stronger local SEO/GEO and cleaner contact paths.',
      url: base,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${base}/#webpage`,
          url: base,
          name: 'Localhouse Designs | Oklahoma Service Business Websites',
          description: 'Broken Arrow, Oklahoma web studio building clearer, higher-converting websites for service businesses with stronger local SEO/GEO and cleaner lead paths.',
          isPartOf: { '@id': `${base}/#website` },
          about: { '@id': `${base}/#organization` },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base }
            ]
          }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'ProfessionalService',
          '@id': `${base}/#organization`,
          name: 'Localhouse Designs',
          description: 'Boutique web studio helping Oklahoma service businesses rebuild vague or underperforming websites into clearer, higher-converting sites with stronger local SEO/GEO foundations. Enterprise and ERP-connected tooling also available.',
          url: base,
          priceRange: '$5K-$40K+',
          logo: { '@type': 'ImageObject', url: `${base}/og.png`, width: 1200, height: 630 },
          sameAs: ['https://github.com/localhouz', 'https://www.linkedin.com/in/steven-rausch83/'],
          founder: {
            '@type': 'Person',
            name: 'Steven Rausch',
            url: 'https://www.linkedin.com/in/steven-rausch83/'
          },
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Broken Arrow',
            addressRegion: 'OK',
            addressCountry: 'US'
          },
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'sales',
            url: `${base}/contact`,
            areaServed: ['Broken Arrow', 'Tulsa', 'Oklahoma City', 'Oklahoma', 'United States'],
            availableLanguage: 'English'
          },
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Localhouse Designs Services',
            itemListElement: [
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Website Rebuilds for Service Businesses' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Local SEO and GEO Optimization' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Conversion and Contact Path Audits' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'ERP-connected Operational Tooling' } }
            ]
          },
          knowsAbout: [
            'Angular', 'TypeScript', 'SEO', 'GEO', 'Web Development', 'Netlify',
            'Three.js', 'WebGL', 'Structured Data', 'Schema.org', 'JSON-LD',
            'Microsoft Business Central', 'SAP', 'Infor SyteLine',
            'ERP Integration', 'Workflow Automation', 'VSTO', 'C#',
            'Manufacturing Operations', 'Supply Chain', 'BOM Systems',
            'Mobile Floor Apps', 'GA4'
          ],
          areaServed: [
            { '@type': 'City', name: 'Broken Arrow' },
            { '@type': 'City', name: 'Tulsa' },
            { '@type': 'City', name: 'Oklahoma City' },
            { '@type': 'State', name: 'Oklahoma' },
            { '@type': 'Country', name: 'United States' }
          ]
        }
      ]
    });
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.initThree();
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('resize', this.onResize);
  }

  ngOnDestroy() {
    if (!isPlatformBrowser(this.platformId)) return;
    cancelAnimationFrame(this.animId);
    this.renderer?.dispose();
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('resize', this.onResize);
  }

  private onMouseMove = (e: MouseEvent) => {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  };

  private onResize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  private initThree() {
    const canvas = this.canvasRef.nativeElement;
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    this.camera.position.z = 4;

    const count = 4000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const accent = new THREE.Color('#ff3c00');
    const accent2 = new THREE.Color('#7c3aed');
    const white = new THREE.Color('#f0f0f5');

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

      const r = Math.random();
      const col = r < 0.06 ? accent : r < 0.12 ? accent2 : white;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.014,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      sizeAttenuation: true
    });

    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);
    this.animate();
  }

  private animate = () => {
    this.animId = requestAnimationFrame(this.animate);
    const t = Date.now() * 0.00008;
    this.particles.rotation.y = t * 0.4 + this.mouse.x * 0.15;
    this.particles.rotation.x = t * 0.15 + this.mouse.y * 0.08;
    this.renderer.render(this.scene, this.camera);
  };
}
