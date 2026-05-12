import Header from './header';
import Footer from './footer';
import '../../index.css';

const Layout = ({ children, theme, toggleTheme }) => {
  return (
    <div className="app-shell">
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main className="app-main">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
