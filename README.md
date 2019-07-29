# enhanced-datachannel

The `enhance(RTCDataChannel)` functions for general usage.

## Install

```
npm i enhanced-datachannel
```

You need to bundle into your app using `webpack`, `rollup`, etc....

## Exports

```js
import { based, promised, chunked } from "enhanced-datachannel";

const pc = new RTCPeerConnection();

// create DataChannel instance
const dc = pc.createDataChannel("mych");
// or
pc.addEventListener("datachannel", ev => {
  const dc = ev.channel;
});

// signaling by yourself and connect p2p...

// enhance it for your usage!
const basedDC = based(dc);
// or
const promisedDC = promised(dc);
// or
const chunkedDC = chunked(dc);
```

Passed `RTCDataChannel` instance should be `reliable` and `ordered` mode.

## API

### BasedDataChannel

```js
const basedDC = based(dc);
```

Do nothing, just wrap with `EventEmitter`.

This class has the same properties which `RTCDataChannel` instance has.

- `readyState`
- `label`
- `binaryType`
- etc...

See [spec](https://w3c.github.io/webrtc-pc/#rtcdatachannel) for the detail.

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

```js
const promisedDC = promised(dc);
```

Make it possible to `await dc.send(json)`.

This class extends `BasedDataChannel`.

And this class has special `send()` method and `on("message")` handler.

```js
// recv
promisedDC.on("message", (data, resolve, reject) => {
  try {
    console.log(data.msg); // "Take this!"
    resolve({ res: "Thank you!" });
  } catch (err) {
    reject(err);
  }
});

// send
const data = await promisedDC.send({ msg: "Take this!" });
console.log(data.res); // "Thank you!"
```

If recv side does not `resolve()` neither nor `reject()`, it is treated as `reject()` with timeout.

### ChunkedDataChannel

```js
const chunkedDC = chunked(dc);
```

Make it possible to send a large file.

This class extends `BasedDataChannel`.

And this class has special `send()` method and `on("message")` handler.

```js
// recv
chunkedDC.on("message", (blob, meta) => {
  // download it
  const $downloadLink = document.createElement("a");
  $downloadLink.href = URL.createObjectURL(blob);
  $downloadLink.download = meta.name;
  $downloadLink.textContent = meta.name;
  document.body.append($downloadLink);
});

// send
await chunkedDC.send(file, { name: "prof.png" });
```
