import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';
import { AdapterCheck, Machine, iotSnapshotAdapter, runAdapterDiagnostics, validateMachinesDetailed } from './erp-lite-adapter';

@Component({
  selector: 'app-lab-erp-lite',
  imports: [FormsModule, RouterLink],
  templateUrl: './lab-erp-lite.html',
  styleUrl: './lab-erp-lite.scss'
})
export class LabErpLiteComponent implements OnInit {
  private seo = inject(SeoService);

  lineFilter = signal('all');
  statusFilter = signal('all');
  shiftFilter = signal('all');
  viewMode = signal<'floor' | 'planner' | 'leadership'>('floor');

  machines = signal<Machine[]>([]);
  sourceNote = signal('Loading dataset...');
  adapterWarnings = signal<string[]>([]);
  adapterChecks = signal<{ warnings: string[]; staleCount: number }>({ warnings: [], staleCount: 0 });
  adapterDiagnostics = signal<AdapterCheck[]>([]);
  contractOpen = signal(false);
  adapterGeneratedAt = signal<string>('');
  adapterSource = signal('iot-snapshot');
  adapterRuns = signal<{ id: string; status: 'ok' | 'warning'; note: string }[]>([]);

  private readonly dataUrl = '/data/iot_sensor_dataset.csv';

  lines = computed(() => Array.from(new Set(this.machines().map(m => m.line))).sort());
  statuses = computed(() => Array.from(new Set(this.machines().map(m => m.status))).sort());
  shifts = computed(() => Array.from(new Set(this.machines().map(m => m.shift))).sort());

  filteredMachines = computed(() => {
    return this.machines().filter(m => {
      const lineOk = this.lineFilter() === 'all' || m.line === this.lineFilter();
      const statusOk = this.statusFilter() === 'all' || m.status === this.statusFilter();
      const shiftOk = this.shiftFilter() === 'all' || m.shift === this.shiftFilter();
      return lineOk && statusOk && shiftOk;
    });
  });

  runningCount = computed(() => this.filteredMachines().filter(m => m.status === 'Running').length);
  idleCount = computed(() => this.filteredMachines().filter(m => m.status === 'Idle').length);
  downCount = computed(() => this.filteredMachines().filter(m => m.status === 'Down').length);
  setupCount = computed(() => this.filteredMachines().filter(m => m.status === 'Setup').length);

  staleCount = computed(() => this.filteredMachines().filter(m => this.isStale(m.lastHeartbeat)).length);
  totalCount = computed(() => this.filteredMachines().length);
  uptimePercent = computed(() => {
    const total = this.totalCount();
    if (!total) return 0;
    return Math.round((this.runningCount() / total) * 100);
  });
  stalePercent = computed(() => {
    const total = this.totalCount();
    if (!total) return 0;
    return Math.round((this.staleCount() / total) * 100);
  });
  freshnessPercent = computed(() => Math.max(0, 100 - this.stalePercent()));
  bottleneckCount = computed(() => this.downCount() + this.staleCount());

  lastUpdated = computed(() => {
    const times = this.filteredMachines().map(m => m.lastHeartbeat).filter(Boolean);
    const latest = times.sort().slice(-1)[0];
    return latest ? this.formatAge(latest) : 'just now';
  });

  exceptions = computed(() => {
    return this.filteredMachines()
      .filter(m => m.status === 'Down' || this.isStale(m.lastHeartbeat))
      .map(m => ({
        id: m.id,
        name: m.name,
        status: this.isStale(m.lastHeartbeat) ? 'Stale' : m.status,
        line: m.line,
        workOrderId: m.workOrderId,
        lastHeartbeat: this.formatAge(m.lastHeartbeat),
        reason: this.isStale(m.lastHeartbeat) ? 'Heartbeat overdue' : 'Failure or alarm',
        riskScore: this.isStale(m.lastHeartbeat) ? 60 : 90
      }));
  });

  exceptionsDown = computed(() => this.exceptions().filter(e => e.status === 'Down').length);
  exceptionsStale = computed(() => this.exceptions().filter(e => e.status === 'Stale').length);
  leadershipIssues = computed(() => {
    return this.exceptions()
      .slice()
      .sort((a, b) => {
        if (a.status === b.status) return 0;
        if (a.status === 'Down') return -1;
        if (b.status === 'Down') return 1;
        return 0;
      })
      .slice(0, 5);
  });

  ngOnInit() {
    const base = 'https://localhousedesigns.netlify.app';
    this.seo.setPage({
      title: 'ERP Lite Floor Map | Localhouse Designs Lab',
      description: 'A lightweight ERP front end demo that visualizes shop floor status without vendor lock-in. Mock data, real UI pattern.',
      url: `${base}/lab/erp-lite`,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${base}/lab/erp-lite#webpage`,
          url: `${base}/lab/erp-lite`,
          name: 'ERP Lite Floor Map | Localhouse Designs Lab',
          description: 'Demo UI showing how ERP data can be normalized into a readable shop floor view.',
          isPartOf: { '@id': `${base}/#website` },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Lab', item: `${base}/lab` },
              { '@type': 'ListItem', position: 3, name: 'ERP Lite', item: `${base}/lab/erp-lite` }
            ]
          }
        }
      ]
    });

    this.loadDataset();
  }

  private async loadDataset() {
    try {
      const res = await fetch(this.dataUrl);
      if (!res.ok) throw new Error('dataset fetch failed');
      const text = await res.text();
      const rows = this.parseCsv(text, 60);
      if (!rows.length) throw new Error('empty dataset');
      const mapped = iotSnapshotAdapter.map(rows.slice(0, 12));
      this.machines.set(mapped.machines);
      this.adapterWarnings.set(mapped.warnings ?? []);
      this.adapterChecks.set(validateMachinesDetailed(mapped.machines));
      this.adapterDiagnostics.set(runAdapterDiagnostics());
      this.adapterGeneratedAt.set(mapped.generatedAt);
      this.adapterSource.set(mapped.source);
      this.adapterRuns.set([
        { id: `run-${Date.now()}`, status: (mapped.warnings ?? []).length ? 'warning' : 'ok', note: 'IoT snapshot mapped' },
        { id: 'run-previous', status: 'ok', note: 'Contract v1 applied' }
      ]);
      this.sourceNote.set('Data source: IBM IoT Predictive Maintenance dataset (snapshot).');
    } catch {
      this.machines.set([]);
      this.sourceNote.set('Data source unavailable. Check dataset snapshot.');
    }
  }

  private parseCsv(text: string, limit: number): Record<string, string>[] {
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return [];
    const header = lines[0].split(',').map(h => h.trim());
    return lines.slice(1, limit + 1).map(line => {
      const cols = line.split(',');
      const row: Record<string, string> = {};
      header.forEach((h, i) => row[h] = cols[i]?.trim() ?? '');
      return row;
    });
  }

  isStale(iso: string): boolean {
    const ts = Date.parse(iso);
    if (Number.isNaN(ts)) return true;
    return Date.now() - ts > 5 * 60_000;
  }

  formatAge(iso: string): string {
    const ts = Date.parse(iso);
    if (Number.isNaN(ts)) return 'unknown';
    const mins = Math.max(1, Math.round((Date.now() - ts) / 60_000));
    return `${mins} min ago`;
  }

}
