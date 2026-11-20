import { Suspense, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import Preloader from '../components/Preloader';
import CursorGlow from '../components/CursorGlow';

function MainLayout({ theme, toggleTheme }) {
  const { pathname, hash } = useLocation();
  const previousPath = useRef(pathname);
  const main = useRef(null);

  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    if (!hash) window.scrollTo({ top: 0, behavior: 'instant' });
    main.current?.focus({ preventScroll: true });
  }, [pathname, hash]);

  return (
    <div className="ng-site">
      <a className="ng-skip-link" href="#contenido">Saltar al contenido</a>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <CursorGlow />
      <main id="contenido" className="ng-main" ref={main} tabIndex={-1}>
        <Suspense fallback={<Preloader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
