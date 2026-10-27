import { test, expect } from '@playwright/test';

// Solo el runner de validación selecciona estos casos, nunca las suites de negocio.
test('caso aprobado', async () => {
  await test.step('Comprobación local aprobada', async () => {
    expect(1).toBe(1);
  });
});

test('caso fallido intencional', async () => {
  await test.step('Comprobación local fallida', async () => {
    expect(1).toBe(2);
  });
});
