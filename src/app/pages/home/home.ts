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
    'Angular 21', 'Three.js', 'SEO/GEO', 'Netlify', 'TypeScript',
    'Business Central', 'SAP', 'Infor SyteLine', 'ERP Integration',
    'Structured Data', 'Schema.org', 'WebGL', 'Workflow Automation'
  ];

  services = [
    { num: '01', title: 'Angular Development', desc: 'Standalone components, signals, lazy loading. Modern Angular done right - fast, maintainable, and ready for scale.' },
    { num: '02', title: 'Enterprise & ERP', desc: 'Business Central, SAP, Infor SyteLine - custom integrations, internal tooling, mobile floor apps, and workflow automation built by someone who actually used these systems.' },
    { num: '03', title: 'SEO & GEO', desc: 'Structured data, FAQPage schemas, Product markup, AI-ready content. Built to rank in search and AI overviews alike.' },
    { num: '04', title: 'WebGL & Three.js', desc: 'Custom GLSL shaders, particle systems, 3D experiences. Browser as canvas - from subtle texture to full generative art.' },
  ];

  trustFacts = [
    {
      label: 'Based in',
      value: 'Broken Arrow, Oklahoma',
      detail: 'Serving Broken Arrow, Tulsa, Oklahoma, and remote clients nationwide.'
    },
    {
      label: 'Best fit',
      value: 'Brands + operations teams',
      detail: 'Especially strong for Angular builds, ERP-connected tooling, and structured-data-first sites.'
    },
    {
      label: 'Built for',
      value: 'Search + answer engines',
      detail: 'Pages are written to help Google, AI overviews, and chat-based discovery systems extract facts cleanly.'
    }
  ];

  answerBlocks = [
    {
      question: 'Where is Localhouse Designs based?',
      answer: 'Localhouse Designs is based in Broken Arrow, Oklahoma and works with clients across the Tulsa metro, Oklahoma, and the wider U.S.'
    },
    {
      question: 'What kind of projects are the best fit?',
      answer: 'The strongest fit is modern Angular sites, structured-data-heavy SEO/GEO work, and business tooling connected to ERP and operations workflows.'
    },
    {
      question: 'Why does the ERP background matter?',
      answer: 'It means the work is shaped by firsthand experience with operational systems, not generic agency assumptions or surface-level documentation.'
    }
  ];

  insightCards = [
    {
      title: 'What GEO actually means for local businesses',
      desc: 'A plain-English look at GEO, how it fits with SEO, and why local businesses should care.',
      route: '/insights/what-geo-means-for-local-businesses',
      tag: 'SEO / GEO'
    },
    {
      title: 'What manufacturers actually need from ERP-connected tooling',
      desc: 'A practical article on internal tooling, operational friction, and why useful systems start with real workflow needs.',
      route: '/insights/what-manufacturers-actually-need-from-erp-connected-tooling',
      tag: 'ERP / Operations'
    },
    {
      title: 'How structured data helps AI search understand your business',
      desc: 'A practical explanation of what schema actually does, what it cannot do alone, and how it supports clearer machine understanding.',
      route: '/insights/how-structured-data-helps-ai-search-understand-your-business',
      tag: 'Structured Data'
    },
    {
      title: 'Why a custom site beats a booking-platform page for local search',
      desc: 'A grounded look at why custom sites create more room for local SEO, trust signals, and answer-ready content than booking-platform shells.',
      route: '/insights/why-a-custom-site-beats-a-booking-platform-page-for-local-search',
      tag: 'Local SEO'
    }
  ];

  featuredProjects = [
    {
      title: 'North Styles',
      desc: 'Built from scratch to replace the old GlossGenius site with a custom brand site, stronger local SEO/AEO foundations, and a cleaner booking path.',
      url: 'https://north-styles.com/',
      previewUrl: 'https://north-styles.com/preview',
      previewDomain: 'north-styles.com',
      bg: 'linear-gradient(135deg, #091325 0%, #20365c 100%)',
      tag: 'Astro / Local SEO',
      stack: ['Astro', 'Tailwind', 'JSON-LD', 'AEO']
    },
    {
      title: 'NorCal Sauce Worx',
      desc: 'Full Angular rebuild - quote wizard, co-packing process, FAQPage + HowTo schemas, Netlify Forms.',
      url: 'https://norcalsauceworx.com',
      previewUrl: 'https://norcalsauceworx.com',
      previewDomain: 'norcalsauceworx.com',
      bg: 'linear-gradient(135deg, #1a0a00 0%, #3d1a00 100%)',
      tag: 'Angular / Netlify',
      stack: ['Angular 21', 'SCSS', 'Netlify Forms', 'JSON-LD']
    },
    {
      title: 'Prescribed Burn Sauces',
      desc: 'Brand site with WebGL, full product schemas, GA4, Google Search Console. 26 rich result items - all valid.',
      url: 'https://prescribedburnsauces.com',
      previewUrl: 'https://prescribedburnsauces.com',
      previewDomain: 'prescribedburnsauces.com',
      bg: 'linear-gradient(135deg, #1a0000 0%, #3d0000 100%)',
      tag: 'Angular / Three.js',
      stack: ['Angular 21', 'Three.js', 'GA4', 'Schema.org']
    }
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.netlify.app';
    this.seo.setPage({
      title: 'Localhouse Designs | Boutique Web Studio - Angular, SEO/GEO, Bleeding Edge',
      description: 'Boutique web studio in Broken Arrow, Oklahoma specializing in Angular, performance SEO/GEO, and bold digital experiences. Built different.',
      url: base,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${base}/#webpage`,
          url: base,
          name: 'Localhouse Designs | Angular, ERP, SEO/GEO - Built Different',
          description: 'Boutique web studio specializing in Angular development, enterprise ERP integrations (Business Central, SAP, SyteLine), and performance SEO/GEO.',
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
          description: 'Boutique web studio specializing in Angular development, enterprise ERP integrations (Microsoft Business Central, SAP, Infor SyteLine), SEO/GEO structured data optimization, WebGL/Three.js experiences, and Netlify deployments.',
          url: base,
          sameAs: ['https://github.com/localhouz'],
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
            areaServed: ['Broken Arrow', 'Tulsa', 'Oklahoma', 'United States'],
            availableLanguage: 'English'
          },
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Localhouse Designs Services',
            itemListElement: [
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Angular Development' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'ERP Integration' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'SEO and GEO Optimization' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'WebGL and Three.js Development' } }
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
