import { based, promised, chunked } from "../lib";

describe("exports#based()", () => {
  it("should throw w/ invalid argument", () => {
    expect(() => based()).toThrowError(/Missing/);
    expect(() => based({})).toThrowError(/Missing/);
  });

  it("should not throw w/ valid argument", () => {
    const pc = new RTCPeerConnection();
    const dc = pc.createDataChannel("x");
    expect(() => based(dc)).not.toThrowError();
  });
});

describe("exports#promised()", () => {
  it("should throw w/ invalid argument", () => {
    expect(() => promised()).toThrowError(/Missing/);
    expect(() => promised({})).toThrowError(/Missing/);
  });

  it("should throw w/ valid argument but ordered = false", () => {
    const pc = new RTCPeerConnection();
    const dc = pc.createDataChannel("x", { ordered: false });
    expect(() => promised(dc)).toThrowError(/ordered/);
  });

  it("should not throw w/ valid argument", () => {
    const pc = new RTCPeerConnection();
    const dc = pc.createDataChannel("x");
    expect(() => promised(dc)).not.toThrowError();
  });
});

describe("exports#chunked()", () => {
  it("should throw w/ invalid argument", () => {
    expect(() => chunked()).toThrowError(/Missing/);
    expect(() => chunked({})).toThrowError(/Missing/);
  });

  it("should throw w/ valid argument but ordered = false", () => {
    const pc = new RTCPeerConnection();
    const dc = pc.createDataChannel("x", { ordered: false });
    expect(() => chunked(dc)).toThrowError(/ordered/);
  });

  it("should not throw w/ valid argument", () => {
    const pc = new RTCPeerConnection();
    const dc = pc.createDataChannel("x");
    expect(() => chunked(dc)).not.toThrowError();
  });

  it("should not throw w/ valid argument but binaryType != arraybuffer", () => {
    const pc = new RTCPeerConnection();
    // NOTE: The default binaryType is blob in Firefox and spec
    const dc = pc.createDataChannel("x");
    expect(() => chunked(dc)).not.toThrowError();
  });
});
