import { seedAccounts, type CentralBank } from './banking';

export interface Vault { id: string; name: string; currency: string; balance: number; kind: 'Checking' | 'Savings' | 'Pi Wallet' | 'Vault'; number: string }
export interface JournalLine { account: string; currency: string; delta: number }
export interface Journal { id: string; sequence: number; timestamp: string; memo: string; category: string; lines: JournalLine[]; previous: string; reference: string }
export interface Credit { id: string; principal: number; outstanding: number; term: number; apr: number; monthly: number; status: 'Active' | 'Repaid' }
export interface Review { id: string; subject: string; status: 'Pending' | 'Approved' | 'Rejected'; note: string }
export interface SimulationState {
  vaults: Vault[]; journal: Journal[]; loans: Credit[];
  card: { frozen: boolean; online: boolean; contactless: boolean; limit: number };
  reviews: Review[];
}
export function createSimulation(c: CentralBank): SimulationState {
  return {
    vaults: seedAccounts(c).map(a => ({ ...a, kind: a.type, currency: a.type === 'Pi Wallet' ? 'PI' : c.currency })),
    journal: [], loans: [],
    card: { frozen: false, online: true, contactless: true, limit: c.dailyTransferCap / 10 },
    reviews: [{ id: 'identity-demo', subject: 'Demo Pioneer identity', status: 'Pending', note: '' }, { id: 'corridor-demo', subject: 'Demo cross-border screening', status: 'Pending', note: '' }],
  };
}
export function roundAmount(amount: number, currency: string) {
  const factor = currency === 'PI' ? 1e7 : ['JPY', 'IRR'].includes(currency) ? 1 : 100;
  return Math.round(amount * factor) / factor;
}
export function monthlyPayment(principal: number, apr: number, term: number) {
  if (!Number.isFinite(principal) || principal <= 0 || !Number.isInteger(term) || term <= 0 || !Number.isFinite(apr) || apr < 0) throw new Error('Enter valid credit terms.');
  const rate = apr / 1200;
  return rate === 0 ? principal / term : principal * rate / (1 - Math.pow(1 + rate, -term));
}
// A deterministic demonstration reference, not a cryptographic hash or blockchain proof.
function reference(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
  return `SIM-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}
export function postJournal(state: SimulationState, memo: string, category: string, input: JournalLine[], timestamp = new Date().toISOString()): SimulationState {
  if (input.length < 2 || !memo.trim()) throw new Error('A journal needs a description and balanced entries.');
  const lines = input.map(l => ({ ...l, delta: roundAmount(l.delta, l.currency) }));
  const totals: Record<string, number> = {};
  for (const line of lines) {
    if (!line.account || !line.currency || !Number.isFinite(line.delta) || line.delta === 0) throw new Error('Invalid journal entry.');
    totals[line.currency] = (totals[line.currency] ?? 0) + line.delta;
  }
  if (Object.entries(totals).some(([currency, total]) => roundAmount(total, currency) !== 0)) throw new Error('Entries must balance within each asset.');
  const vaults = state.vaults.map(v => {
    const delta = lines.filter(l => l.account === v.id && l.currency === v.currency).reduce((sum, l) => sum + l.delta, 0);
    const balance = roundAmount(v.balance + delta, v.currency);
    if (balance < 0) throw new Error(`Insufficient balance in ${v.name}.`);
    return { ...v, balance };
  });
  for (const line of lines) {
    if (!line.account.startsWith('system:') && !state.vaults.some(v => v.id === line.account && v.currency === line.currency)) throw new Error('Unknown asset vault.');
  }
  const previous = state.journal[0]?.reference ?? 'SIM-GENESIS';
  const sequence = state.journal.length + 1;
  const row: Journal = { id: `journal-${sequence}`, sequence, timestamp, memo, category, lines, previous, reference: reference(JSON.stringify({ sequence, previous, memo, lines, timestamp })) };
  return { ...state, vaults, journal: [row, ...state.journal] };
}
export function moveAsset(state: SimulationState, from: string, to: string, amount: number, memo: string, category: string) {
  const vault = state.vaults.find(v => v.id === from || v.id === to);
  if (!vault || !Number.isFinite(amount) || amount <= 0 || from === to) throw new Error('Enter a positive amount and distinct accounts.');
  const currency = vault.currency;
  return postJournal(state, memo, category, [{ account: from, currency, delta: -amount }, { account: to, currency, delta: amount }]);
}
export function debitToday(state: SimulationState, category: string, date = new Date().toISOString().slice(0, 10)) {
  return state.journal.filter(j => j.category === category && j.timestamp.slice(0, 10) === date).reduce((sum, j) => sum + j.lines.filter(l => l.account === 'chk' && l.delta < 0).reduce((s, l) => s - l.delta, 0), 0);
}