import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-tulsa-service-business-websites',
  imports: [RouterLink],
  templateUrl: './tulsa-service-business-websites.html',
  styleUrl: './tulsa-service-business-websites.scss'
})
export class TulsaServiceBusinessWebsitesComponent implements OnInit {
  private seo = inject(SeoService);

  signals = [
    'Broken Arrow-based studio serving Tulsa, Oklahoma City, and service businesses across Oklahoma.',
    'Best fit for established businesses with dated, vague, or platform-limited websites.',
    'Built around trust, service clarity, local visibility, and a contact path people can actually follow.'
  ];

  fixes = [
    'Rewrite the first screen so people can tell what you do, where you work, and what to do next.',
    'Turn thin service sections into pages that answer real buyer questions and support local search.',
    'Make NAP, service area, map/directions, FAQs, and contact flow consistent across the site.',
    'Add structured data that matches the actual business and page instead of generic schema garnish.'
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.com';
    const url = `${base}/tulsa-service-business-websites`;
    this.seo.setPage({
      title: 'Tulsa Service Business Websites | Localhouse Designs',
      description: 'Broken Arrow web studio building clearer, higher-converting websites for Tulsa and Oklahoma service businesses that need stronger trust, local visibility, and lead paths.',
      url,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: 'Tulsa Service Business Websites',
          description: 'A local landing page for Tulsa-area service businesses that need clearer websites, stronger trust signals, local SEO/GEO foundations, and cleaner inquiry paths.',
          isPartOf: { '@id': `${base}/#website` },
          about: { '@id': `${base}/#organization` },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Tulsa Service Business Websites', item: url }
            ]
          }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          '@id': `${url}#service`,
          name: 'Tulsa service business website rebuilds',
          serviceType: 'Website rebuilds and local SEO foundations',
          provider: { '@id': `${base}/#organization` },
          areaServed: [
            { '@type': 'City', name: 'Tulsa' },
            { '@type': 'City', name: 'Broken Arrow' },
            { '@type': 'State', name: 'Oklahoma' }
          ],
          description: 'Website rebuilds for Tulsa-area service businesses that need clearer service pages, stronger local trust signals, better contact paths, and structured data that supports search and AI understanding.'
        },
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'Does Localhouse Designs build websites for Tulsa service businesses?',
              acceptedAnswer: { '@type': 'Answer', text: 'Yes. Localhouse Designs is based in Broken Arrow and works with Tulsa-area service businesses that need clearer websites, stronger local visibility, and better inquiry paths.' }
            },
            {
              '@type': 'Question',
              name: 'What problems does a service-business website rebuild usually fix?',
              acceptedAnswer: { '@type': 'Answer', text: 'The work usually fixes vague homepages, thin service pages, weak local trust signals, unclear calls to action, inconsistent NAP details, and contact paths that make people hesitate before reaching out.' }
            },
            {
              '@type': 'Question',
              name: 'Is this only for Tulsa?',
              acceptedAnswer: { '@type': 'Answer', text: 'No. Tulsa is a primary nearby market, but Localhouse Designs serves businesses in Broken Arrow, Oklahoma City, and across Oklahoma, with remote work available nationwide.' }
            }
          ]
        }
      ]
    });
  }
}
