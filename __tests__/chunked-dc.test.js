import { chunked } from "../lib";
// import { connectDC } from "./utils";

let dc;
let cdc;
beforeEach(() => {
  const pc = new RTCPeerConnection();
  dc = pc.createDataChannel("x");
  cdc = chunked(dc);
});
afterEach(() => {
  cdc.close();
  dc = cdc = null;
});

// should not send in parallel
// should send only blob or file
// should ignore empty

describe("ChunkedDataChannel#constructor()", () => {
  it("should not change binaryType", () => {
    // default
    expect(cdc.binaryType).toBe("arraybuffer");
    expect(() => (cdc.binaryType = "blob")).toThrowError(/change/);
    // not changed
    expect(cdc.binaryType).toBe("arraybuffer");
  });
});

describe("ChunkedDataChannel#send()", () => {
  it("should return Promise<T>", () => {
    expect(cdc.send() instanceof Promise).toBeTruthy();
  });

  it("should throw before open", async () => {
    try {
      await cdc.send("hi");
    } catch (err) {
      expect(err).toMatch(/Not open/);
    }
  });
});
