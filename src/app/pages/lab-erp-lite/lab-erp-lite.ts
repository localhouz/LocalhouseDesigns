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

  machines = signal<Machine[]>([
    { id: 'm1', name: 'Cut 01', line: 'Line A', status: 'Running', shift: 'Day', throughput: '42/hr', lastHeartbeat: '1 min ago', workOrderId: 'WO-18231' },
    { id: 'm2', name: 'Cut 02', line: 'Line A', status: 'Idle', shift: 'Day', throughput: '0/hr', lastHeartbeat: '4 min ago', workOrderId: 'WO-18212' },
    { id: 'm3', name: 'Mill 01', line: 'Line A', status: 'Setup', shift: 'Day', throughput: '12/hr', lastHeartbeat: '2 min ago', workOrderId: 'WO-18243' },
    { id: 'm4', name: 'Press 01', line: 'Line B', status: 'Running', shift: 'Swing', throughput: '38/hr', lastHeartbeat: '1 min ago', workOrderId: 'WO-18208' },
    { id: 'm5', name: 'Press 02', line: 'Line B', status: 'Down', shift: 'Swing', throughput: '0/hr', lastHeartbeat: '9 min ago', workOrderId: 'WO-18177' },
    { id: 'm6', name: 'Paint 01', line: 'Line B', status: 'Running', shift: 'Swing', throughput: '22/hr', lastHeartbeat: '1 min ago', workOrderId: 'WO-18266' },
    { id: 'm7', name: 'Pack 01', line: 'Line C', status: 'Running', shift: 'Night', throughput: '55/hr', lastHeartbeat: '2 min ago', workOrderId: 'WO-18271' },
    { id: 'm8', name: 'Pack 02', line: 'Line C', status: 'Idle', shift: 'Night', throughput: '0/hr', lastHeartbeat: '6 min ago', workOrderId: 'WO-18211' },
    { id: 'm9', name: 'QC 01', line: 'Line C', status: 'Setup', shift: 'Night', throughput: '8/hr', lastHeartbeat: '3 min ago', workOrderId: 'WO-18275' },
    { id: 'm10', name: 'Weld 01', line: 'Line D', status: 'Running', shift: 'Day', throughput: '31/hr', lastHeartbeat: '1 min ago', workOrderId: 'WO-18257' },
    { id: 'm11', name: 'Weld 02', line: 'Line D', status: 'Down', shift: 'Day', throughput: '0/hr', lastHeartbeat: '12 min ago', workOrderId: 'WO-18163' },
    { id: 'm12', name: 'Weld 03', line: 'Line D', status: 'Running', shift: 'Swing', throughput: '29/hr', lastHeartbeat: '2 min ago', workOrderId: 'WO-18259' },
  ]);

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
  }
}
