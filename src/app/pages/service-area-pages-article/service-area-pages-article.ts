import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-service-area-pages-article',
  imports: [RouterLink],
  templateUrl: './service-area-pages-article.html',
  styleUrl: './service-area-pages-article.scss'
})
export class ServiceAreaPagesArticleComponent implements OnInit {
  private seo = inject(SeoService);

  takeaways = [
    "Service-area pages shouldn't be city-name swaps with the same vague copy.",
    'Good local pages explain service fit, geography, proof, and the next step.',
    "A service-area page works best when it feels useful to someone who actually lives there.",
    'Thin local pages can create clutter instead of trust.'
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.com';
    const url = `${base}/insights/why-local-business-websites-need-clear-service-area-pages`;
    this.seo.setPage({
      title: 'Why Local Business Websites Need Clear Service-Area Pages | Localhouse Designs',
      description: 'A practical look at when local service businesses need service-area pages, what those pages should say, and why city-name swaps usually fall flat.',
      url,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': ['TechArticle', 'Article'],
          '@id': `${url}#article`,
          headline: 'Why Local Business Websites Need Clear Service-Area Pages',
          description: 'A practical look at when local service businesses need service-area pages, what those pages should say, and why city-name swaps usually fall flat.',
          datePublished: '2026-04-10',
          dateModified: '2026-04-10',
          author: { '@id': `${base}/about#person` },
          publisher: { '@id': `${base}/#organization` },
          mainEntityOfPage: { '@id': `${url}#webpage` }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: 'Why Local Business Websites Need Clear Service-Area Pages',
          isPartOf: { '@id': `${base}/#website` },
          about: [
            { '@type': 'Thing', name: 'Service-area pages' },
            { '@type': 'Thing', name: 'Local SEO' },
            { '@type': 'Thing', name: 'Local service businesses' }
          ],
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Insights', item: `${base}/insights` },
              { '@type': 'ListItem', position: 3, name: 'Why Local Business Websites Need Clear Service-Area Pages', item: url }
            ]
          }
        }
      ]
    });
  }
}
