const Footer = () => (
  <footer className="bg-[#0a0f1e] border-t border-white/5">
    <div className="max-w-6xl mx-auto px-6 md:px-10 py-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
            <span className="text-white text-[10px] font-black">cx</span>
          </div>
          <span className="text-base font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            campuxo
          </span>
          <span className="text-slate-600 text-xs ml-1 hidden sm:inline">— Empowering campuses, one click at a time.</span>
        </div>

        <p className="text-slate-600 text-xs">© {new Date().getFullYear()} campuxo. All rights reserved.</p>

        <div className="flex gap-5">
          {['Privacy', 'Terms', 'Contact'].map(link => (
            <a key={link} href="#" className="text-slate-600 hover:text-slate-300 text-xs font-medium transition-colors">
              {link}
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
