import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Bell, Shield, Database, Globe, Save } from "lucide-react";
import api from "../services/api";

function Settings() {
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    emailNotifications: false,
    orderNotifications: true,
    productNotifications: true,
    systemNotifications: true,
    autoBackup: true,
    backupFrequency: 'daily',
    maintenanceMode: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get("/settings/index.php");
      if (response.data.success) {
        setSettings(response.data.settings);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  };

  const handleToggle = (key) => {
    setSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  const handleChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await api.post("/settings/update.php", settings);
      if (response.data.success) {
        setMessage({ type: "success", text: "Settings saved successfully!" });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to save settings",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1>
            <SettingsIcon size={28} />
            System Settings
          </h1>
          <p>Configure system preferences and notifications</p>
        </div>
        <button
          onClick={handleSave}
          className="btn btn-primary"
          disabled={loading}
        >
          <Save size={18} />
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          <span>{message.text}</span>
        </div>
      )}

      <div className="settings-grid">
        <div className="settings-card">
          <div className="card-header">
            <Bell size={20} />
            <h2>Notification Settings</h2>
          </div>
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <h3>Enable Notifications</h3>
                <p>Receive in-app notifications for important events</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notificationsEnabled}
                  onChange={() => handleToggle('notificationsEnabled')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h3>Email Notifications</h3>
                <p>Receive email alerts for critical events</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h3>Order Notifications</h3>
                <p>Get notified when new orders are placed</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.orderNotifications}
                  onChange={() => handleToggle('orderNotifications')}
                  disabled={!settings.notificationsEnabled}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h3>Product Notifications</h3>
                <p>Alerts for low stock and product updates</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.productNotifications}
                  onChange={() => handleToggle('productNotifications')}
                  disabled={!settings.notificationsEnabled}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h3>System Notifications</h3>
                <p>Updates and maintenance alerts</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.systemNotifications}
                  onChange={() => handleToggle('systemNotifications')}
                  disabled={!settings.notificationsEnabled}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="settings-card">
          <div className="card-header">
            <Database size={20} />
            <h2>Backup Settings</h2>
          </div>
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <h3>Automatic Backup</h3>
                <p>Enable automatic database backups</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.autoBackup}
                  onChange={() => handleToggle('autoBackup')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h3>Backup Frequency</h3>
                <p>How often to perform automatic backups</p>
              </div>
              <select
                name="backupFrequency"
                value={settings.backupFrequency}
                onChange={handleChange}
                disabled={!settings.autoBackup}
                className="setting-select"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        </div>

        <div className="settings-card">
          <div className="card-header">
            <Globe size={20} />
            <h2>System Settings</h2>
          </div>
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <h3>Maintenance Mode</h3>
                <p>Temporarily disable customer access</p>
              </div>
              <label className="toggle-switch danger">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={() => handleToggle('maintenanceMode')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
