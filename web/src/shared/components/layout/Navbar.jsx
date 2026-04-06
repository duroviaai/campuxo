import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../../features/auth/hooks/useAuth';
import ROUTES from '../../../app/routes/routeConstants';

const LogoutModal = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-xl p-6 w-80 border border-gray-100">
      <div className="flex items-center justify-center w-11 h-11 rounded-full bg-red-50 mx-auto mb-4">
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-gray-900 text-center">Sign out?</h3>
      <p className="text-xs text-gray-500 text-center mt-1 mb-5">
        You'll need to sign in again to continue.
      </p>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-xs font-semibold rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-2 text-xs font-semibold rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors shadow-sm"
        >
          Sign out
        </button>
      </div>
    </div>
  </div>
);

const Navbar = ({ title = 'Dashboard' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleConfirm = () => {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <>
      {showModal && (
        <LogoutModal onConfirm={handleConfirm} onCancel={() => setShowModal(false)} />
      )}
      <header className="h-[60px] bg-white border-b border-gray-200 shadow-sm px-6 flex items-center justify-between">
        <h1 className="text-sm font-semibold text-gray-700">{title}</h1>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
            {user?.username?.[0]?.toUpperCase() ?? '?'}
          </div>
          <span className="text-sm text-gray-600">{user?.username}</span>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </header>
    </>
  );
};

export default Navbar;
