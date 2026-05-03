import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-broken-arrow-web-design',
  imports: [RouterLink],
  templateUrl: './broken-arrow-web-design.html',
  styleUrl: './broken-arrow-web-design.scss'
})
export class BrokenArrowWebDesignComponent implements OnInit {
  private seo = inject(SeoService);

  trustSignals = [
    'Based in Broken Arrow, Oklahoma and built for nearby service businesses that need clearer pages, stronger proof, and a better path to contact.',
    'Best fit for established businesses with dated, vague, or platform-limited sites that do not explain the offer fast enough.',
    'Local SEO, service-page depth, structured data, and conversion cleanup are handled in the same rebuild instead of split across vendors.'
  ];

  pageSections = [
    {
      title: 'Homepage clarity',
      text: 'The first screen should say what you do, where you work, who you serve, and what the visitor should do next without forcing them to hunt.'
    },
    {
      title: 'Service page depth',
      text: 'Each core service gets enough context to answer real buyer questions, support local search, and give AI/search systems cleaner facts to cite.'
    },
    {
      title: 'Local trust signals',
      text: 'Broken Arrow, Tulsa, service area, proof, FAQs, contact flow, and schema are kept consistent so the business feels real and easy to verify.'
    },
    {
      title: 'Contact path cleanup',
      text: 'Forms, calls to action, audit prompts, response expectations, and next steps are tightened so visitors know exactly how to move forward.'
    }
  ];

  verticals = [
    'Salons and barbers',
    'Med spas and wellness brands',
    'Home service businesses',
    'Restaurants and local retail',
    'Trades, specialty contractors, and field teams',
    'Operations-heavy businesses that need website plus workflow thinking'
  ];

  faqs = [
    {
      question: 'Does Localhouse Designs offer web design in Broken Arrow?',
      answer: 'Yes. Localhouse Designs is based in Broken Arrow, Oklahoma and builds clearer websites for service businesses across Broken Arrow, Tulsa, Oklahoma City, and the wider Oklahoma market.'
    },
    {
      question: 'What makes this different from a template website?',
      answer: 'The work focuses on business clarity, service-page depth, local trust signals, schema, contact flow, launch details, and measurement instead of only visual polish.'
    },
    {
      question: 'Can you help if my current site is on a booking platform or page builder?',
      answer: 'Yes. A common fit is replacing or extending platform-limited websites with a custom site that gives the business more room for services, proof, FAQs, SEO, and conversion paths.'
    },
    {
      question: 'Do you work outside Broken Arrow?',
      answer: 'Yes. Broken Arrow is the home base, Tulsa is the closest major market, and Localhouse Designs works with Oklahoma businesses plus remote clients nationwide.'
    }
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.com';
    const url = `${base}/broken-arrow-web-design`;
    this.seo.setPage({
      title: 'Broken Arrow Web Design | Localhouse Designs',
      description: 'Broken Arrow web design and website rebuilds for Oklahoma service businesses that need clearer pages, stronger local SEO, better proof, and cleaner contact paths.',
      url,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: 'Broken Arrow Web Design',
          description: 'Local landing page for Broken Arrow web design, website rebuilds, local SEO foundations, service-page clarity, and contact-path cleanup from Localhouse Designs.',
          isPartOf: { '@id': `${base}/#website` },
          about: { '@id': `${base}/#organization` },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Broken Arrow Web Design', item: url }
            ]
          }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          '@id': `${url}#service`,
          name: 'Broken Arrow web design and website rebuilds',
          serviceType: 'Web design, website rebuilds, local SEO foundations, and conversion cleanup',
          provider: { '@id': `${base}/#organization` },
          areaServed: [
            { '@type': 'City', name: 'Broken Arrow' },
            { '@type': 'City', name: 'Tulsa' },
            { '@type': 'State', name: 'Oklahoma' }
          ],
          description: 'Website rebuilds for Broken Arrow and Tulsa-area service businesses that need clearer service pages, stronger local trust signals, structured data, and better inquiry paths.'
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
