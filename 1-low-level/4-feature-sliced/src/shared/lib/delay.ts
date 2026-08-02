export function delay(ms = 600): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
