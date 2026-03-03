
import React, { useState, useRef } from 'react';
import {
  Plus,
  Trash2,
  Download,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Type as TypeIcon,
  Image as ImageIcon,
  Settings,
  Palette,
  Code,
  RotateCcw,
  Upload,
  X,
  Check,
  Loader2
} from 'lucide-react';
import { SlideData } from './types';
import { INITIAL_SLIDE } from './constants';
import { SlideCanvas } from './components/SlideCanvas';
import { generateCarouselContent } from './services/geminiService';
import * as htmlToImage from 'html-to-image';

const CSS_SNIPPETS = [
  { name: 'ذهبي فاخر', code: '.poster-highlight { text-shadow: 0 4px 10px rgba(218,165,32,0.4); border: 2px solid #DAA520; padding: 10px; border-radius: 12px; }' },
  { name: 'عنوان مفرغ', code: '.poster-headline { -webkit-text-stroke: 1px #006B3D; color: transparent; }' },
  { name: 'حاوية زجاجية', code: '.poster-root { background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%) !important; } .poster-point { background: rgba(255,255,255,0.4); backdrop-filter: blur(10px); }' },
  { name: 'بدون نقش', code: '.decorative-bg { display: none; }' },
  { name: 'صورة دائرية', code: '.poster-image-container { border-radius: 999px; width: 180px; height: 180px; margin: 0 auto; }' },
  { name: 'تدرج ريترو', code: '.poster-root { background: #fff5e6 !important; } .poster-headline { color: #ff4d4d; } .poster-highlight { color: #2d5a27; }' }
];

const PRESET_THEMES = [
  { name: 'كحلي المستثمر', primary: '#0f172a', secondary: '#0ea5e9', bg: '#ffffff', text: '#1a1a1a', iconPrimary: '#0ea5e9', iconSecondary: '#0f172a' },
  { name: 'الأحمر الصيني', primary: '#991b1b', secondary: '#f59e0b', bg: '#fffdf5', text: '#1a1a1a', iconPrimary: '#f59e0b', iconSecondary: '#991b1b' },
  { name: 'سيان الابتكار', primary: '#0891b2', secondary: '#1e293b', bg: '#f0f9ff', text: '#1e293b', iconPrimary: '#1e293b', iconSecondary: '#0891b2' },
  { name: 'فوشيا التحليل', primary: '#d946ef', secondary: '#3b82f6', bg: '#ffffff', text: '#1a1a1a', iconPrimary: '#3b82f6', iconSecondary: '#d946ef' },
  { name: 'برتقالي الحركة', primary: '#ea580c', secondary: '#fbbf24', bg: '#fff7ed', text: '#431407', iconPrimary: '#fbbf24', iconSecondary: '#ea580c' },
  { name: 'لايم النمو', primary: '#84cc16', secondary: '#0284c7', bg: '#f7fee7', text: '#14532d', iconPrimary: '#0284c7', iconSecondary: '#84cc16' },
  { name: 'بنفسجي العمق', primary: '#7c3aed', secondary: '#2563eb', bg: '#ffffff', text: '#1e1b4b', iconPrimary: '#2563eb', iconSecondary: '#7c3aed' },
  { name: 'الوضع الداكن', primary: '#14b8a6', secondary: '#0f172a', bg: '#0f172a', text: '#f1f5f9', iconPrimary: '#2dd4bf', iconSecondary: '#0f172a' }
];

const App: React.FC = () => {
  const [slides, setSlides] = useState<SlideData[]>([{ ...INITIAL_SLIDE }]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'ai' | 'text' | 'design' | 'custom'>('ai');
  const logoInputRef = useRef<HTMLInputElement>(null);
  const footerLogoInputRef = useRef<HTMLInputElement>(null);

  const currentSlide = slides[currentIndex];

  const updateSlide = (updates: Partial<SlideData>) => {
    const newSlides = [...slides];
    newSlides[currentIndex] = { ...currentSlide, ...updates };
    setSlides(newSlides);
  };

  const addSlide = () => {
    const newSlide = { ...INITIAL_SLIDE, id: Date.now().toString() };
    setSlides([...slides, newSlide]);
    setCurrentIndex(slides.length);
  };

  const removeSlide = (index: number) => {
    if (slides.length <= 1) return;
    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides);
    setCurrentIndex(Math.max(0, index - 1));
  };

  const applySnippet = (code: string) => {
    const currentCss = currentSlide.customCss || '';
    updateSlide({ customCss: currentCss + '\n' + code });
  };

  const applyTheme = (theme: typeof PRESET_THEMES[0]) => {
    updateSlide({
      primaryColor: theme.primary,
      secondaryColor: theme.secondary,
      backgroundColor: theme.bg,
      textColor: theme.text
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSlide({ logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFooterLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSlide({ footerLogoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const data = await generateCarouselContent(aiPrompt);
      const generatedSlides = data.slides.map((s: any, idx: number) => ({
        ...INITIAL_SLIDE,
        id: `ai-${Date.now()}-${idx}`,
        header: s.header,
        highlightedHeader: s.highlightedHeader,
        subHeader: s.subHeader,
        points: s.points.map((p: any, pIdx: number) => ({
          id: `p-${pIdx}`,
          title: p.title,
          icon: p.icon
        }))
      }));
      setSlides(generatedSlides);
      setCurrentIndex(0);
    } catch (error) {
      console.error("AI Generation failed:", error);
      alert("عذراً، فشل توليد المحتوى.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    const element = document.getElementById(`slide-export-container-${currentSlide.id}`);
    if (!element) return;

    setIsExporting(true);
    try {
      // نستخدم pixelRatio 3 لضمان دقة عالية جداً
      // نستخدم خيارات إضافية لتجاوز مشاكل الأنماط الخارجية
      const dataUrl = await htmlToImage.toPng(element, {
        pixelRatio: 3,
        cacheBust: true,
        skipFonts: false, // سنحاول تضمينها لأننا أصلحنا CORS في index.html
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });

      const link = document.createElement('a');
      link.download = `slide-${currentIndex + 1}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error: any) {
      console.error("Export failed:", error);
      // محاولة تصدير بديلة في حال فشل الخطوط
      try {
        const fallbackUrl = await htmlToImage.toPng(element, { pixelRatio: 2, skipFonts: true });
        const link = document.createElement('a');
        link.download = `slide-${currentIndex + 1}-fallback.png`;
        link.href = fallbackUrl;
        link.click();
        alert("تم التصدير بنجاح (بدون بعض التنسيقات الخارجية).");
      } catch (e) {
        alert("فشل تصدير الصورة، يرجى التأكد من اتصال الإنترنت.");
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col md:flex-row h-screen overflow-hidden font-[IBM Plex Sans Arabic]" dir="rtl">

      {/* Sidebar */}
      <div className="w-full md:w-[400px] bg-[#1e293b] border-l border-slate-700 flex flex-col overflow-hidden z-20 shadow-2xl">

        {/* Tabs Header */}
        <div className="flex border-b border-slate-700 bg-[#111827]">
          {[
            { id: 'ai', icon: Sparkles, label: 'الذكاء' },
            { id: 'text', icon: TypeIcon, label: 'النصوص' },
            { id: 'design', icon: Palette, label: 'الألوان' },
            { id: 'custom', icon: Code, label: 'تخصيص' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex flex-col items-center py-4 gap-1 transition-all ${activeTab === tab.id
                ? 'bg-[#1e293b] text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-500 hover:text-slate-300'
                }`}
            >
              <tab.icon size={20} />
              <span className="text-[10px] font-[700] uppercase">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="flex-grow overflow-y-auto p-6 scrollbar-hide space-y-8">

          {/* AI TAB */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="p-4 bg-cyan-900/20 rounded-xl border border-cyan-500/30">
                <h3 className="text-cyan-400 font-[700] mb-3 flex items-center gap-2">
                  <Sparkles size={16} /> توليد محتوى ذكي
                </h3>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="مثال: فوائد التمور السعودية، شروط دعم ريف..."
                  className="w-full p-3 rounded-lg bg-slate-800 border border-slate-600 text-white text-sm min-h-[100px] focus:border-cyan-500 outline-none font-[400]"
                />
                <button
                  onClick={handleAiGenerate}
                  disabled={isGenerating}
                  className="w-full mt-4 bg-cyan-600 hover:bg-cyan-500 text-white font-[700] py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-cyan-900/20"
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={20} /> : 'توليد بالذكاء الاصطناعي'}
                </button>
              </div>
            </div>
          )}

          {/* TEXT TAB */}
          {activeTab === 'text' && (
            <div className="space-y-6">
              <h3 className="text-slate-300 font-[700] mb-4">تعديل النصوص</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block font-[500]">العنوان الرئيسي</label>
                  <input type="text" value={currentSlide.header} onChange={(e) => updateSlide({ header: e.target.value })} className="w-full p-2.5 bg-slate-800 border border-slate-600 rounded text-slate-200 outline-none focus:border-cyan-500 font-[400]" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block font-[500]">الكلمة المميزة (ذهبي)</label>
                  <input type="text" value={currentSlide.highlightedHeader} onChange={(e) => updateSlide({ highlightedHeader: e.target.value })} className="w-full p-2.5 bg-slate-800 border border-slate-600 rounded text-slate-200 outline-none focus:border-cyan-500 font-[400]" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block font-[500]">العنوان الفرعي</label>
                  <input type="text" value={currentSlide.subHeader} onChange={(e) => updateSlide({ subHeader: e.target.value })} className="w-full p-2.5 bg-slate-800 border border-slate-600 rounded text-slate-200 outline-none focus:border-cyan-500 font-[400]" />
                </div>

                {/* النقاط */}
                <div className="pt-4 border-t border-slate-700">
                  <label className="text-xs text-slate-500 mb-3 block font-[700]">عناصر القائمة (النقاط)</label>
                  {currentSlide.points.map((point, index) => (
                    <div key={point.id} className="mb-3">
                      <input
                        type="text"
                        value={point.title}
                        onChange={(e) => {
                          const newPoints = [...currentSlide.points];
                          newPoints[index] = { ...newPoints[index], title: e.target.value };
                          updateSlide({ points: newPoints });
                        }}
                        className="w-full p-2.5 bg-slate-800 border border-slate-600 rounded text-slate-200 outline-none focus:border-cyan-500 font-[400] text-sm"
                        placeholder={`النقطة ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>

                {/* الشعار السفلي النصي */}
                <div className="pt-4 border-t border-slate-700">
                  <label className="text-xs text-slate-500 mb-3 block font-[700]">الشعار سفلي النصي</label>
                  <input
                    type="text"
                    value={currentSlide.footerLogoText !== undefined ? currentSlide.footerLogoText : 'منصة المستثمر الاقتصادية'}
                    onChange={(e) => updateSlide({ footerLogoText: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-600 rounded text-slate-200 outline-none focus:border-cyan-500 font-[400]"
                  />
                  <p className="text-[10px] text-slate-500 mt-2">يظهر فقط إذا لم يتم رفع شعار سفلي في قسم "تخصيص".</p>
                </div>
              </div>
            </div>
          )}

          {/* DESIGN/COLORS TAB */}
          {activeTab === 'design' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
              <div>
                <h3 className="text-slate-400 font-[700] text-sm mb-4">الثيمات الجاهزة</h3>
                <div className="grid grid-cols-2 gap-3">
                  {PRESET_THEMES.map((theme) => (
                    <button
                      key={theme.name}
                      onClick={() => applyTheme(theme)}
                      className={`relative p-3 rounded-xl border transition-all text-right flex flex-col gap-3 group ${currentSlide.primaryColor === theme.primary
                        ? 'border-cyan-500 bg-slate-800 shadow-lg shadow-cyan-900/10'
                        : 'border-slate-700 bg-slate-800/40 hover:border-slate-500'
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex -space-x-1 rtl:space-x-reverse">
                          <div className="w-4 h-4 rounded-full border border-slate-900" style={{ backgroundColor: theme.primary }}></div>
                          <div className="w-4 h-4 rounded-full border border-slate-900" style={{ backgroundColor: theme.secondary }}></div>
                        </div>
                        {currentSlide.primaryColor === theme.primary && <Check size={12} className="text-cyan-400" />}
                      </div>
                      <div>
                        <span className="text-[11px] font-[700] text-slate-300 block mb-1">{theme.name}</span>
                        <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden flex">
                          <div className="h-full" style={{ backgroundColor: theme.primary, width: '40%' }}></div>
                          <div className="h-full opacity-30" style={{ backgroundColor: theme.bg, width: '60%' }}></div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <h3 className="text-slate-400 font-[700] text-sm mb-4">تخصيص الألوان</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] text-slate-500 font-[700]">الأساسي</label>
                    <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-lg border border-slate-700">
                      <input type="color" value={currentSlide.primaryColor} onChange={(e) => updateSlide({ primaryColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
                      <span className="text-[10px] text-slate-400 font-mono uppercase">{currentSlide.primaryColor}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] text-slate-500 font-[700]">الثانوي</label>
                    <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-lg border border-slate-700">
                      <input type="color" value={currentSlide.secondaryColor} onChange={(e) => updateSlide({ secondaryColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
                      <span className="text-[10px] text-slate-400 font-mono uppercase">{currentSlide.secondaryColor}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] text-slate-500 font-[700]">الخلفية</label>
                    <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-lg border border-slate-700">
                      <input type="color" value={currentSlide.backgroundColor} onChange={(e) => updateSlide({ backgroundColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
                      <span className="text-[10px] text-slate-400 font-mono uppercase">{currentSlide.backgroundColor}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] text-slate-500 font-[700]">النصوص</label>
                    <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-lg border border-slate-700">
                      <input type="color" value={currentSlide.textColor} onChange={(e) => updateSlide({ textColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
                      <span className="text-[10px] text-slate-400 font-mono uppercase">{currentSlide.textColor}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <label className="text-xs text-slate-400 mb-3 block font-[700] uppercase tracking-wider">شعارك الخاص (أعلى)</label>
                <div className="flex items-center gap-4">
                  {currentSlide.logoUrl ? (
                    <div className="relative group w-16 h-16 bg-slate-900 rounded-lg overflow-hidden border border-slate-600 flex items-center justify-center p-2">
                      <img src={currentSlide.logoUrl} className="max-w-full max-h-full object-contain" alt="Current Logo" />
                      <button onClick={() => updateSlide({ logoUrl: undefined })} className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                        <X size={20} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => logoInputRef.current?.click()} className="w-16 h-16 bg-slate-900 rounded-lg border-2 border-dashed border-slate-600 flex items-center justify-center text-slate-500 hover:text-cyan-400 hover:border-cyan-500 transition-all">
                      <Plus size={24} />
                    </button>
                  )}
                  <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700 mt-4">
                <label className="text-xs text-slate-400 mb-3 block font-[700] uppercase tracking-wider">شعار السفلي (جانب مواقع التواصل)</label>
                <div className="flex items-center gap-4">
                  {currentSlide.footerLogoUrl ? (
                    <div className="relative group w-16 h-16 bg-slate-900 rounded-lg overflow-hidden border border-slate-600 flex items-center justify-center p-2">
                      <img src={currentSlide.footerLogoUrl} className="max-w-full max-h-full object-contain" alt="Footer Logo" />
                      <button onClick={() => updateSlide({ footerLogoUrl: undefined })} className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                        <X size={20} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => footerLogoInputRef.current?.click()} className="w-16 h-16 bg-slate-900 rounded-lg border-2 border-dashed border-slate-600 flex items-center justify-center text-slate-500 hover:text-cyan-400 hover:border-cyan-500 transition-all">
                      <Plus size={24} />
                    </button>
                  )}
                  <input type="file" ref={footerLogoInputRef} onChange={handleFooterLogoUpload} accept="image/*" className="hidden" />
                </div>
              </div>
            </div>
          )}

          {/* CUSTOM TAB */}
          {activeTab === 'custom' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-cyan-400 font-[700] mb-4 flex items-center justify-between">قوالب جاهزة (SNIPPETS)</h3>
                <div className="grid grid-cols-2 gap-3">
                  {CSS_SNIPPETS.map((snippet) => (
                    <button
                      key={snippet.name}
                      onClick={() => applySnippet(snippet.code)}
                      className="bg-slate-800/50 hover:bg-slate-700 border border-slate-700 text-slate-300 py-3 px-2 rounded-lg text-xs font-[700] transition-all text-right flex items-center gap-2 group"
                    >
                      <span className="text-cyan-500 group-hover:scale-125 transition-transform">+</span>
                      {snippet.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-cyan-400 font-[700] mb-2">محرر CSS المتقدم</h3>
                <div className="relative">
                  <textarea
                    value={currentSlide.customCss || ''}
                    onChange={(e) => updateSlide({ customCss: e.target.value })}
                    placeholder="...تخصيص التصميم عبر CSS"
                    className="w-full h-[250px] p-4 bg-[#0a0f1c] border border-slate-700 rounded-xl text-cyan-500 font-mono text-xs focus:ring-2 focus:ring-cyan-500 outline-none resize-none"
                    dir="ltr"
                  />
                </div>
                <button
                  onClick={() => updateSlide({ customCss: '' })}
                  className="w-full mt-4 bg-slate-800 hover:bg-slate-700 text-slate-400 py-3 rounded-lg text-xs font-[700] flex items-center justify-center gap-2 border border-slate-700"
                >
                  <RotateCcw size={14} /> إعادة تعيين CSS
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-[#111827] border-t border-slate-700">
          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-[700] py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-cyan-900/20 disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
            {isExporting ? 'جاري التصدير...' : 'تحميل الصور النهائية'}
          </button>
        </div>
      </div>

      {/* Main Workspace (Preview) */}
      <div className="flex-grow flex flex-col items-center bg-[#0a0f1c] overflow-y-auto p-4 md:p-12 relative scrollbar-hide">
        {/* Background Gradients */}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-cyan-900/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-emerald-900/10 blur-[100px] rounded-full pointer-events-none"></div>

        {/* Slide Controls Top */}
        <div className="w-full max-w-[420px] flex justify-between items-center mb-6 z-10 sticky top-0 bg-[#0a0f1c]/80 backdrop-blur-md py-4">
          <div className="flex items-center gap-4">
            <span className="text-xs font-[700] text-slate-500 uppercase tracking-widest">الشريحة {currentIndex + 1}</span>
            <div className="flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${currentIndex === i ? 'bg-cyan-400 w-6' : 'bg-slate-700'}`}
                />
              ))}
              <button onClick={addSlide} className="w-5 h-5 flex items-center justify-center bg-slate-800 rounded text-slate-400 hover:text-cyan-400 border border-slate-700">
                <Plus size={12} />
              </button>
            </div>
          </div>
          <button onClick={() => removeSlide(currentIndex)} className="text-slate-500 hover:text-red-400 transition-colors">
            <Trash2 size={18} />
          </button>
        </div>

        {/* Preview Container */}
        <div className="w-full max-w-[420px] relative z-10 group mb-12">
          {/* Navigation Arrows (Desktop) */}
          <button onClick={() => setCurrentIndex(p => Math.max(0, p - 1))} disabled={currentIndex === 0} className="fixed top-1/2 right-[420px] md:right-[calc(50%+230px)] -translate-y-1/2 p-4 bg-[#1e293b] text-white rounded-full shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity disabled:hidden border border-slate-700 hidden lg:flex">
            <ChevronRight size={24} />
          </button>
          <button onClick={() => setCurrentIndex(p => Math.min(slides.length - 1, p + 1))} disabled={currentIndex === slides.length - 1} className="fixed top-1/2 left-[calc(50%-230px)] md:left-24 lg:left-[calc(50%-630px)] -translate-y-1/2 p-4 bg-[#1e293b] text-white rounded-full shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity disabled:hidden border border-slate-700 hidden lg:flex">
            <ChevronLeft size={24} />
          </button>

          {/* THE CANVAS */}
          <div className="w-full  shadow-[0_0_80px_rgba(0,0,0,0.6)]  overflow-hidden border border-slate-800 ring-8 ring-slate-900/50">
            <SlideCanvas data={currentSlide} onUpdate={updateSlide} />
          </div>
        </div>

        <p className="mb-12 text-slate-600 text-[10px] font-[700] uppercase tracking-[0.3em] z-10 text-center">
          دقة عالية • 1080 × 1920 • معاينة واقعية • {isExporting ? 'جاري المعالجة...' : 'جاهز للتصدير'}
        </p>
      </div>
    </div>
  );
};

export default App;