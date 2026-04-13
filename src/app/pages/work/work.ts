import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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
  imports: [CommonModule, PreviewShellComponent, RouterLink],
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
      title: 'Local GEO Standard',
      subtitle: 'Results-only case study',
      url: '',
      previewUrl: '',
      imageUrl: 'local-geo-results.svg',
      outcome: 'Results-only GEO/SEO case study showing measurable lifts across North Styles, Prescribed Burn Sauces, and NorCal Sauce Worx while keeping the implementation private.',
      challenge: 'All three sites had different gaps: inconsistent NAP visibility, unclear contact flows, and incomplete structured signals that made local discovery less reliable.',
      work: [
        'Scored each site against a fixed checklist: NAP placement, LocalBusiness schema, contact clarity, CTA path, map/directions, FAQs, and reviews.',
        'Applied the same scoring rubric before and after targeted fixes.',
        'Shared results only, withholding templates and implementation details.'
      ],
      result: 'The public case study shows the outcome and score lift, plus why each site moved (clearer NAP placement, tighter contact flow, and stronger structured signals). Full audits are available by request.',
      stack: ['Local GEO', 'Schema.org', 'On-page SEO', 'AEO'],
      metrics: [
        { val: '+26', label: 'Avg score lift' },
        { val: '3', label: 'Sites audited' },
        { val: 'Results-only', label: 'Public view' },
      ],
      ctaLabel: 'Request the full audit ->',
      ctaRoute: '/local-geo-audit',
      comingSoon: false,
    },
    {
      title: 'OpsSuite',
      subtitle: 'Enterprise Excel add-in',
      url: '',
      previewUrl: '',
      videoUrl: 'dashboard-cut-01m12s.mp4',
      imageUrl: 'OpsSuite.png',
      outcome: 'Unified 7 legacy VBA add-ins into a single C# VSTO Excel ribbon - fully deployed, API-updateable without touching the client machine. Covers capacity planning, master scheduling, exception processing, louver consumption, and purchasing workflows across multiple departments.',
      challenge: 'The existing Excel tooling was fragmented across multiple legacy VBA add-ins, which made maintenance harder, slowed updates, and spread operational workflows across too many disconnected surfaces.',
      work: [
        'Rebuilt the tooling as a single C# VSTO ribbon application that consolidated seven separate add-ins into one deployable system.',
        'Connected the add-in to APIs and SQL-backed business logic so updates could be delivered centrally without touching each client machine.',
        'Covered real operational workflows including capacity planning, master scheduling, exception processing, louver consumption, and purchasing support.'
      ],
      result: 'OpsSuite turned scattered spreadsheet tooling into one maintainable production application, giving operations teams a cleaner workflow and making ongoing updates dramatically easier to manage.',
      stack: ['C#', 'VSTO', '.NET Framework', 'SQL Server', 'REST API', 'Excel'],
      metrics: [
        { val: '7->1', label: 'Add-ins unified' },
        { val: 'API', label: 'Remote updates' },
        { val: 'Live', label: 'In production' },
      ],
      comingSoon: false,
    },
    {
      title: 'Generative Workflow Dashboard',
      subtitle: 'Operations intelligence UI',
      url: '',
      previewUrl: '',
      videoUrl: 'dashboard-cut-01m12s.mp4',
      imageUrl: '',
      outcome: 'Built a generative, role-aware dashboard that turns ERP workflows into a readable operational surface. The UI adapts to workflow state and highlights what matters now instead of forcing users through menu trees.',
      challenge: 'Operations teams were stuck interpreting transactional ERP screens that were not designed for fast decision-making. That led to slower response times, constant context switching, and missed bottlenecks.',
      work: [
        'Designed a workflow-first UI that reorders and prioritizes tasks based on live operational state.',
        'Created a generative layout that adjusts to different roles and work queues without rebuilding the screen.',
        'Focused the surface on exceptions, bottlenecks, and next actions instead of raw ERP tables.'
      ],
      result: 'The dashboard reduced interpretation time and made operational bottlenecks visible without hunting across ERP modules.',
      stack: ['Angular', 'TypeScript', 'Workflow Design', 'Operational UX', 'ERP'],
      metrics: [
        { val: 'Role-aware', label: 'Adaptive UI' },
        { val: 'Workflow', label: 'State-driven' },
        { val: 'Ops', label: 'Decision surface' },
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
              name: 'Local GEO Standard',
              description: 'Results-only case study across three local brands showing before and after improvements in local visibility signals. Full audit available by request.'
            },
            {
              '@type': 'ListItem', position: 5,
              name: 'OpsSuite',
              description: 'C# VSTO Excel ribbon add-in unifying 7 legacy VBA add-ins into one deployed application with API-updateable behavior. Covers capacity planning, master scheduling, exception processing, and purchasing workflows.'
            },
            {
              '@type': 'ListItem', position: 6,
              name: 'Generative Workflow Dashboard',
              description: 'Generative, role-aware operations dashboard that translates ERP workflows into a decision surface focused on exceptions, bottlenecks, and next actions.'
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

  onVideoEnded(event: Event) {
    const video = event.target as HTMLVideoElement | null;
    if (!video) return;
    video.currentTime = 0;
    window.setTimeout(() => video.play().catch(() => undefined), 1200);
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
}
