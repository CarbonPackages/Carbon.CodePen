import { test as base } from '@playwright/test'

import { Neos } from './Neos'

export const test = base.extend<{
  neos: Neos,
}>({
    neos: async ({ page }, use) => {
    await use(new Neos(page, 'https://carboncodepentestdistribution.ddev.site'))
  },
})

export { Neos }

export { expect } from '@playwright/test'

export { sleep } from './sleep'

export const configureTest = () => {
  test.use({ storageState: './tmpSharedNeosTestSession.json', screenshot: "only-on-failure"})
  test.describe.configure({ mode: 'parallel' });
}
