import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-before-after-project-pages-article',
  imports: [RouterLink],
  templateUrl: './before-after-project-pages-article.html',
  styleUrl: './before-after-project-pages-article.scss'
})
export class BeforeAfterProjectPagesArticleComponent implements OnInit {
  private seo = inject(SeoService);

  takeaways = [
    'Before-and-after pages work because they show change, not just taste.',
    'A good project page explains the starting problem, the decision behind the fix, and what improved.',
    'Generic portfolios look nice, but they often skip the proof a buyer needs.',
    'Local service businesses can use project pages to build trust and local relevance at the same time.'
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.com';
    const url = `${base}/insights/why-before-and-after-project-pages-build-more-trust-than-generic-portfolios`;
    this.seo.setPage({
      title: 'Why Before-and-After Project Pages Build More Trust Than Generic Portfolios | Localhouse Designs',
      description: 'A practical article on why before-and-after project pages build stronger trust for local service businesses than generic portfolio galleries.',
      url,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': ['TechArticle', 'Article'],
          '@id': `${url}#article`,
          headline: 'Why Before-and-After Project Pages Build More Trust Than Generic Portfolios',
          description: 'A practical article on why before-and-after project pages build stronger trust for local service businesses than generic portfolio galleries.',
          datePublished: '2026-04-20',
          dateModified: '2026-04-20',
          author: { '@id': `${base}/about#person` },
          publisher: { '@id': `${base}/#organization` },
          mainEntityOfPage: { '@id': `${url}#webpage` }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: 'Why Before-and-After Project Pages Build More Trust Than Generic Portfolios',
          isPartOf: { '@id': `${base}/#website` },
          about: [
            { '@type': 'Thing', name: 'Project pages' },
            { '@type': 'Thing', name: 'Portfolio websites' },
            { '@type': 'Thing', name: 'Local service business trust' }
          ],
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Insights', item: `${base}/insights` },
              { '@type': 'ListItem', position: 3, name: 'Why Before-and-After Project Pages Build More Trust Than Generic Portfolios', item: url }
            ]
          }
        }
      ]
    });
  }
}
