import { useNavigate } from 'react-router-dom';

const STATS = [['500+', 'Institutions'], ['50K+', 'Students'], ['99.9%', 'Uptime']];

const CARDS = [
  { label: 'Students', value: '1,284', icon: '👥', color: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/20' },
  { label: 'Courses', value: '48', icon: '📚', color: 'from-indigo-500/20 to-indigo-600/10', border: 'border-indigo-500/20' },
  { label: 'Attendance', value: '94.2%', icon: '📊', color: 'from-violet-500/20 to-violet-600/10', border: 'border-violet-500/20' },
  { label: 'Faculty', value: '62', icon: '👩‍🏫', color: 'from-sky-500/20 to-sky-600/10', border: 'border-sky-500/20' },
];

const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex items-center bg-[#0a0f1e] overflow-hidden pt-16">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(59,130,246,0.18),transparent)]" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative max-w-7xl mx-auto px-6 md:px-10 py-20 w-full">
        <div className="grid md:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-widest uppercase mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              All-in-one College Management
            </div>

            <h1 className="text-5xl md:text-6xl font-black text-white leading-[1.08] tracking-tight mb-6">
              The smarter way<br />to run your{' '}
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">campus</span>
            </h1>

            <p className="text-blue-100/50 text-lg leading-relaxed mb-10 max-w-md">
              campuxo unifies students, faculty, and admins — streamlining courses, attendance, and academic management in one powerful platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-14">
              <button
                onClick={() => navigate('/register')}
                className="group px-7 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:opacity-90 hover:shadow-xl hover:shadow-blue-700/30 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Get Started Free
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-7 py-3.5 text-sm font-bold text-white/70 border border-white/10 rounded-xl hover:bg-white/5 hover:text-white hover:border-white/20 hover:-translate-y-0.5 active:scale-95 transition-all"
              >
                Sign In
              </button>
            </div>

            <div className="flex gap-10 pt-8 border-t border-white/8">
              {STATS.map(([val, label]) => (
                <div key={label}>
                  <div className="text-2xl font-black text-white">{val}</div>
                  <div className="text-xs text-blue-300/40 mt-0.5 font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Dashboard mockup */}
          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-3xl blur-2xl" />
              <div className="relative bg-white/[0.04] backdrop-blur-xl border border-white/8 rounded-2xl p-6 shadow-2xl">
                {/* Titlebar dots */}
                <div className="flex items-center gap-1.5 mb-5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  <span className="ml-3 text-white/20 text-xs font-medium">campuxo — Dashboard</span>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-white/30 text-xs">Welcome back</p>
                    <p className="text-white font-bold">Admin Dashboard</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-base">🎓</div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {CARDS.map(s => (
                    <div key={s.label} className={`bg-gradient-to-br ${s.color} border ${s.border} rounded-xl p-4`}>
                      <div className="text-lg mb-1.5">{s.icon}</div>
                      <div className="text-white font-black text-xl">{s.value}</div>
                      <div className="text-white/40 text-xs mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Bar chart */}
                <div className="bg-white/[0.03] border border-white/8 rounded-xl p-4">
                  <p className="text-white/40 text-xs font-semibold mb-3">Weekly Attendance</p>
                  <div className="flex items-end gap-1.5 h-12">
                    {[65, 80, 72, 90, 85, 95, 88].map((h, i) => (
                      <div key={i} className="flex-1 rounded bg-gradient-to-t from-blue-600 to-indigo-400 opacity-70" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                      <span key={i} className="flex-1 text-center text-white/20 text-xs">{d}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-3 -right-3 bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Live Updates
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
