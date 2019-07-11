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
  it("should throw before open", () => {
    expect(() => bdc.send("hi")).toThrowError(/Not open/);
  });

  it("should send()", async done => {
    const [dc1, dc2] = await connectDC().catch(done.fail);
    const bdc1 = based(dc1);
    const bdc2 = based(dc2);

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
