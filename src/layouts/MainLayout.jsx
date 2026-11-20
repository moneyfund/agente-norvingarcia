import { Outlet } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { useTheme } from '../hooks/useTheme';

function MainLayout() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="ng-site min-h-screen">
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <main className="ng-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
