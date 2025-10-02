import React from 'react';

interface ImageResultDisplayProps {
  images: string[];
  prompt: string;
}

const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 7.414V13a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
);

const ImageResultDisplay: React.FC<ImageResultDisplayProps> = ({ images, prompt }) => {
    const safeFilename = prompt.substring(0, 50).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    return (
        <div className="bg-white rounded-xl shadow-xl overflow-hidden animate-fade-in border border-slate-200 p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-dark text-center mb-6" style={{fontFamily: "'Playfair Display', serif"}}>
                Hasil Foto Produk Anda
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group aspect-auto bg-gray-200 rounded-lg overflow-hidden shadow-md">
                    <img src={image} alt={`Generated image for: ${prompt} - ${index + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-300"></div>
                    <a
                        href={image}
                        download={`${safeFilename || 'foto_produk'}_${index + 1}.jpeg`}
                        className="absolute bottom-2 right-2 flex items-center gap-1 bg-white text-gray-800 px-3 py-1.5 rounded-full text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0"
                        title="Unduh Gambar"
                    >
                        <DownloadIcon />
                        <span>Unduh</span>
                    </a>
                </div>
              ))}
            </div>
        </div>
    );
};

export default ImageResultDisplay;