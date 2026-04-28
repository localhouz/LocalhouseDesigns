import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-website-audit-checks-article',
  imports: [RouterLink],
  templateUrl: './website-audit-checks-article.html',
  styleUrl: './website-audit-checks-article.scss'
})
export class WebsiteAuditChecksArticleComponent implements OnInit {
  private seo = inject(SeoService);

  takeaways = [
    'A useful audit checks whether the site helps people decide, not just whether scores look nice.',
    'The first questions should be about clarity, trust, and the contact path.',
    'Technical issues matter most when they block discovery, usability, or measurement.',
    'The output should be a fix list a business owner can actually act on.'
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.com';
    const url = `${base}/insights/what-a-small-business-website-audit-should-actually-check`;
    this.seo.setPage({
      title: 'What a Small Business Website Audit Should Actually Check | Localhouse Designs',
      description: 'A practical guide to what a small business website audit should check: clarity, trust, local signals, contact paths, technical basics, and measurement.',
      url,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': ['TechArticle', 'Article'],
          '@id': `${url}#article`,
          headline: 'What a Small Business Website Audit Should Actually Check',
          description: 'A practical guide to what a small business website audit should check: clarity, trust, local signals, contact paths, technical basics, and measurement.',
          datePublished: '2026-04-21',
          dateModified: '2026-04-21',
          author: { '@id': `${base}/about#person` },
          publisher: { '@id': `${base}/#organization` },
          mainEntityOfPage: { '@id': `${url}#webpage` }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: 'What a Small Business Website Audit Should Actually Check',
          isPartOf: { '@id': `${base}/#website` },
          about: [
            { '@type': 'Thing', name: 'Website audits' },
            { '@type': 'Thing', name: 'Small business websites' },
            { '@type': 'Thing', name: 'Conversion optimization' }
          ],
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Insights', item: `${base}/insights` },
              { '@type': 'ListItem', position: 3, name: 'What a Small Business Website Audit Should Actually Check', item: url }
            ]
          }
        }
      ]
    });
  }
}
