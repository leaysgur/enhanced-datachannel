import { based, promised } from "../lib";

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

  it("should throw w/ valid argument but reliable = false", () => {
    const pc = new RTCPeerConnection();
    const dc = pc.createDataChannel("x", { maxRetransmits: 1 });
    expect(() => promised(dc)).toThrowError(/reliable/);
  });

  it("should not throw w/ valid argument", () => {
    const pc = new RTCPeerConnection();
    const dc = pc.createDataChannel("x");
    expect(() => promised(dc)).not.toThrowError();
  });
});
