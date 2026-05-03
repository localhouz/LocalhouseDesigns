import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-salon-website-design-tulsa',
  imports: [RouterLink],
  templateUrl: './salon-website-design-tulsa.html',
  styleUrl: '../broken-arrow-web-design/broken-arrow-web-design.scss'
})
export class SalonWebsiteDesignTulsaComponent implements OnInit {
  private seo = inject(SeoService);

  trustSignals = [
    'Built for salons, barbers, stylists, and grooming brands that need more than a booking-platform profile.',
    'Best fit when the business already has demand, but the website does not explain the brand, services, location, or booking path clearly enough.',
    'Grounded in a real platform-replacement case study: North Styles moved from a constrained GlossGenius presence to a custom site with stronger local SEO/AEO foundations.'
  ];

  pageSections = [
    {
      title: 'Own the brand story',
      text: 'A custom site gives the business room for services, vibe, location context, policies, FAQs, photos, proof, and the reasons someone should book with you.'
    },
    {
      title: 'Keep booking simple',
      text: 'The site should still point people toward booking, but the page can build trust before pushing someone into a platform flow.'
    },
    {
      title: 'Support local discovery',
      text: 'Service copy, location language, schema, FAQs, and internal links help search and AI systems understand what the salon or barber brand actually offers.'
    },
    {
      title: 'Make contact feel safer',
      text: 'New visitors often need clarity around location, service fit, timing, pricing expectations, and what to do next before they book.'
    }
  ];

  verticals = [
    'Salon websites',
    'Barber websites',
    'Independent stylists',
    'Grooming brands',
    'Booking-platform replacement',
    'Tulsa and Broken Arrow local SEO'
  ];

  faqs = [
    {
      question: 'Do salon and barber websites still need booking platforms?',
      answer: 'Often yes. The custom site does not need to replace booking software. It can own the brand, services, local SEO, FAQs, and trust content while still sending ready visitors into the booking platform.'
    },
    {
      question: 'Why is a custom salon website better than only using a booking profile?',
      answer: 'A booking profile is built for scheduling first. A custom site gives more room for service detail, local trust, brand voice, structured data, proof, and content that helps people decide before they book.'
    },
    {
      question: 'Does Localhouse Designs work with Tulsa salons and barbers?',
      answer: 'Yes. Localhouse Designs is based in Broken Arrow and builds websites for Tulsa-area service businesses, including salons, barbers, stylists, and grooming brands that need stronger local visibility and booking paths.'
    },
    {
      question: 'What proof do you have for this kind of work?',
      answer: 'North Styles is the clearest proof point: a local grooming brand site rebuilt from a limited GlossGenius presence into a custom standalone site with stronger local search and booking foundations.'
    }
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.com';
    const url = `${base}/salon-website-design-tulsa`;
    this.seo.setPage({
      title: 'Salon Website Design Tulsa | Localhouse Designs',
      description: 'Salon and barber website design for Tulsa and Broken Arrow grooming brands that need stronger local SEO, service pages, trust content, and booking paths.',
      url,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: 'Salon Website Design Tulsa',
          description: 'Vertical landing page for Tulsa salon and barber website design, booking-platform replacement, local SEO foundations, trust content, FAQs, and booking paths.',
          isPartOf: { '@id': `${base}/#website` },
          about: { '@id': `${base}/#organization` },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Salon Website Design Tulsa', item: url }
            ]
          }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          '@id': `${url}#service`,
          name: 'Salon and barber website design in Tulsa',
          serviceType: 'Salon website design, barber website design, booking-platform replacement, local SEO, and conversion cleanup',
          provider: { '@id': `${base}/#organization` },
          areaServed: [
            { '@type': 'City', name: 'Tulsa' },
            { '@type': 'City', name: 'Broken Arrow' },
            { '@type': 'State', name: 'Oklahoma' }
          ],
          description: 'Custom websites for Tulsa and Broken Arrow salons, barbers, stylists, and grooming brands that need stronger service pages, local SEO foundations, proof, FAQs, and better booking paths.'
        },
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: this.faqs.map(item => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: { '@type': 'Answer', text: item.answer }
          }))
        }
      ]
    });
  }
}
