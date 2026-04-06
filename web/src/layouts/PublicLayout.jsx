import { Outlet } from 'react-router-dom';
import Navbar from '../features/landing/components/Navbar';
import Footer from '../features/landing/components/Footer';

const PublicLayout = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex flex-col flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default PublicLayout;
