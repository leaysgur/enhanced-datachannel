import BasedDataChannel from "./based-datachannel";
import PromisedDataChannel from "./promised-datachannel";

export function based(dc: RTCDataChannel) {
  if (dc instanceof RTCDataChannel === false) {
    throw new Error("Missing datachannel instance!");
  }
  return new BasedDataChannel(dc);
}

export function promised(dc: RTCDataChannel) {
  if (dc instanceof RTCDataChannel === false) {
    throw new Error("Missing datachannel instance!");
  }
  if (!dc.ordered) {
    throw new Error("The ordered property must be true!");
  }
  if (!_isReliable(dc)) {
    throw new Error("The reliable property must be true!");
  }
  return new PromisedDataChannel(dc);
}

// export function chunked(dc: RTCDataChannel) {
//   return new ChunkedDataChannel(dc);
// };

function _isReliable(dc: RTCDataChannel): boolean {
  // Chrome, Firefox
  if ("reliable" in dc) {
    // @ts-ignore: not in the spec and typed but exists...
    return dc.reliable;
  }

  // Safari
  return dc.maxRetransmits === null && dc.maxPacketLifeTime === null;
}
