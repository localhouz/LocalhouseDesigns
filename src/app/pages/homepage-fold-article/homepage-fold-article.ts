import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-homepage-fold-article',
  imports: [RouterLink],
  templateUrl: './homepage-fold-article.html',
  styleUrl: './homepage-fold-article.scss'
})
export class HomepageFoldArticleComponent implements OnInit {
  private seo = inject(SeoService);

  takeaways = [
    'The first screen should say what the business does, who it helps, and what to do next.',
    'Clever hero copy usually loses to clear hero copy.',
    'Local proof belongs near the first decision, not buried near the footer.',
    "If the first screen could belong to any business, it isn't doing enough."
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.com';
    const url = `${base}/insights/what-to-put-above-the-fold-on-a-local-service-homepage`;
    this.seo.setPage({
      title: 'What to Put Above the Fold on a Local Service Homepage | Localhouse Designs',
      description: 'A practical guide to what local service businesses should put on the first screen of a homepage so visitors understand the offer and next step fast.',
      url,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': ['TechArticle', 'Article'],
          '@id': `${url}#article`,
          headline: 'What to Put Above the Fold on a Local Service Homepage',
          description: 'A practical guide to what local service businesses should put on the first screen of a homepage so visitors understand the offer and next step fast.',
          datePublished: '2026-04-11',
          dateModified: '2026-04-11',
          author: { '@id': `${base}/about#person` },
          publisher: { '@id': `${base}/#organization` },
          mainEntityOfPage: { '@id': `${url}#webpage` }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: 'What to Put Above the Fold on a Local Service Homepage',
          isPartOf: { '@id': `${base}/#website` },
          about: [
            { '@type': 'Thing', name: 'Homepage design' },
            { '@type': 'Thing', name: 'Local service websites' },
            { '@type': 'Thing', name: 'Conversion copywriting' }
          ],
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Insights', item: `${base}/insights` },
              { '@type': 'ListItem', position: 3, name: 'What to Put Above the Fold on a Local Service Homepage', item: url }
            ]
          }
        }
      ]
    });
  }
}
