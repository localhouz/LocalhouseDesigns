import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-service-pages-article',
  imports: [RouterLink],
  templateUrl: './service-pages-article.html',
  styleUrl: './service-pages-article.scss'
})
export class ServicePagesArticleComponent implements OnInit {
  private seo = inject(SeoService);

  takeaways = [
    'A service page has to do more than mention the service and city.',
    'Stronger pages explain the problem, the fit, the local context, and the proof.',
    'Thin service pages are weak for both local SEO and AI-driven discovery.',
    'The best service pages can rank, get cited, and still convert a real person.'
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.netlify.app';
    const url = `${base}/insights/what-local-service-pages-need-to-rank-and-get-cited`;
    this.seo.setPage({
      title: 'What Local Service Pages Need to Rank and Get Cited | Localhouse Designs',
      description: 'A practical look at what local service pages need to rank, get cited by AI search, and actually build trust with the people reading them.',
      url,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': ['TechArticle', 'Article'],
          '@id': `${url}#article`,
          headline: 'What Local Service Pages Need to Rank and Get Cited',
          description: 'A practical look at what local service pages need to rank, get cited by AI search, and actually build trust with the people reading them.',
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
          name: 'What Local Service Pages Need to Rank and Get Cited',
          isPartOf: { '@id': `${base}/#website` },
          about: [
            { '@type': 'Thing', name: 'Local service pages' },
            { '@type': 'Thing', name: 'Local SEO' },
            { '@type': 'Thing', name: 'AI search citations' }
          ],
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Insights', item: `${base}/insights` },
              { '@type': 'ListItem', position: 3, name: 'What Local Service Pages Need to Rank and Get Cited', item: url }
            ]
          }
        }
      ]
    });
  }
}
