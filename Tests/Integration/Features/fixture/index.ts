import { test as base } from '@playwright/test'

import { Neos } from './Neos'

export const test = base.extend<{
  neos: Neos
}>({
    neos: async ({ page }, use) => {
      const neos = new Neos(page, {
        username: "admin",
        password: "admin"
      });
      await neos.initializeObject();
      await use(neos)
      await neos.shutdownObject()
    }
})

export { Neos }

export { expect } from '@playwright/test'

export { sleep } from './sleep'

export { NodeType } from "./NodeType"
