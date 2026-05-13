import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { message } from 'antd';
import { clearAuthSession, getStoredUser } from '../../auth';
import api from '../../api';
import moment from 'moment';

const Header = ({ theme, toggleTheme }) => {
  const [loginUser, setLoginUser] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [messageApi, messageContextHolder] = message.useMessage();

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setLoginUser(user);
    }
  }, []);

  const logoutHandler = () => {
    clearAuthSession();
    messageApi.success('Logged out successfully');
    setTimeout(() => navigate('/login'), 500);
  };

  const handleExport = async () => {
    try {
      const res = await api.post('/transactions/export');
      const data = res.data.transactions;
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hishob-export-${moment().format('YYYY-MM-DD')}.json`;
      a.click();
      URL.revokeObjectURL(url);
      messageApi.success(`Exported ${data.length} transactions`);
    } catch {
      messageApi.error('Export failed');
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const transactions = JSON.parse(text);
      const payload = Array.isArray(transactions) ? transactions : transactions.transactions || transactions.data;
      if (!Array.isArray(payload) || payload.length === 0) {
        messageApi.error('File must contain a non-empty array of transactions');
        return;
      }
      const res = await api.post('/transactions/import', { transactions: payload });
      const msg = res.data.errors?.length
        ? `${res.data.message} (${res.data.errors.length} errors)`
        : res.data.message;
      messageApi.success(msg);
      window.location.reload();
    } catch {
      messageApi.error('Import failed. Check file format.');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <header className="app-header">
      {messageContextHolder}
      <div className="app-header__inner">
        <Link className="app-brand" to="/">
          <span className="app-brand__badge">H</span>
          <div>
            <strong>Hishob</strong>
            <p className="app-brand__tagline">Track money without the clutter</p>
          </div>
        </Link>

        <div className="app-header__actions">
          <nav className="app-header__nav">
            <Link className={`app-header__nav-link ${location.pathname === '/' ? 'app-header__nav-link--active' : ''}`} to="/">
              Dashboard
            </Link>
            <Link className={`app-header__nav-link ${location.pathname === '/history' ? 'app-header__nav-link--active' : ''}`} to="/history">
              History
            </Link>
          </nav>
          <label className="btn app-btn app-btn--file" style={{ cursor: 'pointer' }}>
            Import
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
          <button className="btn app-btn app-btn--file" onClick={handleExport}>
            Export
          </button>
          <button className="btn app-btn app-btn--theme" onClick={toggleTheme}>
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <div className="app-user-chip">
            <span className="app-user-chip__label">Signed in as</span>
            <strong>{loginUser?.name || 'Guest'}</strong>
          </div>
          <button className="btn app-btn app-btn--ghost" onClick={logoutHandler}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
