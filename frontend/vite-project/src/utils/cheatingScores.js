export const VIOLATION_SCORES = {
  TAB_SWITCH: 10,
  NO_FACE: 20,
  MULTIPLE_FACES: 40,
  LOOKING_AWAY: 15,
  MOBILE_PHONE: 50,
  SUSPICIOUS_MOVEMENT: 15,
  FULLSCREEN_EXIT: 10,
  WEBCAM_OFF: 25,
  COPY_PASTE: 10,
  RIGHT_CLICK: 5,
  KEYBOARD_SHORTCUT: 10,
  VOICE_DETECTED: 20,
  WINDOW_BLUR: 10,
  OFFLINE: 15,
  VPN_PROXY: 30,
  VIRTUAL_CAMERA: 60,
};

export const getRiskLevel = (score) => {
  if (score < 30) return "Low Risk";
  if (score < 70) return "Medium Risk";
  return "High Risk";
};

export const getRiskColor = (level) => {
  if (level === "Low Risk") return "text-emerald-400";
  if (level === "Medium Risk") return "text-amber-400";
  return "text-red-400";
};
