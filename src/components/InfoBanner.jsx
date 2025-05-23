const InfoBanner = ({ message, onClose }) => (
    <div className="bg-yellow-100 text-yellow-800 px-4 py-3 rounded-md shadow-md mb-4 text-center relative">
      {message}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-1 right-3 text-xl font-bold text-yellow-700"
        >
          ×
        </button>
      )}
    </div>
  );
  
  export default InfoBanner;