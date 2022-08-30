import { test as base } from '@playwright/test'

import { NeosUiNaviationHelper } from './NeosUiNaviationHelper'

export const test = base.extend<{
  neos: NeosUiNaviationHelper,
}>({
    neos: async ({ page }, use) => {
    await use(new NeosUiNaviationHelper(page))
  },
})
export { expect } from '@playwright/test'

export const sleep = (milliseconds: number) => new Promise(r => setTimeout(r, milliseconds))

export const configureTest = () => {
  test.use({ storageState: './tmpSharedNeosTestSession.json' })
  test.describe.configure({ mode: 'parallel' });
}

