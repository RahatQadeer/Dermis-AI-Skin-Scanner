import assert from 'node:assert/strict';
import test from 'node:test';

import { createMemoryRoutineRepository } from '../repositories/memoryRoutineRepository';
import { createRoutineService, utcDateString } from '../services/routineService';

const USER = '77777777-7777-4777-8777-777777777777';

test('routine service add, complete, and list by period', async () => {
  const service = createRoutineService(createMemoryRoutineRepository());
  const date = utcDateString();

  const cleanser = await service.addStep(USER, 'am', 'Cleanser');
  const serum = await service.addStep(USER, 'am', 'Serum');
  await service.addStep(USER, 'pm', 'Moisturizer');

  await service.setCompletion(USER, cleanser.id, true, date);

  const routine = await service.getRoutine(USER, date);
  assert.equal(routine.am.length, 2);
  assert.equal(routine.pm.length, 1);
  assert.equal(routine.am.find((s) => s.id === cleanser.id)?.done, true);
  assert.equal(routine.am.find((s) => s.id === serum.id)?.done, false);
});

test('replaceRoutine resets steps for both periods', async () => {
  const service = createRoutineService(createMemoryRoutineRepository());
  await service.addStep(USER, 'am', 'Old');
  const routine = await service.replaceRoutine(
    USER,
    { am: ['A', 'B'], pm: ['C'] },
    utcDateString(),
  );
  assert.deepEqual(
    routine.am.map((s) => s.label),
    ['A', 'B'],
  );
  assert.deepEqual(
    routine.pm.map((s) => s.label),
    ['C'],
  );
});
