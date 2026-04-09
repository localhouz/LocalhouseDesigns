import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { SeoService } from '../../shared/seo/seo.service';
import { PreviewShellComponent } from '../../shared/preview-shell/preview-shell';

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
  imports: [CommonModule, PreviewShellComponent],
  templateUrl: './work.html',
  styleUrl: './work.scss'
})
export class WorkComponent implements OnInit {
  private seo = inject(SeoService);
  private http = inject(HttpClient);

  repos = signal<Repo[]>([]);
  loading = signal(true);

  caseStudies = [
    {
      title: 'North Styles',
      subtitle: 'Local grooming brand site',
      url: 'https://north-styles.com/',
      previewUrl: 'https://north-styles.com/preview',
      previewDomain: 'north-styles.com',
      imageUrl: '',
      outcome: 'Built from scratch to replace the old GlossGenius site with a custom standalone brand site. Added dedicated About and Contact flows, stronger local SEO / GEO / AEO foundations, trust-building content, and a cleaner path from discovery to booking.',
      challenge: 'The original web presence lived on a limited booking-platform site, which constrained the brand, reduced flexibility, and left little room for stronger local search visibility or richer trust-building content.',
      work: [
        'Built a custom standalone site from scratch to replace the older GlossGenius presence.',
        'Added clearer About and Contact flows, stronger business context, and cleaner content structure.',
        'Improved local SEO / GEO / AEO foundations with more answer-ready and machine-readable signals.'
      ],
      result: 'North Styles now has a site it actually owns: stronger branding, more flexibility, and a much better foundation for discovery, trust, and booking.',
      stack: ['Astro', 'Tailwind', 'JSON-LD', 'Local SEO', 'AEO'],
      metrics: [
        { val: 'Custom', label: 'Built from scratch' },
        { val: '3', label: 'SEO / GEO / AEO' },
        { val: 'Old -> New', label: 'Platform replaced' },
      ],
      comingSoon: false,
    },
    {
      title: 'NorCal Sauce Worx',
      subtitle: 'Co-packing brand site',
      url: 'https://norcalsauceworx.com',
      previewUrl: 'https://norcalsauceworx.com',
      previewDomain: 'norcalsauceworx.com',
      imageUrl: '',
      outcome: 'Built a co-packing brand site with a quote wizard, stronger service positioning, and structured SEO/GEO foundations that support a clearer path from discovery to inquiry.',
      challenge: 'The site needed to explain a specialized co-packing offer clearly enough for potential clients to understand the process, self-qualify, and request a quote without a lot of back-and-forth.',
      work: [
        'Built the site in Angular with a quote flow that helps turn a complex service conversation into a cleaner intake experience.',
        'Added FAQPage, HowTo, and Service schema coverage so search engines and answer engines can extract the right service context.',
        'Structured the content around co-packing questions, process clarity, and inquiry readiness instead of generic brochure copy.'
      ],
      result: 'The finished site gives NorCal Sauce Worx a stronger service narrative, cleaner lead path, and a more credible search-ready presence for a niche offer.',
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
      previewDomain: 'prescribedburnsauces.com',
      imageUrl: '',
      outcome: 'Built an e-commerce brand site with a custom WebGL hero, strong product schema coverage, and analytics foundations that support both brand presentation and richer search visibility.',
      challenge: 'The site needed to feel distinct as a brand while still handling the practical side of search visibility, product understanding, and performance-conscious frontend work.',
      work: [
        'Built a more distinctive frontend experience with WebGL and Three.js instead of relying on a generic storefront feel.',
        'Added product schema, FAQ content, GA4, and Search Console setup so the site is easier for search systems to understand and track.',
        'Balanced branding, performance, and structured product information so the site can support both discovery and shopping behavior.'
      ],
      result: 'Prescribed Burn Sauces now has a stronger visual identity and a much better technical foundation for product visibility, tracking, and rich-result readiness.',
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
      outcome: 'Unified 7 legacy VBA add-ins into a single C# VSTO Excel ribbon - fully deployed, API-updateable without touching the client machine. Covers capacity planning, master scheduling, exception processing, louver consumption, and purchasing workflows across multiple departments.',
      stack: ['C#', 'VSTO', '.NET Framework', 'SQL Server', 'REST API', 'Excel'],
      metrics: [
        { val: '7->1', label: 'Add-ins unified' },
        { val: 'API', label: 'Remote updates' },
        { val: 'Live', label: 'In production' },
      ],
      comingSoon: false,
    },
    {
      title: 'Eads Cooling Solutions',
      subtitle: 'ERP workflow automation',
      url: '',
      previewUrl: '',
      imageUrl: '',
      outcome: 'Built internal Angular and C# tools tied to ERP and production workflows, with a major focus on BOM, routing, reporting, and day-to-day operational accuracy. Wrote the migration scripts used in the Microsoft Business Central to Infor SyteLine cutover, helping deliver a zero-downtime transition with no data loss.',
      challenge: 'The work involved real manufacturing and ERP friction: manual handling, workflow bottlenecks, and high-risk business data movement during a major ERP transition.',
      work: [
        'Built internal Angular and C# tools for workflow visibility, reporting, and execution.',
        'Automated BOM and routing-related processes to reduce manual effort and improve data quality.',
        'Developed the migration scripts used in the Microsoft Business Central to Infor SyteLine cutover.'
      ],
      result: 'The result was a stronger internal workflow foundation and a successful ERP migration completed with zero downtime and no data loss.',
      stack: ['Angular', 'C#', 'Business Central', 'Infor SyteLine', 'BOM Systems', 'Workflow Automation'],
      metrics: [
        { val: '0', label: 'Downtime at cutover' },
        { val: '100%', label: 'Data retained' },
        { val: 'BOM', label: 'Workflow automation' },
      ],
      comingSoon: false,
    },
  ];

  inDevelopment = [
    {
      title: 'SyteLine Mobile',
      desc: 'Using Infor SyteLine as an end user made one problem obvious: the system contained critical operational data, but access to it was still tied too heavily to the desktop. For supply chain leads, inventory managers, shippers, and team leads, that meant slower decisions, more handoffs, and too much time spent chasing routine answers. SyteLine Mobile was designed to fix that - a purpose-built mobile interface that surfaces real-time production, BOM, inventory, and shipment data for the people responsible for keeping work moving.',
      stack: ['Mobile', 'Infor SyteLine', 'ERP Integration', 'Workflow Automation'],
      status: 'In Process',
    },
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.netlify.app';
    this.seo.setPage({
      title: 'Work | Localhouse Designs - Angular Builds, SEO/GEO, Live Projects',
      description: 'Case studies and live projects from Localhouse Designs in Broken Arrow, Oklahoma. Angular builds, full SEO/GEO treatment, and operational software work reaching as far as Sacramento, California.',
      url: `${base}/work`,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          '@id': `${base}/work#webpage`,
          url: `${base}/work`,
          name: 'Work | Localhouse Designs',
          description: 'Portfolio of web development and enterprise projects by Localhouse Designs, based in Broken Arrow, Oklahoma and serving clients locally and remotely.',
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
          name: 'Localhouse Designs - Featured Projects',
          url: `${base}/work`,
          itemListElement: [
            {
              '@type': 'ListItem', position: 1,
              url: 'https://north-styles.com/',
              name: 'North Styles',
              description: 'Custom-built standalone brand site created from scratch to replace an older GlossGenius site, with stronger local SEO, GEO, AEO, trust content, and a cleaner booking path.'
            },
            {
              '@type': 'ListItem', position: 2,
              url: 'https://norcalsauceworx.com',
              name: 'NorCal Sauce Worx',
              description: 'Angular 21 co-packing brand site with quote wizard, Netlify Forms, FAQPage + HowTo + Service schemas, sitemap, and full GEO coverage.'
            },
            {
              '@type': 'ListItem', position: 3,
              url: 'https://prescribedburnsauces.com',
              name: 'Prescribed Burn Sauces',
              description: 'Angular 21 e-commerce brand site with WebGL hero, 10 product schemas, GA4, Google Search Console verified, 26 rich result items all valid.'
            },
            {
              '@type': 'ListItem', position: 4,
              name: 'OpsSuite',
              description: 'C# VSTO Excel ribbon add-in unifying 7 legacy VBA add-ins. Fully deployed and API-updateable without touching client machines. Covers capacity planning, master scheduling, exception processing, and purchasing workflows.'
            },
            {
              '@type': 'ListItem', position: 5,
              name: 'Eads Cooling Solutions',
              description: 'Internal software and ERP workflow automation work including Angular and C# applications, BOM and routing process improvements, and migration scripts used for a zero-downtime Microsoft Business Central to Infor SyteLine cutover.'
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
