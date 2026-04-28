import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-floor-team-erp-tools-article',
  imports: [RouterLink],
  templateUrl: './floor-team-erp-tools-article.html',
  styleUrl: './floor-team-erp-tools-article.scss'
})
export class FloorTeamErpToolsArticleComponent implements OnInit {
  private seo = inject(SeoService);

  takeaways = [
    'Floor teams need fast answers, not a miniature version of the full ERP.',
    'The useful view usually includes status, job context, material context, and exception state.',
    'Role-specific screens beat one giant all-purpose interface.',
    'The ERP can stay the system of record while a lighter tool becomes the system of interpretation.'
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.com';
    const url = `${base}/insights/what-erp-connected-tools-should-expose-to-floor-teams`;
    this.seo.setPage({
      title: 'What ERP-Connected Tools Should Expose to Floor Teams | Localhouse Designs',
      description: 'A practical article on what ERP-connected front ends should show floor teams: status, job context, material context, exceptions, and next actions.',
      url,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': ['TechArticle', 'Article'],
          '@id': `${url}#article`,
          headline: 'What ERP-Connected Tools Should Expose to Floor Teams',
          description: 'A practical article on what ERP-connected front ends should show floor teams: status, job context, material context, exceptions, and next actions.',
          datePublished: '2026-04-24',
          dateModified: '2026-04-24',
          author: { '@id': `${base}/about#person` },
          publisher: { '@id': `${base}/#organization` },
          mainEntityOfPage: { '@id': `${url}#webpage` }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: 'What ERP-Connected Tools Should Expose to Floor Teams',
          isPartOf: { '@id': `${base}/#website` },
          about: [
            { '@type': 'Thing', name: 'ERP tools' },
            { '@type': 'Thing', name: 'Manufacturing floor teams' },
            { '@type': 'Thing', name: 'Operational UI' }
          ],
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Insights', item: `${base}/insights` },
              { '@type': 'ListItem', position: 3, name: 'What ERP-Connected Tools Should Expose to Floor Teams', item: url }
            ]
          }
        }
      ]
    });
  }
}
