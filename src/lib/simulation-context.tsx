import { createContext, useContext, useState, type ReactNode } from 'react';
import { PI_USD, type CountryCode } from './banking';
import { useCountry } from './country-context';
import { createSimulation, moveAsset, postJournal, monthlyPayment, debitToday, roundAmount, type SimulationState } from './simulation';

interface SimulationContextValue {
  state: SimulationState;
  transact: (amount: number, memo: string, category: string, source?: string, deposit?: boolean) => void;
  move: (from: string, to: string, amount: number) => void;
  openVault: (name: string) => void;
  borrow: (amount: number, term: number) => void;
  repay: (id: string, amount: number) => void;
  swap: (amount: number, direction: 'buy' | 'sell') => void;
  updateCard: (patch: Partial<SimulationState['card']>) => void;
  review: (id: string, status: 'Approved' | 'Rejected', note: string) => void;
  reset: () => void;
}
const SimulationContext = createContext<SimulationContextValue | null>(null);
export function SimulationProvider({ children }: { children: ReactNode }) {
  const { country } = useCountry();
  // Intentionally session-only: no credentials, documents or real financial data are stored.
  const [countries, setCountries] = useState<Partial<Record<CountryCode, SimulationState>>>({});
  const state = countries[country.code] ?? createSimulation(country);
  function change(fn: (current: SimulationState) => SimulationState) {
    const next = fn(state);
    setCountries(previous => ({ ...previous, [country.code]: next }));
  }
  const value: SimulationContextValue = {
    state,
    transact(amount, memo, category, source = 'chk', deposit = false) {
      if (category === 'Transfer' && debitToday(state, category) + amount > country.dailyTransferCap) throw new Error('Simulation daily transfer cap reached.');
      if (category === 'International' && (country.intlDailyCap === 0 || debitToday(state, category) + amount > country.intlDailyCap)) throw new Error('Simulation international corridor limit reached.');
      if (category === 'Withdrawal' && debitToday(state, category) + amount > country.dailyTransferCap / 5) throw new Error('Simulation daily cash withdrawal limit reached.');
      if (category === 'Card' && (state.card.frozen || !state.card.online || debitToday(state, category) + amount > state.card.limit)) throw new Error('Card frozen, online payments disabled, or daily limit reached.');
      change(s => deposit ? moveAsset(s, 'system:cash', source, amount, memo, category) : moveAsset(s, source, 'system:settlement', amount, memo, category));
    },
    move(from, to, amount) { change(s => moveAsset(s, from, to, amount, 'Vault transfer', 'Vault')); },
    openVault(name) {
      if (!name.trim()) throw new Error('Enter a vault name.');
      change(s => ({ ...s, vaults: [...s.vaults, { id: `vault-${s.vaults.length}`, name: name.trim(), kind: 'Vault', currency: country.currency, balance: 0, number: `SIM • ${s.vaults.length + 4000}` }] }));
    },
    borrow(amount, term) {
      const apr = 8;
      const monthly = roundAmount(monthlyPayment(amount, apr, term), country.currency);
      const id = `credit-${state.loans.length + 1}`;
      change(s => ({ ...moveAsset(s, 'system:credit', 'chk', amount, 'Credit pool drawdown', 'Credit'), loans: [...s.loans, { id, principal: amount, outstanding: amount, term, apr, monthly, status: 'Active' }] }));
    },
    repay(id, amount) {
      const loan = state.loans.find(l => l.id === id);
      if (!loan || amount > loan.outstanding) throw new Error('Repayment exceeds outstanding principal.');
      change(s => ({ ...moveAsset(s, 'chk', 'system:credit', amount, `Principal repayment ${id}`, 'Credit'), loans: s.loans.map(l => l.id === id ? { ...l, outstanding: roundAmount(l.outstanding - amount, country.currency), status: roundAmount(l.outstanding - amount, country.currency) === 0 ? 'Repaid' : 'Active' } : l) }));
    },
    swap(amount, direction) {
      if (!Number.isFinite(amount) || amount <= 0) throw new Error('Enter a positive Pi amount.');
      const local = roundAmount(amount * PI_USD / country.fxToUsd, country.currency);
      const sign = direction === 'sell' ? -1 : 1;
      change(s => postJournal(s, `Simulated ${direction} π`, 'Swap', [
        { account: 'pi', currency: 'PI', delta: amount * sign }, { account: 'system:fx', currency: 'PI', delta: -amount * sign },
        { account: 'chk', currency: country.currency, delta: -local * sign }, { account: 'system:fx', currency: country.currency, delta: local * sign },
      ]));
    },
    updateCard(patch) {
      if (patch.limit !== undefined && (!Number.isFinite(patch.limit) || patch.limit <= 0)) throw new Error('Enter a positive card limit.');
      change(s => ({ ...s, card: { ...s.card, ...patch } }));
    },
    review(id, status, note) {
      if (!note.trim()) throw new Error('Add a review note.');
      change(s => ({ ...s, reviews: s.reviews.map(r => r.id === id ? { ...r, status, note: note.trim() } : r) }));
    },
    reset() { setCountries(previous => ({ ...previous, [country.code]: createSimulation(country) })); },
  };
  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>;
}
export function useSimulation() {
  const value = useContext(SimulationContext);
  if (!value) throw new Error('SimulationProvider is required.');
  return value;
}