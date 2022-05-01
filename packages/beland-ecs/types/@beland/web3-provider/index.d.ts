declare module '@beland/web3-provider' {
  export type Provider = {
    send: Function
    sendAsync: Function
  }
  export function getProvider(): Promise<Provider>
}
