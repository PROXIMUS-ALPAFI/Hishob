/* eslint-disable react/jsx-pascal-case */
import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import Homepage from './pages/Homepage';
import History from './pages/History';
import Regesterp from './pages/Regesterp';
import Loginp from './pages/Loginp';
import { isAuthenticated } from './auth';



function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.body.classList.toggle('theme-dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ConfigProvider
      message={{ top: 60, duration: 4 }}
    >
      <Routes>
        <Route path="/"
          element={
            <Protected_routes>
              <Homepage theme={theme} toggleTheme={toggleTheme} />
            </Protected_routes>
          }
        />
        <Route path="/history"
          element={
            <Protected_routes>
              <History theme={theme} toggleTheme={toggleTheme} />
            </Protected_routes>
          }
        />
        <Route path="/register" element={<Regesterp theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/login" element={<Loginp theme={theme} toggleTheme={toggleTheme} />} />
      </Routes>
    </ConfigProvider>
  );
}
export function Protected_routes(props) {
  if (isAuthenticated()) {
    return props.children
  }
  else {
    return <Navigate to="/login" />
  }
}
export default App;
