import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-syteline-mobile-case-study',
  imports: [RouterLink],
  templateUrl: './syteline-mobile-case-study.html',
  styleUrl: './syteline-mobile-case-study.scss'
})
export class SytelineMobileCaseStudyComponent implements OnInit {
  private seo = inject(SeoService);

  takeaways = [
    'SyteLine Mobile comes from firsthand ERP experience, not a generic mobile-app concept.',
    'The point is to answer routine ERP questions faster without sending people back to a desktop.',
    'Inventory, shipping, BOM, and production context become more useful when they are easier to reach in motion.',
    'This case study bridges Localhouse\'s ERP thinking with a more personal floor-level interface story.'
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.netlify.app';
    const url = `${base}/insights/syteline-mobile-making-erp-access-work-on-the-floor`;
    this.seo.setPage({
      title: 'SyteLine Mobile: Making ERP Access Work on the Floor | Localhouse Designs',
      description: 'A mobile operations case study rooted in firsthand ERP experience, showing why inventory, shipping, and floor-level teams need faster answers at their fingertips instead of one more desktop-bound workflow.',
      url,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': ['TechArticle', 'Article'],
          '@id': `${url}#article`,
          headline: 'SyteLine Mobile: Making ERP Access Work on the Floor',
          description: 'A mobile operations case study rooted in firsthand ERP experience, showing why inventory, shipping, and floor-level teams need faster answers at their fingertips instead of one more desktop-bound workflow.',
          datePublished: '2026-04-18',
          dateModified: '2026-04-18',
          author: { '@id': `${base}/about#person` },
          publisher: { '@id': `${base}/#organization` },
          mainEntityOfPage: { '@id': `${url}#webpage` }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: 'SyteLine Mobile: Making ERP Access Work on the Floor',
          isPartOf: { '@id': `${base}/#website` },
          about: [
            { '@type': 'Thing', name: 'Infor SyteLine' },
            { '@type': 'Thing', name: 'Mobile ERP access' },
            { '@type': 'Thing', name: 'Manufacturing operations' },
            { '@type': 'Thing', name: 'Workflow design' }
          ],
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Insights', item: `${base}/insights` },
              { '@type': 'ListItem', position: 3, name: 'SyteLine Mobile: Making ERP Access Work on the Floor', item: url }
            ]
          }
        }
      ]
    });
  }
}
