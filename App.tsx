import React, { useState, useEffect } from 'react';
import { Plus, Book, Tv, BarChart3, Search, Home } from 'lucide-react';
import { MediaItem, MediaType } from './types';
import { saveItems, getStoredItems } from './services/storageService';
import { MediaCard } from './components/MediaCard';
import { MediaForm } from './components/MediaForm';
import { StatsView } from './components/StatsView';

function App() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [activeTab, setActiveTab] = useState<'HOME' | MediaType | 'STATS'>('HOME');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  
  useEffect(() => {
    setItems(getStoredItems());
  }, []);

  const saveToStorage = (newItems: MediaItem[]) => {
    setItems(newItems);
    saveItems(newItems);
  };

  const handleSaveItem = (itemData: Omit<MediaItem, 'id' | 'updatedAt'>) => {
    const newItem: MediaItem = {
      ...itemData,
      id: editingItem ? editingItem.id : crypto.randomUUID(),
      updatedAt: Date.now(),
      // imageUrl is now correctly included in ...itemData from the form
    };

    let newItems;
    if (editingItem) {
      newItems = items.map(i => i.id === editingItem.id ? newItem : i);
    } else {
      newItems = [newItem, ...items];
    }
    
    saveToStorage(newItems);
    setShowForm(false);
    setEditingItem(undefined);
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('Hapus item ini?')) {
      const newItems = items.filter(i => i.id !== id);
      saveToStorage(newItems);
      setShowForm(false); // Close form if deleting from form
    }
  };

  const handleQuickUpdate = (item: MediaItem) => {
    const updatedItem = {
      ...item,
      currentProgress: item.currentProgress + 1,
      updatedAt: Date.now()
    };
    const newItems = items.map(i => i.id === item.id ? updatedItem : i);
    saveToStorage(newItems);
  };

  const handleEditItem = (item: MediaItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  // Filter Logic
  const filteredItems = items.filter(item => {
    // If Tab is HOME, show everything unless searching? Or just Show All. 
    // Let's make HOME show All, and other tabs filter.
    const matchesTab = activeTab === 'HOME' || activeTab === 'STATS' || item.type === activeTab;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      
      {/* Top Bar - Minimalist */}
      <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/30">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          {!isSearchVisible && (
             <h1 className="text-xl font-bold tracking-tight">AniManga</h1>
          )}
        </div>
        
        <div className={`flex items-center gap-3 ${isSearchVisible ? 'flex-1 ml-4' : ''}`}>
           {isSearchVisible ? (
             <div className="relative flex-1 animate-fade-in">
               <input 
                 autoFocus
                 type="text" 
                 placeholder="Cari..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 onBlur={() => !searchTerm && setIsSearchVisible(false)}
                 className="w-full bg-slate-800 border-none rounded-xl py-2.5 px-4 text-base focus:ring-2 focus:ring-indigo-500"
               />
               <button onClick={() => {setSearchTerm(''); setIsSearchVisible(false)}} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                 <Plus size={18} className="rotate-45" />
               </button>
             </div>
           ) : (
             <>
                <button 
                  onClick={() => setIsSearchVisible(true)} 
                  className="p-2.5 bg-slate-800 rounded-xl text-slate-300 hover:text-white"
                >
                  <Search size={22} />
                </button>
             </>
           )}
        </div>
      </header>

      {/* Main Scrollable Content */}
      <main className="px-4 py-6 pb-32 max-w-2xl mx-auto">
        {activeTab === 'STATS' ? (
          <StatsView items={items} />
        ) : (
          <>
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-50">
                <Book size={48} className="mb-4 text-slate-600" />
                <p>Belum ada koleksi.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {filteredItems.map(item => (
                  <MediaCard 
                    key={item.id} 
                    item={item} 
                    onEdit={handleEditItem}
                    onQuickUpdate={handleQuickUpdate}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Action Button (FAB) */}
      <button 
        onClick={() => { setEditingItem(undefined); setShowForm(true); }}
        className="fixed bottom-24 right-5 z-40 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl shadow-indigo-600/40 flex items-center justify-center active:scale-90 transition-transform"
      >
        <Plus size={28} />
      </button>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 pb-safe z-30">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          <NavButton 
            active={activeTab === 'HOME'} 
            onClick={() => setActiveTab('HOME')} 
            icon={<Home size={24} />} 
            label="Semua" 
          />
          <NavButton 
            active={activeTab === MediaType.ANIME} 
            onClick={() => setActiveTab(MediaType.ANIME)} 
            icon={<Tv size={24} />} 
            label="Anime" 
          />
          <NavButton 
            active={activeTab === MediaType.MANGA} 
            onClick={() => setActiveTab(MediaType.MANGA)} 
            icon={<Book size={24} />} 
            label="Manga" 
          />
           <NavButton 
            active={activeTab === 'STATS'} 
            onClick={() => setActiveTab('STATS')} 
            icon={<BarChart3 size={24} />} 
            label="Stats" 
          />
        </div>
      </nav>

      {/* Forms & Modals */}
      {showForm && (
        <MediaForm 
          initialData={editingItem}
          onSave={handleSaveItem}
          onDelete={editingItem ? handleDeleteItem : undefined}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

// Nav Button Helper
const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${active ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
  >
    <div className={`transition-transform duration-200 ${active ? '-translate-y-1' : ''}`}>
      {icon}
    </div>
    <span className={`text-[10px] font-medium ${active ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
  </button>
);

export default App;