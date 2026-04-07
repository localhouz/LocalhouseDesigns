import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SeoService } from '../../shared/seo/seo.service';

interface Repo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  topics: string[];
  updated_at: string;
}

@Component({
  selector: 'app-work',
  imports: [CommonModule],
  templateUrl: './work.html',
  styleUrl: './work.scss'
})
export class WorkComponent implements OnInit {
  private seo = inject(SeoService);
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);

  safeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  repos = signal<Repo[]>([]);
  loading = signal(true);

  caseStudies = [
    {
      title: 'NorCal Sauce Worx',
      subtitle: 'Co-packing brand site',
      url: 'https://norcalsauceworx.com',
      previewUrl: 'https://norcalsauceworx.com',
      imageUrl: '',
      outcome: 'Quote wizard, Netlify Forms, FAQPage + HowTo + Service schemas, sitemap, full GEO coverage.',
      stack: ['Angular 21', 'SCSS', 'Netlify Forms', 'JSON-LD', 'Schema.org'],
      metrics: [
        { val: '8', label: 'FAQ schemas' },
        { val: '5', label: 'Service schemas' },
        { val: '100%', label: 'Form uptime' },
      ],
      comingSoon: false,
    },
    {
      title: 'Prescribed Burn Sauces',
      subtitle: 'E-commerce brand site',
      url: 'https://prescribedburnsauces.com',
      previewUrl: 'https://prescribedburnsauces.com',
      imageUrl: '',
      outcome: 'WebGL hero, 10 product schemas, GA4, Google Search Console verified, 26 rich result items all valid.',
      stack: ['Angular 21', 'Three.js', 'GA4', 'Schema.org', 'Netlify DNS'],
      metrics: [
        { val: '26', label: 'Rich results' },
        { val: '15', label: 'FAQ entries' },
        { val: '10', label: 'Product schemas' },
      ],
      comingSoon: false,
    },
    {
      title: 'OpsSuite',
      subtitle: 'Enterprise Excel add-in',
      url: '',
      previewUrl: '',
      imageUrl: 'OpsSuite.png',
      outcome: 'Unified 7 legacy VBA add-ins into a single C# VSTO Excel ribbon — fully deployed, API-updateable without touching the client machine. Covers capacity planning, master scheduling, exception processing, louver consumption, and purchasing workflows across multiple departments.',
      stack: ['C#', 'VSTO', '.NET Framework', 'SQL Server', 'REST API', 'Excel'],
      metrics: [
        { val: '7→1', label: 'Add-ins unified' },
        { val: 'API', label: 'Remote updates' },
        { val: 'Live', label: 'In production' },
      ],
      comingSoon: false,
    },
    {
      title: 'Operations Dashboard',
      subtitle: 'Internal enterprise tooling',
      url: '',
      previewUrl: '',
      imageUrl: '',
      outcome: 'Full-stack operations dashboard built for internal manufacturing management. Custom BOM programs, workflow automation, and real-time production data. Screenshot pending environment spin-up.',
      stack: ['Angular', 'REST API', 'Workflow Engine', 'BOM Systems', 'Data Viz'],
      metrics: [
        { val: 'BOM', label: 'Automation' },
        { val: 'Real-time', label: 'Data' },
        { val: 'Custom', label: 'Workflows' },
      ],
      comingSoon: true,
    },
  ];

  inDevelopment = [
    {
      title: 'SyteLine Mobile',
      desc: 'Using Infor SyteLine as an end user made one problem obvious: the system contained critical operational data, but access to it was still tied too heavily to the desktop. For supply chain leads, inventory managers, shippers, and team leads, that meant slower decisions, more handoffs, and too much time spent chasing routine answers. SyteLine Mobile was designed to fix that — a purpose-built mobile interface that surfaces real-time production, BOM, inventory, and shipment data for the people responsible for keeping work moving.',
      stack: ['Mobile', 'Infor SyteLine', 'ERP Integration', 'Workflow Automation'],
      status: 'In Process',
    },
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.netlify.app';
    this.seo.setPage({
      title: 'Work | Localhouse Designs — Angular Builds, SEO/GEO, Live Projects',
      description: 'Case studies and live projects from Localhouse Designs. Angular builds, full SEO/GEO treatment, and GitHub open source work.',
      url: `${base}/work`,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          '@id': `${base}/work#webpage`,
          url: `${base}/work`,
          name: 'Work | Localhouse Designs',
          description: 'Portfolio of web development and enterprise projects by Localhouse Designs.',
          isPartOf: { '@id': `${base}/#website` },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Work', item: `${base}/work` }
            ]
          }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Localhouse Designs — Featured Projects',
          url: `${base}/work`,
          itemListElement: [
            {
              '@type': 'ListItem', position: 1,
              url: 'https://norcalsauceworx.com',
              name: 'NorCal Sauce Worx',
              description: 'Angular 21 co-packing brand site with quote wizard, Netlify Forms, FAQPage + HowTo + Service schemas, sitemap, and full GEO coverage.'
            },
            {
              '@type': 'ListItem', position: 2,
              url: 'https://prescribedburnsauces.com',
              name: 'Prescribed Burn Sauces',
              description: 'Angular 21 e-commerce brand site with WebGL hero, 10 product schemas, GA4, Google Search Console verified, 26 rich result items all valid.'
            },
            {
              '@type': 'ListItem', position: 3,
              name: 'OpsSuite',
              description: 'C# VSTO Excel ribbon add-in unifying 7 legacy VBA add-ins. Fully deployed and API-updateable without touching client machines. Covers capacity planning, master scheduling, exception processing, and purchasing workflows.'
            }
          ]
        }
      ]
    });

    this.http.get<Repo[]>('https://api.github.com/users/localhouz/repos?sort=updated&per_page=12')
      .subscribe({
        next: (repos) => {
          this.repos.set(repos.filter(r => !r.name.startsWith('.')));
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  openProject(url: string) {
    if (url) window.open(url, '_blank', 'noopener');
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
}
