import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="flex items-center justify-between px-6 md:px-12 py-4">
        <span className="text-2xl font-extrabold text-blue-600 tracking-tight">CollegePortal</span>

        {/* Desktop buttons */}
        <div className="hidden md:flex gap-3">
          <button onClick={() => navigate('/login')} className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 hover:scale-105 active:scale-95 transition-all duration-200">
            Login
          </button>
          <button onClick={() => navigate('/register')} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm">
            Register
          </button>
        </div>

        {/* Hamburger */}
        <button
          className="md:hidden flex flex-col justify-center gap-1.5 p-2 rounded-lg hover:bg-gray-100 transition-all"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          <span className={`block h-0.5 w-5 bg-gray-700 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block h-0.5 w-5 bg-gray-700 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 w-5 bg-gray-700 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden flex flex-col gap-3 px-6 pb-5 pt-1 border-t border-gray-100">
          <button onClick={() => navigate('/login')} className="w-full px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 active:scale-95 transition-all">
            Login
          </button>
          <button onClick={() => navigate('/register')} className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-sm">
            Register
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
