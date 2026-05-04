import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-plumber-website-design',
  imports: [RouterLink],
  templateUrl: './plumber-website-design.html',
  styleUrl: '../broken-arrow-web-design/broken-arrow-web-design.scss'
})
export class PlumberWebsiteDesignComponent implements OnInit {
  private seo = inject(SeoService);

  trustSignals = [
    'Plumbing searches are often emergencies. A visitor with a burst pipe or backed-up drain is calling the first result that looks credible and available — not the one with the best homepage design.',
    'Service area buried in the footer, no visible phone number above the fold, and emergency availability nowhere on the page: these are the conversion failures that cost plumbing companies calls every day.',
    'License number, insurance, and years in business belong in the first screen — not the about page. For high-stakes home services, credibility signals need to appear before the visitor decides to scroll.'
  ];

  pageSections = [
    {
      title: 'Availability and call path in the first screen',
      text: 'Phone number, service area, and emergency availability visible immediately — no scrolling required. In a plumbing emergency, the site that answers these questions first earns the call.'
    },
    {
      title: 'Service pages that explain the job',
      text: 'Individual pages for drain clearing, water heater repair, pipe repair, and emergency services — each explaining the problem, the process, the service area, and what to expect. Depth that ranks and converts.'
    },
    {
      title: 'Credibility in the right place',
      text: 'License, insurance, service area, and years in business visible in the hero — not buried in an about section. High-stakes services need trust signals where the decision is actually made.'
    },
    {
      title: 'Schema and local SEO foundations',
      text: 'LocalBusiness, Plumber, and FAQPage schema, consistent NAP, service-area pages, and Search Console setup at launch. The technical foundations that support local rankings from day one.'
    }
  ];

  verticals = [
    'Residential plumbing companies competing in local search',
    'Emergency plumbing services that need faster call-to-site conversion',
    'Drain and sewer specialists with specific service-page needs',
    'Water heater installation and repair businesses',
    'Plumbers replacing a template site that isn\'t generating enough calls',
    'Multi-service plumbing companies that need individual pages per service type'
  ];

  faqs = [
    {
      question: 'What does a plumber website need to generate more calls?',
      answer: 'Phone number and service area in the first screen, emergency availability clearly stated, individual service pages with real depth, license and insurance visible, and a contact path that doesn\'t require a form when someone just wants to call. Most plumber sites fail on two or three of these.'
    },
    {
      question: 'Do plumbers need separate pages for each service?',
      answer: 'Yes. A single "Services" page can\'t rank for "drain clearing near me" and "water heater replacement near me" at the same time. Individual service pages each target a specific search, support local rankings, and give buyers the depth they need to feel confident calling.'
    },
    {
      question: 'How does a plumber website rank in local search?',
      answer: 'Local plumbing rankings come from Google Business Profile consistency, on-page service-area signals, Plumber and LocalBusiness schema, FAQ content, mobile performance, and a site that clearly tells search systems what services you offer and where. We build all of that in from launch.'
    },
    {
      question: 'Can you rebuild my existing plumber website?',
      answer: 'Yes. Most plumbing site projects start with an existing site that\'s losing calls due to poor mobile performance, buried contact info, or vague service pages. We audit what\'s broken and rebuild around a structure that earns more of the calls you\'re currently losing.'
    }
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.com';
    const url = `${base}/plumber-website-design`;
    this.seo.setPage({
      title: 'Plumber Website Design | Localhouse Designs',
      description: 'Plumber website design that earns the call before a competitor does — emergency availability, service-area clarity, individual service pages, local SEO foundations, and credibility signals in the right place.',
      url,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: 'Plumber Website Design',
          description: 'Plumber website design for plumbing companies — emergency availability, service-area clarity, service-page depth, credibility signals, and local SEO foundations.',
          isPartOf: { '@id': `${base}/#website` },
          about: { '@id': `${base}/#organization` },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Plumber Website Design', item: url }
            ]
          }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          '@id': `${url}#service`,
          name: 'Plumber website design',
          serviceType: 'Plumber website design, local SEO, service-page structure, emergency availability, schema markup',
          provider: { '@id': `${base}/#organization` },
          areaServed: { '@type': 'Country', name: 'United States' },
          description: 'Custom website design for plumbing companies — emergency availability, service-area clarity, individual service pages, credibility signals, and local SEO foundations that earn the call.'
        },
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: this.faqs.map(item => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: { '@type': 'Answer', text: item.answer }
          }))
        }
      ]
    });
  }
}
