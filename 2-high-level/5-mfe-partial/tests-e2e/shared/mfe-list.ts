import type { Locator, Page } from '@playwright/test'

/** Seletores comuns das listas paginadas (Vue / React / Angular). */
export function mfeListLocators(root: Page | Locator) {
  const paginationNav = root.getByRole('navigation', { name: 'Paginação' })

  return {
    items: root.locator('.mfe-item:not(.mfe-item--skeleton)'),
    paginationNav,
    previousPageButton: paginationNav.getByRole('button', { name: 'Anterior' }),
    nextPageButton: paginationNav.getByRole('button', { name: 'Próxima' }),
    pageStatusText: paginationNav.getByText(/Página \d+ de \d+/),
  }
}

export async function goToNextPage(root: Page | Locator) {
  const { nextPageButton } = mfeListLocators(root)
  await nextPageButton.scrollIntoViewIfNeeded()
  await nextPageButton.click({ force: true })
}

export async function goToPreviousPage(root: Page | Locator) {
  const { previousPageButton } = mfeListLocators(root)
  await previousPageButton.scrollIntoViewIfNeeded()
  await previousPageButton.click({ force: true })
}
