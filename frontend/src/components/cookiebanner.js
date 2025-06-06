// src/components/CookieBanner.jsx
import React, { useEffect, useState } from "react";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
    role="alert"
    aria-live="polite"
    className="fixed bottom-0 left-0 right-0 z-50 bg-violet-900 text-gray-100"
    aria-label="cookie banner"
    >
        <div
        className="max-w-4xl mx-auto flex flex-col space-y-3 px-3 py-4 sm:flex-row sm:space-y-0 sm:space-x-4 sm:px-6 sm:py-5"
        aria-label="cookie banner inner div styler"
        >
            <p
            className="text-xs leading-snug sm:text-sm text-center sm:text-left"
            >
                We use cookies to enhance your experience, analyze site traffic, and for security purposes.&nbsp;
                <a
                href="/"
                className="underline text-indigo-300 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors ease-linear duration-150"
                target="_blank"
                rel="noopener noreferrer"
                >
                    Learn more about our nonexistent privacy policy!
                </a>.
            </p>

            <button
            onClick={handleAccept}
            aria-label="accept cookies"
            className="self-center px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-xs sm:text-sm font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors ease-linear duration-150"
            >
                Accept
            </button>
        </div>
    </div>
  );
}
