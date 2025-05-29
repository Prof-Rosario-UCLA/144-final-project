import React, { useState, useRef } from 'react';

export default function AudioRecorder({ onAudioCaptured }) {
  const mediaRecorderRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const recorder = new MediaRecorder(stream);
    const chunks = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      setAudioBlob(blob);
      onAudioCaptured?.(blob);
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  const reset = () => {
    setAudioBlob(null);
    setRecording(false);
    onAudioCaptured?.(null);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {!recording && !audioBlob && (
        <button
          onClick={startRecording}
        className="sm:ml-[1em] mr-[1em] px-4 py-2 sm:text-lg text-xs bg-blue-100 hover:bg-blue-600 text-white font-semibold rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          🎙️
        </button>
      )}

      {recording && (
        <button
          onClick={stopRecording}
          className="px-4 py-2 mr-[1em] bg-red-600 text-white rounded-lg"
        >
          ⏹️
        </button>
      )}

      {audioBlob && (
        <>
          <audio controls src={URL.createObjectURL(audioBlob)} className="mt-2" />
          <button
            onClick={reset}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg"
          >
            🔁 
          </button>
        </>
      )}
    </div>
  );
}
