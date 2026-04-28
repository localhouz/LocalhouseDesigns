import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-spreadsheet-to-app-article',
  imports: [RouterLink],
  templateUrl: './spreadsheet-to-app-article.html',
  styleUrl: './spreadsheet-to-app-article.scss'
})
export class SpreadsheetToAppArticleComponent implements OnInit {
  private seo = inject(SeoService);

  takeaways = [
    'A spreadsheet should become an app when the workflow needs guardrails, sharing, validation, or repeatable updates.',
    'Spreadsheets are good at flexible thinking, but weak at controlled process.',
    'The warning sign is not complexity by itself. It is repeated operational risk.',
    'The first app version should preserve what worked while removing the fragile parts.'
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.com';
    const url = `${base}/insights/when-a-spreadsheet-should-become-a-real-internal-app`;
    this.seo.setPage({
      title: 'When a Spreadsheet Should Become a Real Internal App | Localhouse Designs',
      description: 'A practical article on when spreadsheets should become internal apps: repeated workflows, validation, shared data, permissions, and operational risk.',
      url,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': ['TechArticle', 'Article'],
          '@id': `${url}#article`,
          headline: 'When a Spreadsheet Should Become a Real Internal App',
          description: 'A practical article on when spreadsheets should become internal apps: repeated workflows, validation, shared data, permissions, and operational risk.',
          datePublished: '2026-04-25',
          dateModified: '2026-04-25',
          author: { '@id': `${base}/about#person` },
          publisher: { '@id': `${base}/#organization` },
          mainEntityOfPage: { '@id': `${url}#webpage` }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: 'When a Spreadsheet Should Become a Real Internal App',
          isPartOf: { '@id': `${base}/#website` },
          about: [
            { '@type': 'Thing', name: 'Internal apps' },
            { '@type': 'Thing', name: 'Spreadsheet workflows' },
            { '@type': 'Thing', name: 'Workflow automation' }
          ],
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Insights', item: `${base}/insights` },
              { '@type': 'ListItem', position: 3, name: 'When a Spreadsheet Should Become a Real Internal App', item: url }
            ]
          }
        }
      ]
    });
  }
}
