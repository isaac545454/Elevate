import type { Locator, Page } from '@playwright/test'

import {
  goToNextPage,
  goToPreviousPage,
  mfeListLocators,
} from '../../../tests-e2e/shared/mfe-list'

export type ShellMfeId = 'jsonplaceholder' | 'pokemon' | 'rick'

const MFE_LABEL: Record<ShellMfeId, string> = {
  jsonplaceholder: 'JSONPlaceholder',
  pokemon: 'Pokémon',
  rick: 'Rick and Morty',
}

const NAV_EVENT: Record<ShellMfeId, string> = {
  jsonplaceholder: 'home-jsonplaceholder',
  pokemon: 'home-pokemon',
  rick: 'home-rick',
}

/** Shell integrado em http://127.0.0.1:5000 — sidebar + remotes via event bus. */
export class ShellPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/')
  }

  sidebarButton(mfeId: ShellMfeId) {
    return this.page.locator(`.sidebar__btn--${mfeId}`)
  }

  get shellHeading() {
    return this.page.locator('.shell__header h1')
  }

  /** Slot visível (não usa display:none). Conteúdo do remote fica no Shadow DOM. */
  get visibleSlot(): Locator {
    return this.page.locator('.mfe-slot:not(.mfe-slot--hidden)')
  }

  remoteHeading(mfeId: ShellMfeId) {
    return this.visibleSlot.getByRole('heading', {
      level: 2,
      name: MFE_LABEL[mfeId],
    })
  }

  get items() {
    return mfeListLocators(this.visibleSlot).items
  }

  get pageStatusText() {
    return mfeListLocators(this.visibleSlot).pageStatusText
  }

  get previousPageButton() {
    return mfeListLocators(this.visibleSlot).previousPageButton
  }

  get nextPageButton() {
    return mfeListLocators(this.visibleSlot).nextPageButton
  }

  async openMfe(mfeId: ShellMfeId) {
    await this.sidebarButton(mfeId).click()
  }

  goToNextPage() {
    return goToNextPage(this.visibleSlot)
  }

  goToPreviousPage() {
    return goToPreviousPage(this.visibleSlot)
  }

  /** Emite navegação direto no bus global (sem clicar na sidebar). */
  async emitNavViaBus(mfeId: ShellMfeId) {
    await this.page.evaluate((id) => {
      const eventByMfe = {
        jsonplaceholder: 'home-jsonplaceholder',
        pokemon: 'home-pokemon',
        rick: 'home-rick',
      } as const
      const bus = (
        window as Window & {
          __MFE_PLATFORM_EVENT_BUS__?: {
            emit: (type: string, event: { mfeId: string }) => void
          }
        }
      ).__MFE_PLATFORM_EVENT_BUS__
      if (!bus) throw new Error('Event bus não inicializado')
      bus.emit(eventByMfe[id], { mfeId: id })
    }, mfeId)
  }

  navEventName(mfeId: ShellMfeId) {
    return NAV_EVENT[mfeId]
  }

  mfeLabel(mfeId: ShellMfeId) {
    return MFE_LABEL[mfeId]
  }
}

/** Coleta logs do event bus / shell enquanto o callback roda. */
export function collectEventBusLogs(page: Page) {
  const sent: string[] = []
  const received: string[] = []

  page.on('console', (msg) => {
    const text = msg.text()
    if (text.includes('[MFE Event Bus] Evento enviado:')) {
      sent.push(text)
    }
    if (text.includes('[Shell] Evento recebido:')) {
      received.push(text)
    }
  })

  return {
    sent,
    received,
    sawSent(eventName: string) {
      return sent.some((line) => line.includes(eventName))
    },
    sawReceived(eventName: string) {
      return received.some((line) => line.includes(eventName))
    },
  }
}
