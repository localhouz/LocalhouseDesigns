import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-erp-article',
  imports: [RouterLink],
  templateUrl: './erp-article.html',
  styleUrl: './erp-article.scss'
})
export class ErpArticleComponent implements OnInit {
  private seo = inject(SeoService);

  takeaways = [
    'Most manufacturing teams do not need more software. They need fewer bottlenecks.',
    'Useful ERP-connected tools reduce friction around visibility, data handling, and repeat work.',
    'The best internal tooling is shaped by how people actually work, not just by what the ERP technically exposes.',
    'If a tool makes the floor, planner, or operations lead slower, it is not helping.'
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.netlify.app';
    const url = `${base}/insights/what-manufacturers-actually-need-from-erp-connected-tooling`;
    this.seo.setPage({
      title: 'What Manufacturers Actually Need from ERP-Connected Tooling | Localhouse Designs',
      description: 'A practical look at what useful ERP-connected tooling should actually do for manufacturers, operations teams, and production workflows.',
      url,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          '@id': `${url}#article`,
          headline: 'What Manufacturers Actually Need from ERP-Connected Tooling',
          description: 'A practical look at what useful ERP-connected tooling should actually do for manufacturers, operations teams, and production workflows.',
          datePublished: '2026-04-09',
          dateModified: '2026-04-09',
          author: { '@id': `${base}/about#person` },
          publisher: { '@id': `${base}/#organization` },
          mainEntityOfPage: { '@id': `${url}#webpage` }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: 'What Manufacturers Actually Need from ERP-Connected Tooling',
          isPartOf: { '@id': `${base}/#website` },
          about: [
            { '@type': 'Thing', name: 'ERP integration' },
            { '@type': 'Thing', name: 'Manufacturing operations' },
            { '@type': 'Thing', name: 'Workflow automation' }
          ],
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Insights', item: url }
            ]
          }
        }
      ]
    });
  }
}
