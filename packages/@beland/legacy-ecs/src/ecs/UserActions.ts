let modulePromise: any

/**
 * teleport player to a destination
 * @param destination - "coordX,coordY", "magic", "crowd"
 * @public
 */
export function teleportTo(destination: string) {
  // error(`teleportTo(destination) was deprecated. Please use:

  // import {requestTeleport} from '@beland/UserActionModule'
  // executeTask(async () => {
  //   await requestTeleport(destination)
  // })`)
  callModuleRpc('requestTeleport', [destination])
}

function ensureModule(): boolean {
  if (typeof modulePromise === 'undefined' && typeof bld !== 'undefined') {
    modulePromise = bld.loadModule('@beland/UserActionModule', {})
  }
  return typeof modulePromise !== 'undefined' && typeof bld !== 'undefined'
}

function callModuleRpc(methodName: string, args: any[]): void {
  if (ensureModule()) {
    modulePromise.then(($: any) => {
      void bld.callRpc($.rpcHandle, methodName, args)
    })
  }
}
