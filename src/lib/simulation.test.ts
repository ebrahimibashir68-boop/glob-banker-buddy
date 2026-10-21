import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getCountry } from './banking';
import { createSimulation, postJournal, moveAsset, monthlyPayment } from './simulation';

test('balanced transfers debit one vault and credit another', () => {
  const original = createSimulation(getCountry('US'));
  const next = moveAsset(original, 'chk', 'sav', 100, 'Transfer', 'Vault');
  assert.equal(next.vaults.find(v => v.id === 'chk')?.balance, 12350);
  assert.equal(next.vaults.find(v => v.id === 'sav')?.balance, 42430);
  assert.equal(next.journal[0].lines.reduce((sum, l) => sum + l.delta, 0), 0);
  assert.equal(original.journal.length, 0);
});
test('overdrafts are rejected atomically', () => {
  const state = createSimulation(getCountry('US'));
  assert.throws(() => moveAsset(state, 'chk', 'system:settlement', 12451, 'Payment', 'Bills'), /Insufficient balance/);
  assert.equal(state.vaults[0].balance, 12450);
});
test('journals must balance separately for fiat and Pi', () => {
  assert.throws(() => postJournal(createSimulation(getCountry('US')), 'Invalid swap', 'Swap', [{ account: 'pi', currency: 'PI', delta: -1 }, { account: 'chk', currency: 'USD', delta: 1 }]), /balance within each asset/);
});
test('negative and nonfinite payments are rejected', () => {
  const state = createSimulation(getCountry('US'));
  for (const amount of [-1, 0, NaN, Infinity]) assert.throws(() => moveAsset(state, 'chk', 'sav', amount, 'Payment', 'Vault'));
});
test('simulation countries have isolated starting assets', () => {
  assert.equal(createSimulation(getCountry('PK')).vaults[0].balance, 850000);
  assert.equal(createSimulation(getCountry('US')).vaults[0].currency, 'USD');
});
test('credit quote amortizes principal using the selected APR and term', () => {
  assert.equal(monthlyPayment(1200, 0, 12), 100);
  assert.ok(Math.abs(monthlyPayment(1000, 8, 12) - 86.9884) < 0.001);
});