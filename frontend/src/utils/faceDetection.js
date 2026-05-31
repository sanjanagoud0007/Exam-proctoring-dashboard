import * as faceapi from "@vladmandic/face-api";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

const MODEL_BASE =
  "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.15/model";

let faceModelsPromise = null;
let cocoModelPromise = null;

export async function loadFaceModels() {
  if (!faceModelsPromise) {
    faceModelsPromise = (async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_BASE);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_BASE);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_BASE);
      return true;
    })();
  }
  return faceModelsPromise;
}

export async function loadObjectModel() {
  if (!cocoModelPromise) {
    cocoModelPromise = cocoSsd.load();
  }
  return cocoModelPromise;
}

const isLookingAway = (landmarks) => {
  const nose = landmarks.getNose()[3];
  const leftEye = landmarks.getLeftEye();
  const rightEye = landmarks.getRightEye();
  const eyeCenterX =
    (leftEye[0].x + rightEye[3].x) / 2;
  const offset = Math.abs(nose.x - eyeCenterX);
  const eyeWidth = Math.abs(rightEye[3].x - leftEye[0].x) || 1;
  return offset / eyeWidth > 0.35;
};

const hasSuspiciousMovement = (prev, current) => {
  if (!prev || !current) return false;
  const dx = Math.abs(prev.x - current.x);
  const dy = Math.abs(prev.y - current.y);
  return dx + dy > 80;
};

export async function analyzeExamFrame(video, prevNose = null) {
  if (!video || video.readyState < 2) {
    return { status: "loading", faceCount: -1 };
  }

  await loadFaceModels();

  const detections = await faceapi
    .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceExpressions();

  const faceCount = detections.length;
  let lookingAway = false;
  let suspiciousMovement = false;
  let nosePoint = null;

  if (faceCount === 1) {
    const lm = detections[0].landmarks;
    lookingAway = isLookingAway(lm);
    nosePoint = lm.getNose()[3];
    suspiciousMovement = hasSuspiciousMovement(prevNose, nosePoint);
  }

  let mobilePhone = false;
  try {
    const objectModel = await loadObjectModel();
    const objects = await objectModel.detect(video);
    mobilePhone = objects.some(
      (o) =>
        o.class === "cell phone" &&
        o.score > 0.55
    );
  } catch {
    mobilePhone = false;
  }

  let status = "ok";
  if (faceCount === 0) status = "no-face";
  else if (faceCount > 1) status = "multiple";
  else if (mobilePhone) status = "phone";
  else if (lookingAway) status = "looking-away";
  else if (suspiciousMovement) status = "movement";

  return {
    status,
    faceCount,
    lookingAway,
    suspiciousMovement,
    mobilePhone,
    expressions: detections[0]?.expressions,
    nosePoint,
  };
}

