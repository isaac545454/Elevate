import { test, expect } from '@playwright/test'

import { JsonPlaceholderPage } from './jsonplaceholder.page'

test.describe('MFE Vue isolado — :5001', () => {
  test.use({ baseURL: 'http://127.0.0.1:5001' })

  test('carrega a primeira página de posts com grade paginada', async ({ page }) => {
    const list = new JsonPlaceholderPage(page)
    await list.goto()
    await expect(list.listHeading).toBeVisible()
    await expect(list.items.first()).toBeVisible({ timeout: 25_000 })
    await expect(list.items).toHaveCount(12)
    await expect(list.pageStatusText).toHaveText(/Página 1 de \d+/)
  })

  test('paginação: avança para a página 2 e volta para a 1', async ({ page }) => {
    const list = new JsonPlaceholderPage(page)
    await list.goto()
    await expect(list.items.first()).toBeVisible({ timeout: 25_000 })
    await expect(list.previousPageButton).toBeDisabled()
    await expect(list.pageStatusText).toHaveText(/Página 1 de/)

    await list.goToNextPage()
    await expect(list.items.first()).toBeVisible({ timeout: 25_000 })
    await expect(list.pageStatusText).toHaveText(/Página 2 de/)
    await expect(list.previousPageButton).toBeEnabled()

    await list.goToPreviousPage()
    await expect(list.items.first()).toBeVisible({ timeout: 25_000 })
    await expect(list.pageStatusText).toHaveText(/Página 1 de/)
    await expect(list.previousPageButton).toBeDisabled()
  })
})
