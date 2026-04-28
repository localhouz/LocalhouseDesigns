import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-erp-lite-case-study',
  imports: [RouterLink],
  templateUrl: './erp-lite-case-study.html',
  styleUrl: './erp-lite-case-study.scss'
})
export class ErpLiteCaseStudyComponent implements OnInit {
  private seo = inject(SeoService);

  takeaways = [
    'ERP Lite is framed as a decision surface, not a dashboard-first rebuild.',
    'The adapter contract keeps the UI stable while ERP connectors change underneath it.',
    'Role views make the same operational dataset more useful for floor, planner, and leadership contexts.',
    'The ERP stays the system of record while the front end becomes the system of interpretation.'
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.com';
    const url = `${base}/insights/erp-lite-designing-an-operational-decision-surface`;
    this.seo.setPage({
      title: 'ERP Lite: Designing an Operational Decision Surface | Localhouse Designs',
      description: 'A design and UX case study on ERP Lite, showing how an adapter-first operational front end can sit above ERP systems without replacing the system of record.',
      url,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': ['TechArticle', 'Article'],
          '@id': `${url}#article`,
          headline: 'ERP Lite: Designing an Operational Decision Surface',
          description: 'A design and UX case study on ERP Lite, showing how an adapter-first operational front end can sit above ERP systems without replacing the system of record.',
          datePublished: '2026-04-14',
          dateModified: '2026-04-14',
          author: { '@id': `${base}/about#person` },
          publisher: { '@id': `${base}/#organization` },
          mainEntityOfPage: { '@id': `${url}#webpage` }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: 'ERP Lite: Designing an Operational Decision Surface',
          isPartOf: { '@id': `${base}/#website` },
          about: [
            { '@type': 'Thing', name: 'ERP UX' },
            { '@type': 'Thing', name: 'Operational dashboard design' },
            { '@type': 'Thing', name: 'Adapter contract' },
            { '@type': 'Thing', name: 'Role-aware interfaces' }
          ],
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Insights', item: `${base}/insights` },
              { '@type': 'ListItem', position: 3, name: 'ERP Lite: Designing an Operational Decision Surface', item: url }
            ]
          }
        }
      ]
    });
  }
}
