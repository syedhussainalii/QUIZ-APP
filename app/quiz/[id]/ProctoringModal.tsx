"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ProctoringModalProps {
  quizId: string;
  onClose?: () => void;
}

export default function ProctoringModal({ quizId, onClose }: ProctoringModalProps) {
  const router = useRouter();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Request camera access when component mounts
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((mediaStream) => {
        setStream(mediaStream);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(
          "Camera access is required for proctoring. Please allow the camera to continue."
        );
        setLoading(false);
      });
    // Cleanup on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProceed = () => {
    // Navigate to the quiz‑taking page
    router.push(`/quiz/${quizId}/take`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Camera Proctoring Permission
        </h2>
        {loading && (
          <p className="text-gray-700 dark:text-gray-300 mb-4">Requesting camera access…</p>
        )}
        {error && <p className="text-red-600 mb-4">{error}</p>}
        {stream && (
          <div className="mb-4 flex justify-center">
            <video
              autoPlay
              playsInline
              muted
              ref={(video) => {
                if (video && stream) {
                  video.srcObject = stream;
                }
              }}
              className="rounded border w-64 h-48"
            />
          </div>
        )}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleProceed}
            disabled={!stream}
            className={`px-4 py-2 rounded text-white ${
              stream ? "bg-indigo-600 hover:bg-indigo-700" : "bg-indigo-400 cursor-not-allowed"
            }`}
          >
            Start Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
