export class HttpClient {
  async get<T>(url: string): Promise<T> {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Falha HTTP (${response.status}) em ${url}`)
    }

    return response.json() as Promise<T>
  }
}
