declare namespace SU {
  class Http {
    on(event: string, callback: (arg: any) => void): void
    defaults: Record<string, any>
  }
}
