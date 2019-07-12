import $debug from "debug";
import BasedDataChannel from "./based-datachannel";

const debug = $debug("chunked-dc");
// 16384 is the REAL size but...
const CHUNK_SIZE = 16000;

const META_TYPES = {
  START: "START",
  END: "END"
};

type JSONValue = boolean | number | string | null | JSONArray | JSONObject;
interface JSONObject {
  [key: string]: JSONValue;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface JSONArray extends Array<JSONValue> {}

class ChunkedDataChannel extends BasedDataChannel {
  private _sending: boolean;
  private _recving: boolean;
  private _recvBuffer: ArrayBuffer[];

  constructor(dc: RTCDataChannel) {
    super(dc);

    this._sending = false;
    this._recving = false;
    this._recvBuffer = [];
  }

  get sending() {
    return this._sending;
  }
  get recving() {
    return this._recving;
  }

  set binaryType(_type: string) {
    throw new Error("Can not change binaryType!");
  }
  get binaryType() {
    return this._dc.binaryType;
  }

  close() {
    debug("close()");

    this._sending = false;
    this._recving = false;
    this._recvBuffer.length = 0;

    super.close();
  }

  async send(data: Blob, meta: JSONObject = {}): Promise<void> {
    debug("send()", data, meta);

    if (this._closed) {
      throw new Error("Closed!");
    }
    if (this._dc.readyState !== "open") {
      throw new Error("Not opened!");
    }
    if (this._sending) {
      throw new Error("Can not send files in parallel!");
    }

    if (data instanceof Blob === false) {
      throw new Error("Argument is not an instance of File!");
    }
    if (data.size === 0) {
      throw new Error("Empty file!");
    }

    debug(`data has ${data.size}bytes`);

    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      let offset = 0;

      const readSlice = (nextOffset: number) => {
        debug(`read slice of idx ${nextOffset}`);
        const slice = data.slice(offset, nextOffset + CHUNK_SIZE);
        fileReader.readAsArrayBuffer(slice);
      };

      fileReader.onerror = err => reject(err);
      fileReader.onabort = () => reject(new Error("Read file aborted!"));
      fileReader.onload = () => {
        const { result } = fileReader;
        if (result === null || typeof result === "string") {
          return reject(new Error("Invalid read result!"));
        }

        debug("send slice");
        this._dc.send(result);

        offset += result.byteLength;
        if (offset < data.size) {
          readSlice(offset);
        } else {
          debug("signal end sending");
          this._dc.send(JSON.stringify({ type: META_TYPES.END, meta }));

          fileReader.onerror = fileReader.onabort = fileReader.onload = null;
          this._sending = false;
          resolve();
        }
      };

      debug("signal start sending");
      this._sending = true;
      this._dc.send(JSON.stringify({ type: META_TYPES.START }));
      readSlice(0);
    });
  }

  protected _handleMessage(ev: MessageEvent) {
    const { data } = ev;
    if (!(typeof data === "string" || data instanceof ArrayBuffer)) return;

    // handle string
    if (typeof data === "string") {
      const { type, meta } = JSON.parse(data);

      if (type === META_TYPES.START) {
        debug("start recving");
        this._recving = true;
      }

      if (type === META_TYPES.END) {
        debug("end recving");
        this.emit("message", new Blob(this._recvBuffer), meta);

        this._recving = false;
        this._recvBuffer.length = 0;
      }
      return;
    }

    // handle ArrayBuffer
    debug("recv chunk");
    this._recvBuffer.push(data);
  }
}

export default ChunkedDataChannel;
