import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-services',
  imports: [RouterLink],
  templateUrl: './services.html',
  styleUrl: './services.scss'
})
export class ServicesComponent implements OnInit {
  private seo = inject(SeoService);
  

  positioning = [
    'Based in Broken Arrow and built for service businesses across Oklahoma that need a clearer site, stronger trust signals, and a next step people will actually take.',
    'Best fit for businesses whose current website feels vague, boxed in by a platform, or too thin to support local SEO, GEO, and real conversion.',
    'Also available for operations-heavy teams that need ERP-aware dashboards, workflow tooling, or a cleaner surface on top of messy internal systems.'
  ];

  serviceQuestions = [
    {
      question: 'Do you work with businesses outside Tulsa?',
      answer: 'Yes. Localhouse Designs is based in Broken Arrow and works across Oklahoma, especially around Tulsa, Broken Arrow, Oklahoma City, Edmond, Norman, Moore, Jenks, Owasso, and Bixby.'
    },
    {
      question: 'What do you mean by website clarity?',
      answer: 'It means the site quickly answers the questions that decide trust: what you do, where you work, who you serve, why someone should choose you, and what the next step is. That is where a lot of conversion and local visibility problems really start.'
    },
    {
      question: 'Is this just SEO work?',
      answer: 'No. Search visibility is only one piece. The stronger offer is a clearer site overall: better service pages, better About and Contact structure, stronger local signals, cleaner CTAs, and better measurement once the site is live.'
    },
    {
      question: 'Who is the best fit?',
      answer: 'The best fit is an established Oklahoma service business with a dated, vague, or platform-limited site. Secondary fit is an operations-heavy team that needs ERP-connected tooling or a more readable internal dashboard.'
    }
  ];

  serviceBreakdowns = [
    {
      title: 'Website Rebuilds For Service Businesses',
      intro: 'This is the primary lane: rebuild the site so it is easier to trust, easier to navigate, and easier to contact.',
      points: [
        'Best for salons, barbers, med spas, home services, wellness brands, and other Oklahoma businesses that depend on local trust.',
        'Reworks weak homepages, vague service pages, platform-limited layouts, and confusing About or Contact sections.',
        'Built custom so the brand feels real, the path feels obvious, and the business is not stuck inside someone else\'s template.'
      ],
      outcomes: ['More trust', 'Clearer offer', 'Better first impression']
    },
    {
      title: 'Local SEO / GEO / AEO Foundations',
      intro: 'This is where visibility and conversion start to work together instead of fighting each other.',
      points: [
        'Covers the pieces that most local businesses miss first: visible NAP, clear CTA paths, real FAQ content, map and directions flow, and schema that matches the page.',
        'Built to help Google, AI overviews, and answer engines understand the business without making people read through clutter.',
        'Best used as part of a site cleanup or rebuild, not as a layer of technical garnish on top of vague messaging.'
      ],
      outcomes: ['Stronger local signals', 'Better entity clarity', 'Less contact friction']
    },
    {
      title: 'Audit-First Conversion Cleanup',
      intro: 'For businesses that are not ready for a full rebuild but need a clear first move.',
      points: [
        'Starts with a fast async review of homepage clarity, service-page structure, NAP placement, CTA consistency, FAQ coverage, and contact-path friction.',
        'Turns abstract website problems into a short list of practical fixes instead of broad marketing advice.',
        'Built for owners who want a grounded recommendation before deciding whether to rebuild, tighten, or expand.'
      ],
      outcomes: ['Lower-risk first step', 'Clear priorities', '48-hour response path']
    },
    {
      title: 'ERP-Connected Tooling And Operational Views',
      intro: 'This is the secondary lane: internal software for teams that need better operational visibility, not just a prettier interface.',
      points: [
        'Shaped by real experience around Business Central, SAP, and Infor SyteLine workflows rather than generic dashboard language.',
        'Useful for floor views, reporting surfaces, workflow helpers, BOM-related tooling, and data layers that make internal systems easier to read.',
        'Best fit when the problem is interpretation time, workflow friction, or lack of a clean front end above the ERP.'
      ],
      outcomes: ['Cleaner ops visibility', 'Less workflow friction', 'Better internal UX']
    }
  ];

  engagementFits = [
    {
      kind: 'Strong fit',
      bullets: [
        'You already have a real business, but the site feels vague, dated, or boxed in by a platform.',
        'You want a site that helps people trust you faster instead of making them guess what to click next.',
        'You need someone who can handle brand clarity, local visibility, and the technical side in the same build.'
      ]
    },
    {
      kind: 'Usually not a fit',
      bullets: [
        'You only want the cheapest possible website and do not care how it performs or whether it converts.',
        'You want a giant agency process with heavy account layers instead of direct collaboration and execution.',
        'You want generic marketing promises without doing the harder work of clarifying the offer and fixing the path.'
      ]
    }
  ];

  proofSignals = [
    'Real Oklahoma-based case studies across local service brands and operational tooling',
    'Search, schema, contact-path, and conversion thinking handled in the same workflow',
    'Hands-on ERP familiarity across Business Central, SAP, and SyteLine when the work moves beyond brochure sites',
    'Launch, analytics, forms, and follow-through handled in the same build instead of split across vendors'
  ];

  services = [
    {
      num: '01',
      title: 'Website Rebuilds',
      desc: 'Custom websites for Oklahoma service businesses that need more clarity, more trust, and a path that actually leads somewhere. Built to replace vague homepages, thin platform sites, and confusing service structures.',
      items: ['Homepage and service-page restructuring', 'About and Contact cleanup', 'Custom layout and brand polish', 'Mobile-first rebuilds', 'Booking and inquiry path cleanup', 'Platform replacement when needed']
    },
    {
      num: '02',
      title: 'Local SEO / GEO',
      desc: 'Make the business easier for Google, AI overviews, and real customers to understand. The focus is not just metadata. It is clarity, local signals, entity structure, and a contact path that holds up once someone lands.',
      items: ['Visible NAP and local trust signals', 'Schema that matches the actual page', 'FAQ content built around real buyer questions', 'Map and directions flow', 'Per-page metadata and OG cleanup', 'Search Console and sitemap setup']
    },
    {
      num: '03',
      title: 'Audit-First Conversion Work',
      desc: 'A lighter first step for businesses that know the site is underperforming but do not want to jump straight into a full rebuild. We score the contact path, trust structure, and local visibility basics, then hand back a practical fix list.',
      items: ['48-hour async audit path', 'Homepage clarity review', 'CTA and contact-flow review', 'FAQ and schema review', 'Priority fix list', 'Rebuild recommendation when needed']
    },
    {
      num: '04',
      title: 'ERP-Connected Tooling',
      desc: 'For teams that need a better surface on top of Business Central, SAP, or Infor SyteLine. This is where internal dashboards, workflow helpers, and ops-aware interfaces come in.',
      items: ['Operational dashboards', 'Workflow tooling', 'ERP-aware front ends', 'Reporting views', 'Manufacturing and supply-chain context', 'Internal UX cleanup']
    },
    {
      num: '05',
      title: 'Launch, Tracking, And Follow-Through',
      desc: 'The build does not stop at design handoff. Launch, forms, analytics, and the pieces that make the site actually usable all stay in scope.',
      items: ['Netlify deployment and DNS support', 'Forms and inquiry routing', 'GA4 and Search Console setup', 'Conversion tracking basics', 'Core Web Vitals cleanup', 'Post-launch fixes and iteration']
    }
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.com';
    this.seo.setPage({
      title: 'Services | Websites For Oklahoma Service Businesses',
      description: 'Website rebuilds, local SEO/GEO foundations, audit-first conversion work, and ERP-aware tooling from Localhouse Designs in Broken Arrow, serving businesses across Oklahoma.',
      url: `${base}/services`,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          provider: { '@id': `${base}/#organization` },
          serviceType: 'Website Rebuild And Local Visibility Services',
          name: 'Localhouse Designs Web Services',
          url: `${base}/services`,
          description: 'Website rebuilds, local SEO/GEO, conversion cleanup, launch support, and ERP-aware tooling for Oklahoma businesses.',
          areaServed: [
            { '@type': 'State', name: 'Oklahoma' },
            { '@type': 'Country', name: 'United States' }
          ],
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Website And Operational Tooling Services',
            itemListElement: [
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Website Rebuilds', description: 'Custom websites for Oklahoma service businesses that need more clarity, more trust, and a better contact path.' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Local SEO And GEO Foundations', description: 'Visible NAP, structured data, FAQ coverage, metadata, and map-driven contact flow improvements.' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Audit-First Conversion Cleanup', description: 'Async website clarity and local visibility review with a short list of practical fixes.' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'ERP-Connected Tooling', description: 'Operational dashboards, workflow tools, and ERP-aware interfaces for Business Central, SAP, and Infor SyteLine environments.' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Launch And Tracking Support', description: 'Deployment, forms, analytics, Search Console, and post-launch cleanup handled in the same workflow.' } }
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
              name: 'What kind of businesses is Localhouse Designs built for?',
              acceptedAnswer: { '@type': 'Answer', text: 'Localhouse Designs is built primarily for Oklahoma service businesses that need a clearer, higher-converting website with stronger local visibility. Secondary work includes ERP-connected tooling and operational dashboards for teams with more complex internal systems.' }
            },
            {
              '@type': 'Question',
              name: 'What does a Localhouse website rebuild usually include?',
              acceptedAnswer: { '@type': 'Answer', text: 'A typical rebuild includes homepage and service-page restructuring, better About and Contact flow, local trust signals, clearer calls to action, stronger mobile behavior, and the SEO/GEO foundations needed for search and answer engines to understand the business more clearly.' }
            },
            {
              '@type': 'Question',
              name: 'Does Localhouse Designs offer SEO and GEO services?',
              acceptedAnswer: { '@type': 'Answer', text: 'Yes. Localhouse Designs handles the practical side of local SEO, GEO, and AEO: visible NAP, FAQ coverage, metadata, map and directions flow, structured data, sitemap setup, and content cleanup that helps both search engines and customers understand what the business actually does.' }
            },
            {
              '@type': 'Question',
              name: 'Do you offer an audit before a full rebuild?',
              acceptedAnswer: { '@type': 'Answer', text: 'Yes. Localhouse Designs offers an async audit-first path that reviews homepage clarity, local trust signals, CTA structure, FAQ coverage, and contact-path friction before recommending the next move.' }
            },
            {
              '@type': 'Question',
              name: 'What ERP systems does Localhouse Designs work with?',
              acceptedAnswer: { '@type': 'Answer', text: 'Localhouse Designs has hands-on familiarity with Microsoft Business Central, SAP, and Infor SyteLine. ERP-related work includes operational dashboards, workflow helpers, reporting views, and front ends that make internal data easier to read.' }
            },
            {
              '@type': 'Question',
              name: 'Does Localhouse Designs handle launch and tracking too?',
              acceptedAnswer: { '@type': 'Answer', text: 'Yes. Launch support includes deployment, DNS help, forms, GA4, Search Console, conversion tracking basics, and post-launch cleanup so the site is not just designed but actually usable and measurable.' }
            }
          ]
        }
      ]
    });
  }
}
