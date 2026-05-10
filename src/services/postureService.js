import { Pose } from '@mediapipe/pose'

let poseInstance = null

export async function initPose(onResults) {
  if (poseInstance) {
    poseInstance.close()
    poseInstance = null
  }

  const pose = new Pose({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`,
  })

  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  })

  pose.onResults(onResults)
  await pose.initialize()
  poseInstance = pose
}

export async function sendFrame(videoElement) {
  if (poseInstance && videoElement.readyState >= 2) {
    await poseInstance.send({ image: videoElement })
  }
}

export function stopPose() {
  if (poseInstance) {
    poseInstance.close()
    poseInstance = null
  }
}
