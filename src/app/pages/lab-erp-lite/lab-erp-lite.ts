import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

type MachineStatus = 'Running' | 'Idle' | 'Down' | 'Setup';
type MachineShift = 'Day' | 'Swing' | 'Night';

interface Machine {
  id: string;
  name: string;
  line: string;
  status: MachineStatus;
  shift: MachineShift;
  throughput: string;
  lastHeartbeat: string;
  workOrderId: string;
}

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

  machines = signal<Machine[]>([]);
  sourceNote = signal('Loading dataset...');

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

  lastUpdated = computed(() => {
    const times = this.filteredMachines().map(m => m.lastHeartbeat);
    return times[0] || 'just now';
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
      const machines = this.toMachines(rows, 12);
      this.machines.set(machines);
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

  private toMachines(rows: Record<string, string>[], count: number): Machine[] {
    const shifts: MachineShift[] = ['Day', 'Swing', 'Night'];
    const lines = ['Line A', 'Line B', 'Line C', 'Line D'];

    const numericCols = Object.keys(rows[0]).filter(k => rows.some(r => !isNaN(Number(r[k]))));
    const metricKey = ['outpressure', 'inpressure', 'footfall', 'temp', 'atemp']
      .find(k => numericCols.includes(k)) ?? numericCols[0];
    const failureKey = ['fail', 'failure', 'failure_within_24h', 'machine_failure']
      .find(k => Object.keys(rows[0]).includes(k));

    const metricVals = rows.map(r => Number(r[metricKey] ?? 0)).filter(v => !isNaN(v));
    const sorted = [...metricVals].sort((a, b) => a - b);
    const p25 = sorted[Math.floor(sorted.length * 0.25)] ?? 0;
    const p75 = sorted[Math.floor(sorted.length * 0.75)] ?? 0;

    return rows.slice(0, count).map((r, i) => {
      const metric = Number(r[metricKey] ?? 0);
      const failure = failureKey ? Number(r[failureKey] ?? 0) : 0;
      let status: MachineStatus = 'Running';
      if (failure === 1) status = 'Down';
      else if (metric <= p25) status = 'Idle';
      else if (metric >= p75) status = 'Running';
      else status = 'Setup';

      const machineId = r['machine_id'] || r['device_id'] || r['id'] || `M${i + 1}`;
      const name = `Machine ${String(i + 1).padStart(2, '0')}`;
      const throughput = `${Math.max(0, Math.round(metric))}/hr`;

      return {
        id: String(machineId),
        name,
        line: lines[i % lines.length],
        status,
        shift: shifts[i % shifts.length],
        throughput,
        lastHeartbeat: '1 min ago',
        workOrderId: `WO-${18200 + i}`,
      };
    });
  }

}
