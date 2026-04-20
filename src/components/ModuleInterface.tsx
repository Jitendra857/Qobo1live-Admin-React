import React from 'react';
import { Save, Plus, ArrowLeft } from 'lucide-react';

interface Section {
  title: string;
  fields: { label: string; type: string; placeholder?: string; options?: string[] }[];
}

interface ModuleInterfaceProps {
  title: string;
  subtitle: string;
  sections: Section[];
}

const ModuleInterface: React.FC<ModuleInterfaceProps> = ({ title, subtitle, sections }) => {
  return (
    <div className="module-interface" style={{ animation: 'slideIn 0.8s ease' }}>
      <div className="module-header" style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
          <button className="glass" style={{ width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-purple)', cursor: 'pointer' }}>
            <ArrowLeft size={18} />
          </button>
          <h1 className="page-title" style={{ fontSize: '2.5rem', color: 'var(--text-primary)' }}>{title}</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', paddingLeft: '60px' }}>{subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-10">
        {sections.map((section, sidx) => (
          <div key={sidx} className="glass p-8" style={{ border: '1px solid var(--glass-border)', background: '#fff', borderRadius: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '8px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '10px', color: 'var(--accent-purple)' }}>
                <Plus size={18} />
              </div>
              {section.title}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {section.fields.map((field, fidx) => (
                <div key={fidx} className="field-group">
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                    {field.label}
                  </label>
                  {field.type === 'select' ? (
                    <select className="glass-input">
                      {field.options?.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input type={field.type} className="glass-input" placeholder={field.placeholder} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
        <button className="glass" style={{ padding: '15px 30px', borderRadius: '16px', fontWeight: 700, background: '#fff', color: 'var(--text-primary)', cursor: 'pointer' }}>
          Reset Fields
        </button>
        <button style={{ 
          background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))', 
          border: 'none', padding: '15px 45px', borderRadius: '16px', fontWeight: 900, color: 'white', 
          boxShadow: '0 10px 20px rgba(139, 92, 246, 0.2)', cursor: 'pointer'
        }}>
          Deploy Changes
        </button>
      </div>

      <style>{`
        .glass-input {
          width: 100%;
          background: #f8fafc;
          border: 1px solid rgba(0,0,0,0.05);
          padding: 16px 20px;
          border-radius: 14px;
          color: var(--text-primary);
          font-family: inherit;
          font-size: 1rem;
          font-weight: 500;
          transition: all 0.3s;
        }
        .glass-input:focus {
          outline: none;
          background: #fff;
          border-color: var(--accent-purple);
          box-shadow: 0 8px 16px rgba(139, 92, 246, 0.08);
        }
      `}</style>
    </div>
  );
};

export default ModuleInterface;
