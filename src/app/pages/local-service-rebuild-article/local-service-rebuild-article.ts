import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-local-service-rebuild-article',
  imports: [RouterLink],
  templateUrl: './local-service-rebuild-article.html',
  styleUrl: './local-service-rebuild-article.scss'
})
export class LocalServiceRebuildArticleComponent implements OnInit {
  private seo = inject(SeoService);

  takeaways = [
    'Local-service sites lose leads when the path from visit to quote request is vague.',
    'The best rebuilds tighten service clarity, local proof, and one obvious CTA.',
    'A case study like this is easier to sell than a generic redesign story.',
    'This kind of page can support rankings, citations, and inquiries at the same time.'
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.netlify.app';
    const url = `${base}/insights/how-a-local-service-rebuild-turns-traffic-into-leads`;
    this.seo.setPage({
      title: 'How a Local Service Rebuild Turns Traffic Into Leads | Localhouse Designs',
      description: 'A practical case-study framework for rebuilding a local service site around service clarity, trust, and a cleaner path from search traffic to quote requests.',
      url,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': ['TechArticle', 'Article'],
          '@id': `${url}#article`,
          headline: 'How a Local Service Rebuild Turns Traffic Into Leads',
          description: 'A practical case-study framework for rebuilding a local service site around service clarity, trust, and a cleaner path from search traffic to quote requests.',
          datePublished: '2026-04-17',
          dateModified: '2026-04-17',
          author: { '@id': `${base}/about#person` },
          publisher: { '@id': `${base}/#organization` },
          mainEntityOfPage: { '@id': `${url}#webpage` }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: 'How a Local Service Rebuild Turns Traffic Into Leads',
          isPartOf: { '@id': `${base}/#website` },
          about: [
            { '@type': 'Thing', name: 'Local service websites' },
            { '@type': 'Thing', name: 'Lead generation' },
            { '@type': 'Thing', name: 'Contact path optimization' },
            { '@type': 'Thing', name: 'Local SEO' }
          ],
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Insights', item: `${base}/insights` },
              { '@type': 'ListItem', position: 3, name: 'How a Local Service Rebuild Turns Traffic Into Leads', item: url }
            ]
          }
        }
      ]
    });
  }
}
