export function track(event: string, properties?: Record<string, unknown>): void {
  if (import.meta.env.DEV) {
    console.log(`[Event Tracked]: ${event}`, properties || {});
  }
}
