import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-dashboard-article',
  imports: [RouterLink],
  templateUrl: './dashboard-article.html',
  styleUrl: './dashboard-article.scss'
})
export class DashboardArticleComponent implements OnInit {
  private seo = inject(SeoService);

  takeaways = [
    'More visibility is not the same thing as less friction.',
    'A dashboard that does not help a decision happen faster usually becomes another screen to babysit.',
    'Better internal tools are built around exceptions, actions, and repeated pain points.',
    'Workflow-aware software usually creates more value than dashboard-first software.'
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.netlify.app';
    const url = `${base}/insights/why-most-dashboards-do-not-fix-the-workflow`;
    this.seo.setPage({
      title: 'Why Most Dashboards Do Not Fix the Workflow | Localhouse Designs',
      description: 'A practical look at why many internal dashboards add visibility without removing friction, and what better workflow-aware tooling should do instead.',
      url,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          '@id': `${url}#article`,
          headline: 'Why Most Dashboards Do Not Fix the Workflow',
          description: 'A practical look at why many internal dashboards add visibility without removing friction, and what better workflow-aware tooling should do instead.',
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
          name: 'Why Most Dashboards Do Not Fix the Workflow',
          isPartOf: { '@id': `${base}/#website` },
          about: [
            { '@type': 'Thing', name: 'Dashboards' },
            { '@type': 'Thing', name: 'Workflow automation' },
            { '@type': 'Thing', name: 'ERP-connected tooling' }
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
