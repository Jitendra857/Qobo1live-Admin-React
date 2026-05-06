import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import toast from 'react-hot-toast';
import { Globe, Plus, Search, Languages, Save, Trash2, Edit2, AlertCircle } from 'lucide-react';
import '../../styles/UserManagement.css';

const Localization: React.FC = () => {
  const [translations, setTranslations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    key: '',
    en: '',
    hi: '',
    ar: '',
    es: ''
  });

  // Mocking fetch as the backend might not have this endpoint yet.
  // In a real scenario, this would be adminService.getTranslations()
  const fetchTranslations = async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockData = [
          { id: '1', key: 'welcome_msg', en: 'Welcome to Qobo1Live', hi: 'कोबो1लाइव में आपका स्वागत है', ar: 'مرحبًا بك في Qobo1Live', es: 'Bienvenido a Qobo1Live' },
          { id: '2', key: 'btn_go_live', en: 'Go Live', hi: 'लाइव जाएं', ar: 'بث مباشر', es: 'Transmitir en vivo' },
          { id: '3', key: 'coins_balance', en: 'Coins Balance', hi: 'सिक्कों का बैलेंस', ar: 'رصيد العملات', es: 'Saldo de monedas' },
        ];
        setTranslations(mockData);
        setLoading(false);
      }, 600);
    } catch (err) {
      toast.error('Failed to load translations');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTranslations();
  }, []);

  const handleOpenCreate = () => {
    setSelectedKey(null);
    setFormData({
      key: '',
      en: '',
      hi: '',
      ar: '',
      es: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item: any) => {
    setSelectedKey(item);
    setFormData({
      key: item.key,
      en: item.en || '',
      hi: item.hi || '',
      ar: item.ar || '',
      es: item.es || ''
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.key || !formData.en) {
      toast.error('Key and English translation are required');
      return;
    }
    
    // Simulate save
    const loadingToast = toast.loading('Saving translation...');
    setTimeout(() => {
      if (selectedKey) {
        setTranslations(translations.map(t => t.id === selectedKey.id ? { ...t, ...formData } : t));
        toast.success('Translation updated', { id: loadingToast });
      } else {
        const newRecord = { ...formData, id: Math.random().toString(36).substr(2, 9) };
        setTranslations([newRecord, ...translations]);
        toast.success('New translation key added', { id: loadingToast });
      }
      setShowModal(false);
    }, 500);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this translation key? It might break the app if currently in use.')) {
      setTranslations(translations.filter(t => t.id !== id));
      toast.success('Translation key removed');
    }
  };

  const filteredTranslations = translations.filter(t => 
    t.key.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.en.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="user-management fade-in">
      <div className="header-actions">
        <div className="flex items-center justify-between w-full">
          <div>
            <h2 className="page-title">Localization Manager</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Manage multi-language translations and regional strings</p>
          </div>
          <button className="primary flex items-center gap-2" onClick={handleOpenCreate}>
            <Plus size={20} /> Add Translation Key
          </button>
        </div>
        
        <div className="top-tools mt-6">
          <div className="search-bar">
            <Search size={20} style={{ color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search by key or english text..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bento-grid mt-10" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="bento-card">
          <div className="card-top">
            <div className="card-label">TOTAL KEYS</div>
            <div className="card-icon-wrap" style={{ color: 'var(--accent-blue)' }}>
              <Languages size={24} />
            </div>
          </div>
          <div className="card-bottom">
            <div className="card-value">{translations.length}</div>
          </div>
        </div>
        <div className="bento-card">
          <div className="card-top">
            <div className="card-label">ACTIVE LANGUAGES</div>
            <div className="card-icon-wrap" style={{ color: 'var(--accent-green)' }}>
              <Globe size={24} />
            </div>
          </div>
          <div className="card-bottom">
            <div className="card-value">4</div>
          </div>
        </div>
        <div className="bento-card" style={{ background: 'var(--bg-secondary)' }}>
          <div className="card-top">
            <div className="card-label">SYSTEM WARNING</div>
            <div className="card-icon-wrap" style={{ color: 'var(--accent-orange)' }}>
              <AlertCircle size={24} />
            </div>
          </div>
          <div className="card-bottom">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '10px' }}>Changing keys that are hardcoded in the Flutter app will cause fallback to English.</p>
          </div>
        </div>
      </div>

      <div className="table-container-premium mt-8">
        <table className="modern-table">
          <thead>
            <tr>
              <th style={{ width: '25%' }}>Translation Key</th>
              <th style={{ width: '30%' }}>English (Base)</th>
              <th style={{ width: '15%' }}>Hindi</th>
              <th style={{ width: '15%' }}>Arabic</th>
              <th style={{ textAlign: 'right', width: '15%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>Loading translations...</td></tr>
            ) : filteredTranslations.map((item) => (
              <tr key={item.id} className="row-premium">
                <td>
                  <div className="asset-tag" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 800 }}>{item.key}</span>
                  </div>
                </td>
                <td><div style={{ fontWeight: 600 }}>{item.en}</div></td>
                <td><div style={{ color: 'var(--text-secondary)' }}>{item.hi || '-'}</div></td>
                <td><div style={{ color: 'var(--text-secondary)' }} dir="rtl">{item.ar || '-'}</div></td>
                <td>
                  <div className="ops-cluster" style={{ justifyContent: 'flex-end' }}>
                    <button className="op-btn edit" onClick={() => handleOpenEdit(item)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="op-btn delete" onClick={() => handleDelete(item.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filteredTranslations.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
                  No translation keys found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content bento-card" style={{ maxWidth: '600px', width: '90%', padding: '0', overflow: 'hidden', borderRadius: '40px', background: 'white', border: 'none' }}>
            <div style={{ padding: '32px 40px', borderBottom: '1px solid #f1f5f9' }}>
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-5">
                    <div style={{ background: '#eff6ff', borderRadius: '16px', padding: '12px', color: '#3b82f6' }}>
                      <Languages size={28} />
                    </div>
                    <div>
                      <h3 style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: '800', lineHeight: '1.2' }}>
                        {selectedKey ? 'Edit Translation' : 'New Translation Key'}
                      </h3>
                      <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '2px' }}>
                        Define strings for internationalization
                      </p>
                    </div>
                  </div>
                  <div 
                    onClick={() => setShowModal(false)} 
                    style={{ background: '#f8fafc', borderRadius: '50%', padding: '10px', color: '#64748b', cursor: 'pointer' }}
                  >
                    X
                  </div>
               </div>
            </div>

            <div style={{ padding: '40px' }}>
              <form onSubmit={handleSave} className="flex flex-col gap-6">
                <div>
                  <label style={{ display: 'block', color: '#1e293b', fontWeight: '800', marginBottom: '8px', fontSize: '0.8rem', textTransform: 'uppercase' }}>Unique String Key</label>
                  <input 
                    type="text" 
                    style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '2px solid #e0e7ff', fontSize: '1rem', fontFamily: 'monospace' }}
                    placeholder="e.g., error_network_failed"
                    value={formData.key}
                    onChange={e => setFormData({...formData, key: e.target.value.toLowerCase().replace(/\s+/g, '_')})}
                    disabled={!!selectedKey}
                    required
                  />
                  {selectedKey && <p style={{ fontSize: '0.8rem', color: '#f59e0b', marginTop: '6px' }}>Key cannot be changed once created.</p>}
                </div>

                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                  <label style={{ display: 'block', color: '#1e293b', fontWeight: '800', marginBottom: '8px', fontSize: '0.8rem', textTransform: 'uppercase' }}>English (Base Reference) *</label>
                  <input 
                    type="text" 
                    style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '2px solid #cbd5e1', fontSize: '1rem' }}
                    placeholder="Network connection failed"
                    value={formData.en}
                    onChange={e => setFormData({...formData, en: e.target.value})}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label style={{ display: 'block', color: '#64748b', fontWeight: '800', marginBottom: '8px', fontSize: '0.8rem', textTransform: 'uppercase' }}>Hindi (hi)</label>
                    <input 
                      type="text" 
                      style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '2px solid #f1f5f9', fontSize: '1rem' }}
                      value={formData.hi}
                      onChange={e => setFormData({...formData, hi: e.target.value})}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#64748b', fontWeight: '800', marginBottom: '8px', fontSize: '0.8rem', textTransform: 'uppercase' }}>Arabic (ar)</label>
                    <input 
                      type="text" 
                      dir="rtl"
                      style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '2px solid #f1f5f9', fontSize: '1rem' }}
                      value={formData.ar}
                      onChange={e => setFormData({...formData, ar: e.target.value})}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#64748b', fontWeight: '800', marginBottom: '8px', fontSize: '0.8rem', textTransform: 'uppercase' }}>Spanish (es)</label>
                    <input 
                      type="text" 
                      style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '2px solid #f1f5f9', fontSize: '1rem' }}
                      value={formData.es}
                      onChange={e => setFormData({...formData, es: e.target.value})}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="primary" 
                  style={{ width: '100%', padding: '20px', borderRadius: '20px', fontSize: '1.1rem', fontWeight: '900', marginTop: '10px' }}
                >
                  <Save size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
                  {selectedKey ? 'Commit Changes' : 'Create Record'}
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

export default Localization;
