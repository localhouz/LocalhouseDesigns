import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';
import { RestaurantPrototype, restaurantPrototypeMap } from './restaurant-prototypes.data';

@Component({
  selector: 'app-restaurant-prototype',
  imports: [CommonModule, RouterLink],
  templateUrl: './restaurant-prototype.html',
  styleUrl: './restaurant-prototype.scss'
})
export class RestaurantPrototypeComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private seo = inject(SeoService);

  prototype = signal<RestaurantPrototype | null>(null);
  menuQuery = signal('');
  selectedCategory = signal('All');
  selectedPairing = signal('Bone-in ribeye');
  currentHour = new Date().getHours();

  themeStyles = computed(() => {
    const prototype = this.prototype();
    if (!prototype) return {};

    return {
      '--proto-bg': prototype.theme.background,
      '--proto-panel': prototype.theme.panel,
      '--proto-panel-alt': prototype.theme.panelAlt,
      '--proto-line': prototype.theme.line,
      '--proto-accent': prototype.theme.accent,
      '--proto-accent-soft': prototype.theme.accentSoft,
      '--proto-text': prototype.theme.text,
      '--proto-muted': prototype.theme.muted
    };
  });

  currentMenuState = computed(() => {
    if (this.currentHour < 16) return 'Happy hour';
    if (this.currentHour < 22) return 'Dinner';
    return 'Late night';
  });

  filteredMenuCards = computed(() => {
    const prototype = this.prototype();
    if (!prototype) return [];

    const query = this.menuQuery().trim().toLowerCase();
    const category = this.selectedCategory();

    return prototype.menuCards.filter((item) => {
      const matchesQuery = !query
        || item.title.toLowerCase().includes(query)
        || item.subtitle.toLowerCase().includes(query);

      const matchesCategory = category === 'All'
        || item.title.toLowerCase().includes(category.toLowerCase().replace(' classics', '').replace(' ', ''))
        || item.subtitle.toLowerCase().includes(category.toLowerCase().split(' ')[0]);

      return matchesQuery && matchesCategory;
    });
  });

  activePairing = computed(() => {
    const prototype = this.prototype();
    if (!prototype?.pairingOptions?.length) return null;
    return prototype.pairingOptions.find((item) => item.cut === this.selectedPairing()) ?? prototype.pairingOptions[0];
  });

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug') ?? '';
      const prototype = restaurantPrototypeMap.get(slug) ?? null;
      this.prototype.set(prototype);
      this.menuQuery.set('');
      this.selectedCategory.set('All');
      this.selectedPairing.set(prototype?.pairingOptions?.[0]?.cut ?? 'Bone-in ribeye');

      if (!prototype) return;

      const base = 'https://localhousedesigns.netlify.app';
      const url = `${base}/private-preview/${prototype.shareSlug}`;
      this.seo.setPage({
        title: `${prototype.businessName} Prototype | Localhouse Designs`,
        description: `${prototype.prototypeLabel} for ${prototype.businessName} in ${prototype.cityLabel}. ${prototype.summary}`,
        url,
        noIndex: true
      });
    });
  }

  setCategory(category: string) {
    this.selectedCategory.set(category);
  }

  setPairing(cut: string) {
    this.selectedPairing.set(cut);
  }
}
