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
  // TODO: must be reliable
  return new PromisedDataChannel(dc);
}

// export function chunked(dc: RTCDataChannel) {
//   return new ChunkedDataChannel(dc);
// };
