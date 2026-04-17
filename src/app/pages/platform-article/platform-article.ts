import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-platform-article',
  imports: [RouterLink],
  templateUrl: './platform-article.html',
  styleUrl: './platform-article.scss'
})
export class PlatformArticleComponent implements OnInit {
  private seo = inject(SeoService);

  takeaways = [
    'Booking-platform pages are good at transactions, but usually weak at search depth, trust signals, and local differentiation.',
    'Custom sites create more room for About content, service clarity, FAQ content, structured data, and proof.',
    'That extra room helps both classic local SEO and AI-driven discovery.',
    'The goal is not just booking. It is better discovery, stronger trust, and more control.'
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.netlify.app';
    const url = `${base}/insights/why-a-custom-site-beats-a-booking-platform-page-for-local-search`;
    this.seo.setPage({
      title: 'Why a Custom Site Beats a Booking-Platform Page for Local Search | Localhouse Designs',
      description: 'A practical comparison of custom websites versus booking-platform pages for local search, trust, structured data, and answer-ready content.',
      url,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': ['TechArticle', 'Article'],
          '@id': `${url}#article`,
          headline: 'Why a Custom Site Beats a Booking-Platform Page for Local Search',
          description: 'A practical comparison of custom websites versus booking-platform pages for local search, trust, structured data, and answer-ready content.',
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
          name: 'Why a Custom Site Beats a Booking-Platform Page for Local Search',
          isPartOf: { '@id': `${base}/#website` },
          about: [
            { '@type': 'Thing', name: 'Local SEO' },
            { '@type': 'Thing', name: 'Booking platforms' },
            { '@type': 'Thing', name: 'Custom websites' }
          ],
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Insights', item: `${base}/insights` },
              { '@type': 'ListItem', position: 3, name: 'Why a Custom Site Beats a Booking-Platform Page for Local Search', item: url }
            ]
          }
        }
      ]
    });
  }
}
