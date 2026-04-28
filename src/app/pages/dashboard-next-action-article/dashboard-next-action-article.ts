import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-dashboard-next-action-article',
  imports: [RouterLink],
  templateUrl: './dashboard-next-action-article.html',
  styleUrl: './dashboard-next-action-article.scss'
})
export class DashboardNextActionArticleComponent implements OnInit {
  private seo = inject(SeoService);

  takeaways = [
    'A dashboard that stops at visibility still leaves the user to interpret everything.',
    'The best internal tools make the next action easier to see.',
    'Exceptions, ownership, freshness, and suggested next steps matter more than extra charts.',
    'If the user has to leave the dashboard to understand what to do, the tool is not finished.'
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.com';
    const url = `${base}/insights/why-internal-dashboards-fail-when-they-ignore-the-next-action`;
    this.seo.setPage({
      title: 'Why Internal Dashboards Fail When They Ignore the Next Action | Localhouse Designs',
      description: 'A practical article on why internal dashboards fail when they show status without helping people decide what to do next.',
      url,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': ['TechArticle', 'Article'],
          '@id': `${url}#article`,
          headline: 'Why Internal Dashboards Fail When They Ignore the Next Action',
          description: 'A practical article on why internal dashboards fail when they show status without helping people decide what to do next.',
          datePublished: '2026-04-23',
          dateModified: '2026-04-23',
          author: { '@id': `${base}/about#person` },
          publisher: { '@id': `${base}/#organization` },
          mainEntityOfPage: { '@id': `${url}#webpage` }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: 'Why Internal Dashboards Fail When They Ignore the Next Action',
          isPartOf: { '@id': `${base}/#website` },
          about: [
            { '@type': 'Thing', name: 'Dashboards' },
            { '@type': 'Thing', name: 'Workflow design' },
            { '@type': 'Thing', name: 'Operational tooling' }
          ],
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Insights', item: `${base}/insights` },
              { '@type': 'ListItem', position: 3, name: 'Why Internal Dashboards Fail When They Ignore the Next Action', item: url }
            ]
          }
        }
      ]
    });
  }
}
