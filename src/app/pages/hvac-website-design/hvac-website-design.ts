import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-hvac-website-design',
  imports: [RouterLink],
  templateUrl: './hvac-website-design.html',
  styleUrl: '../broken-arrow-web-design/broken-arrow-web-design.scss'
})
export class HvacWebsiteDesignComponent implements OnInit {
  private seo = inject(SeoService);

  trustSignals = [
    'Most HVAC sites bury the phone number, don\'t state the service area clearly, and make emergency availability invisible. In a high-intent search, that costs the call.',
    'Generic service pages that list "heating, cooling, and air quality" without explaining the actual job, the process, or the service area give buyers no reason to choose you over the next result.',
    'The HVAC sites that win locally aren\'t the prettiest — they\'re the ones that answer availability, service area, and trust signals faster than the competition.'
  ];

  pageSections = [
    {
      title: 'Emergency availability front and center',
      text: 'Phone number, service area, and availability visible in the first screen. Visitors in an emergency shouldn\'t have to scroll to find out if you can help them right now.'
    },
    {
      title: 'Service pages with real depth',
      text: 'Individual pages for AC repair, heating, installation, and maintenance — each explaining the job, the process, the service area, and what to expect. Depth that earns both rankings and trust.'
    },
    {
      title: 'Local trust signals',
      text: 'License and insurance visibility, service area named explicitly, review content structured for schema, and FAQ coverage for the questions buyers ask before calling.'
    },
    {
      title: 'Schema and local SEO foundations',
      text: 'LocalBusiness, Service, and FAQPage schema wired in from day one. Search Console, GA4, and sitemap set up at launch so the site is measurable and indexable immediately.'
    }
  ];

  verticals = [
    'HVAC companies offering residential repair and installation',
    'AC repair specialists in high-demand seasonal markets',
    'Heating and furnace service companies',
    'Ductwork and indoor air quality businesses',
    'HVAC businesses replacing a generic template or outdated site',
    'Multi-service HVAC companies that need individual pages per service'
  ];

  faqs = [
    {
      question: 'Does my HVAC company need a custom website?',
      answer: 'If your current site is a template that doesn\'t clearly state your service area, show availability, or give people a reason to call you over a competitor — yes. HVAC searches are high-intent. The site that earns the call is the one that answers the right questions fastest.'
    },
    {
      question: 'What pages does an HVAC website need?',
      answer: 'At minimum: a homepage that states service area and availability clearly, individual pages for AC repair, heating, installation, and maintenance, an about page with license and insurance signals, and a contact page with a simple form and your phone number prominent.'
    },
    {
      question: 'How does an HVAC site rank in local search?',
      answer: 'Local rankings come from a combination of Google Business Profile consistency, on-page service area signals, schema markup, page-specific metadata, and a site structure that clearly tells search engines what you do and where. We build all of that in from day one.'
    },
    {
      question: 'Can you rebuild an existing HVAC website?',
      answer: 'Yes. Most HVAC site projects start with an existing site that\'s vague, slow, or platform-limited. We audit what\'s there, identify what\'s losing calls, and rebuild around a structure that actually converts.'
    }
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.com';
    const url = `${base}/hvac-website-design`;
    this.seo.setPage({
      title: 'HVAC Website Design | Localhouse Designs',
      description: 'HVAC website design for heating and cooling companies that need more service calls — built around emergency availability, service-area clarity, local SEO foundations, and a contact path that converts.',
      url,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: 'HVAC Website Design',
          description: 'HVAC website design for heating and cooling companies — service clarity, emergency availability, local SEO foundations, and a contact path built to earn the call.',
          isPartOf: { '@id': `${base}/#website` },
          about: { '@id': `${base}/#organization` },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'HVAC Website Design', item: url }
            ]
          }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          '@id': `${url}#service`,
          name: 'HVAC website design',
          serviceType: 'HVAC website design, local SEO, service-page structure, schema markup',
          provider: { '@id': `${base}/#organization` },
          areaServed: { '@type': 'Country', name: 'United States' },
          description: 'Custom website design for HVAC companies — emergency availability, service-area clarity, individual service pages, schema, and a contact path that earns the call before a competitor does.'
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
