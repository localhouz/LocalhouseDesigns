import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-local-seo-service-businesses',
  imports: [RouterLink],
  templateUrl: './local-seo-service-businesses.html',
  styleUrl: '../broken-arrow-web-design/broken-arrow-web-design.scss'
})
export class LocalSeoServiceBusinessesComponent implements OnInit {
  private seo = inject(SeoService);

  trustSignals = [
    'Local SEO work is handled as part of the website structure, not as a detached checklist pasted onto vague pages.',
    'Best fit for service businesses that need stronger service pages, consistent local signals, FAQs, schema, and proof before chasing more traffic.',
    'Built for Broken Arrow, Tulsa, Oklahoma City, and Oklahoma service businesses that want search visibility to turn into clearer inquiries.'
  ];

  pageSections = [
    {
      title: 'Entity clarity',
      text: 'The site needs to make the business name, location, service area, services, proof, and contact path easy for both people and search systems to understand.'
    },
    {
      title: 'Service-page structure',
      text: 'Core services should have enough depth to answer buyer questions, explain fit, link to proof, and support search queries without becoming thin local SEO clutter.'
    },
    {
      title: 'Schema that matches the page',
      text: 'Structured data should describe the actual business and page content: Service, WebPage, FAQPage, breadcrumbs, organization links, and local area served.'
    },
    {
      title: 'Contact-path confidence',
      text: 'Local visibility only matters if the visitor can see what to do next. CTAs, forms, response expectations, and proof need to reduce hesitation.'
    }
  ];

  verticals = [
    'Service-area pages',
    'Service page rewrites',
    'FAQ and schema cleanup',
    'Google Business Profile consistency',
    'Contact and conversion path audits',
    'Sitemap, indexing, and Search Console setup'
  ];

  faqs = [
    {
      question: 'Does Localhouse Designs offer local SEO as a standalone service?',
      answer: 'Localhouse Designs offers local SEO foundations primarily as part of website rebuilds, service-page cleanup, or audit-first conversion work. The focus is on pages that are clearer for search systems and more useful for real visitors.'
    },
    {
      question: 'What local SEO issues usually get fixed first?',
      answer: 'The first fixes are usually vague homepages, thin service pages, inconsistent local signals, weak FAQs, missing or generic schema, unclear CTAs, and contact pages that do not reduce uncertainty.'
    },
    {
      question: 'Is this only for Oklahoma businesses?',
      answer: 'Oklahoma service businesses are the primary fit, especially around Broken Arrow and Tulsa, but the same structure can support remote service businesses when the service area and proof are clear.'
    },
    {
      question: 'Will schema alone make a page rank?',
      answer: 'No. Schema helps search and AI systems understand the page, but it works best when the visible page already has clear services, proof, FAQs, location context, and a useful contact path.'
    }
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.com';
    const url = `${base}/local-seo-for-service-businesses`;
    this.seo.setPage({
      title: 'Local SEO For Service Businesses | Localhouse Designs',
      description: 'Local SEO foundations for Oklahoma service businesses: service pages, schema, FAQs, local trust signals, Search Console, and cleaner contact paths.',
      url,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: 'Local SEO For Service Businesses',
          description: 'Commercial service page for local SEO foundations, service-page structure, schema, FAQs, local trust signals, and contact-path cleanup for service businesses.',
          isPartOf: { '@id': `${base}/#website` },
          about: { '@id': `${base}/#organization` },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Local SEO For Service Businesses', item: url }
            ]
          }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          '@id': `${url}#service`,
          name: 'Local SEO foundations for service businesses',
          serviceType: 'Local SEO, service-page structure, schema, FAQs, and conversion cleanup',
          provider: { '@id': `${base}/#organization` },
          areaServed: [
            { '@type': 'City', name: 'Broken Arrow' },
            { '@type': 'City', name: 'Tulsa' },
            { '@type': 'City', name: 'Oklahoma City' },
            { '@type': 'State', name: 'Oklahoma' }
          ],
          description: 'Local SEO foundation work for service businesses that need clearer service pages, consistent local trust signals, structured data, FAQs, indexing basics, and better inquiry paths.'
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
