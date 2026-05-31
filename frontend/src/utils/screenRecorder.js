export async function startScreenRecording({ onChunk, onStop }) {
  const displayStream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: false,
  });

  const recorder = new MediaRecorder(displayStream, {
    mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm",
  });

  recorder.ondataavailable = async (e) => {
    if (e.data.size > 0 && onChunk) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result?.split(",")[1];
        onChunk(base64);
      };
      reader.readAsDataURL(e.data);
    }
  };

  recorder.onstop = () => {
    displayStream.getTracks().forEach((t) => t.stop());
    onStop?.();
  };

  recorder.start(10000);

  return {
    stop: () => {
      if (recorder.state !== "inactive") recorder.stop();
    },
    stream: displayStream,
  };
}
