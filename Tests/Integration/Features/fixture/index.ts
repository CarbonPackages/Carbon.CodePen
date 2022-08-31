import { test as base } from '@playwright/test'

import { Neos } from './Neos'

export const test = base.extend<{
  neos: Neos
}>({
    neos: async ({ page }, use) => {
      await use(new Neos(page))
    },
})

export { Neos }

export { expect } from '@playwright/test'

export { sleep } from './sleep'

export const configureTest = () => {
  test.describe.configure({ mode: 'parallel' });
}
