import EventEmitter from "eventemitter3";
import $debug from "debug";

const debug = $debug("based-dc");

const dataChannelEvents = [
  "open",
  "close",
  "error",
  "message",
  "bufferedamountlow"
];

class BasedDataChannel extends EventEmitter {
  protected _dc: RTCDataChannel;
  protected _closed: boolean;

  constructor(dc: RTCDataChannel) {
    super();

    this._dc = dc;
    this._closed = false;

    for (const ev of dataChannelEvents) {
      this._dc.addEventListener(ev, this, false);
    }
  }

  get readyState() {
    return this._dc.readyState;
  }

  get closed(): boolean {
    return this._closed;
  }

  close(): void {
    debug("close()");

    this._closed = true;

    for (const ev of dataChannelEvents) {
      this._dc.removeEventListener(ev, this, false);
    }
    this._dc.close();

    this.emit("close");
    this.removeAllListeners();
  }

  send(data: any) {
    debug("send()", data);

    if (this._closed) {
      throw new Error("Closed!");
    }
    if (this._dc.readyState !== "open") {
      throw new Error("Not opened!");
    }

    this._dc.send(data);
  }

  handleEvent(ev: Event) {
    if (this._closed) return;

    switch (ev.type) {
      case "open":
        return this._handleOpen();
      case "close":
        return this._handleClose();
      case "error":
        return this._handleError(ev as RTCErrorEvent);
      case "message":
        return this._handleMessage(ev as MessageEvent);
      case "bufferedamountlow":
        return this._handleBufferedAmountLow();
    }
  }

  _handleOpen() {
    this.emit("open");
  }

  _handleClose() {
    this.emit("close");
  }

  _handleError(ev: RTCErrorEvent) {
    this.emit("error", ev.error);
  }

  _handleMessage(ev: MessageEvent) {
    this.emit("message", ev.data);
  }

  _handleBufferedAmountLow() {
    this.emit("bufferedamountlow");
  }
}

export default BasedDataChannel;
