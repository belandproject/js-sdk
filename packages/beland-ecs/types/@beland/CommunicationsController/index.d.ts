declare module '@beland/CommunicationsController' {
  /**
   * Send the comms transmission
   * @param message
   */
  export function send(message: string): Promise<void>
}
