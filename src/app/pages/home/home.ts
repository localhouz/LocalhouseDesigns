import { AfterViewInit, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import * as THREE from 'three';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  private seo = inject(SeoService);
  private sanitizer = inject(DomSanitizer);

  safeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

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
    { num: '01', title: 'Angular Development', desc: 'Standalone components, signals, lazy loading. Modern Angular done right — fast, maintainable, and ready for scale.' },
    { num: '02', title: 'Enterprise & ERP', desc: 'Business Central, SAP, Infor SyteLine — custom integrations, internal tooling, mobile floor apps, and workflow automation built by someone who actually used these systems.' },
    { num: '03', title: 'SEO & GEO', desc: 'Structured data, FAQPage schemas, Product markup, AI-ready content. Built to rank in search and AI overviews alike.' },
    { num: '04', title: 'WebGL & Three.js', desc: 'Custom GLSL shaders, particle systems, 3D experiences. Browser as canvas — from subtle texture to full generative art.' },
  ];

  featuredProjects = [
    {
      title: 'North Styles',
      desc: 'Astro rebuild for a Tulsa grooming studio with stronger local SEO, AEO, trust content, and a cleaner booking path.',
      url: 'https://northstyles.com',
      bg: 'linear-gradient(135deg, #091325 0%, #20365c 100%)',
      tag: 'Astro / Local SEO',
      stack: ['Astro', 'Tailwind', 'JSON-LD', 'AEO']
    },
    {
      title: 'NorCal Sauce Worx',
      desc: 'Full Angular rebuild — quote wizard, co-packing process, FAQPage + HowTo schemas, Netlify Forms.',
      url: 'https://norcalsauceworx.com',
      bg: 'linear-gradient(135deg, #1a0a00 0%, #3d1a00 100%)',
      tag: 'Angular · Netlify',
      stack: ['Angular 21', 'SCSS', 'Netlify Forms', 'JSON-LD']
    },
    {
      title: 'Prescribed Burn Sauces',
      desc: 'Brand site with WebGL, full product schemas, GA4, Google Search Console. 26 rich result items — all valid.',
      url: 'https://prescribedburnsauces.com',
      bg: 'linear-gradient(135deg, #1a0000 0%, #3d0000 100%)',
      tag: 'Angular · Three.js',
      stack: ['Angular 21', 'Three.js', 'GA4', 'Schema.org']
    }
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.netlify.app';
    this.seo.setPage({
      title: 'Localhouse Designs | Boutique Web Studio — Angular, SEO/GEO, Bleeding Edge',
      description: 'Boutique web studio specializing in Angular, performance SEO/GEO, and bold digital experiences. Built different.',
      url: base,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${base}/#webpage`,
          url: base,
          name: 'Localhouse Designs | Angular · ERP · SEO/GEO — Built Different',
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
          knowsAbout: [
            'Angular', 'TypeScript', 'SEO', 'GEO', 'Web Development', 'Netlify',
            'Three.js', 'WebGL', 'Structured Data', 'Schema.org', 'JSON-LD',
            'Microsoft Business Central', 'SAP', 'Infor SyteLine',
            'ERP Integration', 'Workflow Automation', 'VSTO', 'C#',
            'Manufacturing Operations', 'Supply Chain', 'BOM Systems',
            'Mobile Floor Apps', 'GA4'
          ],
          areaServed: { '@type': 'Country', name: 'United States' }
        }
      ]
    });
  }

  ngAfterViewInit() {
    this.initThree();
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('resize', this.onResize);
  }

  ngOnDestroy() {
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
      positions[i * 3]     = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

      const r = Math.random();
      const col = r < 0.06 ? accent : r < 0.12 ? accent2 : white;
      colors[i * 3]     = col.r;
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
