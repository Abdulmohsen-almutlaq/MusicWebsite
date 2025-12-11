import { Home, Search, Library, PlusSquare, LogOut, User, Settings, Users, Mic2, X, Shield } from 'lucide-react';

export default function Sidebar({ activeView, setView, logout, isOpen, setIsOpen, user }) {
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'artists', label: 'Artists', icon: Mic2 },
    { id: 'social', label: 'Community', icon: Users },
    { id: 'library', label: 'Your Library', icon: Library },
    { id: 'upload', label: 'Upload Track', icon: PlusSquare },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (user && user.role === 'admin') {
    menuItems.push({ id: 'admin', label: 'Admin Dashboard', icon: Shield });
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-brand-dark/95 backdrop-blur-xl h-full flex flex-col text-brand-light px-5 pt-5 pb-24 md:pb-5 border-r border-white/5 shadow-2xl
        transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="mb-8 flex items-center justify-between px-2 mt-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-beige to-brand-medium rounded-lg shadow-lg shadow-brand-beige/20"></div>
            <h1 className="text-xl font-bold text-brand-beige tracking-wide">6rabyat</h1>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden text-brand-light hover:text-brand-beige transition-colors p-1 hover:bg-white/5 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-hide">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive 
                    ? 'bg-brand-medium text-brand-beige font-medium shadow-lg shadow-brand-dark/20' 
                    : 'hover:bg-white/5 hover:text-brand-beige text-brand-light/80'
                }`}
              >
                <Icon size={18} className={`transition-transform group-hover:scale-110 ${isActive ? 'text-brand-beige' : ''}`} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-all group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
