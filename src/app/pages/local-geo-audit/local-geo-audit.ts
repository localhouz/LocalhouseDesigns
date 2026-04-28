import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-local-geo-audit',
  imports: [FormsModule],
  templateUrl: './local-geo-audit.html',
  styleUrl: './local-geo-audit.scss'
})
export class LocalGeoAuditComponent implements OnInit {
  private seo = inject(SeoService);

  name = '';
  email = '';
  businessName = '';
  website = '';
  location = '';
  businessType = '';
  primaryGoal = '';
  platform = '';
  notes = '';

  submitted = signal(false);
  submitting = signal(false);

  businessTypes = [
    'Local service business',
    'Retail / storefront',
    'Restaurant / food',
    'Health / wellness',
    'Home services',
    'Other',
  ];

  goalOptions = [
    'More local visibility',
    'Better conversion from visits',
    'Clearer contact flow',
    'Improve trust signals',
    'Unsure',
  ];

  platformOptions = [
    'Custom site',
    'Shopify',
    'Squarespace',
    'Wix',
    'WordPress',
    'Booking platform',
    'Other',
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.com';
    this.seo.setPage({
      title: 'Local GEO Audit | Localhouse Designs',
      description: 'Request a Local GEO audit for your business. Get a scorecard, top fixes, and a prioritized action list for local visibility and answer-ready content.',
      url: `${base}/local-geo-audit`,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${base}/local-geo-audit#webpage`,
          url: `${base}/local-geo-audit`,
          name: 'Local GEO Audit | Localhouse Designs',
          description: 'Request a Local GEO audit to improve local visibility, contact clarity, and structured data signals.',
          isPartOf: { '@id': `${base}/#website` },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Local GEO Audit', item: `${base}/local-geo-audit` }
            ]
          }
        }
      ]
    });
  }

  async onSubmit(form: any) {
    if (!form.valid) return;
    this.submitting.set(true);

    const body = new URLSearchParams({
      'form-name': 'local-geo-audit',
      auditType: 'local-geo',
      name: this.name,
      email: this.email,
      businessName: this.businessName,
      website: this.website,
      location: this.location,
      businessType: this.businessType,
      primaryGoal: this.primaryGoal,
      platform: this.platform,
      notes: this.notes,
    });

    try {
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      });
      this.submitted.set(true);
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      this.submitting.set(false);
    }
  }
}
