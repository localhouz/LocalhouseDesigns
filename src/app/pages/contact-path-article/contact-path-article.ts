import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-contact-path-article',
  imports: [RouterLink],
  templateUrl: './contact-path-article.html',
  styleUrl: './contact-path-article.scss'
})
export class ContactPathArticleComponent implements OnInit {
  private seo = inject(SeoService);

  takeaways = [
    'Local SEO breaks when the contact path is unclear or inconsistent.',
    'NAP clarity, CTA clarity, FAQ schema, and map/directions flow do most of the work.',
    'FAQ schema only helps when the questions are real pre-sales questions.',
    'A clearer contact path improves both trust and local visibility.'
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.netlify.app';
    const url = `${base}/insights/why-local-seo-fails-when-the-contact-path-is-vague`;
    this.seo.setPage({
      title: 'Why Local SEO Fails When the Contact Path Is Vague | Localhouse Designs',
      description: 'A practical breakdown of why local SEO fails when the contact path is unclear, and how NAP clarity, CTA clarity, FAQ schema, and map/directions flow fix it.',
      url,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': ['TechArticle', 'Article'],
          '@id': `${url}#article`,
          headline: 'Why Local SEO Fails When the Contact Path Is Vague',
          description: 'A practical breakdown of why local SEO fails when the contact path is unclear, and how NAP clarity, CTA clarity, FAQ schema, and map/directions flow fix it.',
          datePublished: '2026-04-14',
          dateModified: '2026-04-14',
          author: { '@id': `${base}/about#person` },
          publisher: { '@id': `${base}/#organization` },
          mainEntityOfPage: { '@id': `${url}#webpage` }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: 'Why Local SEO Fails When the Contact Path Is Vague',
          isPartOf: { '@id': `${base}/#website` },
          about: [
            { '@type': 'Thing', name: 'Local SEO' },
            { '@type': 'Thing', name: 'Contact path' },
            { '@type': 'Thing', name: 'NAP consistency' },
            { '@type': 'Thing', name: 'FAQ schema' }
          ],
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Insights', item: `${base}/insights` },
              { '@type': 'ListItem', position: 3, name: 'Why Local SEO Fails When the Contact Path Is Vague', item: url }
            ]
          }
        }
      ]
    });
  }
}
