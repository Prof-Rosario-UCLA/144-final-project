import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';

export default function WebcamComp({ onImageCaptured, showWebcam, setShowWebcam, image, setImage }) {
  const webcamRef = useRef(null);
  // const [image, setImage] = useState(null);

  const captureWebcam = () => {
    const screenshot = webcamRef.current.getScreenshot();
    setImage(screenshot);
    onImageCaptured?.(screenshot);
  };

  useEffect(() => {
      console.log("pranav is fat");
  }, [showWebcam])

  return (
    <div className="flex flex-col items-center max-w-sm">
      {!showWebcam && !image && (
        <button
          onClick={() => setShowWebcam(true)}
          className="px-4 py-2 sm:text-lg text-xs bg-purple-300 hover:bg-purple-400 text-white font-semibold rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ease-linear duration-150"
        >
          📷 
        </button>
      )}

      {showWebcam && !image && (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="rounded-lg mt-[.6em] border-[.3em] border-slate-800"
          />
          <div
          className="flex flex-row items-center justify-center sm:space-x-[4em] space-x-[.5em]"
          >
            <button
              onClick={captureWebcam}
              className="mt-4 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg sm:text-lg text-xs transition-colors ease-linear duration-150"
            >
              Capture
            </button>
            <button
              onClick={() => setShowWebcam(false)}
              className="mt-4 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg sm:text-lg text-xs transition-colors ease-linear duration-150"
            >
              Hide
            </button>
          </div>
        </>
      )}

      {image && (
        <>
          <img src={image} alt="Captured" className="rounded-lg mt-[.6em] border-[.3em] border-slate-800" />
          <button
            onClick={() => {
              setImage(null);
              setShowWebcam(true);
              onImageCaptured?.(null);
            }}
            className="mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors ease-linear duration-150"
          >
            🔁 Retake
          </button>
        </>
      )}
    </div>
  );
}
