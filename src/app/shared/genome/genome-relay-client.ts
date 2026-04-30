/**
 * Browser-side Genome Relay Client
 *
 * Implements the Genome relay handshake and envelope protocol using the
 * WebCrypto API (SubtleCrypto). Generates an ephemeral ed25519 keypair per
 * session, authenticates with the relay, and routes signed GenomeEnvelopes.
 *
 * Used by both the chat widget (visitor, ephemeral DID) and the admin page
 * (Steve, loaded from localStorage with a stable seed).
 */

// ── Types (mirroring relay_protocol.ts / genome_envelope.ts) ─────────────────

export interface GenomeEnvelope {
  v: 1;
  networkType: string;
  networkId: string;
  from: string;
  payload: Record<string, unknown>;
  ts: number;
  sig: string;
}

type RelayClientMsg =
  | { type: 'register_req'; did: string; publicKeyHex: string }
  | { type: 'register_resp'; did: string; nonce: string; sig: string }
  | { type: 'route'; to: string; envelope: GenomeEnvelope }
  | { type: 'ack'; msgId: string }
  | { type: 'ping' };

type RelayServerMsg =
  | { type: 'register_challenge'; nonce: string }
  | { type: 'registered'; relayId: string; queuedCount: number }
  | { type: 'deliver'; msgId: string; from: string; envelope: GenomeEnvelope }
  | { type: 'route_ok'; to: string; queued: boolean }
  | { type: 'route_err'; to: string; reason: string }
  | { type: 'pong' }
  | { type: 'error'; code: string; message: string };

export interface GenomeRelayConfig {
  relayUrl: string;
  /** 32-byte hex seed. Omit to generate an ephemeral keypair. */
  seedHex?: string;
  /** 32-byte hex public key paired with seedHex. Required when seedHex is set so the DID is stable. */
  publicKeyHex?: string;
}

// ── Base58btc helpers ─────────────────────────────────────────────────────────

const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function base58Encode(bytes: Uint8Array): string {
  let n = 0n;
  for (const b of bytes) n = (n << 8n) | BigInt(b);
  let result = '';
  while (n > 0n) { result = BASE58[Number(n % 58n)] + result; n /= 58n; }
  for (const b of bytes) { if (b === 0) result = BASE58[0] + result; else break; }
  return result;
}

// ── Hex helpers ───────────────────────────────────────────────────────────────

function toHex(buf: ArrayBuffer | Uint8Array): string {
  return Array.from(new Uint8Array(buf instanceof ArrayBuffer ? buf : buf.buffer))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

function fromHex(hex: string): Uint8Array {
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < arr.length; i++) arr[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return arr;
}

// ── Key derivation ────────────────────────────────────────────────────────────

// PKCS8 DER header for Ed25519: SEQUENCE { INTEGER 0, SEQUENCE { OID 1.3.101.112 }, OCTET STRING { OCTET STRING { seed } } }
const ED25519_PKCS8_HEADER = new Uint8Array([
  0x30, 0x2e, 0x02, 0x01, 0x00, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x04, 0x22, 0x04, 0x20,
]);

async function deriveKeypair(seedHex?: string, knownPublicKeyHex?: string): Promise<{ privateKey: CryptoKey; publicKeyBytes: Uint8Array }> {
  if (seedHex && knownPublicKeyHex) {
    // Stable identity: wrap the 32-byte seed in PKCS8 DER so WebCrypto can import it.
    // 'raw' format is only supported for public keys in WebCrypto Ed25519.
    const seed = fromHex(seedHex);
    const pkcs8 = new Uint8Array(48);
    pkcs8.set(ED25519_PKCS8_HEADER);
    pkcs8.set(seed, 16);
    const privateKey = await crypto.subtle.importKey('pkcs8', pkcs8.buffer as ArrayBuffer, { name: 'Ed25519' }, false, ['sign']);
    return { privateKey, publicKeyBytes: fromHex(knownPublicKeyHex) };
  }
  const pair = await (crypto.subtle as any).generateKey({ name: 'Ed25519' }, true, ['sign', 'verify']);
  const pubBytes = await exportEd25519PublicBytes(pair.publicKey);
  return { privateKey: pair.privateKey, publicKeyBytes: pubBytes };
}

async function exportEd25519PublicBytes(publicKey: CryptoKey): Promise<Uint8Array> {
  const raw = await crypto.subtle.exportKey('raw', publicKey);
  return new Uint8Array(raw);
}

function pubKeyToDidAndHex(pubBytes: Uint8Array): { did: string; publicKeyHex: string } {
  const multikey = new Uint8Array(2 + pubBytes.length);
  multikey[0] = 0xed; multikey[1] = 0x01;
  multikey.set(pubBytes, 2);
  return { did: 'did:key:z' + base58Encode(multikey), publicKeyHex: toHex(pubBytes) };
}

async function signBytes(privateKey: CryptoKey, bytes: Uint8Array): Promise<string> {
  const sig = await crypto.subtle.sign({ name: 'Ed25519' }, privateKey, bytes.buffer as ArrayBuffer);
  return toHex(sig);
}

// ── Canonical envelope bytes (matches genome_envelope.ts) ────────────────────

function canonicalBytes(env: Omit<GenomeEnvelope, 'sig'>): Uint8Array {
  const obj = { v: env.v, networkType: env.networkType, networkId: env.networkId,
                from: env.from, payload: env.payload, ts: env.ts };
  return new TextEncoder().encode(JSON.stringify(obj));
}

// ── GenomeRelayClient ─────────────────────────────────────────────────────────

export class GenomeRelayClient {
  private ws: WebSocket | null = null;
  private did = '';
  private publicKeyHex = '';
  private privateKey: CryptoKey | null = null;
  private connected = false;
  private reconnectDelay = 1_000;
  private stopped = false;

  private readonly deliverHandlers: Array<(env: GenomeEnvelope, from: string) => void> = [];
  private readonly connectHandlers: Array<(did: string) => void> = [];
  private readonly disconnectHandlers: Array<() => void> = [];
  private readonly pendingRoutes = new Map<string, { resolve: (q: boolean) => void; reject: (e: Error) => void }>();

  constructor(private readonly config: GenomeRelayConfig) {}

  get myDid(): string { return this.did; }
  get isConnected(): boolean { return this.connected; }

  async connect(): Promise<void> {
    const { privateKey, publicKeyBytes } = await deriveKeypair(this.config.seedHex, this.config.publicKeyHex);
    this.privateKey = privateKey;
    const { did, publicKeyHex } = pubKeyToDidAndHex(publicKeyBytes);
    this.did = did;
    this.publicKeyHex = publicKeyHex;
    return this._open();
  }

  private _open(): Promise<void> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(this.config.relayUrl);
      this.ws = ws;
      let registered = false;

      ws.onopen = () => {
        this._send({ type: 'register_req', did: this.did, publicKeyHex: this.publicKeyHex });
      };

      ws.onmessage = async (evt) => {
        let msg: RelayServerMsg;
        try { msg = JSON.parse(evt.data as string) as RelayServerMsg; } catch { return; }

        switch (msg.type) {
          case 'register_challenge': {
            const payload = new TextEncoder().encode(`${this.did}:${msg.nonce}`);
            const sig = await signBytes(this.privateKey!, payload);
            this._send({ type: 'register_resp', did: this.did, nonce: msg.nonce, sig });
            break;
          }
          case 'registered':
            this.connected = true;
            this.reconnectDelay = 1_000;
            registered = true;
            for (const h of this.connectHandlers) h(this.did);
            resolve();
            break;
          case 'deliver':
            this._send({ type: 'ack', msgId: msg.msgId });
            for (const h of this.deliverHandlers) h(msg.envelope, msg.from);
            break;
          case 'route_ok': {
            const p = this.pendingRoutes.get(msg.to);
            if (p) { this.pendingRoutes.delete(msg.to); p.resolve(msg.queued); }
            break;
          }
          case 'route_err': {
            const p = this.pendingRoutes.get(msg.to);
            if (p) { this.pendingRoutes.delete(msg.to); p.reject(new Error(msg.reason)); }
            break;
          }
          case 'error':
            if (!registered) reject(new Error(`${msg.code}: ${msg.message}`));
            break;
        }
      };

      ws.onclose = () => {
        this.connected = false;
        for (const h of this.disconnectHandlers) h();
        for (const [, p] of this.pendingRoutes) p.reject(new Error('Relay disconnected'));
        this.pendingRoutes.clear();
        if (!registered) reject(new Error('Closed before registration'));
        if (!this.stopped) this._scheduleReconnect();
      };

      ws.onerror = () => {
        if (!registered) reject(new Error('WebSocket error'));
      };
    });
  }

  async route(to: string, payloadData: Record<string, unknown>): Promise<boolean> {
    if (!this.connected || !this.privateKey) throw new Error('Not connected');
    const unsigned: Omit<GenomeEnvelope, 'sig'> = {
      v: 1, networkType: 'p2p',
      networkId: await sha256Hex(to + this.did),
      from: this.did, payload: payloadData, ts: Date.now(),
    };
    const sig = await signBytes(this.privateKey, canonicalBytes(unsigned));
    const envelope: GenomeEnvelope = { ...unsigned, sig };

    return new Promise((resolve, reject) => {
      this.pendingRoutes.set(to, { resolve, reject });
      this._send({ type: 'route', to, envelope });
      setTimeout(() => {
        if (this.pendingRoutes.has(to)) { this.pendingRoutes.delete(to); reject(new Error('Route timeout')); }
      }, 10_000);
    });
  }

  onDeliver(handler: (env: GenomeEnvelope, from: string) => void): void {
    this.deliverHandlers.push(handler);
  }
  onConnect(handler: (did: string) => void): void { this.connectHandlers.push(handler); }
  onDisconnect(handler: () => void): void { this.disconnectHandlers.push(handler); }

  disconnect(): void {
    this.stopped = true;
    this.ws?.close();
    this.ws = null;
    this.connected = false;
  }

  private _send(msg: RelayClientMsg): void {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(msg));
  }

  private _scheduleReconnect(): void {
    if (this.reconnectDelay > 60_000) return;
    setTimeout(async () => {
      try { await this._open(); }
      catch { this.reconnectDelay = Math.min(this.reconnectDelay * 2, 60_000); this._scheduleReconnect(); }
    }, this.reconnectDelay);
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 60_000);
  }
}

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return toHex(buf).slice(0, 16);
}
