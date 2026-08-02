/** API: setup da requisição (baseURL, headers, tratamento de erro). */

type CreateApiOptions = {
  baseURL: string
}

export function createApi({ baseURL }: CreateApiOptions) {
  async function get<T>(path: string): Promise<T> {
    const response = await fetch(`${baseURL}${path}`, {
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`Falha HTTP (${response.status}) em ${path}`)
    }

    return response.json() as Promise<T>
  }

  return { get }
}
