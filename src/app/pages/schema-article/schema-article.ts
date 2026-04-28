import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-schema-article',
  imports: [RouterLink],
  templateUrl: './schema-article.html',
  styleUrl: './schema-article.scss'
})
export class SchemaArticleComponent implements OnInit {
  private seo = inject(SeoService);

  takeaways = [
    'Structured data helps machines interpret a page with less guesswork, but it works best when the visible copy is already clear.',
    'Schema supports entity clarity, service understanding, FAQ meaning, and stronger page classification.',
    "It can't rescue a vague or thin page on its own.",
    'The strongest results come when content, structure, and schema all reinforce the same facts.'
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.com';
    const url = `${base}/insights/how-structured-data-helps-ai-search-understand-your-business`;
    this.seo.setPage({
      title: 'How Structured Data Helps AI Search Understand Your Business | Localhouse Designs',
      description: 'A practical explanation of how structured data helps AI search and search engines understand your business, and why schema works best when the site is already clear and trustworthy.',
      url,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': ['TechArticle', 'Article'],
          '@id': `${url}#article`,
          headline: 'How Structured Data Helps AI Search Understand Your Business',
          description: 'A practical explanation of how structured data helps AI search and search engines understand your business, and why schema works best when the site is already clear and trustworthy.',
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
          name: 'How Structured Data Helps AI Search Understand Your Business',
          isPartOf: { '@id': `${base}/#website` },
          about: [
            { '@type': 'Thing', name: 'Structured data' },
            { '@type': 'Thing', name: 'Schema.org' },
            { '@type': 'Thing', name: 'AI search' }
          ],
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Insights', item: `${base}/insights` },
              { '@type': 'ListItem', position: 3, name: 'How Structured Data Helps AI Search Understand Your Business', item: url }
            ]
          }
        }
      ]
    });
  }
}
