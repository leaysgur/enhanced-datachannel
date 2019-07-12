import { promised } from "../lib";
import { connectDC } from "./utils";

let dc;
let pdc;
beforeEach(() => {
  const pc = new RTCPeerConnection();
  dc = pc.createDataChannel("x");
  pdc = promised(dc);
});
afterEach(() => {
  pdc.close();
  dc = pdc = null;
});

describe("PromisedDataChannel#send()", () => {
  let pdc1;
  let pdc2;
  beforeEach(async () => {
    const [dc1, dc2] = await connectDC();
    pdc1 = promised(dc1);
    pdc2 = promised(dc2);
  });
  afterEach(() => {
    pdc1.close();
    pdc2.close();
    pdc1 = pdc2 = null;
  });

  it("should return Promise<T>", async () => {
    expect(pdc.send() instanceof Promise).toBeTruthy();
  });

  it("should throw before open", async () => {
    try {
      await pdc.send("hi");
    } catch (err) {
      expect(err).toMatch(/Not open/);
    }
  });

  it("should send() JSON like object", async done => {
    pdc2.once("message", data => {
      expect(data).toEqual({ i: { ate: [2, "cakes"] } });
      done();
    });
    pdc1.send({ i: { ate: [2, "cakes"] } });
  });

  it("should await send()", async done => {
    pdc1.once("message", (data, resolve) => {
      expect(data).toBe("hello");
      resolve("world");
    });
    const res = await pdc2.send("hello");
    expect(res).toBe("world");
    done();
  });

  it("should await send().catch(reason)", async done => {
    pdc1.once("message", (data, resolve, reject) => {
      reject(new Error("NG!"));
    });
    await pdc2.send("OK?").catch(err => {
      expect(err).toMatch(/NG/);
      done();
    });
  });

  it("should await send().catch(timeout)", async done => {
    await pdc1.send("OK?").catch(err => {
      expect(err).toMatch(/Timeout/);
      done();
    });
  });

  it("should manage internal _sentRequests", async done => {
    pdc2.on("message", (data, resolve, reject) =>
      ({
        1: resolve,
        2: reject,
        3: () => {} // wanna timeout
      }[data]())
    );

    // starts with 0
    expect(pdc1._sentRequests.size).toBe(0);

    // await = deleted by resolve
    await pdc1.send(1);
    expect(pdc1._sentRequests.size).toBe(0);

    // await = deleted by reject
    await pdc1.send(2).catch(() => {});
    expect(pdc1._sentRequests.size).toBe(0);

    // await = deleted by timeout
    await pdc1.send(3).catch(() => {});
    expect(pdc1._sentRequests.size).toBe(0);

    // there is a 1 until timeout
    pdc1.send(3);
    expect(pdc1._sentRequests.size).toBe(1);

    // force to close test
    done();
  });
});
