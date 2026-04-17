import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

interface Option {
  label: string;
  value: string;
  hint: string;
}

interface DemoScenario {
  title: string;
  service: string;
  urgency: string;
  summary: string;
}

@Component({
  selector: 'app-hvac-prototype',
  imports: [CommonModule, RouterLink],
  templateUrl: './hvac-prototype.html',
  styleUrl: './hvac-prototype.scss'
})
export class HvacPrototypeComponent implements OnInit, OnDestroy {
  private seo = inject(SeoService);
  private cycleTimer: ReturnType<typeof setInterval> | null = null;

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

  scenarios: DemoScenario[] = [
    {
      title: 'Emergency repair',
      service: 'repair',
      urgency: 'today',
      summary: 'Phone-first repair lead with same-day urgency and immediate area coverage.'
    },
    {
      title: 'Replacement quote',
      service: 'replace',
      urgency: 'planning',
      summary: 'Lower-pressure estimate path with financing and trust moved closer to the CTA.'
    },
    {
      title: 'Seasonal tune-up',
      service: 'maintenance',
      urgency: 'week',
      summary: 'Simple scheduling flow for recurring maintenance instead of a bloated service page.'
    }
  ];

  selectedService = signal('repair');
  selectedUrgency = signal('today');
  selectedScenario = signal('Emergency repair');
  autoPlaying = signal(true);

  activeService = computed(
    () => this.serviceOptions.find((option) => option.value === this.selectedService()) ?? this.serviceOptions[0]
  );

  activeUrgency = computed(
    () => this.urgencyOptions.find((option) => option.value === this.selectedUrgency()) ?? this.urgencyOptions[0]
  );

  heroEyebrow = computed(() => {
    const service = this.selectedService();
    if (service === 'replace') return 'Replacement estimates';
    if (service === 'maintenance') return 'Seasonal tune-up';
    if (service === 'air-quality') return 'Indoor air quality';
    return 'Same-day repair';
  });

  heroHeadline = computed(() => {
    const service = this.selectedService();
    const urgency = this.selectedUrgency();

    if (service === 'replace') {
      return urgency === 'planning'
        ? 'Compare system options without chasing the next step.'
        : 'Make replacement quotes feel calm, local, and easy to trust.';
    }

    if (service === 'maintenance') {
      return 'Turn tune-up traffic into scheduled service without extra friction.';
    }

    if (service === 'air-quality') {
      return 'Explain comfort problems in homeowner language, then give one clear action.';
    }

    return urgency === 'today'
      ? 'Air out today? Make the next step obvious.'
      : 'Keep repair leads moving with one clear action above the fold.';
  });

  primaryCta = computed(() => {
    const service = this.selectedService();
    const urgency = this.selectedUrgency();

    if (service === 'replace') return 'Request free estimate';
    if (service === 'maintenance') return 'Schedule tune-up';
    if (service === 'air-quality') return 'Book home assessment';
    if (urgency === 'today') return 'Call for same-day service';
    return 'Request repair visit';
  });

  proofItems = computed(() => {
    const service = this.selectedService();

    if (service === 'replace') {
      return ['Financing options', 'Licensed installation', 'Tulsa metro service area'];
    }
    if (service === 'maintenance') {
      return ['Seasonal checklist', 'Membership pricing', 'Fast scheduling'];
    }
    if (service === 'air-quality') {
      return ['Dust and allergy issues', 'Humidity and airflow', 'Whole-home solutions'];
    }
    return ['24/7 emergency response', 'Broken Arrow to Owasso', 'Short estimate path'];
  });

  demoNotes = computed(() => {
    const service = this.selectedService();
    if (service === 'replace') {
      return [
        'Replacement traffic needs trust and financing sooner than it needs a long service explainer.',
        'The CTA language shifts from urgent repair to lower-friction estimate intent.'
      ];
    }
    if (service === 'maintenance') {
      return [
        'Tune-up traffic converts better when the offer is small, specific, and easy to schedule.',
        'Membership and checklist language reduce hesitation faster than generic HVAC copy.'
      ];
    }
    if (service === 'air-quality') {
      return [
        'Air-quality pages work better when they start with symptoms people actually recognize at home.',
        'This path earns the lead by translating comfort issues before asking for the appointment.'
      ];
    }
    return [
      'Repair traffic needs urgency, area coverage, and one obvious phone-first action immediately.',
      'The prototype keeps the first screen tight so the estimate path feels immediate instead of buried.'
    ];
  });

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

    this.startAutoCycle();
  }

  ngOnDestroy() {
    this.stopAutoCycle();
  }

  setService(value: string) {
    this.selectedService.set(value);
    this.syncScenarioLabel();
  }

  setUrgency(value: string) {
    this.selectedUrgency.set(value);
    this.syncScenarioLabel();
  }

  activateScenario(scenario: DemoScenario, userInitiated = false) {
    this.selectedService.set(scenario.service);
    this.selectedUrgency.set(scenario.urgency);
    this.selectedScenario.set(scenario.title);

    if (userInitiated) {
      this.autoPlaying.set(false);
      this.stopAutoCycle();
    }
  }

  resumeAutoPlay() {
    this.autoPlaying.set(true);
    this.startAutoCycle();
  }

  pauseAutoPlay() {
    this.autoPlaying.set(false);
    this.stopAutoCycle();
  }

  private startAutoCycle() {
    this.stopAutoCycle();

    let index = this.scenarios.findIndex((scenario) => scenario.title === this.selectedScenario());
    if (index < 0) index = 0;

    this.cycleTimer = setInterval(() => {
      if (!this.autoPlaying()) return;
      index = (index + 1) % this.scenarios.length;
      this.activateScenario(this.scenarios[index]);
    }, 4000);
  }

  private stopAutoCycle() {
    if (this.cycleTimer) {
      clearInterval(this.cycleTimer);
      this.cycleTimer = null;
    }
  }

  private syncScenarioLabel() {
    const match = this.scenarios.find(
      (scenario) => scenario.service === this.selectedService() && scenario.urgency === this.selectedUrgency()
    );
    this.selectedScenario.set(match?.title ?? 'Custom view');
  }
}
