import React from 'react';

interface ImageGalleryProps {
  images: string[];
  recipeName: string;
}

const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 7.414V13a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
);

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, recipeName }) => {
  const placeholders = Array(4).fill(0);
  const displayImages = images.length > 0 ? images : placeholders;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {displayImages.map((image, index) => (
        <div key={index} className="relative group aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden shadow-md">
          {images.length > 0 ? (
            <>
              <img src={image} alt={`${recipeName} - tampilan ${index + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-300"></div>
              <a
                href={image}
                download={`${recipeName.replace(/\s+/g, '_')}_${index + 1}.jpeg`}
                className="absolute bottom-2 right-2 flex items-center gap-1 bg-white text-gray-800 px-3 py-1.5 rounded-full text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0"
                title="Unduh Gambar"
              >
                <DownloadIcon />
                <span>Unduh</span>
              </a>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center animate-pulse">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"></path></svg>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ImageGallery;