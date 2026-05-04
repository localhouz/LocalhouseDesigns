import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-restaurant-website-design',
  imports: [RouterLink],
  templateUrl: './restaurant-website-design.html',
  styleUrl: '../broken-arrow-web-design/broken-arrow-web-design.scss'
})
export class RestaurantWebsiteDesignComponent implements OnInit {
  private seo = inject(SeoService);

  trustSignals = [
    'The most common restaurant website failure: hours and location buried, menu as a PDF that doesn\'t load on mobile, and a reservation path that redirects through three platforms before anyone books.',
    'Relying on OpenTable, Yelp, or Google listings as your primary web presence means someone else controls how your restaurant is described, ranked, and monetized. A custom site gives that control back.',
    'Restaurant searches are almost entirely mobile. A site that looks fine on desktop but loads slowly, hides the phone number, or requires pinching to read the menu loses the visit before it starts.'
  ];

  pageSections = [
    {
      title: 'Menu and hours in the first screen',
      text: 'What you serve, when you\'re open, and where you are — answered immediately, without scrolling or PDFs. Mobile-first because that\'s where nearly every restaurant search happens.'
    },
    {
      title: 'Reservation and order path that converts',
      text: 'A booking or order flow that doesn\'t require leaving the site or navigating three platforms. The shorter the path from "I want to go here" to "table confirmed," the higher the conversion.'
    },
    {
      title: 'Local search presence',
      text: 'Restaurant and LocalBusiness schema, consistent NAP, and page structure that helps Google and AI search represent your restaurant accurately when someone searches your cuisine or neighborhood.'
    },
    {
      title: 'Photography and atmosphere',
      text: 'Real food and interior photography structured for fast load times — not stock images, not PDFs, not gallery plugins that break on mobile. Visuals that make the decision before they check Yelp.'
    }
  ];

  verticals = [
    'Independent restaurants replacing a dated or platform-built site',
    'Fine dining and upscale casual restaurants that need stronger brand presence',
    'Fast casual and counter-service restaurants with online ordering',
    'Bars and breweries with event and menu pages',
    'Food trucks and pop-ups building a real online presence',
    'Cafes and specialty food businesses that need clearer local search visibility'
  ];

  faqs = [
    {
      question: 'Does my restaurant need its own website if I have a Google listing and Yelp page?',
      answer: 'Yes. Third-party listings control how you\'re described, charge for leads, and can change how you rank without notice. A custom site gives you a home base that you own — where the menu is always current, the booking path is yours, and the brand experience is yours to control.'
    },
    {
      question: 'What should a restaurant website include?',
      answer: 'At minimum: current menu (not a PDF), hours and address in the first screen, a reservation or contact path, real food photography, and your Google Business Profile linked and consistent. Beyond that: schema markup, event pages if relevant, and a mobile experience that loads in under two seconds.'
    },
    {
      question: 'How do I get my restaurant to rank higher in local search?',
      answer: 'Local restaurant rankings depend on Google Business Profile completeness, consistent NAP across the web, on-page schema (Restaurant, Menu, FAQPage), mobile performance, and having a site that clearly signals your cuisine, neighborhood, and hours to search systems.'
    },
    {
      question: 'Can you integrate online ordering or reservations?',
      answer: 'Yes. We can integrate existing platforms like Toast, OpenTable, or Resy into a custom site so the booking or ordering experience feels native rather than redirected. Or help you evaluate simpler direct options depending on your volume and setup.'
    }
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.com';
    const url = `${base}/restaurant-website-design`;
    this.seo.setPage({
      title: 'Restaurant Website Design | Localhouse Designs',
      description: 'Restaurant website design that fills seats — menu clarity, mobile-first performance, reservation path, local search foundations, and a brand experience that earns the visit before they check Yelp.',
      url,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: 'Restaurant Website Design',
          description: 'Restaurant website design for independent restaurants, bars, and food businesses — mobile-first, menu clarity, reservation path, and local search foundations.',
          isPartOf: { '@id': `${base}/#website` },
          about: { '@id': `${base}/#organization` },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Restaurant Website Design', item: url }
            ]
          }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          '@id': `${url}#service`,
          name: 'Restaurant website design',
          serviceType: 'Restaurant website design, local SEO, menu structure, reservation integration, schema markup',
          provider: { '@id': `${base}/#organization` },
          areaServed: { '@type': 'Country', name: 'United States' },
          description: 'Custom website design for restaurants — mobile-first, menu clarity, reservation path, local search schema, and a brand experience that earns the visit.'
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
