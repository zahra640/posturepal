// MediaPipe Pose is loaded via CDN script tag in index.html (window.Pose)
// This avoids Vite's ESM transform failing on MediaPipe's IIFE bundle.

let poseInstance = null

export async function initPose(onResults) {
  if (poseInstance) {
    poseInstance.close()
    poseInstance = null
  }

  const pose = new window.Pose({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
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
