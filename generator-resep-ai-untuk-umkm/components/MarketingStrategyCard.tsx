import React from 'react';
import { MarketingStrategy } from '../types';

interface MarketingStrategyCardProps {
  strategy: MarketingStrategy;
}

const SectionTitle: React.FC<{ icon: React.ReactNode; children: React.ReactNode; className?: string }> = ({ icon, children, className = '' }) => (
  <h3 className={`text-lg font-bold text-slate-800 mb-3 flex items-center border-b border-gray-300 pb-1 ${className}`} style={{fontFamily: "'Playfair Display', serif"}}>
    <span className="mr-2 text-brand-primary">{icon}</span>
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

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden animate-fade-in border border-gray-200 p-4">
      <h2 className="text-xl font-bold text-slate-800 text-center mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
        Strategi Pemasaran
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


export default MarketingStrategyCard;