export function connectDC() {
  return new Promise((resolve, reject) => {
    (async () => {
      const pc1 = new RTCPeerConnection();
      const pc2 = new RTCPeerConnection();

      pc1.onicecandidate = ev =>
        ev.candidate && pc2.addIceCandidate(ev.candidate);
      pc2.onicecandidate = ev =>
        ev.candidate && pc1.addIceCandidate(ev.candidate);

      const dc1 = pc1.createDataChannel("test");
      let dc2;
      pc2.ondatachannel = async ev => {
        dc2 = ev.channel;

        await Promise.all([
          dc1.readyState === "open"
            ? Promise.resolve()
            : new Promise(r => (dc1.onopen = r)),
          dc2.readyState === "open"
            ? Promise.resolve()
            : new Promise(r => (dc2.onopen = r))
        ]);

        resolve([dc1, dc2]);
      };

      const offer = await pc1.createOffer();
      await pc1.setLocalDescription(offer);
      await pc2.setRemoteDescription(offer);
      const answer = await pc2.createAnswer();
      await pc2.setLocalDescription(answer);
      await pc1.setRemoteDescription(answer);
    })().catch(reject);
  });
}

export function createBlob(size) {
  return new Blob([new ArrayBuffer(size)]);
}

export function createFile(size) {
  const blob = createBlob(size);
  return new File([blob], "dummy");
}
