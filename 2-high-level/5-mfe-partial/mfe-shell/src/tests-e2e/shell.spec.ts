import { test, expect } from '@playwright/test'

import { collectEventBusLogs, ShellPage, type ShellMfeId } from './shell.page'

test.describe('Shell integrado — event bus', () => {
  test.use({ baseURL: 'http://127.0.0.1:5000' })

  test('abre no JSONPlaceholder e carrega o remote Vue', async ({ page }) => {
    const shell = new ShellPage(page)
    await shell.goto()

    await expect(shell.shellHeading).toHaveText('JSONPlaceholder')
    await expect(shell.sidebarButton('jsonplaceholder')).toHaveClass(/sidebar__btn--active/)
    await expect(shell.remoteHeading('jsonplaceholder')).toBeVisible({ timeout: 30_000 })
    await expect(shell.items.first()).toBeVisible({ timeout: 25_000 })
    await expect(shell.items).toHaveCount(12)
  })

  test('sidebar emite eventos home-* e troca o remote visível', async ({ page }) => {
    const shell = new ShellPage(page)
    const logs = collectEventBusLogs(page)
    await shell.goto()
    await expect(shell.remoteHeading('jsonplaceholder')).toBeVisible({ timeout: 30_000 })

    const sequence: ShellMfeId[] = ['pokemon', 'rick', 'jsonplaceholder']

    for (const mfeId of sequence) {
      const eventName = shell.navEventName(mfeId)
      await shell.openMfe(mfeId)

      await expect
        .poll(() => logs.sawSent(eventName), { timeout: 10_000 })
        .toBe(true)
      await expect
        .poll(() => logs.sawReceived(eventName), { timeout: 10_000 })
        .toBe(true)

      await expect(shell.shellHeading).toHaveText(shell.mfeLabel(mfeId))
      await expect(shell.sidebarButton(mfeId)).toHaveClass(/sidebar__btn--active/)
      await expect(shell.remoteHeading(mfeId)).toBeVisible({ timeout: 30_000 })
    }
  })

  test('emit programático no bus navega sem clique na sidebar', async ({ page }) => {
    const shell = new ShellPage(page)
    const logs = collectEventBusLogs(page)
    await shell.goto()
    await expect(shell.remoteHeading('jsonplaceholder')).toBeVisible({ timeout: 30_000 })

    await shell.emitNavViaBus('pokemon')

    await expect
      .poll(() => logs.sawReceived('home-pokemon'), { timeout: 10_000 })
      .toBe(true)

    await expect(shell.shellHeading).toHaveText('Pokémon')
    await expect(shell.sidebarButton('pokemon')).toHaveClass(/sidebar__btn--active/)
    await expect(shell.remoteHeading('pokemon')).toBeVisible({ timeout: 30_000 })
    await expect(shell.items.first()).toBeVisible({ timeout: 25_000 })
  })

  test('paginação no remote ativo (Pokémon) dentro do shell', async ({ page }) => {
    const shell = new ShellPage(page)
    await shell.goto()
    await shell.openMfe('pokemon')
    await expect(shell.remoteHeading('pokemon')).toBeVisible({ timeout: 30_000 })
    await expect(shell.items.first()).toBeVisible({ timeout: 25_000 })
    await expect(shell.previousPageButton).toBeDisabled()

    await shell.goToNextPage()
    await expect(shell.pageStatusText).toHaveText(/Página 2 de/, { timeout: 25_000 })
    await expect(shell.previousPageButton).toBeEnabled()

    await shell.goToPreviousPage()
    await expect(shell.pageStatusText).toHaveText(/Página 1 de/, { timeout: 25_000 })
    await expect(shell.previousPageButton).toBeDisabled()
  })
})
