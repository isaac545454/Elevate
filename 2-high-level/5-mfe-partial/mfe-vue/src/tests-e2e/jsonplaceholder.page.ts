import type { Page } from '@playwright/test'

import {
  goToNextPage,
  goToPreviousPage,
  mfeListLocators,
} from '../../../tests-e2e/shared/mfe-list'

/** Preview isolado do MFE Vue em http://127.0.0.1:5001 */
export class JsonPlaceholderPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/')
  }

  get listHeading() {
    return this.page.getByRole('heading', { level: 2, name: 'JSONPlaceholder' })
  }

  get items() {
    return mfeListLocators(this.page).items
  }

  get previousPageButton() {
    return mfeListLocators(this.page).previousPageButton
  }

  get nextPageButton() {
    return mfeListLocators(this.page).nextPageButton
  }

  get pageStatusText() {
    return mfeListLocators(this.page).pageStatusText
  }

  goToNextPage() {
    return goToNextPage(this.page)
  }

  goToPreviousPage() {
    return goToPreviousPage(this.page)
  }
}
