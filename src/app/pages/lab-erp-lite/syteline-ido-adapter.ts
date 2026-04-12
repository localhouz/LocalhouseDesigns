import { ErpAdapter, ErpAdapterResult, Machine, MachineStatus } from './erp-lite-adapter';

type SytelineRow = Record<string, string | number | null>;

export const sytelineIdoAdapter: ErpAdapter<SytelineRow[]> = {
  source: 'syteline-ido',
  map(rows: SytelineRow[]): ErpAdapterResult {
    if (!rows.length) {
      return {
        generatedAt: new Date().toISOString(),
        source: 'syteline-ido',
        machines: [],
        warnings: ['Empty IDO payload. Map IDO fields to the canonical model.']
      };
    }

    // TODO: map IDO fields to the canonical model.
    // Suggested mapping placeholders:
    // id           <- ResourceId / WorkCenter / MachineId
    // name         <- ResourceName / Description
    // line         <- WorkCenterGroup / Line / Department
    // status       <- State / Status / RunFlag (derive precedence)
    // shift        <- Shift / CalendarCode
    // throughput   <- QtyComplete / Rate / Output
    // workOrderId  <- Job / Order / Operation
    // lastHeartbeat<- LastUpdate / StatusTimestamp

    const machines: Machine[] = rows.map((r, i) => {
      const status = String(r['Status'] ?? 'Idle') as MachineStatus;
      return {
        id: String(r['ResourceId'] ?? `RES-${i + 1}`),
        name: String(r['ResourceName'] ?? `Resource ${i + 1}`),
        line: String(r['WorkCenter'] ?? 'Line A'),
        status,
        shift: 'Day',
        throughput: '0/hr',
        lastHeartbeat: new Date().toISOString(),
        workOrderId: String(r['Job'] ?? 'WO-0000')
      };
    });

    return {
      generatedAt: new Date().toISOString(),
      source: 'syteline-ido',
      machines,
      warnings: ['SyteLine adapter stub: replace placeholder fields with real IDO mappings.']
    };
  }
};
