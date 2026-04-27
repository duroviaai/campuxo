const LINKS = {
  Product: ['Features', 'How it Works', 'Pricing', 'Changelog'],
  Platform: ['Student Portal', 'Faculty Portal', 'Admin Dashboard', 'HOD Panel'],
  Company: ['About Us', 'Blog', 'Careers', 'Contact'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'],
};

const SOCIALS = [
  { icon: 'fa-brands fa-twitter', href: '#', label: 'Twitter' },
  { icon: 'fa-brands fa-linkedin-in', href: '#', label: 'LinkedIn' },
  { icon: 'fa-brands fa-github', href: '#', label: 'GitHub' },
  { icon: 'fa-brands fa-instagram', href: '#', label: 'Instagram' },
];

const Footer = () => (
  <footer className="bg-[#060b18] border-t border-white/[0.05]">
    <div className="max-w-6xl mx-auto px-6 md:px-10 pt-16 pb-10">
      {/* Top */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-14">
        {/* Brand col */}
        <div className="col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
              <i className="fa-solid fa-graduation-cap text-white text-xs" />
            </div>
            <span className="text-lg font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent font-['Syne']">
              campuxo
            </span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
            The all-in-one campus management platform for students, faculty, and admins.
          </p>
          <div className="flex gap-3">
            {SOCIALS.map(({ icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <i className={`${icon} text-xs`} />
              </a>
            ))}
          </div>
        </div>

        {/* Link cols */}
        {Object.entries(LINKS).map(([group, items]) => (
          <div key={group}>
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-4">{group}</p>
            <ul className="space-y-2.5">
              {items.map(item => (
                <li key={item}>
                  <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div className="pt-8 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-slate-500 text-xs">
          © {new Date().getFullYear()} campuxo. All rights reserved.
        </p>
        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
          <i className="fa-solid fa-heart text-rose-500 text-[10px]" />
          Built for educators, by educators
        </div>
        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          All systems operational
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
