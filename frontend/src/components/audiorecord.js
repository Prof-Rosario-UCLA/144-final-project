import React, { useState, useRef } from 'react';

export default function AudioRecorder({ onAudioCaptured, recording, setRecording, audioBlob, setAudioBlob }) {
  const mediaRecorderRef = useRef(null);
  // const [audioBlob, setAudioBlob] = useState(null);

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
          className="px-4 py-2 sm:text-lg text-xs bg-purple-300 hover:bg-purple-400 text-white font-semibold rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ease-linear duration-150"
        >
          🎙️
        </button>
      )}

      {recording && (
        <button
          onClick={stopRecording}
          className="px-4 py-2 mr-[1em] bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors ease-linear duration-150"
        >
          ⏹️
        </button>
      )}

      {audioBlob && (
        <>
          <audio controls src={URL.createObjectURL(audioBlob)} className="mt-2" />
          <button
            onClick={reset}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors ease-linear duration-150"
          >
            Cancel
          </button>
        </>
      )}
    </div>
  );
}
