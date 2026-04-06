const STEPS = [
  {
    step: '01',
    title: 'Create your institution',
    desc: 'Sign up and set up your college profile in minutes. No technical knowledge required.',
    icon: '🏫',
  },
  {
    step: '02',
    title: 'Add users & courses',
    desc: 'Invite faculty and students, create courses, and assign roles with a few clicks.',
    icon: '👥',
  },
  {
    step: '03',
    title: 'Manage everything',
    desc: 'Track attendance, monitor progress, and get real-time insights from one dashboard.',
    icon: '📊',
  },
];

const HowItWorks = () => (
  <section className="py-28 px-6 md:px-10 bg-slate-50">
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-4 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          How it works
        </span>
        <h2 className="mt-5 text-4xl md:text-5xl font-black text-gray-900 leading-tight tracking-tight">
          Up and running{' '}
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            in minutes
          </span>
        </h2>
        <p className="mt-4 text-gray-400 text-lg max-w-md mx-auto">
          Three simple steps to transform how your institution operates.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 relative">
        {/* Connector line */}
        <div className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-blue-200 via-indigo-200 to-violet-200" />

        {STEPS.map((s, i) => (
          <div key={i} className="flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-2xl bg-white border border-gray-100 shadow-md flex items-center justify-center text-3xl">
                {s.icon}
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white text-[10px] font-black">{i + 1}</span>
              </div>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">{s.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
