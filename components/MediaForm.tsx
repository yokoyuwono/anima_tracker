import React, { useState } from 'react';
import { MediaItem, MediaType, MediaStatus } from '../types';
import { enrichMediaData } from '../services/geminiService';
import { Wand2, X, Save, Loader2, Minus, Plus, Star, Link as LinkIcon, AlertCircle, Trash2 } from 'lucide-react';

interface MediaFormProps {
  initialData?: MediaItem;
  onSave: (item: Omit<MediaItem, 'id' | 'updatedAt'>) => void;
  onDelete?: (id: string) => void;
  onCancel: () => void;
}

// Stepper component
const Stepper = ({ 
  value, 
  onChange, 
  label, 
  subLabel,
  max,
  isPrimary = false 
}: { 
  value: number, 
  onChange: (v: number) => void, 
  label: string, 
  subLabel?: string,
  max?: number,
  isPrimary?: boolean
}) => (
  <div className="flex flex-col gap-2">
    <div className="flex justify-between items-end px-1">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</label>
      {subLabel && <span className="text-[10px] text-slate-500 font-medium">{subLabel}</span>}
    </div>
    
    <div className={`flex items-center p-1 rounded-xl border transition-all ${
      isPrimary 
        ? 'bg-slate-800 border-indigo-500/50 shadow-lg shadow-indigo-900/10 focus-within:border-indigo-400' 
        : 'bg-slate-800 border-slate-700 focus-within:border-slate-500'
    }`}>
      <button 
        type="button" 
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-14 h-12 flex-shrink-0 flex items-center justify-center bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg active:scale-95 transition-transform"
      >
        <Minus size={22} strokeWidth={2.5} />
      </button>
      
      <input 
        type="number" 
        inputMode="numeric"
        className="flex-1 bg-transparent text-center text-3xl font-bold text-white focus:outline-none appearance-none px-2 font-mono min-w-0"
        value={value === 0 ? '' : value}
        placeholder="0"
        onChange={(e) => {
          const val = e.target.value === '' ? 0 : parseInt(e.target.value);
          if (!isNaN(val)) onChange(val);
        }}
        onFocus={(e) => e.target.select()}
      />
      
      <button 
        type="button" 
        onClick={() => onChange(max ? Math.min(max, value + 1) : value + 1)}
        className={`w-14 h-12 flex-shrink-0 flex items-center justify-center rounded-lg active:scale-95 transition-transform shadow-lg ${
          isPrimary 
            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/30' 
            : 'bg-slate-600 hover:bg-slate-500 text-white'
        }`}
      >
        <Plus size={22} strokeWidth={2.5} />
      </button>
    </div>
  </div>
);

export const MediaForm: React.FC<MediaFormProps> = ({ initialData, onSave, onDelete, onCancel }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [type, setType] = useState<MediaType>(initialData?.type || MediaType.ANIME);
  const [status, setStatus] = useState<MediaStatus>(initialData?.status || MediaStatus.CURRENT);
  const [currentProgress, setCurrentProgress] = useState(initialData?.currentProgress || 0);
  const [totalProgress, setTotalProgress] = useState(initialData?.totalProgress || 0);
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [description, setDescription] = useState(initialData?.description || '');
  const [link, setLink] = useState(initialData?.link || '');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  
  const [isEnriching, setIsEnriching] = useState(false);
  
  const handleEnrich = async () => {
    if (!title) return;
    setIsEnriching(true);
    const data = await enrichMediaData(title, type);
    if (data) {
      setDescription(data.description);
      if (data.totalEpisodesOrChapters) setTotalProgress(data.totalEpisodesOrChapters);
    }
    setIsEnriching(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      type,
      status,
      currentProgress,
      totalProgress,
      rating,
      description,
      link,
      imageUrl
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-0 sm:p-4 sm:items-center">
      <div className="bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl border-t sm:border border-slate-700 shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-slide-up">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center shrink-0">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            {initialData ? 'Edit Entri' : 'Tambah Baru'}
          </h2>
          <button onClick={onCancel} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto pb-safe scrollbar-thin scrollbar-thumb-slate-700">
          <div className="space-y-6">
            
            {/* Title Input */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Judul</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  autoFocus={!initialData}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="Judul Anime/Manga..."
                />
                <button
                  type="button"
                  onClick={handleEnrich}
                  disabled={isEnriching || !title}
                  className="bg-indigo-900/30 text-indigo-300 border border-indigo-500/30 px-4 rounded-xl flex flex-col items-center justify-center gap-1 min-w-[64px] hover:bg-indigo-900/50 transition-colors"
                >
                  {isEnriching ? <Loader2 size={20} className="animate-spin" /> : <Wand2 size={20} />}
                  <span className="text-[10px] font-bold">INFO</span>
                </button>
              </div>
            </div>

            {/* Manual Image URL Input with Preview */}
            <div>
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Link Gambar Cover</label>
               <div className="flex flex-col gap-3">
                 <div className="relative">
                    <LinkIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                      placeholder="https://example.com/poster.jpg"
                    />
                 </div>
                 
                 {/* Live Preview */}
                 {imageUrl && (
                    <div className="flex items-start gap-4 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                       <div className="w-16 h-24 shrink-0 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 shadow-sm relative">
                          <img 
                            src={imageUrl} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                                const icon = document.createElement('div');
                                icon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
                                e.currentTarget.parentElement?.appendChild(icon);
                            }} 
                          />
                       </div>
                       <div className="flex-1 min-w-0 pt-1">
                          <p className="text-xs font-bold text-slate-300 mb-1">Preview Cover</p>
                          <p className="text-[10px] text-slate-500 line-clamp-2 break-all">{imageUrl}</p>
                       </div>
                    </div>
                 )}
               </div>
            </div>

            {/* Type & Status Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tipe</label>
                <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
                  {Object.values(MediaType).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                        type === t 
                          ? 'bg-slate-700 text-white shadow-sm' 
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as MediaStatus)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none text-sm font-medium"
                >
                  {Object.values(MediaStatus).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Progress Steppers */}
            <div className="grid grid-cols-2 gap-4">
               <Stepper 
                  label="Progres" 
                  value={currentProgress} 
                  onChange={setCurrentProgress}
                  subLabel={type === MediaType.ANIME ? 'Episode' : 'Chapter'}
                  isPrimary={true}
                  max={totalProgress || undefined}
               />
               <Stepper 
                  label="Total" 
                  value={totalProgress} 
                  onChange={setTotalProgress}
                  subLabel="Estimasi"
               />
            </div>

            {/* Rating Slider */}
            <div>
              <div className="flex justify-between items-end mb-2">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rating</label>
                 <span className="flex items-center gap-1 text-yellow-400 font-bold text-lg">
                    <Star size={16} fill="currentColor" /> {rating}
                 </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={rating}
                onChange={(e) => setRating(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-600 font-mono mt-1 px-1">
                <span>0</span><span>5</span><span>10</span>
              </div>
            </div>

            {/* Link Input */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Link Baca / Nonton</label>
              <div className="relative">
                <LinkIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Catatan / Sinopsis</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                placeholder="Tulis catatan..."
              />
            </div>

          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-3 pt-4 border-t border-slate-800">
            {initialData && onDelete && (
               <button
                 type="button"
                 onClick={() => onDelete(initialData.id)}
                 className="flex-none w-14 h-14 flex items-center justify-center bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500/20 transition-colors"
               >
                 <Trash2 size={24} />
               </button>
            )}
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white h-14 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-900/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Save size={20} />
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};