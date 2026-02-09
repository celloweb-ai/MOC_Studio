
import React, { useState, useRef, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MOCList from './components/MOCList';
import RiskMatrix from './components/RiskMatrix';
import AIChatAssistant from './components/AIChatAssistant';
import FacilityMap from './components/FacilityMap';
import AssetInventory from './components/AssetInventory';
import HelpCenter from './components/HelpCenter';
import UserManagement from './components/UserManagement';
import Login from './components/Auth/Login';
import NotificationPanel from './components/NotificationPanel';
import { Bell, Search, ChevronDown, Moon, Sun, Loader2 } from 'lucide-react';
import { TRANSLATIONS } from './constants';

const MainLayout: React.FC = () => {
  const { user, language, setLanguage, theme, setTheme, loading, notifications, emergencyWizardActive } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const t = TRANSLATIONS[language];
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Effect to switch to MOC tab when emergency wizard is activated
  useEffect(() => {
    if (emergencyWizardActive) {
      setActiveTab('mocs');
    }
  }, [emergencyWizardActive]);

  if (loading && !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="animate-spin text-blue-500" size={48} />
          <span className="text-blue-500 font-black tracking-widest text-xs uppercase animate-pulse">Initializing Ecosystem...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'mocs': return <MOCList />;
      case 'risk': return <RiskMatrix />;
      case 'ai': return <AIChatAssistant />;
      case 'facilities': return <FacilityMap />;
      case 'assets': return <AssetInventory />;
      case 'users': return <UserManagement />;
      case 'help': return <HelpCenter />;
      default: return <div className="text-white">Coming Soon: {activeTab}</div>;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      
      <main className="flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden">
        <header className="h-24 px-10 flex items-center justify-between border-b border-black/5 dark:border-white/5 glass-panel z-20">
          <div className="flex-1 flex items-center gap-6">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder={t.fullTextSearch.slice(0, 30) + '...'}
                  className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/5 rounded-2xl py-2.5 pl-12 pr-6 text-sm text-slate-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 w-80 transition-all"
                />
             </div>
          </div>

          <div className="flex items-center space-x-4 lg:space-x-6">
            {/* Theme Toggle */}
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl text-slate-600 dark:text-gray-400 border border-black/5 dark:border-white/5 transition-all"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-blue-600" />}
            </button>

            {/* Language Selector */}
            <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-black/5 dark:border-white/10">
               <button 
                 onClick={() => setLanguage('en-US')}
                 className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${language === 'en-US' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-slate-900 dark:hover:text-white'}`}
               >
                 EN
               </button>
               <button 
                 onClick={() => setLanguage('pt-BR')}
                 className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${language === 'pt-BR' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-slate-900 dark:hover:text-white'}`}
               >
                 BR
               </button>
            </div>

            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl text-slate-600 dark:text-gray-400 border border-black/5 dark:border-white/5 transition-all ${showNotifications ? 'bg-blue-600/10 text-blue-500' : ''}`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-50 dark:border-[#020617] animate-pulse"></span>
                )}
              </button>
              {showNotifications && <NotificationPanel onClose={() => setShowNotifications(false)} />}
            </div>

            <div className="flex items-center gap-3 pl-6 border-l border-black/10 dark:border-white/10 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">Operational Center</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-500 font-black uppercase tracking-tighter">System Online</div>
              </div>
              <ChevronDown className="text-gray-500 group-hover:text-slate-900 dark:group-hover:text-white transition-all" size={16} />
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar relative">
          <div className="text-slate-900 dark:text-white h-full">
            {renderContent()}
          </div>
        </section>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

export default App;
