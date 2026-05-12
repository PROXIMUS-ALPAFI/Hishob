import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearAuthSession, getStoredUser } from '../../auth';

const Header = ({ theme, toggleTheme }) => {
  const [loginUser, setLoginUser] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setLoginUser(user);
    }
  }, []);

  const logoutHandler = () => {
    clearAuthSession();
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link className="app-brand" to="/">
          <span className="app-brand__badge">H</span>
          <div>
            <strong>Hishob</strong>
            <p className="app-brand__tagline">Track money without the clutter</p>
          </div>
        </Link>

        <div className="app-header__actions">
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
