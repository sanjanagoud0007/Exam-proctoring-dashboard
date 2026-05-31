import { useRef, useCallback, useEffect, useState } from "react";
import Webcam from "react-webcam";
import { analyzeExamFrame, loadFaceModels } from "../utils/faceDetection";

const SCAN_INTERVAL_MS = 3000;
const REQUIRED_STREAK = 2;

const WebcamMonitor = ({
  onStreamLost,
  onNoFace,
  onMultipleFaces,
  onLookingAway,
  onMobilePhone,
  onSuspiciousMovement,
  onFrameCapture,
  onVirtualCamera,
  disabled = false,
}) => {
  const webcamRef = useRef(null);
  const noseRef = useRef(null);
  const streaks = useRef({});
  const callbacks = useRef({});
  const lastFrameDataRef = useRef(null);
  const sameFrameCountRef = useRef(0);

  const [faceStatus, setFaceStatus] = useState("loading");
  const [faceCount, setFaceCount] = useState(null);

  useEffect(() => {
    callbacks.current = {
      onNoFace,
      onMultipleFaces,
      onLookingAway,
      onMobilePhone,
      onSuspiciousMovement,
      onFrameCapture,
      onVirtualCamera,
    };
  });

  const bumpStreak = (key, fire) => {
    streaks.current[key] = (streaks.current[key] || 0) + 1;
    if (streaks.current[key] >= REQUIRED_STREAK) {
      streaks.current[key] = 0;
      fire?.();
    }
  };

  const resetStreaks = (...keys) => {
    keys.forEach((k) => {
      streaks.current[k] = 0;
    });
  };

  const handleUserMediaError = useCallback(() => {
    setFaceStatus("off");
    onStreamLost?.();
  }, [onStreamLost]);

  const handleUserMedia = useCallback((stream) => {
    const videoTracks = stream.getVideoTracks();
    videoTracks.forEach((track) => {
      const label = track.label.toLowerCase();
      if (
        label.includes("virtual") ||
        label.includes("obs") ||
        label.includes("manycam") ||
        label.includes("splitcam") ||
        label.includes("camo") ||
        label.includes("vcamera")
      ) {
        callbacks.current.onVirtualCamera?.();
      }
    });
  }, []);

  useEffect(() => {
    if (disabled) return;

    let cancelled = false;
    let intervalId;

    const runScan = async () => {
      const video = webcamRef.current?.video;
      if (!video || cancelled) return;

      try {
        const analysis = await analyzeExamFrame(video, noseRef.current);
        if (cancelled) return;

        noseRef.current = analysis.nosePoint;
        setFaceCount(analysis.faceCount);

        if (analysis.faceCount >= 0 && callbacks.current.onFrameCapture) {
          const canvas = document.createElement("canvas");
          canvas.width = 160;
          canvas.height = 120;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, 160, 120);

          // Freeze Frame / Spoof detection (Pixel Variance Check)
          const imgData = ctx.getImageData(0, 0, 160, 120).data;
          if (lastFrameDataRef.current) {
            let isIdentical = true;
            for (let i = 0; i < imgData.length; i += 40) {
              if (imgData[i] !== lastFrameDataRef.current[i]) {
                isIdentical = false;
                break;
              }
            }

            if (isIdentical) {
              sameFrameCountRef.current += 1;
              if (sameFrameCountRef.current >= 3) {
                callbacks.current.onVirtualCamera?.();
              }
            } else {
              sameFrameCountRef.current = 0;
            }
          }
          lastFrameDataRef.current = new Uint8ClampedArray(imgData);

          callbacks.current.onFrameCapture(
            canvas.toDataURL("image/jpeg", 0.5)
          );
        }

        if (analysis.status === "no-face") {
          setFaceStatus("no-face");
          bumpStreak("noFace", callbacks.current.onNoFace);
        } else if (analysis.status === "multiple") {
          setFaceStatus("multiple");
          bumpStreak("multi", callbacks.current.onMultipleFaces);
        } else if (analysis.status === "phone") {
          setFaceStatus("phone");
          bumpStreak("phone", callbacks.current.onMobilePhone);
        } else if (analysis.status === "looking-away") {
          setFaceStatus("looking-away");
          bumpStreak("away", callbacks.current.onLookingAway);
        } else if (analysis.status === "movement") {
          setFaceStatus("movement");
          bumpStreak("move", callbacks.current.onSuspiciousMovement);
        } else {
          setFaceStatus("ok");
          resetStreaks("noFace", "multi", "phone", "away", "move");
        }
      } catch (error) {
        console.warn("Face scan failed:", error);
        if (!cancelled) setFaceStatus("error");
      }
    };

    (async () => {
      await loadFaceModels();
      if (cancelled) return;
      await runScan();
      intervalId = setInterval(runScan, SCAN_INTERVAL_MS);
    })();

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [disabled]);

  const labels = {
    loading: "Loading AI models…",
    ok: "Face OK — eyes tracked",
    "no-face": "No face",
    multiple: "Multiple faces",
    phone: "Phone detected",
    "looking-away": "Looking away",
    movement: "Suspicious movement",
    off: "Camera off",
    error: "AI unavailable",
  };

  return (
    <div className="overflow-hidden rounded-xl border-2 border-slate-300 shadow dark:border-slate-600">
      <Webcam
        ref={webcamRef}
        height={200}
        width={300}
        mirrored
        onUserMediaError={handleUserMediaError}
        onUserMedia={handleUserMedia}
      />
      <p className="bg-slate-800 px-2 py-1 text-center text-xs text-cyan-300">
        {labels[faceStatus] || faceStatus}
        {faceCount !== null && ` (${faceCount})`}
      </p>
    </div>
  );
};

export default WebcamMonitor;
