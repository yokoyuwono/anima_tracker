import React, { useState, useEffect } from 'react';
import { MediaItem, MediaType } from '../types';
import { STATUS_COLORS, MOCK_COVER_IMAGE } from '../constants';
import { Star, Tv, BookOpen, Plus, ExternalLink, Calendar } from 'lucide-react';

interface MediaCardProps {
  item: MediaItem;
  onEdit: (item: MediaItem) => void;
  onQuickUpdate: (item: MediaItem) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({ item, onEdit, onQuickUpdate }) => {
  const percent = item.totalProgress && item.totalProgress > 0 
    ? Math.min(100, Math.round((item.currentProgress / item.totalProgress) * 100))
    : 0;

  const isCompleted = item.currentProgress >= (item.totalProgress || 9999);
  
  // Image handling
  const [imgSrc, setImgSrc] = useState(item.imageUrl || MOCK_COVER_IMAGE);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(item.imageUrl || MOCK_COVER_IMAGE);
    setHasError(false);
  }, [item.imageUrl]);

  const handleImageError = () => {
    if (!hasError) {
      setImgSrc(MOCK_COVER_IMAGE);
      setHasError(true);
    }
  };

  const isAnime = item.type === MediaType.ANIME;
  
  // Date formatting
  const lastUpdate = new Date(item.updatedAt).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short'
  });

  return (
    <div className={`relative group flex flex-col overflow-hidden transition-all duration-300 ${
      isAnime 
        ? 'rounded-2xl bg-slate-800 shadow-lg shadow-indigo-900/10' 
        : 'rounded-r-2xl rounded-l-md bg-slate-800 border-l-4 border-orange-500 shadow-lg shadow-orange-900/10'
    }`}>
      
      {/* Poster Image Area - Click to Edit */}
      <div 
        onClick={() => onEdit(item)}
        className="relative aspect-[3/4] overflow-hidden bg-slate-900 cursor-pointer active:opacity-90 transition-opacity"
      >
        <img 
          src={imgSrc} 
          alt={item.title}
          onError={handleImageError} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-90" />

        {/* Top Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
           <div className={`text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm backdrop-blur-md ${STATUS_COLORS[item.status]} bg-opacity-90`}>
             {item.status}
           </div>
        </div>
        
        {/* Last Updated Badge (Left) */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-[10px] text-slate-300 font-medium shadow-sm">
            <Calendar size={10} className="text-slate-400" />
            {lastUpdate}
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col gap-1">
           {/* Title */}
           <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 drop-shadow-md">
             {item.title}
           </h3>

           {/* Progress Info */}
           <div className="flex items-center justify-between text-xs text-slate-300 mt-1">
              <div className="flex items-center gap-1.5">
                 {isAnime ? <Tv size={12} className="text-indigo-400" /> : <BookOpen size={12} className="text-orange-400" />}
                 <span className="font-mono font-medium">
                    {item.currentProgress}
                    <span className="text-slate-500">/{item.totalProgress || '?'}</span>
                 </span>
              </div>
              <div className="flex items-center gap-1 text-yellow-400 font-bold">
                 <Star size={10} fill="currentColor" /> {item.rating}
              </div>
           </div>

           {/* Progress Bar */}
           <div className="w-full h-1 bg-slate-700/50 rounded-full overflow-hidden mt-1 backdrop-blur-sm">
              <div 
                 className={`h-full rounded-full ${isCompleted ? 'bg-green-500' : isAnime ? 'bg-indigo-500' : 'bg-orange-500'}`} 
                 style={{ width: `${percent}%` }}
              />
           </div>
        </div>
      </div>

      {/* Action Strip (Bottom) */}
      <div className="flex items-center gap-2 p-2 border-t border-slate-700/50 bg-slate-800/95 backdrop-blur-sm">
         <button 
           onClick={(e) => {
             e.stopPropagation();
             onQuickUpdate(item);
           }}
           disabled={isCompleted}
           className={`flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-sm font-bold transition-colors shadow-sm active:scale-95 ${
             isCompleted 
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                : isAnime 
                   ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20' 
                   : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-900/20'
           }`}
         >
           <Plus size={18} strokeWidth={3} />
           {isAnime ? 'Ep' : 'Ch'}
         </button>
         
         {item.link && (
            <a
               href={item.link}
               target="_blank"
               rel="noopener noreferrer"
               className="h-10 w-10 flex items-center justify-center text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 rounded-xl transition-colors bg-slate-700/20 active:scale-95"
               title="Buka Link"
               onClick={(e) => e.stopPropagation()}
            >
               <ExternalLink size={20} />
            </a>
         )}
      </div>
    </div>
  );
};