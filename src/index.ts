import BasedDC from "./based-datachannel";
import PromisedDC from "./promised-datachannel";
import ChunkedDC from "./chunked-datachannel";
import $debug from "debug";

const debug = $debug("enhanced-dc");

export function based(dc: RTCDataChannel) {
  if (dc instanceof RTCDataChannel === false) {
    throw new Error("Missing datachannel instance!");
  }
  return new BasedDC(dc);
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
  return new PromisedDC(dc);
}

export function chunked(dc: RTCDataChannel) {
  if (dc instanceof RTCDataChannel === false) {
    throw new Error("Missing datachannel instance!");
  }
  if (!dc.ordered) {
    throw new Error("The ordered property must be true!");
  }
  if (dc.binaryType !== "arraybuffer") {
    debug(`change binaryType ${dc.binaryType} -> arraybuffer`);
    dc.binaryType = "arraybuffer";
  }
  // NOTE: should check dc.reliable or NOT here
  // but Safari does not have its property and no idea to know it...
  return new ChunkedDC(dc);
}

export type BasedDataChannel = InstanceType<typeof BasedDC>;
export type PromisedDataChannel = InstanceType<typeof PromisedDC>;
export type ChunkedDataChannel = InstanceType<typeof ChunkedDC>;
