import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-tulsa-web-design',
  imports: [RouterLink],
  templateUrl: './tulsa-web-design.html',
  styleUrl: '../broken-arrow-web-design/broken-arrow-web-design.scss'
})
export class TulsaWebDesignComponent implements OnInit {
  private seo = inject(SeoService);

  trustSignals = [
    'Broken Arrow-based studio serving Tulsa businesses with custom websites, service-page structure, local SEO foundations, and cleaner contact paths.',
    'Best fit for Tulsa service businesses whose current site feels dated, vague, thin, or boxed in by a booking platform or page builder.',
    'Built around the details that decide local trust: proof, FAQs, service area, schema, forms, tracking, and what happens after someone lands.'
  ];

  pageSections = [
    {
      title: 'Tulsa offer clarity',
      text: 'The page structure makes the business, service area, audience, and next step clear before a visitor has to compare you against another Tulsa result.'
    },
    {
      title: 'Service pages that carry weight',
      text: 'Instead of one broad services page, the site can support focused pages for the work people actually search for and the questions they ask before contacting.'
    },
    {
      title: 'Proof and local context',
      text: 'Case studies, project notes, location language, FAQs, and structured data help search systems and real customers understand why the business is credible.'
    },
    {
      title: 'Launch and measurement',
      text: 'Forms, GA4, Search Console, sitemap, metadata, schema, and post-launch cleanup stay part of the build so the site is measurable from day one.'
    }
  ];

  verticals = [
    'Tulsa salons and barbers',
    'Tulsa med spas and wellness brands',
    'Tulsa home service businesses',
    'Local restaurants and specialty retail',
    'Contractors, trades, and field-service teams',
    'Oklahoma businesses expanding into the Tulsa market'
  ];

  faqs = [
    {
      question: 'Does Localhouse Designs offer web design for Tulsa businesses?',
      answer: 'Yes. Localhouse Designs is based in Broken Arrow and builds websites for Tulsa-area service businesses that need clearer messaging, stronger local SEO foundations, and cleaner lead paths.'
    },
    {
      question: 'Is this different from the Tulsa service business websites page?',
      answer: 'Yes. This page targets Tulsa web design broadly, while the Tulsa service business websites page goes deeper on the service-business rebuild use case and supports this page internally.'
    },
    {
      question: 'What does a Tulsa website rebuild usually include?',
      answer: 'A typical rebuild includes homepage clarity, service-page structure, proof, FAQs, contact flow, metadata, schema, sitemap cleanup, form handling, tracking, and launch support.'
    },
    {
      question: 'Can you help with local SEO at the same time?',
      answer: 'Yes. Local SEO foundations are part of the website work: visible local signals, page-specific metadata, FAQ content, structured data, internal links, Search Console, and a clearer path from search result to contact.'
    }
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.com';
    const url = `${base}/tulsa-web-design`;
    this.seo.setPage({
      title: 'Tulsa Web Design | Localhouse Designs',
      description: 'Tulsa web design and website rebuilds from a Broken Arrow studio for service businesses that need clearer pages, stronger local SEO, proof, and contact paths.',
      url,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: 'Tulsa Web Design',
          description: 'Tulsa web design landing page for service-business websites, local SEO foundations, service-page clarity, proof, FAQs, and contact-path cleanup.',
          isPartOf: { '@id': `${base}/#website` },
          about: { '@id': `${base}/#organization` },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Tulsa Web Design', item: url }
            ]
          }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          '@id': `${url}#service`,
          name: 'Tulsa web design and website rebuilds',
          serviceType: 'Web design, website rebuilds, local SEO foundations, and conversion cleanup',
          provider: { '@id': `${base}/#organization` },
          areaServed: [
            { '@type': 'City', name: 'Tulsa' },
            { '@type': 'City', name: 'Broken Arrow' },
            { '@type': 'State', name: 'Oklahoma' }
          ],
          description: 'Website rebuilds for Tulsa service businesses that need clearer service pages, stronger local trust signals, structured data, proof, and better inquiry paths.'
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
