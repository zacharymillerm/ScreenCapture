import React, { useEffect } from "react";

const Modal = ({ imageSrc, title, onClose, onPrev, onNext }) => {
  // Use effect to handle keydown events
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault(); // Prevent default scroll behavior
        onPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault(); // Prevent default scroll behavior
        onNext();
      } else if (event.key === "Escape") {
        event.preventDefault(); // Prevent default scroll behavior
        onClose();
      }
    };

    // Add event listener
    window.addEventListener("keydown", handleKeyDown);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onPrev, onNext, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-8">
      <div className="bg-white p-1 rounded shadow-lg overflow-auto relative">
        <span className="absolute top-4 left-4 font-bold text-4xl text-white bg-black bg-opacity-50 rounded-full px-3">
          {title}
        </span>
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 flex space-x-4 bg-blue-600 bg-opacity-20 py-1 px-2 rounded-full">
          <button
            onClick={onPrev}
            className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center hover:bg-slate-400 hover:shadow-lg hover:shadow-blue-500/50"
          >
            &#9664;
          </button>
          <button
            onClick={onNext}
            className="bg-gray-200   rounded-full w-10 h-10 flex items-center justify-center hover:bg-slate-400 hover:shadow-lg hover:shadow-blue-500/50"
          >
            &#9654;
          </button>
          <button
            onClick={onClose}
            className="text-black bg-gray-200 rounded-full w-10 h-10 hover:bg-slate-400 hover:shadow-lg hover:shadow-blue-500/50"
          >
            &times;
          </button>
        </div>
        <img
          src={imageSrc}
          alt="Screenshot"
          className="transition-all w-auto h-auto max-w-none max-h-[90vh]"
        />
      </div>
    </div>
  );
};

export default Modal;