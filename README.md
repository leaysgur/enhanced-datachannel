# enhanced-datachannel
enhance(RTCDataChannel) for general usage.

## Install

```
npm i enhanced-datachannel
```

```js
import { based, promised } from "enhanced-datachannel";

const pc = new RTCPeerConnection();

const dc = pc.createDataChannel("mych");
// or
pc.addEventListener("datachannel", ev => {
  const dc = ev.channel;
});

// signaling by yourself and connect p2p...

const basedDC = based(dc);
// or
const promisedDC = promised(dc);
```

## API

### BasedDataChannel

This class has the same properties which passed `RTCDataChannel` instance has.

- `readyState`
- `label`
- etc...

and also emits the same event types via `EventEmitter`.

- `open`
- `close`
- `error`
- `message`
- `bufferedamountlow`

The `send()` method is equivalent to `dc.send()` and `on("message")` handler is equivalent to `dc.onmessage`.

```js
// recv
basedDC.on("message", data => {});

// send
basedDC.send(data);
```

### PromisedDataChannel

This class extends `BasedDataChannel`.

But this class has special `send()` method and `on("message")` handler.

```js
// recv
promisedDC.on("message", (data, resolve, reject) => {
  try {
    console.log(data); // "Take this!"
    resolve("Thank you!");
  } catch (err) {
    reject(err);
  }
});

// send
const res = await promisedDC.send("Take this!");
console.log(res); // "Thank you!"
```

If recv side does not `resolve()` neither nor `reject()`, it is treated as `reject()` with timeout.

## TODO

- chunked
- publish
- check install
  - use webpack to run it
