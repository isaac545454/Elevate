import type { Page } from '@playwright/test'

import {
  goToNextPage,
  goToPreviousPage,
  mfeListLocators,
} from '../../../tests-e2e/shared/mfe-list'

/** Preview isolado do MFE React em http://127.0.0.1:5002 */
export class PokemonPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/')
  }

  get listHeading() {
    return this.page.getByRole('heading', { level: 2, name: 'Pokémon' })
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
