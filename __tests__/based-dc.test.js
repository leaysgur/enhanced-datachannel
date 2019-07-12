import { based } from "../lib";
import { connectDC } from "./utils";

let dc;
let bdc;
beforeEach(() => {
  const pc = new RTCPeerConnection();
  dc = pc.createDataChannel("x");
  bdc = based(dc);
});
afterEach(() => {
  bdc.close();
  dc = bdc = null;
});

describe("BasedDataChannel#constructor", () => {
  it("should be closed = false", () => {
    expect(bdc.closed).toBeFalsy();
  });

  it("should get props", () => {
    [
      "binaryType",
      "bufferedAmountLowThreshold",
      "bufferedAmount",
      "id",
      "label",
      "maxPacketLifeTime",
      "maxRetransmits",
      "negotiated",
      "ordered",
      // seems not to be implemented yet
      // "priority",
      "protocol",
      "readyState"
    ].forEach(prop => {
      // should be assigned or null
      expect(bdc[prop]).not.toBeUndefined();
    });
  });

  it("should set props", () => {
    bdc.binaryType = "arraybuffer";
    expect(bdc.binaryType).toBe("arraybuffer");

    bdc.bufferedAmountLowThreshold = 10;
    expect(bdc.bufferedAmountLowThreshold).toBe(10);
  });

  it("should listen events and emit them", async () => {
    await Promise.all(
      ["open", "close", "error", "message", "bufferedamountlow"].map(evName => {
        return new Promise(resolve => {
          bdc.once(evName, resolve);
          const ev = new Event(evName);
          dc.dispatchEvent(ev);
        });
      })
    );
  });
});

describe("BasedDataChannel#send()", () => {
  let bdc1;
  let bdc2;
  beforeEach(async () => {
    const [dc1, dc2] = await connectDC();
    bdc1 = based(dc1);
    bdc2 = based(dc2);
  });
  afterEach(() => {
    bdc1.close();
    bdc2.close();
    bdc1 = bdc2 = null;
  });

  it("should throw before open", () => {
    expect(() => bdc.send("hi")).toThrowError(/Not open/);
  });

  it("should send()", async done => {
    bdc1.once("message", data => {
      expect(data).toBe("hello");
      bdc1.send("world");
    });
    bdc2.once("message", data => {
      expect(data).toBe("world");
      done();
    });
    bdc2.send("hello");
  });

  it("should not send() after close()", () => {
    bdc1.close();
    expect(() => bdc1.send()).toThrowError(/Closed/);
  });
});

describe("BasedDataChannel#close()", () => {
  it("should be closed = true", () => {
    expect(bdc.closed).toBeFalsy();
    bdc.close();
    expect(bdc.closed).toBeTruthy();
  });

  it("should emit(close)", done => {
    bdc.once("close", done);
    bdc.close();
  });

  it("should not listen events and emit them", async done => {
    bdc.on("foo", done.fail);
    bdc.close();

    bdc.emit("foo");

    // "close" event should be emitted
    ["open", "error", "message", "bufferedamountlow"].map(evName => {
      bdc.once(evName, done.fail);
      const ev = new Event(evName);
      dc.dispatchEvent(ev);
    });

    done();
  });
});
