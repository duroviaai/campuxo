import { Outlet } from 'react-router-dom';
import Sidebar from '../shared/components/layout/Sidebar';
import Navbar from '../shared/components/layout/Navbar';

const DashboardLayout = () => (
  <div className="flex min-h-screen">
    <Sidebar />
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar />
      <main className="flex-1 p-6 bg-gray-100 overflow-auto">
        <Outlet />
      </main>
    </div>
  </div>
);

export default DashboardLayout;
