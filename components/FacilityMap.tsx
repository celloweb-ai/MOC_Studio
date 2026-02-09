// @ts-nocheck
import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { TRANSLATIONS } from '../constants';
import { 
  ShieldCheck, Navigation, Activity, Plus, Edit2, Trash2, 
  X, Save, MapPin, Globe, Loader2, AlertTriangle, Info,
  Search, Settings, ChevronRight, Factory, Map as MapIcon,
  Circle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Facility } from '../types';

// Custom Marker Generator
const createStatusIcon = (status: string, isSelected: boolean) => {
  const color = status === 'Online' ? '#10b981' : status === 'Offline' ? '#ef4444' : '#f59e0b';
  const showPulse = status === 'Online';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="relative flex items-center justify-center" style="width: 32px; height: 32px;">
        <!-- Backdrop Glass -->
        <div class="absolute inset-0 rounded-full bg-slate-900/60 backdrop-blur-md border ${isSelected ? 'border-blue-400 border-2 scale-110' : 'border-white/20'} shadow-2xl transition-all duration-300"></div>
        
        <!-- Status Indicator Container -->
        <div class="relative" style="width: 12px; height: 12px;">
          <!-- Pulse Ring (Online Only) -->
          ${showPulse ? `<div class="marker-pulse-ring" style="background-color: ${color}"></div>` : ''}
          
          <!-- Core Dot -->
          <div class="relative w-full h-full rounded-full shadow-[0_0_12px_${color}]" style="background-color: ${color}; border: 1.5px solid rgba(255,255,255,0.4);"></div>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const LocationMarker: React.FC<{ onLocationSelected: (lat: number, lng: number) => void }> = ({ onLocationSelected }) => {
  useMapEvents({
    click(e) {
      onLocationSelected(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const FacilityMap: React.FC = () => {
  const { language, facilities, saveFacility, deleteFacility, addNotification } = useApp();
  const t = TRANSLATIONS[language];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formFacility, setFormFacility] = useState<Partial<Facility>>({
    id: '',
    name: '',
    type: 'FPSO',
    status: 'Online',
    coordinates: [-22.5, -40.5]
  });

  const filteredFacilities = facilities.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setModalMode('add');
    const newId = `F${String(facilities.length + 1).padStart(2, '0')}`;
    setFormFacility({
      id: newId,
      name: '',
      type: 'FPSO',
      status: 'Online',
      coordinates: [-22.5, -40.5]
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (f: Facility) => {
    setModalMode('edit');
    setFormFacility({ ...f });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFacility.name || !formFacility.id) {
      addNotification({ title: 'Validation Error', message: 'Facility name and ID are required.', type: 'error' });
      return;
    }

    setIsSaving(true);
    try {
      await saveFacility(formFacility as Facility);
      addNotification({
        title: modalMode === 'add' ? 'Facility Established' : 'Asset Profile Updated',
        message: `${formFacility.name} is now synchronized in the geospatial registry.`,
        type: 'success'
      });
      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteFacility(id);
    addNotification({
      title: 'Facility Decommissioned',
      message: 'The facility record has been purged from the network.',
      type: 'warning'
    });
    setIsDeleting(null);
    if (selectedFacility?.id === id) setSelectedFacility(null);
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500 overflow-hidden">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight leading-none mb-1 glow-title">
            {t.facilities}
          </h2>
          <p className="text-slate-500 dark:text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">
            Geospatial Logistics & Operational Status • {facilities.length} Hubs
          </p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl flex items-center gap-2 font-black uppercase tracking-widest text-[11px] transition-all shadow-xl shadow-blue-500/20 active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
          <span>Provision New Hub</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Hub Navigator */}
        <div className="lg:col-span-4 glass-panel rounded-[3rem] p-6 flex flex-col min-h-0">
          <div className="relative mb-6">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/20 rounded-2xl py-4 pl-14 pr-4 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {filteredFacilities.map(f => (
              <div 
                key={f.id}
                onClick={() => setSelectedFacility(f)}
                className={`w-full p-5 rounded-3xl border transition-all text-left flex justify-between items-center group cursor-pointer ${
                  selectedFacility?.id === f.id
                    ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-500/30'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-blue-500/40'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[9px] font-mono font-black uppercase ${selectedFacility?.id === f.id ? 'text-blue-100' : 'text-blue-500'}`}>{f.id}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${f.status === 'Online' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : f.status === 'Offline' ? 'bg-red-500' : 'bg-orange-500'} ${f.status === 'Online' ? 'animate-pulse' : ''}`}></span>
                  </div>
                  <div className="text-sm font-black truncate">{f.name}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-70 flex items-center gap-1">
                    <Factory size={10} /> {f.type} • {f.status}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <button 
                    onClick={(e) => { e.stopPropagation(); handleOpenEdit(f); }}
                    className={`p-2 rounded-xl transition-all ${selectedFacility?.id === f.id ? 'hover:bg-blue-500 text-white' : 'hover:bg-blue-500/10 text-slate-400 hover:text-blue-500'}`}
                   >
                     <Edit2 size={14} />
                   </button>
                   <button 
                    onClick={(e) => { e.stopPropagation(); setIsDeleting(f.id); }}
                    className={`p-2 rounded-xl transition-all ${selectedFacility?.id === f.id ? 'hover:bg-red-500 text-white' : 'hover:bg-red-500/10 text-slate-400 hover:text-red-500'}`}
                   >
                     <Trash2 size={14} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map Container */}
        <div className="lg:col-span-8 glass-panel rounded-[3rem] overflow-hidden border-white/5 relative z-10">
          <MapContainer 
            center={[-22.5, -40.5]} 
            zoom={7} 
            scrollWheelZoom={true} 
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {facilities.map(f => (
              <Marker 
                key={f.id} 
                position={f.coordinates}
                icon={createStatusIcon(f.status, selectedFacility?.id === f.id)}
                eventHandlers={{
                  click: () => setSelectedFacility(f),
                }}
              >
                <Popup>
                  <div className="p-2">
                    <div className="text-[10px] font-black uppercase text-blue-500 mb-1">{f.id}</div>
                    <div className="text-sm font-black text-slate-900">{f.name}</div>
                    <div className="text-[9px] font-bold text-slate-500 mt-1 uppercase">{f.type} • {f.status}</div>
                  </div>
                </Popup>
              </Marker>
            ))}
            <LocationMarker onLocationSelected={(lat, lng) => {
              if (modalMode === 'add' || modalMode === 'edit') {
                setFormFacility(prev => ({ ...prev, coordinates: [lat, lng] }));
              }
            }} />
          </MapContainer>

          <div className="absolute bottom-8 left-8 right-8 z-[500] pointer-events-none">
            {selectedFacility ? (
              <div className="glass-panel p-6 rounded-[2.5rem] bg-slate-900/90 backdrop-blur-xl border-blue-500/30 pointer-events-auto flex items-center justify-between animate-in slide-in-from-bottom-4">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
                    <Factory size={32} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] mb-1">Operational Telemetry</div>
                    <h3 className="text-xl font-black text-white">{selectedFacility.name}</h3>
                    <div className="flex gap-4 mt-1">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                         <Globe size={10} /> {selectedFacility.coordinates[0].toFixed(4)}, {selectedFacility.coordinates[1].toFixed(4)}
                       </span>
                       <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${selectedFacility.status === 'Online' ? 'text-emerald-500' : selectedFacility.status === 'Offline' ? 'text-red-500' : 'text-orange-500'}`}>
                         <Circle size={8} fill="currentColor" /> {selectedFacility.status}
                       </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                   <button 
                    onClick={() => handleOpenEdit(selectedFacility)}
                    className="bg-white/5 hover:bg-blue-600 text-slate-300 hover:text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10"
                   >
                     Update Profile
                   </button>
                </div>
              </div>
            ) : (
              <div className="glass-panel p-6 rounded-[2rem] bg-slate-900/40 backdrop-blur-md border-white/5 text-center pointer-events-auto">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center justify-center gap-3">
                   <MapIcon size={14} /> Interactive Geospatial Network • Select a hub to view telemetry
                 </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Facility Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="glass-panel w-full max-w-2xl rounded-[3.5rem] overflow-hidden flex flex-col relative z-10 shadow-2xl border-white/10">
             <header className="px-10 py-8 border-b border-white/10 flex justify-between items-center bg-blue-600/5">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl">
                      <Factory size={28} />
                   </div>
                   <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">
                      {modalMode === 'add' ? 'Provision New Hub' : 'Modify Asset Profile'}
                    </h3>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mt-1">Geospatial Registry Management</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-all"><X size={28} /></button>
             </header>

             <form onSubmit={handleSave} className="p-12 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Asset ID</label>
                      <input 
                        required
                        disabled={modalMode === 'edit'}
                        value={formFacility.id}
                        onChange={(e) => setFormFacility({...formFacility, id: e.target.value.toUpperCase()})}
                        className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 px-6 text-sm font-black text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all uppercase disabled:opacity-50"
                        placeholder="e.g. F04"
                      />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Facility Status</label>
                      <select 
                        value={formFacility.status}
                        onChange={(e) => setFormFacility({...formFacility, status: e.target.value as any})}
                        className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 px-6 text-sm font-black text-white outline-none cursor-pointer"
                      >
                         <option value="Online">Online</option>
                         <option value="Offline">Offline</option>
                         <option value="Maintenance">Maintenance</option>
                      </select>
                   </div>
                </div>

                <div className="space-y-3">
                   <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Facility Nomenclature</label>
                   <input 
                     required
                     value={formFacility.name}
                     onChange={(e) => setFormFacility({...formFacility, name: e.target.value})}
                     className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 px-6 text-sm font-black text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                     placeholder="e.g. P-60 Fixed Platform"
                   />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Infrastructure Type</label>
                      <select 
                        value={formFacility.type}
                        onChange={(e) => setFormFacility({...formFacility, type: e.target.value as any})}
                        className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 px-6 text-sm font-black text-white outline-none cursor-pointer"
                      >
                         <option value="FPSO">FPSO</option>
                         <option value="Fixed">Fixed Platform</option>
                         <option value="Onshore">Onshore Terminal</option>
                      </select>
                   </div>
                   <div className="space-y-3">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Coordinates (Lat, Lng)</label>
                      <div className="flex gap-2">
                        <input 
                          type="number" step="0.0001"
                          value={formFacility.coordinates?.[0]}
                          onChange={(e) => setFormFacility({...formFacility, coordinates: [parseFloat(e.target.value), formFacility.coordinates![1]]})}
                          className="flex-1 bg-slate-900 border border-white/10 rounded-2xl py-4 px-6 text-sm font-mono text-white outline-none"
                        />
                        <input 
                          type="number" step="0.0001"
                          value={formFacility.coordinates?.[1]}
                          onChange={(e) => setFormFacility({...formFacility, coordinates: [formFacility.coordinates![0], parseFloat(e.target.value)]})}
                          className="flex-1 bg-slate-900 border border-white/10 rounded-2xl py-4 px-6 text-sm font-mono text-white outline-none"
                        />
                      </div>
                   </div>
                </div>

                <div className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-[2rem] flex items-center gap-4">
                   <Info size={24} className="text-blue-500 shrink-0" />
                   <p className="text-[10px] text-slate-300 font-medium leading-relaxed">
                     Tip: You can manually adjust coordinates or type them exactly. This facility will be used to filter MOCs and Digital Twin assets.
                   </p>
                </div>
                
                <footer className="pt-6 border-t border-white/10 flex justify-end gap-6">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="px-8 py-4 rounded-2xl font-black text-slate-400 hover:bg-white/5 transition-all text-[11px] uppercase tracking-widest"
                  >
                    Abort
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center gap-3 shadow-xl transition-all active:scale-95"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {modalMode === 'add' ? 'Confirm Provision' : 'Commit Profile'}
                  </button>
                </footer>
             </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {isDeleting && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setIsDeleting(null)}></div>
          <div className="glass-panel w-full max-w-md rounded-[3.5rem] p-12 relative z-10 shadow-2xl border-white/10 text-center">
             <div className="w-24 h-24 bg-red-500/20 text-red-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10">
                <AlertTriangle size={48} />
             </div>
             <h3 className="text-3xl font-black mb-4 text-white tracking-tight">Decommission?</h3>
             <p className="text-slate-400 text-base mb-12 leading-relaxed px-4 font-medium">
               Warning: Deleting hub <span className="font-black text-red-400">{isDeleting}</span> is an irreversible administrative action. All linked telemetry and regional logs will be archived.
             </p>
             <div className="flex gap-6">
                <button onClick={() => setIsDeleting(null)} className="flex-1 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] bg-white/5 hover:bg-white/10 transition-all text-slate-500">Abort</button>
                <button onClick={() => handleDelete(isDeleting)} className="flex-1 py-5 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl hover:bg-red-500 transition-all">Confirm Purge</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilityMap;