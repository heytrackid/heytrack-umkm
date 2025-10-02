import React, { useState } from 'react';
import { MarketingStrategy } from '../types';
import { generateMarketingStrategy } from '../services/openrouterService';
import LoadingSpinner from './LoadingSpinner';
import MarketingStrategyCard from './MarketingStrategyCard';

// Memindahkan FormSelect ke luar komponen utama untuk mencegah pembuatan ulang pada setiap render.
const FormSelect: React.FC<{ 
  label: string; 
  name: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; 
  children: React.ReactNode; 
  isLoading: boolean;
}> = ({ label, name, value, onChange, children, isLoading }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={isLoading}
      className="w-full px-4 py-2.5 text-base text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent transition-colors duration-200 disabled:opacity-50"
    >
      {children}
    </select>
  </div>
);

// Memindahkan FormInput ke luar komponen utama untuk mencegah pembuatan ulang pada setiap render.
const FormInput: React.FC<{ 
  label: string; 
  name: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  placeholder: string; 
  isLoading: boolean;
}> = ({ label, name, value, onChange, placeholder, isLoading }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={isLoading}
      className="w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent transition-colors duration-200 disabled:opacity-50"
    />
  </div>
);

const MarketingStrategyGenerator: React.FC = () => {
  const [formData, setFormData] = useState({
    businessStage: '',
    businessType: '',
    mainChallenge: '',
    productDescription: '',
    targetCustomer: '',
    businessLocation: '',
    marketingBudget: '',
    currentEfforts: '',
  });

  const [strategy, setStrategy] = useState<MarketingStrategy | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    businessStage,
    businessType,
    mainChallenge,
    productDescription,
    targetCustomer,
    businessLocation,
    marketingBudget,
    currentEfforts
  } = formData;
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const isFormValid = businessStage && businessType && mainChallenge && productDescription.trim() && targetCustomer.trim() && businessLocation.trim() && marketingBudget;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    setError(null);
    setStrategy(null);

    const businessContext = `
      - Deskripsi Produk Unggulan: ${productDescription.trim()}
      - Tahap Bisnis: ${businessStage}
      - Jenis Usaha: ${businessType}
      - Lokasi Bisnis: ${businessLocation.trim()}
      - Target Pelanggan Spesifik: ${targetCustomer.trim()}
      - Tantangan Utama: ${mainChallenge}
      - Tingkat Anggaran Pemasaran: ${marketingBudget}
      - Upaya Pemasaran Saat Ini: ${currentEfforts.trim() || 'Belum ada upaya signifikan.'}
    `;

    try {
      const newStrategy = await generateMarketingStrategy(businessContext);
      setStrategy(newStrategy);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Gagal membuat strategi. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="p-6 bg-white rounded-xl shadow-lg border border-slate-200">
        <h2 className="text-xl font-bold text-center text-slate-800 mb-2">Ciptakan Strategi Pemasaran Detail</h2>
        <p className="text-center text-gray-600 mb-6 max-w-2xl mx-auto">
          Semakin detail informasi yang Anda berikan, semakin akurat dan relevan strategi yang akan dihasilkan oleh AI untuk bisnis Anda.
        </p>
        
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-4">
          <div>
            <label htmlFor="product-desc" className="block text-sm font-medium text-gray-700 mb-1">1. Deskripsi Produk Unggulan Anda*</label>
            <textarea
              id="product-desc"
              name="productDescription"
              value={productDescription}
              onChange={handleInputChange}
              placeholder="Contoh: Kopi susu gula aren dengan biji kopi premium dan rasa manis yang pas, disajikan dalam kemasan modern."
              disabled={isLoading}
              rows={3}
              className="w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent transition-colors duration-200 disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormInput 
                label="2. Target Pelanggan Spesifik Anda?*"
                name="targetCustomer"
                value={targetCustomer}
                onChange={handleInputChange}
                placeholder="Cth: Mahasiswa, keluarga muda"
                isLoading={isLoading}
             />
             <FormInput 
                label="3. Di Mana Lokasi Bisnis Anda?*"
                name="businessLocation"
                value={businessLocation}
                onChange={handleInputChange}
                placeholder="Cth: Pusat kota, hanya online"
                isLoading={isLoading}
             />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormSelect name="businessStage" label="4. Tahap Bisnis Saat Ini*" value={businessStage} onChange={handleInputChange} isLoading={isLoading}>
              <option value="" disabled>Pilih tahap</option>
              <option value="Baru Buka">Baru Buka</option>
              <option value="Sudah Berjalan">Sudah Berjalan</option>
              <option value="Ingin Ekspansi">Ingin Ekspansi</option>
            </FormSelect>
            <FormSelect name="businessType" label="5. Jenis Usaha Anda*" value={businessType} onChange={handleInputChange} isLoading={isLoading}>
               <option value="" disabled>Pilih jenis</option>
              <option value="Restoran / Kafe">Restoran / Kafe</option>
              <option value="Warung Makan">Warung Makan</option>
              <option value="Kedai Kopi">Kedai Kopi</option>
              <option value="Toko Roti / Pastry">Toko Roti / Pastry</option>
              <option value="Katering">Katering</option>
              <option value="Booth Minuman / Makanan">Booth Minuman / Makanan</option>
              <option value="Food Truck">Food Truck</option>
              <option value="Cloud Kitchen / Online">Cloud Kitchen / Online</option>
              <option value="Produk Kemasan">Produk Kemasan</option>
            </FormSelect>
            <FormSelect name="mainChallenge" label="6. Tantangan Terbesar Anda*" value={mainChallenge} onChange={handleInputChange} isLoading={isLoading}>
               <option value="" disabled>Pilih tantangan</option>
              <option value="Menarik Pelanggan Baru">Menarik Pelanggan Baru</option>
              <option value="Meningkatkan Penjualan">Meningkatkan Penjualan</option>
              <option value="Membangun Brand Awareness">Membangun Brand Awareness</option>
              <option value="Menghadapi Kompetitor">Menghadapi Kompetitor</option>
            </FormSelect>
          </div>
          
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect name="marketingBudget" label="7. Tingkat Anggaran Pemasaran*" value={marketingBudget} onChange={handleInputChange} isLoading={isLoading}>
                   <option value="" disabled>Pilih tingkat anggaran</option>
                  <option value="Rendah (Fokus pada organik & biaya rendah)">Rendah</option>
                  <option value="Sedang (Bisa untuk iklan & kolaborasi kecil)">Sedang</option>
                  <option value="Tinggi (Fleksibel untuk berbagai channel)">Tinggi</option>
                </FormSelect>
                <div>
                    <label htmlFor="current-efforts" className="block text-sm font-medium text-gray-700 mb-1">8. Upaya Pemasaran Saat Ini (Opsional)</label>
                    <input
                      id="current-efforts"
                      name="currentEfforts"
                      type="text"
                      value={currentEfforts}
                      onChange={handleInputChange}
                      placeholder="Cth: Posting di Instagram, promo dari mulut ke mulut"
                      disabled={isLoading}
                      className="w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent transition-colors duration-200 disabled:opacity-50"
                    />
                </div>
           </div>

          <div className="text-center pt-2">
            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className="w-full md:w-auto px-10 py-3 font-bold text-white bg-brand-primary rounded-full hover:bg-orange-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              Buat Strategi Lengkap
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8">
        {isLoading && (
          <div className="flex flex-col items-center justify-center text-center p-8 bg-white/50 rounded-lg shadow-md">
            <LoadingSpinner />
            <p className="mt-4 text-lg font-semibold text-brand-primary">Meracik strategi pemasaran komprehensif...</p>
            <p className="text-sm text-gray-600">Mohon tunggu, AI sedang menganalisis data bisnis Anda!</p>
          </div>
        )}
        {error && (
          <div className="text-center p-8 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-md">
            <h3 className="font-bold text-lg">Oops! Terjadi kesalahan.</h3>
            <p>{error}</p>
          </div>
        )}
        {!isLoading && strategy && (
            <MarketingStrategyCard strategy={strategy} />
        )}
      </div>
    </div>
  );
};

export default MarketingStrategyGenerator;