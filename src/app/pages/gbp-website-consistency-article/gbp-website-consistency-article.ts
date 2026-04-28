import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-gbp-website-consistency-article',
  imports: [RouterLink],
  templateUrl: './gbp-website-consistency-article.html',
  styleUrl: './gbp-website-consistency-article.scss'
})
export class GbpWebsiteConsistencyArticleComponent implements OnInit {
  private seo = inject(SeoService);

  takeaways = [
    'Your Google Business Profile and website should describe the same business in the same basic way.',
    'Mismatched services, hours, names, or locations create doubt for people and search systems.',
    'Consistency does not mean robotic repetition. It means the facts line up.',
    'The website should be the clearest source behind the profile.'
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.com';
    const url = `${base}/insights/why-your-google-business-profile-and-website-need-to-say-the-same-thing`;
    this.seo.setPage({
      title: 'Why Your Google Business Profile and Website Need to Say the Same Thing | Localhouse Designs',
      description: 'A practical explanation of why Google Business Profile and website consistency matters for local trust, local SEO, and clearer customer decisions.',
      url,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': ['TechArticle', 'Article'],
          '@id': `${url}#article`,
          headline: 'Why Your Google Business Profile and Website Need to Say the Same Thing',
          description: 'A practical explanation of why Google Business Profile and website consistency matters for local trust, local SEO, and clearer customer decisions.',
          datePublished: '2026-04-12',
          dateModified: '2026-04-12',
          author: { '@id': `${base}/about#person` },
          publisher: { '@id': `${base}/#organization` },
          mainEntityOfPage: { '@id': `${url}#webpage` }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: 'Why Your Google Business Profile and Website Need to Say the Same Thing',
          isPartOf: { '@id': `${base}/#website` },
          about: [
            { '@type': 'Thing', name: 'Google Business Profile' },
            { '@type': 'Thing', name: 'Local SEO' },
            { '@type': 'Thing', name: 'NAP consistency' }
          ],
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Insights', item: `${base}/insights` },
              { '@type': 'ListItem', position: 3, name: 'Why Your Google Business Profile and Website Need to Say the Same Thing', item: url }
            ]
          }
        }
      ]
    });
  }
}
