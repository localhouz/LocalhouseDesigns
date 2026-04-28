import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-case-study-proof-article',
  imports: [RouterLink],
  templateUrl: './case-study-proof-article.html',
  styleUrl: './case-study-proof-article.scss'
})
export class CaseStudyProofArticleComponent implements OnInit {
  private seo = inject(SeoService);

  takeaways = [
    'A useful case study proves change, not just effort.',
    'The reader needs the before state, the constraint, the decision, and the result.',
    'Screenshots are stronger when they are connected to a business problem.',
    'A case study should make the next similar buyer feel understood.'
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.com';
    const url = `${base}/insights/what-a-useful-case-study-page-needs-to-prove`;
    this.seo.setPage({
      title: 'What a Useful Case Study Page Needs to Prove | Localhouse Designs',
      description: 'A practical article on what case study pages need to prove: the before state, constraints, decisions, outcomes, and business value.',
      url,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': ['TechArticle', 'Article'],
          '@id': `${url}#article`,
          headline: 'What a Useful Case Study Page Needs to Prove',
          description: 'A practical article on what case study pages need to prove: the before state, constraints, decisions, outcomes, and business value.',
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
          name: 'What a Useful Case Study Page Needs to Prove',
          isPartOf: { '@id': `${base}/#website` },
          about: [
            { '@type': 'Thing', name: 'Case studies' },
            { '@type': 'Thing', name: 'Project proof' },
            { '@type': 'Thing', name: 'Business websites' }
          ],
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Insights', item: `${base}/insights` },
              { '@type': 'ListItem', position: 3, name: 'What a Useful Case Study Page Needs to Prove', item: url }
            ]
          }
        }
      ]
    });
  }
}
