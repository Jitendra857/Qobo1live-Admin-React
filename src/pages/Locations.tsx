import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import toast from 'react-hot-toast';
import { MapPin, Plus, Search, Trash2, Globe, AlertCircle, Loader2 } from 'lucide-react';
import '../styles/UserManagement.css';

interface Country {
  id: string;
  name: string;
  code: string;
}

interface State {
  id: string;
  name: string;
}

const Locations: React.FC = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [states, setStates] = useState<State[]>([]);
  
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingStates, setLoadingStates] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [stateSearch, setStateSearch] = useState('');

  // Modals
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);

  // Form states
  const [countryForm, setCountryForm] = useState({ name: '', code: '' });
  const [stateForm, setStateForm] = useState({ name: '', countryId: '' });

  const fetchCountries = async () => {
    try {
      setLoadingCountries(true);
      const res = await (adminService as any).getCountries();
      if (res.data.statusCode === 1) {
        setCountries(res.data.data);
        if (res.data.data.length > 0 && !selectedCountry) {
          setSelectedCountry(res.data.data[0]);
        }
      }
    } catch (err: any) {
      toast.error('Failed to load countries');
    } finally {
      setLoadingCountries(false);
    }
  };

  const fetchStates = async (countryId: string) => {
    try {
      setLoadingStates(true);
      const res = await (adminService as any).getStates(countryId);
      if (res.data.statusCode === 1) {
        setStates(res.data.data);
      }
    } catch (err: any) {
      toast.error('Failed to load states');
    } finally {
      setLoadingStates(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      fetchStates(selectedCountry.id);
    } else {
      setStates([]);
    }
  }, [selectedCountry]);

  const handleAddCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!countryForm.name || !countryForm.code) {
      toast.error('All fields are required');
      return;
    }
    const toastId = toast.loading('Adding country...');
    try {
      const res = await (adminService as any).createCountry(countryForm);
      if (res.data.statusCode === 1) {
        toast.success('Country added successfully', { id: toastId });
        setCountryForm({ name: '', code: '' });
        setShowCountryModal(false);
        fetchCountries();
      } else {
        toast.error(res.data.message || 'Failed to add country', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Server error', { id: toastId });
    }
  };

  const handleAddState = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stateForm.name || !stateForm.countryId) {
      toast.error('State name and country selection are required');
      return;
    }
    const toastId = toast.loading('Adding state...');
    try {
      const res = await (adminService as any).createState({
        name: stateForm.name,
        countryId: stateForm.countryId
      });
      if (res.data.statusCode === 1) {
        toast.success('State added successfully', { id: toastId });
        const lastCountryId = stateForm.countryId;
        setStateForm({ name: '', countryId: lastCountryId });
        setShowStateModal(false);
        const targetC = countries.find(c => c.id === lastCountryId);
        if (targetC) setSelectedCountry(targetC);
        fetchStates(lastCountryId);
      } else {
        toast.error(res.data.message || 'Failed to add state', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Server error', { id: toastId });
    }
  };

  const handleDeleteCountry = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This will also delete all of its states!`)) {
      return;
    }
    const toastId = toast.loading('Deleting country...');
    try {
      const res = await (adminService as any).deleteCountry(id);
      if (res.data.statusCode === 1) {
        toast.success('Country and its states deleted', { id: toastId });
        if (selectedCountry?.id === id) {
          setSelectedCountry(null);
        }
        fetchCountries();
      } else {
        toast.error(res.data.message || 'Failed to delete country', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Server error', { id: toastId });
    }
  };

  const handleDeleteState = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete state ${name}?`)) {
      return;
    }
    const toastId = toast.loading('Deleting state...');
    try {
      const res = await (adminService as any).deleteState(id);
      if (res.data.statusCode === 1) {
        toast.success('State deleted', { id: toastId });
        if (selectedCountry) {
          fetchStates(selectedCountry.id);
        }
      } else {
        toast.error(res.data.message || 'Failed to delete state', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Server error', { id: toastId });
    }
  };

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const filteredStates = states.filter(s => 
    s.name.toLowerCase().includes(stateSearch.toLowerCase())
  );

  return (
    <div className="user-management fade-in">
      <div className="header-actions">
        <div className="flex items-center justify-between w-full">
          <div>
            <h2 className="page-title">Locations Manager</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Dynamically manage available countries and states for hosts and registrations</p>
          </div>
          <div className="flex gap-4">
            <button className="primary flex items-center gap-2" onClick={() => setShowCountryModal(true)}>
              <Plus size={20} /> Add Country
            </button>
            <button className="primary flex items-center gap-2" style={{ background: '#0284c7' }} onClick={() => {
              setStateForm({ name: '', countryId: selectedCountry?.id || '' });
              setShowStateModal(true);
            }}>
              <Plus size={20} /> Add State
            </button>
          </div>
        </div>
      </div>

      <div className="bento-grid mt-8" style={{ gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
        
        {/* Left Column: Countries */}
        <div className="bento-card" style={{ padding: '24px' }}>
          <div className="card-top mb-4 flex justify-between items-center">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Countries</h3>
            <span className="asset-tag" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
              {countries.length} total
            </span>
          </div>

          <div className="search-bar mb-4" style={{ width: '100%' }}>
            <Search size={18} style={{ color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search countries..." 
              value={countrySearch}
              onChange={(e) => setCountrySearch(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ maxHeight: '500px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {loadingCountries ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 className="animate-spin" /></div>
            ) : filteredCountries.map((c) => (
              <div 
                key={c.id} 
                onClick={() => setSelectedCountry(c)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'between', 
                  padding: '16px 20px', 
                  borderRadius: '16px', 
                  background: selectedCountry?.id === c.id ? 'rgba(59, 130, 246, 0.08)' : 'rgba(255,255,255,0.05)', 
                  border: selectedCountry?.id === c.id ? '2px solid #3b82f6' : '2px solid transparent', 
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <Globe size={18} color={selectedCountry?.id === c.id ? '#3b82f6' : '#94a3b8'} />
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{c.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>Code: {c.code}</div>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCountry(c.id, c.name);
                  }}
                  style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    color: '#ef4444', 
                    cursor: 'pointer',
                    padding: '6px'
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {!loadingCountries && filteredCountries.length === 0 && (
              <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>No countries found</div>
            )}
          </div>
        </div>

        {/* Right Column: States of Selected Country */}
        <div className="bento-card" style={{ padding: '24px' }}>
          {selectedCountry ? (
            <>
              <div className="card-top mb-4 flex justify-between items-center">
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    States in {selectedCountry.name}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Region code: {selectedCountry.code}</p>
                </div>
                <span className="asset-tag" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                  {states.length} states
                </span>
              </div>

              <div className="search-bar mb-4" style={{ width: '100%' }}>
                <Search size={18} style={{ color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  placeholder="Search states..." 
                  value={stateSearch}
                  onChange={(e) => setStateSearch(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ maxHeight: '500px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {loadingStates ? (
                  <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 className="animate-spin" /></div>
                ) : filteredStates.map((s) => (
                  <div 
                    key={s.id} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'between', 
                      padding: '16px 20px', 
                      borderRadius: '16px', 
                      background: 'rgba(255,255,255,0.03)', 
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <MapPin size={18} color="#10b981" />
                      <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{s.name}</span>
                    </div>
                    <button 
                      onClick={() => handleDeleteState(s.id, s.name)}
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        color: '#ef4444', 
                        cursor: 'pointer',
                        padding: '6px'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {!loadingStates && filteredStates.length === 0 && (
                  <div style={{ gridColumn: 'span 2', color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>
                    No states added to {selectedCountry.name} yet.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', color: 'var(--text-secondary)' }}>
              <AlertCircle size={48} style={{ marginBottom: '16px' }} />
              <h3>Select a country from the left side to manage states</h3>
            </div>
          )}
        </div>
      </div>

      {/* Add Country Modal */}
      {showCountryModal && (
        <div className="modal-overlay">
          <div className="modal-content bento-card" style={{ maxWidth: '450px', width: '90%', padding: '0', overflow: 'hidden', borderRadius: '40px', background: 'white', border: 'none' }}>
            <div style={{ padding: '32px 40px', borderBottom: '1px solid #f1f5f9' }}>
               <div className="flex justify-between items-center">
                  <h3 style={{ color: '#0f172a', fontSize: '1.4rem', fontWeight: '850' }}>Add New Country</h3>
                  <button onClick={() => setShowCountryModal(false)} style={{ background: '#f8fafc', border: 'none', borderRadius: '50%', padding: '8px 12px', color: '#64748b', cursor: 'pointer' }}>X</button>
               </div>
            </div>
            <div style={{ padding: '40px' }}>
              <form onSubmit={handleAddCountry} className="flex flex-col gap-6">
                <div>
                  <label className="input-label-premium">Country Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Canada"
                    value={countryForm.name}
                    onChange={e => setCountryForm({...countryForm, name: e.target.value})}
                    style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '2px solid #e0e7ff', fontSize: '1rem', color: '#0f172a' }}
                    required
                  />
                </div>
                <div>
                  <label className="input-label-premium">Country Code (2 Letters)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. CA"
                    value={countryForm.code}
                    onChange={e => setCountryForm({...countryForm, code: e.target.value})}
                    maxLength={2}
                    style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '2px solid #e0e7ff', fontSize: '1rem', textTransform: 'uppercase', color: '#0f172a' }}
                    required
                  />
                </div>
                <button type="submit" className="primary" style={{ width: '100%', padding: '20px', borderRadius: '20px', fontSize: '1.1rem', fontWeight: '900', marginTop: '10px' }}>
                  Create Country
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add State Modal */}
      {showStateModal && (
        <div className="modal-overlay">
          <div className="modal-content bento-card" style={{ maxWidth: '450px', width: '90%', padding: '0', overflow: 'hidden', borderRadius: '40px', background: 'white', border: 'none' }}>
            <div style={{ padding: '32px 40px', borderBottom: '1px solid #f1f5f9' }}>
               <div className="flex justify-between items-center">
                  <h3 style={{ color: '#0f172a', fontSize: '1.4rem', fontWeight: '850' }}>Add New State</h3>
                  <button onClick={() => setShowStateModal(false)} style={{ background: '#f8fafc', border: 'none', borderRadius: '50%', padding: '8px 12px', color: '#64748b', cursor: 'pointer' }}>X</button>
               </div>
            </div>
            <div style={{ padding: '40px' }}>
              <form onSubmit={handleAddState} className="flex flex-col gap-6">
                <div>
                  <label className="input-label-premium" style={{ color: '#1e293b' }}>Select Country</label>
                  <select
                    value={stateForm.countryId}
                    onChange={e => setStateForm({...stateForm, countryId: e.target.value})}
                    style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '2px solid #e0e7ff', fontSize: '1rem', color: '#0f172a', background: 'white' }}
                    required
                  >
                    <option value="">-- Select Country --</option>
                    {countries.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="input-label-premium" style={{ color: '#1e293b' }}>State / Province Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Ontario"
                    value={stateForm.name}
                    onChange={e => setStateForm({ ...stateForm, name: e.target.value })}
                    style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '2px solid #e0e7ff', fontSize: '1rem', color: '#0f172a' }}
                    required
                  />
                </div>
                <button type="submit" className="primary" style={{ width: '100%', padding: '20px', borderRadius: '20px', fontSize: '1.1rem', fontWeight: '900', marginTop: '10px' }}>
                  Create State
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000;
        }
      `}</style>
    </div>
  );
};

export default Locations;
