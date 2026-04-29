import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../shared/components/layout/Sidebar';
import Navbar from '../shared/components/layout/Navbar';
import useWebPush from '../features/notifications/hooks/useWebPush';

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  useWebPush(true);

  return (
    <div className="flex min-h-screen" style={{ background: '#f8fafc' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
