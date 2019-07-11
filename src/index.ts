import BasedDataChannel from "./based-datachannel";
import PromisedDataChannel from "./promised-datachannel";
import ChunkedDataChannel from "./chunked-datachannel";

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
  // NOTE: should check dc.reliable or NOT here
  // but Safari does not have its property and no idea to know it...
  return new PromisedDataChannel(dc);
}

export function chunked(dc: RTCDataChannel) {
  if (dc instanceof RTCDataChannel === false) {
    throw new Error("Missing datachannel instance!");
  }
  if (!dc.ordered) {
    throw new Error("The ordered property must be true!");
  }
  // NOTE: should check dc.reliable or NOT here
  // but Safari does not have its property and no idea to know it...
  return new ChunkedDataChannel(dc);
}
