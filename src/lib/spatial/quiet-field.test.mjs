import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FIELD_DEFAULTS, QuietField } from './quiet-field.js';

// The engine is the design package's file, unchanged. These tests pin the facts about it that the
// site relies on, so a later copy of the engine cannot change them unnoticed.

test('the two lights follow the clocks in Algiers and in Florida', () => {
  // 12:00 UTC in June is 13:00 in Algiers and 08:00 in New York: working hours in both.
  assert.deepEqual(QuietField.clock(new Date('2026-06-15T12:00:00Z')),
    { dz: 1, fl: 1, dzT: '13:00', flT: '08:00', dzW: 'working hours', flW: 'working hours' });
  // 05:30 UTC in January is 06:30 in Algiers (morning) and 00:30 in New York (night).
  assert.deepEqual(QuietField.clock(new Date('2026-01-15T05:30:00Z')),
    { dz: 0.72, fl: 0.45, dzT: '06:30', flT: '00:30', dzW: 'morning', flW: 'night' });
  // 19:00 UTC in January is 20:00 in Algiers (evening) and 14:00 in New York (working hours).
  assert.deepEqual(QuietField.clock(new Date('2026-01-15T19:00:00Z')),
    { dz: 0.72, fl: 1, dzT: '20:00', flT: '14:00', dzW: 'evening', flW: 'working hours' });
});

test('the empty-space list still holds the bare [tabindex] entry that QuietField.astro narrows', () => {
  assert.ok(FIELD_DEFAULTS.emptyBlockers.split(',').includes('[tabindex]'));
});
