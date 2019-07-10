import PromisedDataChannel from "./promised-datachannel";

export function promised(dc: RTCDataChannel) {
  // TODO: must be reliable
  return new PromisedDataChannel(dc);
};

// export function chunked(dc: RTCDataChannel) {
//   return new ChunkedDataChannel(dc);
// };
