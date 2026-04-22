import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-branded-serp-article',
  imports: [RouterLink],
  templateUrl: './branded-serp-article.html',
  styleUrl: './branded-serp-article.scss'
})
export class BrandedSerpArticleComponent implements OnInit {
  private seo = inject(SeoService);

  takeaways = [
    'If your business does not own its own name in search, broader SEO claims are usually premature.',
    'Branded search is where Google decides whether your site is the clearest source for the entity.',
    'Third-party pages can help validate a brand, but they can also crowd or define it when the official site is weak.',
    'Owning branded search usually starts with clearer identity, stronger support pages, and cleaner outside signals.'
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.netlify.app';
    const url = `${base}/insights/why-branded-search-ownership-matters-before-local-seo-promises`;
    this.seo.setPage({
      title: 'Why Branded Search Ownership Matters Before Local SEO Promises | Localhouse Designs',
      description: 'A practical article on why businesses should own their own branded search results before making bigger local SEO promises, and what usually gets in the way.',
      url,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': ['TechArticle', 'Article'],
          '@id': `${url}#article`,
          headline: 'Why branded search ownership matters before local SEO promises',
          description: 'A practical article on why businesses should own their own branded search results before making bigger local SEO promises, and what usually gets in the way.',
          datePublished: '2026-04-22',
          dateModified: '2026-04-22',
          author: { '@id': `${base}/about#person` },
          publisher: { '@id': `${base}/#organization` },
          mainEntityOfPage: { '@id': `${url}#webpage` }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: 'Why Branded Search Ownership Matters Before Local SEO Promises',
          isPartOf: { '@id': `${base}/#website` },
          about: [
            { '@type': 'Thing', name: 'Branded search ownership' },
            { '@type': 'Thing', name: 'Local SEO' },
            { '@type': 'Thing', name: 'Entity clarity' }
          ],
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Insights', item: `${base}/insights` },
              { '@type': 'ListItem', position: 3, name: 'Why Branded Search Ownership Matters Before Local SEO Promises', item: url }
            ]
          }
        }
      ]
    });
  }
}
