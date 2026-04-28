import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-handoff-friction-article',
  imports: [RouterLink],
  templateUrl: './handoff-friction-article.html',
  styleUrl: './handoff-friction-article.scss'
})
export class HandoffFrictionArticleComponent implements OnInit {
  private seo = inject(SeoService);

  takeaways = [
    'Handoff friction shows up when work crosses teams, tools, or systems.',
    'Custom software helps when it preserves context instead of making people re-explain it.',
    'The best tools reduce duplicate entry, status chasing, and unclear ownership.',
    'A smoother handoff is often more valuable than a flashier interface.'
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.com';
    const url = `${base}/insights/how-custom-business-software-reduces-handoff-friction`;
    this.seo.setPage({
      title: 'How Custom Business Software Reduces Handoff Friction | Localhouse Designs',
      description: 'A practical article on how custom business software reduces handoff friction by preserving context, ownership, status, and next actions across teams.',
      url,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': ['TechArticle', 'Article'],
          '@id': `${url}#article`,
          headline: 'How Custom Business Software Reduces Handoff Friction',
          description: 'A practical article on how custom business software reduces handoff friction by preserving context, ownership, status, and next actions across teams.',
          datePublished: '2026-04-26',
          dateModified: '2026-04-26',
          author: { '@id': `${base}/about#person` },
          publisher: { '@id': `${base}/#organization` },
          mainEntityOfPage: { '@id': `${url}#webpage` }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: 'How Custom Business Software Reduces Handoff Friction',
          isPartOf: { '@id': `${base}/#website` },
          about: [
            { '@type': 'Thing', name: 'Custom business software' },
            { '@type': 'Thing', name: 'Workflow automation' },
            { '@type': 'Thing', name: 'Operational handoffs' }
          ],
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Insights', item: `${base}/insights` },
              { '@type': 'ListItem', position: 3, name: 'How Custom Business Software Reduces Handoff Friction', item: url }
            ]
          }
        }
      ]
    });
  }
}
