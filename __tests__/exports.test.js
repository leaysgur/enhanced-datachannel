import { based } from "../lib";

describe("exports#based()", () => {
  it("should throw w/ invalid argument", () => {
    expect(() => based()).toThrow();
    expect(() => based({})).toThrow();
  });

  it("should not throw w/ valid argument", () => {
    const pc = new RTCPeerConnection();
    const dc = pc.createDataChannel("x");
    expect(() => based(dc)).not.toThrow();
  });
});
