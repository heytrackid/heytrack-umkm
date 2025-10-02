import React, { useState } from 'react';
import { MarketingStrategy } from '../types';

interface MarketingStrategyCardProps {
  strategy: MarketingStrategy;
}

const SectionTitle: React.FC<{ icon: React.ReactNode; children: React.ReactNode; className?: string }> = ({ icon, children, className = '' }) => (
  <h3 className={`text-lg font-bold text-slate-800 mb-3 flex items-center border-b border-gray-300 pb-1 ${className}`} style={{fontFamily: "'Inter', sans-serif"}}>
    <span className="mr-2 text-orange-600">{icon}</span>
    {children}
  </h3>
);

const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className = '' }) => (
    <div className={`bg-white p-4 rounded border border-gray-200 ${className}`}>
        {children}
    </div>
);

const MarketingStrategyCard: React.FC<MarketingStrategyCardProps> = ({ strategy }) => {
  const { summary, targetAudience, usp, contentPillars, branding, socialMedia, offlineStrategy, promotions, kpis } = strategy;
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleCheck = (itemId: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(itemId)) {
      newChecked.delete(itemId);
    } else {
      newChecked.add(itemId);
    }
    setCheckedItems(newChecked);
  };

  // Generate quick tips based on strategy
  const getQuickTips = () => {
    const tips = [];
    if (socialMedia.length > 0) {
      tips.push("Posting konsisten di media sosial 3-4x seminggu");
      tips.push("Gunakan hashtag lokal untuk reach lebih luas");
    }
    if (promotions.length > 0) {
      tips.push("Buat promo spesial untuk hari besar atau weekend");
    }
    if (branding.toneOfVoice) {
      tips.push(`Selalu gunakan tone ${branding.toneOfVoice.toLowerCase()} di semua komunikasi`);
    }
    tips.push("Ambil foto produk berkualitas tinggi untuk postingan");
    tips.push("Tanyakan feedback pelanggan dan tampilkan testimonial");
    return tips;
  };

  // Generate action checklist
  const getActionChecklist = () => {
    const actions = [
      { id: 'social_setup', label: 'Setup akun media sosial lengkap dengan bio dan foto profil', priority: 'high' },
      { id: 'content_plan', label: 'Buat jadwal posting konten untuk 1 minggu ke depan', priority: 'high' },
      { id: 'brand_assets', label: 'Siapkan logo dan elemen branding untuk digunakan', priority: 'medium' },
      { id: 'customer_feedback', label: 'Tanyakan feedback dari 5 pelanggan pertama', priority: 'high' },
      { id: 'pricing_review', label: 'Review dan sesuaikan harga berdasarkan strategi', priority: 'medium' },
      { id: 'local_partnership', label: 'Cari peluang partnership dengan bisnis lokal', priority: 'low' }
    ];
    return actions;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 animate-fade-in p-4">
      <h2 className="text-3xl font-bold text-slate-800 text-center mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
        Strategi Pemasaran Lengkap
      </h2>
      
      <Card className="bg-gray-50 text-center mb-4">
        <p className="text-sm text-slate-700">{summary}</p>
      </Card>
      
      <div className="mt-8 space-y-8">
        
        {/* Target Audience & USP */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <SectionTitle icon={<UserGroupIcon />}>Persona Target Audiens</SectionTitle>
                <Card>
                    <h4 className="text-xl font-bold text-brand-primary">{targetAudience.personaName}</h4>
                    <div className="mt-4 space-y-3 text-slate-700">
                        <p><strong>Demografi:</strong> {targetAudience.demographics}</p>
                        <p><strong>Psikografi:</strong> {targetAudience.psychographics}</p>
                    </div>
                </Card>
            </div>
            <div>
                <SectionTitle icon={<StarIcon />}>USP</SectionTitle>
                 <Card className="h-full flex items-center justify-center">
                    <p className="text-center font-semibold text-slate-800 text-sm">"{usp}"</p>
                </Card>
            </div>
        </div>
        
        {/* Content Pillars & Branding */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <SectionTitle icon={<PillarsIcon />}>Pilar Konten</SectionTitle>
                <Card>
                    <ul className="space-y-3 list-disc list-inside text-slate-700">
                      {contentPillars.map((pillar, i) => <li key={i} className="font-semibold text-lg">{pillar}</li>)}
                    </ul>
                </Card>
            </div>
            <div>
                <SectionTitle icon={<SparklesIcon />}>Identitas Branding</SectionTitle>
                <Card>
                     <ul className="space-y-3 text-slate-700">
                        <li><strong>Konsep Logo:</strong> {branding.logoConcept}</li>
                        <li><strong>Slogan:</strong> <span className="italic">"{branding.slogan}"</span></li>
                        <li><strong>Ide Kemasan:</strong> {branding.packaging}</li>
                        <li><strong>Tone of Voice:</strong> <span className="font-semibold text-brand-primary">{branding.toneOfVoice}</span></li>
                    </ul>
                </Card>
            </div>
        </div>

        <div>
                <SectionTitle icon={<ShareIcon />}>Media Sosial</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {socialMedia.map((platformStrategy, i) => (
                    <Card key={i}>
                        <h4 className="text-sm font-bold text-slate-800 mb-1">{platformStrategy.platform}</h4>
                        <p className="text-xs text-slate-600 mb-2 italic">{platformStrategy.strategySummary}</p>
                        <div className="space-y-2">
                            {platformStrategy.contentIdeas.map((idea, j) => (
                                <div key={j} className="p-2 bg-gray-50 rounded border border-gray-200">
                                    <p className="text-xs font-bold text-slate-700">{idea.title} <span className="ml-1 text-[0.6rem] font-semibold text-white bg-brand-primary px-1.5 py-0.5 rounded">{idea.format}</span></p>
                                    <p className="text-xs text-slate-600 mt-1">{idea.description}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>
        </div>

        {/* Offline & Promotions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <SectionTitle icon={<BuildingStorefrontIcon />}>Strategi Offline</SectionTitle>
                <Card>
                    <ul className="space-y-3 list-disc list-inside text-slate-700">
                        {offlineStrategy.map((idea, i) => <li key={i}>{idea}</li>)}
                    </ul>
                </Card>
            </div>
            <div>
                <SectionTitle icon={<TagIcon />}>Promosi</SectionTitle>
                <div className="space-y-2">
                    {promotions.map((promo, i) => (
                        <Card key={i}>
                            <h4 className="text-xs font-bold text-slate-800">{promo.promotionName}</h4>
                            <p className="text-xs text-slate-700 my-1">{promo.description}</p>
                            <p className="text-[0.6rem] text-slate-500"><strong>Tujuan:</strong> {promo.objective}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
        
        {/* KPIs */}
        <div>
            <SectionTitle icon={<ChartBarIcon />}>KPI</SectionTitle>
            <Card>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {kpis.map((kpi, i) => (
                        <li key={i} className="flex items-start">
                            <CheckIcon className="h-4 w-4 text-green-600 mr-1 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-slate-700">{kpi}</span>
                        </li>
                    ))}
                </ul>
            </Card>
        </div>

        {/* Quick Tips */}
        <div>
            <SectionTitle icon={<LightBulbIcon />}>Tips Cepat</SectionTitle>
            <Card className="bg-blue-50 border-blue-200">
                <div className="space-y-2">
                    {getQuickTips().map((tip, index) => (
                        <div key={index} className="flex items-start">
                            <span className="text-blue-600 mr-2 mt-0.5">💡</span>
                            <span className="text-sm text-blue-800">{tip}</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>

        {/* Action Checklist */}
        <div>
            <SectionTitle icon={<ClipboardIcon />}>Checklist Implementasi</SectionTitle>
            <Card className="bg-green-50 border-green-200">
                <div className="space-y-3">
                    {getActionChecklist().map((action) => (
                        <div key={action.id} className="flex items-start space-x-3">
                            <input
                                type="checkbox"
                                id={action.id}
                                checked={checkedItems.has(action.id)}
                                onChange={() => toggleCheck(action.id)}
                                className="mt-0.5 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <div className="flex-1">
                                <label htmlFor={action.id} className="text-sm text-green-800 cursor-pointer">
                                    {action.label}
                                </label>
                                <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                                    action.priority === 'high' ? 'bg-red-100 text-red-700' :
                                    action.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                    {action.priority === 'high' ? 'Prioritas Tinggi' :
                                     action.priority === 'medium' ? 'Prioritas Sedang' : 'Prioritas Rendah'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 pt-3 border-t border-green-200">
                    <p className="text-xs text-green-700">
                        ✅ {checkedItems.size} dari {getActionChecklist().length} action telah selesai
                    </p>
                </div>
            </Card>
        </div>

      </div>
    </div>
  );
};

// SVG Icons
const UserGroupIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM18 13.5l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 18l-1.035.259a3.375 3.375 0 00-2.456 2.456L18 21.75l-.259-1.035a3.375 3.375 0 00-2.456-2.456L14.25 18l1.035-.259a3.375 3.375 0 002.456-2.456L18 13.5z" /></svg>;
const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.195.025.39.05.588.08m-5.858 3.555a2.25 2.25 0 01-2.186 0M15.75 5.25v4.95c0 .025.025.05.05.075 1.012 1.012 2.698 1.012 3.71 0 .998-.998 1.012-2.65.014-3.668a3.748 3.748 0 00-4.28-4.28.988.988 0 00-.75.05A2.25 2.25 0 005.25 7.5v4.95m3.75-4.95a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5a.75.75 0 01.75-.75z" /></svg>;
const TagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg>;
const PillarsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" /></svg>;
const BuildingStorefrontIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5A.75.75 0 0114.25 12h.01a.75.75 0 01.75.75v7.5m0 0H15M15 21a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0015 4.5h-3a2.25 2.25 0 00-2.25 2.25v12A2.25 2.25 0 0015 21h-1.5m1.5 0h-3" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5v7.5a2.25 2.25 0 002.25 2.25H9M3 13.5V9.75A2.25 2.25 0 015.25 7.5h3.75a2.25 2.25 0 012.25 2.25v3.75m-6 0h6m-6 0a2.25 2.25 0 00-2.25 2.25v3.75a2.25 2.25 0 002.25 2.25h3.75m-3.75 0h3.75M12 15.75v3" /></svg>;
const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>;
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>;
const LightBulbIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const ClipboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 8.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25m0 0H2.25A2.25 2.25 0 00.75 10.5v9a2.25 2.25 0 002.25 2.25h13.5a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H16.5m-9 0H7.5m3 0h-3m0 4.5h.008v.008H10.5V12zm0 2.25h.008v.008H10.5v-.008zm0 2.25h.008v.008H10.5V16.5z" /></svg>;


export default MarketingStrategyCard;