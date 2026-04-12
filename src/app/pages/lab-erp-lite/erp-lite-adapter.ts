export type MachineStatus = 'Running' | 'Idle' | 'Down' | 'Setup';
export type MachineShift = 'Day' | 'Swing' | 'Night';

export interface Machine {
  id: string;
  name: string;
  line: string;
  status: MachineStatus;
  shift: MachineShift;
  throughput: string;
  lastHeartbeat: string;
  workOrderId: string;
}

export interface ErpAdapterResult {
  generatedAt: string;
  source: string;
  machines: Machine[];
  warnings?: string[];
}

export interface ErpAdapter<Input> {
  source: string;
  map(input: Input): ErpAdapterResult;
}

type IoTRow = Record<string, string>;
type ValidateResult = { warnings: string[]; staleCount: number };
export type AdapterCheck = { name: string; pass: boolean; note?: string };

export const iotSnapshotAdapter: ErpAdapter<IoTRow[]> = {
  source: 'iot-snapshot',
  map(input) {
    if (!input.length) {
      return {
        generatedAt: new Date().toISOString(),
        source: 'iot-snapshot',
        machines: [],
        warnings: ['Empty dataset']
      };
    }

    const shifts: MachineShift[] = ['Day', 'Swing', 'Night'];
    const lines = ['Line A', 'Line B', 'Line C', 'Line D'];

    const numericCols = Object.keys(input[0]).filter(k => input.some(r => !isNaN(Number(r[k]))));
    const metricKey = ['outpressure', 'inpressure', 'footfall', 'temp', 'atemp']
      .find(k => numericCols.includes(k)) ?? numericCols[0];
    const failureKey = ['fail', 'failure', 'failure_within_24h', 'machine_failure']
      .find(k => Object.keys(input[0]).includes(k));

    const metricVals = input.map(r => Number(r[metricKey] ?? 0)).filter(v => !isNaN(v));
    const sorted = [...metricVals].sort((a, b) => a - b);
    const p25 = sorted[Math.floor(sorted.length * 0.25)] ?? 0;
    const p75 = sorted[Math.floor(sorted.length * 0.75)] ?? 0;

    const now = Date.now();
    const machines: Machine[] = input.map((r, i) => {
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

      const minutesAgo = (i % 6) + 1;
      const lastHeartbeat = new Date(now - minutesAgo * 60_000).toISOString();

      return {
        id: String(machineId),
        name,
        line: lines[i % lines.length],
        status,
        shift: shifts[i % shifts.length],
        throughput,
        lastHeartbeat,
        workOrderId: `WO-${18200 + i}`,
      };
    });

    return {
      generatedAt: new Date().toISOString(),
      source: 'iot-snapshot',
      machines,
      warnings: validateMachines(machines)
    };
  }
};

export function validateMachines(machines: Machine[]): string[] {
  return validateMachinesDetailed(machines).warnings;
}

export function validateMachinesDetailed(machines: Machine[]): ValidateResult {
  const warnings: string[] = [];
  const required = ['id', 'name', 'line', 'status', 'lastHeartbeat'] as const;
  let staleCount = 0;

  machines.forEach((m, idx) => {
    required.forEach((key) => {
      if (!m[key]) warnings.push(`Row ${idx + 1} missing ${key}`);
    });

    if (!['Running', 'Idle', 'Down', 'Setup'].includes(m.status)) {
      warnings.push(`Row ${idx + 1} has invalid status: ${m.status}`);
    }

    if (Number.isNaN(Date.parse(m.lastHeartbeat))) {
      warnings.push(`Row ${idx + 1} has invalid lastHeartbeat`);
    } else if (Date.now() - Date.parse(m.lastHeartbeat) > 5 * 60_000) {
      staleCount += 1;
    }
  });

  return { warnings, staleCount };
}

export function runAdapterDiagnostics(): AdapterCheck[] {
  const checks: AdapterCheck[] = [];
  const now = new Date().toISOString();
  const stale = new Date(Date.now() - 10 * 60_000).toISOString();

  const missingField: Machine = {
    id: 'M-00',
    name: '',
    line: 'Line X',
    status: 'Idle',
    shift: 'Day',
    throughput: '0/hr',
    lastHeartbeat: now,
    workOrderId: ''
  };

  const invalidStatus: Machine = {
    id: 'M-01',
    name: 'Machine 01',
    line: 'Line X',
    status: 'Running',
    shift: 'Day',
    throughput: '0/hr',
    lastHeartbeat: now,
    workOrderId: 'WO-1'
  };

  const staleMachine: Machine = {
    id: 'M-02',
    name: 'Machine 02',
    line: 'Line X',
    status: 'Idle',
    shift: 'Day',
    throughput: '0/hr',
    lastHeartbeat: stale,
    workOrderId: 'WO-2'
  };

  const validation = validateMachinesDetailed([missingField, invalidStatus, staleMachine]);
  checks.push({
    name: 'Required fields validation',
    pass: validation.warnings.some(w => w.includes('missing name')),
    note: 'Missing field is flagged'
  });
  checks.push({
    name: 'Stale heartbeat detection',
    pass: validation.staleCount > 0,
    note: 'Heartbeat older than threshold'
  });

  const sampleRows: IoTRow[] = [
    { machine_id: 'A1', outpressure: '10', fail: '1' },
    { machine_id: 'A2', outpressure: '90', fail: '0' }
  ];
  const mapped = iotSnapshotAdapter.map(sampleRows);
  const down = mapped.machines.find(m => m.id === 'A1');
  checks.push({
    name: 'Status precedence (fail -> Down)',
    pass: down?.status === 'Down',
    note: 'Failure flag forces Down'
  });

  return checks;
}
