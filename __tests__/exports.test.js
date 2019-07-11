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

  it("should throw w/ valid argument but invalid settings", () => {
    const pc = new RTCPeerConnection();
    const dc1 = pc.createDataChannel("x", { ordered: false });
    expect(() => promised(dc1)).toThrowError(/ordered/);

    const dc2 = pc.createDataChannel("x", { maxRetransmits: 1 });
    expect(() => promised(dc2)).toThrowError(/reliable/);
  });

  it("should not throw w/ valid argument", () => {
    const pc = new RTCPeerConnection();
    const dc = pc.createDataChannel("x");
    expect(() => promised(dc)).not.toThrowError();
  });
});
