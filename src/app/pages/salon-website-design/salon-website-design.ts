import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-salon-website-design',
  imports: [RouterLink],
  templateUrl: './salon-website-design.html',
  styleUrl: '../broken-arrow-web-design/broken-arrow-web-design.scss'
})
export class SalonWebsiteDesignComponent implements OnInit {
  private seo = inject(SeoService);

  trustSignals = [
    'Most salon websites built on GlossGenius, Vagaro, or StyleSeat work fine as booking tools — but they don\'t rank in local search, don\'t carry your brand, and don\'t give new clients a reason to choose you over the next result.',
    'Service menus without pricing, stylist profiles with no personality, and booking buttons that redirect through three platforms create friction exactly when a new client is deciding whether to commit.',
    'Real proof — before/afters, portfolio work, named stylists — does more to earn a new client booking than any generic "professional and friendly team" copy. Buyers are choosing a person, not just a location.'
  ];

  pageSections = [
    {
      title: 'Service menu with real clarity',
      text: 'Services listed with descriptions, timing, and pricing ranges so a new client knows what to expect before they book. No guessing, no "call for pricing" friction for basic services.'
    },
    {
      title: 'Stylist profiles that build trust',
      text: 'Individual profiles for each stylist — specialties, portfolio work, booking link — so clients can choose who they\'re booking with, not just where. That personal connection drives loyalty from the first visit.'
    },
    {
      title: 'Booking path without the redirect',
      text: 'A booking experience that feels native to the site — whether integrated with your scheduling platform or a clean contact flow — so the path from "I want to book" to "booked" has as few steps as possible.'
    },
    {
      title: 'Local search foundations',
      text: 'LocalBusiness and Service schema, consistent NAP, page structure that ranks for "[service] salon near me" searches, and a Google Business Profile that reinforces the site rather than replacing it.'
    }
  ];

  verticals = [
    'Hair salons replacing a GlossGenius or Vagaro page with a real brand site',
    'Barbershops that need stronger local search presence',
    'Independent stylists building a personal brand site',
    'Blowout bars and express styling services',
    'Nail salons, lash studios, and beauty service businesses',
    'Multi-stylist salons that need individual booking paths per stylist'
  ];

  faqs = [
    {
      question: 'Do I need a custom salon website if I already use GlossGenius or Vagaro?',
      answer: 'You can keep using those platforms for booking — a custom site doesn\'t replace them. But a GlossGenius page doesn\'t rank in local search, doesn\'t carry your brand, and doesn\'t give new clients a way to find you organically. A custom site gives you a home base that earns search traffic and sends it to your booking platform.'
    },
    {
      question: 'What does a salon website need to attract new clients?',
      answer: 'A service menu with real pricing and descriptions, stylist profiles with portfolio work, a booking path with minimal friction, and local SEO foundations so the site ranks when someone searches for your service type in your area. North Styles is a live example of exactly this.'
    },
    {
      question: 'Can you integrate my existing booking platform into a custom site?',
      answer: 'Yes. We integrate GlossGenius, Vagaro, StyleSeat, or similar platforms into a custom site so the booking experience feels native. The custom site drives organic traffic and handles the brand experience; the platform handles scheduling.'
    },
    {
      question: 'How do salons rank in local search?',
      answer: 'Local salon rankings depend on Google Business Profile consistency, on-page LocalBusiness and Service schema, service-area signals, mobile performance, and having real content — service descriptions, stylist profiles, FAQs — that matches what buyers search for.'
    }
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.com';
    const url = `${base}/salon-website-design`;
    this.seo.setPage({
      title: 'Salon Website Design | Localhouse Designs',
      description: 'Salon website design that earns new client bookings from search — service menu clarity, stylist profiles, booking integration, and local SEO foundations that GlossGenius pages can\'t provide.',
      url,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: 'Salon Website Design',
          description: 'Salon website design for hair salons, barbershops, and beauty service businesses — service clarity, stylist profiles, booking integration, and local SEO foundations.',
          isPartOf: { '@id': `${base}/#website` },
          about: { '@id': `${base}/#organization` },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Salon Website Design', item: url }
            ]
          }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          '@id': `${url}#service`,
          name: 'Salon website design',
          serviceType: 'Salon website design, booking integration, local SEO, stylist profiles, schema markup',
          provider: { '@id': `${base}/#organization` },
          areaServed: { '@type': 'Country', name: 'United States' },
          description: 'Custom website design for hair salons, barbershops, and beauty businesses — service clarity, stylist profiles, booking integration, and local SEO that earns new client bookings from search.'
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
