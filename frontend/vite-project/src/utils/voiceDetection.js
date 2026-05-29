export function setupVoiceDetection({ onVoiceDetected, threshold = 0.02 }) {
  let audioContext;
  let analyser;
  let source;
  let rafId;
  let streak = 0;

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      audioContext = new AudioContext();
      analyser = audioContext.createAnalyser();
      source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 512;
      const data = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg =
          data.reduce((a, b) => a + b, 0) / data.length / 255;
        if (avg > threshold) {
          streak += 1;
          if (streak >= 8) {
            streak = 0;
            onVoiceDetected?.();
          }
        } else {
          streak = 0;
        }
        rafId = requestAnimationFrame(tick);
      };
      tick();
    } catch (e) {
      console.warn("Voice detection unavailable", e);
    }
  };

  start();

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
    source?.disconnect();
    audioContext?.close();
  };
}
