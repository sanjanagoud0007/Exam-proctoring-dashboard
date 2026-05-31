export const MAX_VIOLATIONS = 4;

export const VIOLATION_TYPES = {
  TAB_SWITCH: "TAB_SWITCH",
  FULLSCREEN_EXIT: "FULLSCREEN_EXIT",
  WEBCAM_OFF: "WEBCAM_OFF",
  NO_FACE: "NO_FACE",
  MULTIPLE_FACES: "MULTIPLE_FACES",
  LOOKING_AWAY: "LOOKING_AWAY",
  MOBILE_PHONE: "MOBILE_PHONE",
  SUSPICIOUS_MOVEMENT: "SUSPICIOUS_MOVEMENT",
  COPY_PASTE: "COPY_PASTE",
  RIGHT_CLICK: "RIGHT_CLICK",
  KEYBOARD_SHORTCUT: "KEYBOARD_SHORTCUT",
  VOICE_DETECTED: "VOICE_DETECTED",
  WINDOW_BLUR: "WINDOW_BLUR",
  OFFLINE: "OFFLINE",
  VPN_PROXY: "VPN_PROXY",
  VIRTUAL_CAMERA: "VIRTUAL_CAMERA",
};

const MESSAGES = {
  [VIOLATION_TYPES.TAB_SWITCH]:
    "You left the exam tab. Stay on this page during the test.",
  [VIOLATION_TYPES.FULLSCREEN_EXIT]:
    "You exited fullscreen mode. Return to fullscreen to continue.",
  [VIOLATION_TYPES.WEBCAM_OFF]:
    "Webcam access was lost. Enable your camera to continue.",
  [VIOLATION_TYPES.NO_FACE]:
    "Your face is not visible. Center yourself in front of the camera.",
  [VIOLATION_TYPES.MULTIPLE_FACES]:
    "Multiple faces detected. Only you should be visible during the exam.",
  [VIOLATION_TYPES.LOOKING_AWAY]:
    "You appear to be looking away from the screen frequently.",
  [VIOLATION_TYPES.MOBILE_PHONE]:
    "A mobile phone or device was detected in view.",
  [VIOLATION_TYPES.SUSPICIOUS_MOVEMENT]:
    "Suspicious head movement detected.",
  [VIOLATION_TYPES.COPY_PASTE]: "Copy/paste is disabled during the exam.",
  [VIOLATION_TYPES.RIGHT_CLICK]: "Right-click is disabled during the exam.",
  [VIOLATION_TYPES.KEYBOARD_SHORTCUT]:
    "Blocked keyboard shortcut detected.",
  [VIOLATION_TYPES.VOICE_DETECTED]:
    "Background voice or noise detected.",
  [VIOLATION_TYPES.WINDOW_BLUR]: "Exam window lost focus.",
  [VIOLATION_TYPES.OFFLINE]:
    "Internet connection lost. Exam may auto-submit.",
  [VIOLATION_TYPES.VPN_PROXY]:
    "VPN or proxy network usage detected. Please disable it to continue.",
  [VIOLATION_TYPES.VIRTUAL_CAMERA]:
    "Virtual camera or spoofed feed detected. Use a physical webcam.",
};

export const getViolationMessage = (type) =>
  MESSAGES[type] || "Suspicious activity detected.";

export function setupProctoring({
  onViolation,
  onMaxViolations,
  requestFullscreen = true,
}) {
  let violationCount = 0;
  let disposed = false;

  const recordViolation = (type) => {
    if (disposed) return;

    violationCount += 1;
    const payload = {
      type,
      message: getViolationMessage(type),
      count: violationCount,
    };

    onViolation?.(payload);

    if (violationCount >= MAX_VIOLATIONS) {
      onMaxViolations?.(payload);
    }
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      recordViolation(VIOLATION_TYPES.TAB_SWITCH);
    }
  };

  const handleFullscreenChange = () => {
    if (!document.fullscreenElement) {
      recordViolation(VIOLATION_TYPES.FULLSCREEN_EXIT);
    }
  };

  const handleOffline = () => {
    recordViolation(VIOLATION_TYPES.OFFLINE);
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  document.addEventListener("fullscreenchange", handleFullscreenChange);
  window.addEventListener("offline", handleOffline);

  if (requestFullscreen && document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {});
  }

  return {
    reportViolation: recordViolation,
    reportWebcamOff: () => recordViolation(VIOLATION_TYPES.WEBCAM_OFF),
    reportNoFace: () => recordViolation(VIOLATION_TYPES.NO_FACE),
    reportMultipleFaces: () =>
      recordViolation(VIOLATION_TYPES.MULTIPLE_FACES),
    reportLookingAway: () =>
      recordViolation(VIOLATION_TYPES.LOOKING_AWAY),
    reportMobilePhone: () =>
      recordViolation(VIOLATION_TYPES.MOBILE_PHONE),
    reportSuspiciousMovement: () =>
      recordViolation(VIOLATION_TYPES.SUSPICIOUS_MOVEMENT),
    reportVoice: () => recordViolation(VIOLATION_TYPES.VOICE_DETECTED),
    reportVirtualCamera: () => recordViolation(VIOLATION_TYPES.VIRTUAL_CAMERA),
    reportVpnProxy: () => recordViolation(VIOLATION_TYPES.VPN_PROXY),
    getViolationCount: () => violationCount,
    cleanup: () => {
      disposed = true;
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
      window.removeEventListener("offline", handleOffline);
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
    },
  };
}
