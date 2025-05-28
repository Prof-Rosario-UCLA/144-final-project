import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';

export default function WebcamComp({ onImageCaptured }) {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);

  const captureWebcam = () => {
    const screenshot = webcamRef.current.getScreenshot();
    setImage(screenshot);
    onImageCaptured?.(screenshot);
  };

  return (
    <div className="flex flex-col items-center">
      {!showWebcam && !image && (
        <button
          onClick={() => setShowWebcam(true)}
          className="sm:ml-[1em] mr-[1em] px-4 py-2 sm:text-lg text-xs bg-blue-100 hover:bg-blue-600 text-white font-semibold rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="rounded-lg mt-4"
          />
          <button
            onClick={captureWebcam}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Capture
          </button>
          <button
            onClick={() => setShowWebcam(false)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Hide
          </button>
        </>
      )}

      {image && (
        <>
          <img src={image} alt="Captured" className="rounded-lg mt-4" />
          <button
            onClick={() => {
              setImage(null);
              setShowWebcam(false);
                onImageCaptured?.(null);
            }}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg"
          >
            🔁 Retake
          </button>
        </>
      )}
    </div>
  );
}
