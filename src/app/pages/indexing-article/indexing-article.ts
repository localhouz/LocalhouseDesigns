import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-indexing-article',
  imports: [RouterLink],
  templateUrl: './indexing-article.html',
  styleUrl: './indexing-article.scss'
})
export class IndexingArticleComponent implements OnInit {
  private seo = inject(SeoService);

  takeaways = [
    'A page being discovered or crawled does not guarantee Google sees it as worth indexing yet.',
    'Indexing problems are often part technical and part page-quality or page-priority issue.',
    'Clearer canonicals, stronger internal links, and more distinct page value usually matter more than panic.',
    'The pages to fight for first are the ones that define the business: home, services, about, contact, and the best support content.'
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.netlify.app';
    const url = `${base}/insights/why-google-can-find-your-page-and-still-not-index-it`;
    this.seo.setPage({
      title: 'Why Google Can Find Your Page and Still Not Index It | Localhouse Designs',
      description: 'A practical explanation of why Google can discover or crawl a page and still choose not to index it, and what business owners should do next.',
      url,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': ['TechArticle', 'Article'],
          '@id': `${url}#article`,
          headline: 'Why Google can find your page and still not index it',
          description: 'A practical explanation of why Google can discover or crawl a page and still choose not to index it, and what business owners should do next.',
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
          name: 'Why Google Can Find Your Page and Still Not Index It',
          isPartOf: { '@id': `${base}/#website` },
          about: [
            { '@type': 'Thing', name: 'Indexing' },
            { '@type': 'Thing', name: 'Search Console' },
            { '@type': 'Thing', name: 'Technical SEO' }
          ],
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Insights', item: `${base}/insights` },
              { '@type': 'ListItem', position: 3, name: 'Why Google Can Find Your Page and Still Not Index It', item: url }
            ]
          }
        }
      ]
    });
  }
}
