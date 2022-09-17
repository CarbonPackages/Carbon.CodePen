import { test as base } from '@playwright/test'

import { Neos } from './Neos'

export const test = base.extend<{
  neos: Neos
}>({
    neos: async ({ page }, use) => {
      const neos = new Neos(page);
      await neos.initializeObject();
      await use(neos)
      await neos.shutdownObject()
    }
})

export { Neos }

export { expect } from '@playwright/test'

export { sleep } from './sleep'

export const configureTest = () => {
  test.describe.configure({ mode: 'parallel' });
}

export const optional = <T>(...items: T[]): T[] => {
  const skipOptional = process.env.SKIP_OPTIONAL;
  if (skipOptional && (skipOptional === "1" || skipOptional.toLowerCase() === "true")) {
    return [];
  }
  return items;
}
