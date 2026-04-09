import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-about',
  imports: [RouterLink],
  templateUrl: './about.html',
  styleUrl: './about.scss'
})
export class AboutComponent implements OnInit {
  private seo = inject(SeoService);

  highlights = [
    {
      label: 'Based in',
      value: 'Broken Arrow, Oklahoma',
      detail: 'Working with Broken Arrow, Tulsa, and Oklahoma businesses locally, plus remote clients across the United States.'
    },
    {
      label: 'Built from',
      value: 'Product + operations experience',
      detail: 'Grounded in manufacturing, reporting, ERP migration, and internal process improvement.'
    },
    {
      label: 'Best known for',
      value: 'Angular, ERP workflows, SEO/GEO',
      detail: 'Combining frontend execution with structured data, automation, and business-context awareness from Oklahoma to projects reaching Sacramento, California.'
    }
  ];

  timeline = [
    {
      title: 'Software Developer, ERP and workflow automation',
      body: 'Built and maintained internal tools that automate ERP and production workflows. Developed Angular and C# applications that reduced manual handling, improved data accuracy, and turned process friction into usable internal systems.'
    },
    {
      title: 'Zero-downtime ERP migration work',
      body: 'Played a key role in moving business data from Microsoft Business Central to Infor SyteLine. Wrote the migration scripts responsible for the cutover, helping deliver a successful transition with zero downtime and no data loss.'
    },
    {
      title: 'Product management and reporting leadership',
      body: 'Managed product responsibilities across multiple business units with a heavy emphasis on reporting, finance visibility, sales support, and cross-functional execution. That work shaped a practical understanding of how operations, product, and analytics fit together.'
    }
  ];

  fit = [
    'Businesses that need a sharper website and cleaner technical execution.',
    'Teams that want someone who understands both frontend systems and operational workflows.',
    'Manufacturing or process-heavy environments where software needs to reflect real-world usage.'
  ];

  differentiators = [
    'Firsthand experience with Business Central, Infor SyteLine, BOMs, routing, reporting, and workflow bottlenecks.',
    'A product-management lens that keeps business clarity tied to technical execution.',
    'A structured-data-first approach that helps search engines and answer engines understand the business accurately.'
  ];

  qa = [
    {
      question: 'Who is behind Localhouse Designs?',
      answer: 'Localhouse Designs is led by Steven Rausch, a Broken Arrow, Oklahoma developer working in the Tulsa market with experience across product management, ERP migration, internal software, reporting, and workflow automation.'
    },
    {
      question: 'Why does the ERP background matter?',
      answer: 'Because it changes how systems are built. The work is informed by real exposure to manufacturing and operational pain points, not just surface-level technical implementation.'
    },
    {
      question: 'What makes the studio different from a typical web agency?',
      answer: 'The difference is the combination of product thinking, operational context, Angular development, and structured-data-driven SEO/GEO work. The goal is not just a site that looks good, but one that is useful, scalable, and easier to find.'
    },
    {
      question: 'Do you only work in Oklahoma?',
      answer: 'No. Broken Arrow, Tulsa, and the wider Oklahoma market are the home base, but Localhouse Designs also works remotely and has handled client work as far as Sacramento, California.'
    }
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.netlify.app';
    this.seo.setPage({
      title: 'About | Localhouse Designs - Broken Arrow Web Studio, ERP and SEO/GEO',
      description: 'About Localhouse Designs: a Broken Arrow, Oklahoma web studio in the Tulsa market led by Steven Rausch, with experience in Angular development, ERP migration, workflow automation, product management, and structured-data-first SEO/GEO.',
      url: `${base}/about`,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          '@id': `${base}/about#webpage`,
          url: `${base}/about`,
          name: 'About | Localhouse Designs',
          description: 'Background and experience behind Localhouse Designs.',
          isPartOf: { '@id': `${base}/#website` },
          about: { '@id': `${base}/#organization` },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'About', item: `${base}/about` }
            ]
          }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Person',
          '@id': `${base}/about#person`,
          name: 'Steven Rausch',
          jobTitle: 'Software Developer and Product Manager',
          worksFor: { '@id': `${base}/#organization` },
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Broken Arrow',
            addressRegion: 'OK',
            addressCountry: 'US'
          },
          alumniOf: [
            { '@type': 'CollegeOrUniversity', name: 'Northeastern State University' },
            { '@type': 'CollegeOrUniversity', name: 'Oklahoma State University Institute of Technology' }
          ],
          knowsAbout: [
            'Angular',
            'ERP migration',
            'Infor SyteLine',
            'Microsoft Business Central',
            'Workflow automation',
            'BOM systems',
            'Routing workflows',
            'Product management',
            'Reporting and analytics',
            'SEO',
            'GEO',
            'Structured data'
          ]
        }
      ]
    });
  }
}
