import React, { useState, useCallback } from 'react';
import { generateProductImage, editProductImage } from '../services/openrouterService';
import LoadingSpinner from './LoadingSpinner';
import ImageResultDisplay from './ImageResultDisplay';

type Mode = 'text' | 'image';

const styleOptions = [
    "Fotografi Realistis",
    "Gaya Minimalis",
    "Cahaya Dramatis",
    "Latar Belakang Pedesaan",
    "Suasana Kafe",
    "Warna Gelap & Moody",
    "Gaya Vintage Film",
    "Hitam Putih Artistik",
    "Warna Cerah & Jenuh",
    "Gaya Majalah Gourmet",
    "Pencahayaan Studio Bersih (High-key)",
];

const angleOptions = [
    "Sejajar Mata (Eye-level)",
    "Dari Atas (Flat Lay)",
    "Sudut 45 Derajat",
    "Close-up Makro",
    "Sudut Rendah (Hero Shot)",
    "Sudut Tinggi",
    "Detail Shot (Sangat Dekat)",
];

const servingStyleOptions = [
    "Minimalis di piring putih",
    "Gaya rustik di atas talenan kayu",
    "Disajikan dalam mangkuk keramik",
    "Modern dengan hiasan microgreens",
    "Gaya 'messy' yang artistik",
    "Porsi keluarga di nampan besar",
    "Dibungkus dengan kertas perkamen",
    "Tatanan dekonstruksi",
    "Dalam kotak bekal/takeaway",
    "Dengan kepulan asap/uap panas",
    "Dihiasi bunga yang bisa dimakan",
];

const backgroundOptions = [
    "Latar belakang putih/abu-abu bersih",
    "Meja kayu dengan properti dapur",
    "Kain linen bertekstur",
    "Permukaan marmer yang elegan",
    "Suasana outdoor taman/piknik",
    "Latar belakang warna solid yang kontras",
    "Efek bokeh (blur) di belakang",
    "Permukaan batu tulis (slate) gelap",
    "Tekstur beton/semen",
    "Suasana dapur yang sibuk (blur)",
    "Taplak meja bermotif",
];

const randomPromptIdeas = [
    "Semangkuk soto ayam bening dengan koya dan jeruk nipis",
    "Setumpuk pancake lembut disiram sirup maple dan buah beri",
    "Burger keju juicy dengan kentang goreng renyah di sampingnya",
    "Salad buah tropis yang segar dan berwarna-warni",
    "Semangkuk pho Vietnam mengepul dengan irisan daging sapi",
    "Sepotong kue cokelat kaya dengan lelehan lava di tengahnya",
    "Nasi goreng spesial dengan telur mata sapi dan acar",
    "Pizza pepperoni dengan keju mozzarella meleleh",
    "Sushi platter yang disajikan dengan indah",
    "Segelas es kopi susu kekinian dengan gradasi warna",
];


const WelcomePlaceholder: React.FC = () => (
  <div className="text-center p-6 bg-white rounded border border-gray-200">
    <div className="mx-auto bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    </div>
    <h2 className="text-lg font-bold text-slate-800 mt-4" style={{fontFamily: "'Playfair Display', serif"}}>Studio Foto AI</h2>
    <p className="mt-2 text-gray-600 max-w-2xl mx-auto text-sm">
      Buat foto produk dari deskripsi teks atau unggah foto untuk diedit oleh AI.
    </p>
  </div>
);

const ProductPhotoGenerator: React.FC = () => {
    const [mode, setMode] = useState<Mode>('text');
    const [prompt, setPrompt] = useState('');
    const [style, setStyle] = useState(styleOptions[0]);
    const [angle, setAngle] = useState(angleOptions[0]);
    const [servingStyle, setServingStyle] = useState(servingStyleOptions[0]);
    const [background, setBackground] = useState(backgroundOptions[0]);
    const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:3' | '3:4'>('1:1');
    
    const [uploadedImage, setUploadedImage] = useState<{file: File, base64: string} | null>(null);
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage({
                    file: file,
                    base64: (reader.result as string).split(',')[1] // Get base64 part
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const isFormValid = () => {
        if (mode === 'text') {
            return prompt.trim().length > 0;
        }
        if (mode === 'image') {
            return prompt.trim().length > 0 && uploadedImage !== null;
        }
        return false;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid()) return;

        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);

        try {
            let result: string[];
            if (mode === 'text') {
                result = await generateProductImage(prompt, style, angle, servingStyle, background, aspectRatio);
            } else if (uploadedImage) {
                const editPrompt = `${prompt}. Terapkan gaya visual '${style}', disajikan dengan gaya '${servingStyle}' dengan latar belakang '${background}' dan sudut pengambilan gambar '${angle}'.`;
                result = await editProductImage(uploadedImage.base64, uploadedImage.file.type, editPrompt);
            } else {
                 throw new Error("Tidak ada gambar yang diunggah untuk diedit.");
            }
            setGeneratedImages(result);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Gagal memproses gambar. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleRandomGenerate = async () => {
        if (isLoading) return;

        const randomPrompt = randomPromptIdeas[Math.floor(Math.random() * randomPromptIdeas.length)];
        const randomStyle = styleOptions[Math.floor(Math.random() * styleOptions.length)];
        const randomAngle = angleOptions[Math.floor(Math.random() * angleOptions.length)];
        const randomServingStyle = servingStyleOptions[Math.floor(Math.random() * servingStyleOptions.length)];
        const randomBackground = backgroundOptions[Math.floor(Math.random() * backgroundOptions.length)];
        const aspectRatios: ('1:1' | '4:3' | '3:4')[] = ['1:1', '4:3', '3:4'];
        const randomAspectRatio = aspectRatios[Math.floor(Math.random() * aspectRatios.length)];
    
        setPrompt(randomPrompt);
        setStyle(randomStyle);
        setAngle(randomAngle);
        setServingStyle(randomServingStyle);
        setBackground(randomBackground);
        setAspectRatio(randomAspectRatio);
        setMode('text');
    
        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);
    
        try {
            const result = await generateProductImage(
                randomPrompt,
                randomStyle,
                randomAngle,
                randomServingStyle,
                randomBackground,
                randomAspectRatio
            );
            setGeneratedImages(result);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Gagal memproses gambar. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div>
            <div className="p-4 bg-white rounded border border-gray-200">
                 <h2 className="text-lg font-bold text-center text-slate-800 mb-2" style={{fontFamily: "'Playfair Display', serif"}}>Generator Foto Produk</h2>
                <p className="text-center text-gray-600 mb-4 max-w-2xl mx-auto text-sm">
                    Pilih mode dan berikan detail untuk membuat visual produk Anda.
                </p>

                <div className="flex justify-center gap-2 mb-4">
                    <button onClick={() => setMode('text')} disabled={isLoading} className={`px-4 py-2 rounded font-medium transition-colors duration-200 ${mode === 'text' ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        Teks
                    </button>
                    <button onClick={() => setMode('image')} disabled={isLoading} className={`px-4 py-2 rounded font-medium transition-colors duration-200 ${mode === 'image' ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        Gambar
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-3">
                    {mode === 'image' && (
                        <div>
                             <label className="block text-xs font-medium text-slate-700 mb-1">Unggah Foto</label>
                             {uploadedImage ? (
                                <div className="relative group">
                                    <img src={`data:${uploadedImage.file.type};base64,${uploadedImage.base64}`} alt="Pratinjau" className="w-full h-auto max-h-48 object-contain rounded border border-gray-300" />
                                    <button onClick={() => setUploadedImage(null)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                             ) : (
                                <div className="mt-1 flex justify-center px-4 pt-4 pb-4 border border-dashed border-gray-300 rounded bg-gray-50">
                                    <div className="space-y-1 text-center">
                                        <svg className="mx-auto h-10 w-10 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        <div className="flex text-xs text-slate-600">
                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded font-medium text-brand-primary hover:text-brand-secondary focus-within:outline-none">
                                                <span className="text-slate-700">Pilih file</span>
                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" />
                                            </label>
                                        </div>
                                        <p className="text-[0.6rem] text-slate-500">PNG, JPG, WEBP</p>
                                    </div>
                                </div>
                             )}
                        </div>
                    )}

                    <div>
                        <label htmlFor="prompt" className="block text-xs font-medium text-slate-700 mb-1">{mode === 'text' ? 'Deskripsi Foto*' : 'Instruksi Edit*'}</label>
                        <textarea
                            id="prompt"
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            placeholder={mode === 'text' ? "Cth: semangkuk ramen tonkotsu..." : "Cth: Tambahkan daun segar..."}
                            disabled={isLoading}
                            rows={2}
                            className="w-full px-3 py-2 text-sm text-slate-700 placeholder-slate-400 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-colors duration-200 disabled:opacity-50"
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label htmlFor="style" className="block text-xs font-medium text-slate-700 mb-1">{mode === 'text' ? 'Gaya Foto*' : 'Gaya*'}</label>
                            <select id="style" value={style} onChange={e => setStyle(e.target.value)} disabled={isLoading} className="w-full px-3 py-2 text-sm text-slate-700 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-colors duration-200 disabled:opacity-50">
                                {styleOptions.map(opt => <option key={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="angle" className="block text-xs font-medium text-slate-700 mb-1">{mode === 'text' ? 'Sudut*' : 'Sudut*'}</label>
                            <select id="angle" value={angle} onChange={e => setAngle(e.target.value)} disabled={isLoading} className="w-full px-3 py-2 text-sm text-slate-700 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-colors duration-200 disabled:opacity-50">
                                {angleOptions.map(opt => <option key={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="servingStyle" className="block text-xs font-medium text-slate-700 mb-1">{mode === 'text' ? 'Penyajian*' : 'Penyajian*'}</label>
                            <select id="servingStyle" value={servingStyle} onChange={e => setServingStyle(e.target.value)} disabled={isLoading} className="w-full px-3 py-2 text-sm text-slate-700 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-colors duration-200 disabled:opacity-50">
                                {servingStyleOptions.map(opt => <option key={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="background" className="block text-xs font-medium text-slate-700 mb-1">{mode === 'text' ? 'Latar*' : 'Latar*'}</label>
                            <select id="background" value={background} onChange={e => setBackground(e.target.value)} disabled={isLoading} className="w-full px-3 py-2 text-sm text-slate-700 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-colors duration-200 disabled:opacity-50">
                                {backgroundOptions.map(opt => <option key={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </div>

                     {mode === 'text' && (
                        <div className="pt-1">
                            <label htmlFor="aspectRatio" className="block text-xs font-medium text-slate-700 mb-1">Aspek Rasio*</label>
                            <select id="aspectRatio" value={aspectRatio} onChange={e => setAspectRatio(e.target.value as any)} disabled={isLoading} className="w-full px-3 py-2 text-sm text-slate-700 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-colors duration-200 disabled:opacity-50">
                                <option value="1:1">1:1</option>
                                <option value="4:3">4:3</option>
                                <option value="3:4">3:4</option>
                            </select>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                        <button type="submit" disabled={isLoading || !isFormValid()} className="w-full sm:w-auto px-4 py-2 font-medium text-white bg-brand-primary rounded hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                           {isLoading ? 'Memproses...' : (mode === 'text' ? 'Buat Foto' : 'Edit Foto')}
                        </button>
                        {mode === 'text' && (
                            <button 
                                type="button" 
                                onClick={handleRandomGenerate}
                                disabled={isLoading} 
                                className="w-full sm:w-auto px-4 py-2 font-medium text-gray-600 bg-slate-100 border border-slate-200 rounded hover:bg-slate-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                title="Gunakan ide acak"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                                </svg>
                                Acak
                            </button>
                        )}
                    </div>
                </form>
            </div>
            <div className="mt-6">
                 {isLoading && (
                  <div className="flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded border border-gray-200">
                    <LoadingSpinner />
                    <p className="mt-2 text-sm font-semibold text-brand-primary">Memproses...</p>
                  </div>
                )}
                {error && (
                  <div className="text-center p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    <h3 className="font-bold text-sm">Error</h3>
                    <p className="text-xs">{error}</p>
                  </div>
                )}
                {!isLoading && generatedImages.length > 0 && (
                    <ImageResultDisplay images={generatedImages} prompt={prompt} />
                )}
                 {!isLoading && generatedImages.length === 0 && !error && (
                    <WelcomePlaceholder />
                )}
            </div>
        </div>
    )
}

export default ProductPhotoGenerator;