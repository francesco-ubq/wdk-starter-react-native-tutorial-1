/**
 * WEB-ONLY STUB for `react-native-bare-kit`.
 *
 * The real module is a native nitro module that boots a Bare (Node-like)
 * JS runtime in a separate thread and is where the actual WDK engine
 * runs. A browser cannot host it. Nothing here does any work — it only
 * exists so the module graph resolves; any attempt to actually start a
 * worklet throws loudly rather than silently pretending to work.
 */

const unavailable = () => {
  throw new Error('[wdk web harness] react-native-bare-kit is native-only and unavailable on web');
};

export class Worklet {
  readonly IPC = {
    read: unavailable,
    write: unavailable,
    on: () => {},
    off: () => {},
    end: () => {},
  };
  start(..._args: unknown[]): never {
    return unavailable();
  }
  terminate(): void {}
  suspend(): void {}
  resume(): void {}
}

export const BareKit = { Worklet };
export default BareKit;
