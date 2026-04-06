import { useNavigate } from 'react-router-dom';

const CTA = () => {
  const navigate = useNavigate();
  return (
    <section className="py-28 px-6 md:px-10 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-[#0a0f1e] px-8 md:px-16 py-20 text-center shadow-2xl">
          {/* Background glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(99,102,241,0.25),transparent)]" />
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

          <div className="relative">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-xs font-semibold tracking-widest uppercase mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Get Started Today
            </span>

            <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight tracking-tight">
              Ready to transform<br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                your institution?
              </span>
            </h2>

            <p className="text-white/40 text-lg mb-12 max-w-md mx-auto leading-relaxed">
              Join thousands of institutions already using campuxo to simplify administration and empower every stakeholder.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
              <button
                onClick={() => navigate('/register')}
                className="group px-8 py-3.5 text-sm font-bold text-gray-900 bg-white rounded-xl hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Create Free Account
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3.5 text-sm font-bold text-white/70 border border-white/10 rounded-xl hover:bg-white/5 hover:text-white hover:border-white/20 hover:-translate-y-0.5 active:scale-95 transition-all"
              >
                Sign In
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-white/25 text-xs font-medium">
              {['No credit card required', 'Free forever plan', 'Setup in minutes'].map(t => (
                <span key={t} className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
