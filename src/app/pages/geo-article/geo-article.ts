import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-geo-article',
  imports: [RouterLink],
  templateUrl: './geo-article.html',
  styleUrl: './geo-article.scss'
})
export class GeoArticleComponent implements OnInit {
  private seo = inject(SeoService);

  takeaways = [
    'GEO is about making your business easier for AI systems to identify, describe, and cite correctly.',
    'It works best when your site is clear about who you are, where you are, what you do, and who you are for.',
    'Structured data helps, but weak messaging and vague pages still limit results.',
    'Local businesses benefit most when GEO and classic local SEO work together instead of competing.'
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.netlify.app';
    const url = `${base}/insights/what-geo-means-for-local-businesses`;
    this.seo.setPage({
      title: 'What GEO Actually Means for Local Businesses | Localhouse Designs',
      description: 'A practical explanation of GEO for local businesses: what it is, what it is not, and how it works alongside SEO, structured data, and clearer website messaging.',
      url,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': ['TechArticle', 'Article'],
          '@id': `${url}#article`,
          headline: 'What GEO Actually Means for Local Businesses',
          description: 'A practical explanation of GEO for local businesses: what it is, what it is not, and how it works alongside SEO, structured data, and clearer website messaging.',
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
          name: 'What GEO Actually Means for Local Businesses',
          isPartOf: { '@id': `${base}/#website` },
          about: [
            { '@type': 'Thing', name: 'GEO' },
            { '@type': 'Thing', name: 'Local SEO' },
            { '@type': 'Thing', name: 'Structured data' }
          ],
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Insights', item: `${base}/insights/what-geo-means-for-local-businesses` }
            ]
          }
        }
      ]
    });
  }
}
