import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, Save, RefreshCw, Building, 
  Percent, FileText, Mail, Phone, MapPin, CheckCircle, Shield
} from 'lucide-react';
import { settingService } from '../services/dataService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState('');

  // Editable state map: { [settingKey]: { value, description } }
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await settingService.getSettings();
      if (res.data?.success) {
        const list = res.data.data || [];
        setSettings(list);
        const map = {};
        list.forEach(s => {
          map[s.settingKey] = {
            value: s.settingValue || '',
            description: s.description || ''
          };
        });
        setFormData(map);
      }
    } catch (err) {
      toast.error('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, field, val) => {
    setFormData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: val
      }
    }));
  };

  const handleSaveSetting = async (key) => {
    if (!isAdmin) {
      toast.error('Only administrators can modify system settings');
      return;
    }

    try {
      setSavingKey(key);
      const data = formData[key];
      const res = await settingService.updateSetting(key, {
        settingKey: key,
        settingValue: data.value,
        description: data.description
      });
      if (res.data?.success) {
        toast.success(`Updated ${key} successfully`);
        fetchSettings();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to update ${key}`);
    } finally {
      setSavingKey('');
    }
  };

  const handleSaveAll = async () => {
    if (!isAdmin) {
      toast.error('Only administrators can modify system settings');
      return;
    }

    try {
      setSavingKey('ALL');
      const keys = Object.keys(formData);
      for (const k of keys) {
        await settingService.updateSetting(k, {
          settingKey: k,
          settingValue: formData[k].value,
          description: formData[k].description
        });
      }
      toast.success('All settings saved successfully');
      fetchSettings();
    } catch (err) {
      toast.error('Failed to save some settings');
    } finally {
      setSavingKey('');
    }
  };

  const getIconForKey = (key) => {
    if (key.includes('gst') || key.includes('rate')) return <Percent size={18} className="text-primary" />;
    if (key.includes('company_name')) return <Building size={18} className="text-primary" />;
    if (key.includes('gstin')) return <Shield size={18} className="text-primary" />;
    if (key.includes('email')) return <Mail size={18} className="text-primary" />;
    if (key.includes('phone')) return <Phone size={18} className="text-primary" />;
    if (key.includes('address')) return <MapPin size={18} className="text-primary" />;
    return <FileText size={18} className="text-primary" />;
  };

  const formatKeyName = (key) => {
    return key
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="page-title m-0">System Configuration</h1>
          <p className="text-muted m-0">Configure company metadata, tax parameters, and document prefixes</p>
        </div>

        {isAdmin && (
          <button 
            onClick={handleSaveAll} 
            disabled={savingKey === 'ALL' || loading}
            className="btn btn-primary d-flex align-items-center gap-2"
          >
            <Save size={16} /> {savingKey === 'ALL' ? 'Saving All...' : 'Save All Changes'}
          </button>
        )}
      </div>

      {loading ? (
        <div className="card loading-container py-5">
          <div className="spinner"></div>
          <p>Loading configurations...</p>
        </div>
      ) : settings.length === 0 ? (
        <div className="card text-center py-5">
          <SettingsIcon size={48} className="text-muted mb-2" />
          <h3>No Settings Found</h3>
          <p className="text-muted">System default parameters will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-2 gap-4">
          {settings.map((s) => {
            const k = s.settingKey;
            const current = formData[k] || { value: '', description: '' };
            const isSaving = savingKey === k;

            return (
              <div key={k} className="card">
                <div className="card-header border-bottom pb-2 mb-3 d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    {getIconForKey(k)}
                    <h3 className="card-title m-0 text-sm">{formatKeyName(k)}</h3>
                  </div>
                  <code>{k}</code>
                </div>

                <div className="form-group mb-3">
                  <label className="form-label text-xs text-muted">Value</label>
                  <input
                    type="text"
                    className="form-control"
                    disabled={!isAdmin}
                    value={current.value}
                    onChange={(e) => handleChange(k, 'value', e.target.value)}
                  />
                </div>

                <div className="form-group mb-3">
                  <label className="form-label text-xs text-muted">Description / Notes</label>
                  <input
                    type="text"
                    className="form-control text-sm"
                    disabled={!isAdmin}
                    value={current.description}
                    onChange={(e) => handleChange(k, 'description', e.target.value)}
                  />
                </div>

                {isAdmin && (
                  <div className="d-flex justify-content-end">
                    <button
                      type="button"
                      onClick={() => handleSaveSetting(k)}
                      disabled={isSaving}
                      className="btn btn-sm btn-secondary d-flex align-items-center gap-1"
                    >
                      <Save size={14} /> {isSaving ? 'Saving...' : 'Update Setting'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
