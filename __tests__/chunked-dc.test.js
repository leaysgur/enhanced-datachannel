import { chunked } from "../lib";
import { connectDC, createBlob, createFile } from "./utils";

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

describe("ChunkedDataChannel#constructor()", () => {
  it("should not change binaryType", () => {
    // default
    expect(cdc.binaryType).toBe("arraybuffer");
    expect(() => (cdc.binaryType = "blob")).toThrowError(/change/);
    // not changed
    expect(cdc.binaryType).toBe("arraybuffer");
  });
});

fdescribe("ChunkedDataChannel#send()", () => {
  let cdc1;
  let cdc2;
  beforeEach(async () => {
    const [dc1, dc2] = await connectDC();
    cdc1 = chunked(dc1);
    cdc2 = chunked(dc2);
  });
  afterEach(() => {
    cdc1.close();
    cdc2.close();
    cdc1 = cdc2 = null;
  });

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

  it("should throw data is not an instanceof Blob", async () => {
    try {
      await cdc1.send("text");
    } catch (err) {
      expect(err).toMatch(/instance/);
    }

    try {
      await cdc1.send(createFile(0));
    } catch (err) {
      expect(err).toMatch(/Empty/);
    }
  });

  it("should throw data is empty", async () => {
    try {
      await cdc1.send(createBlob(0));
    } catch (err) {
      expect(err).toMatch(/Empty/);
    }

    try {
      await cdc1.send(createFile(0));
    } catch (err) {
      expect(err).toMatch(/Empty/);
    }
  });

  it("should send Blob and emit Blob", async done => {
    cdc1.once("message", blob => {
      expect(blob instanceof Blob).toBeTruthy();
      done();
    });
    await cdc2.send(createBlob(1));
  });

  it("should send File and emit Blob", async done => {
    cdc1.once("message", blob => {
      expect(blob instanceof Blob).toBeTruthy();
      done();
    });
    await cdc2.send(createFile(1));
  });

  it("should send large File", async done => {
    cdc1.once("message", blob => {
      expect(blob.size).toBe(9999);
      done();
    });
    await cdc2.send(createFile(9999));
  });

  it("should send large Blob", async done => {
    cdc1.once("message", blob => {
      expect(blob.size).toBe(1234567);
      done();
    });
    await cdc2.send(createBlob(1234567));
  });

  it("should throw send in parallel", async () => {
    await cdc1.send(createFile(1));
    try {
      await cdc1.send(createFile(1));
    } catch (err) {
      expect(err).toMatch(/parallel/);
    }
  });
});
