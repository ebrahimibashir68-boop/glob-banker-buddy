import { test, expect } from 'bun:test';
import { getCountry } from './banking';
import { createSimulation, postJournal, moveAsset, monthlyPayment } from './simulation';

test('balanced transfers debit one vault and credit another', () => {
  const original = createSimulation(getCountry('US'));
  const next = moveAsset(original, 'chk', 'sav', 100, 'Transfer', 'Vault');
  expect(next.vaults.find(v => v.id === 'chk')?.balance).toBe(12350);
  expect(next.vaults.find(v => v.id === 'sav')?.balance).toBe(42430);
  expect(next.journal[0].lines.reduce((sum, l) => sum + l.delta, 0)).toBe(0);
  expect(original.journal.length).toBe(0);
});
test('overdrafts are rejected atomically', () => {
  const state = createSimulation(getCountry('US'));
  expect(() => moveAsset(state, 'chk', 'system:settlement', 12451, 'Payment', 'Bills')).toThrow('Insufficient balance');
  expect(state.vaults[0].balance).toBe(12450);
});
test('journals must balance separately for fiat and Pi', () => {
  expect(() => postJournal(createSimulation(getCountry('US')), 'Invalid swap', 'Swap', [{ account: 'pi', currency: 'PI', delta: -1 }, { account: 'chk', currency: 'USD', delta: 1 }])).toThrow('balance within each asset');
});
test('negative and nonfinite payments are rejected', () => {
  const state = createSimulation(getCountry('US'));
  for (const amount of [-1, 0, NaN, Infinity]) expect(() => moveAsset(state, 'chk', 'sav', amount, 'Payment', 'Vault')).toThrow();
});
test('simulation countries have isolated starting assets', () => {
  expect(createSimulation(getCountry('PK')).vaults[0].balance).toBe(850000);
  expect(createSimulation(getCountry('US')).vaults[0].currency).toBe('USD');
});
test('credit quote amortizes principal using the selected APR and term', () => {
  expect(monthlyPayment(1200, 0, 12)).toBe(100);
  expect(monthlyPayment(1000, 8, 12)).toBeCloseTo(86.9884, 3);
});