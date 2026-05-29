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

export const getRiskLevel = (totalScore) => {
  if (totalScore < 30) return "Low Risk";
  if (totalScore < 70) return "Medium Risk";
  return "High Risk";
};

export const calculateCheatingScore = (eventTypes = []) => {
  const totalScore = eventTypes.reduce(
    (sum, type) => sum + (VIOLATION_SCORES[type] || 5),
    0
  );
  return {
    cheatingScore: totalScore,
    riskLevel: getRiskLevel(totalScore),
  };
};
