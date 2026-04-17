import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

interface Option {
  label: string;
  value: string;
  hint: string;
}

@Component({
  selector: 'app-hvac-prototype',
  imports: [CommonModule, RouterLink],
  templateUrl: './hvac-prototype.html',
  styleUrl: './hvac-prototype.scss'
})
export class HvacPrototypeComponent implements OnInit {
  private seo = inject(SeoService);

  serviceOptions: Option[] = [
    { label: 'AC Repair', value: 'repair', hint: 'No cooling, weak airflow, strange noise' },
    { label: 'New System Quote', value: 'replace', hint: 'Older unit, rising bills, replacement planning' },
    { label: 'Seasonal Tune-Up', value: 'maintenance', hint: 'Preventive maintenance before the next weather swing' },
    { label: 'Indoor Air Quality', value: 'air-quality', hint: 'Filtration, humidity, and whole-home comfort' }
  ];

  urgencyOptions: Option[] = [
    { label: 'Need help today', value: 'today', hint: 'Emergency or same-day callout' },
    { label: 'This week is fine', value: 'week', hint: 'Important, but not an emergency' },
    { label: 'Just comparing options', value: 'planning', hint: 'Researching price, timing, and fit' }
  ];

  selectedService = signal('repair');
  selectedUrgency = signal('today');

  serviceSummary = computed(() => {
    const service = this.selectedService();
    const urgency = this.selectedUrgency();

    if (service === 'repair' && urgency === 'today') {
      return 'Fastest path: emergency repair request, same-day callback, and one obvious action above the fold.';
    }
    if (service === 'replace') {
      return 'Quote path shifts toward trust, financing, system fit, and a lower-friction estimate request.';
    }
    if (service === 'maintenance') {
      return 'The page should reduce hesitation with membership clarity, checklist coverage, and a clean scheduling CTA.';
    }
    if (service === 'air-quality') {
      return 'Lead with problem language people actually use: dust, allergies, uneven rooms, humidity, and stale air.';
    }

    if (urgency === 'planning') {
      return 'For lower urgency traffic, the prototype leans harder on proof, FAQs, and service-page clarity before asking for the lead.';
    }

    return 'The contact path stays simple: one primary CTA, local proof near the decision, and less form friction.';
  });

  ngOnInit() {
    const base = 'https://localhousedesigns.netlify.app';
    const url = `${base}/lab/local-service-hvac-prototype`;
    this.seo.setPage({
      title: 'HVAC Lead Prototype | Localhouse Designs',
      description: 'A local-service HVAC prototype showing how clearer service framing, local proof, and a lower-friction quote path can turn search traffic into leads.',
      url,
      noIndex: true
    });
  }

  setService(value: string) {
    this.selectedService.set(value);
  }

  setUrgency(value: string) {
    this.selectedUrgency.set(value);
  }
}
