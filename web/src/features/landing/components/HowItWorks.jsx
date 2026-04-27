const STEPS = [
  {
    icon: 'fa-building-columns',
    title: 'Create your institution',
    desc: 'Sign up and set up your college profile in minutes. Add departments, configure academic year, and you\'re ready.',
    color: 'from-blue-600 to-indigo-600',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
  },
  {
    icon: 'fa-user-plus',
    title: 'Add users & courses',
    desc: 'Invite faculty and students, create courses, assign HODs, and configure role-based access with a few clicks.',
    color: 'from-indigo-600 to-violet-600',
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
  },
  {
    icon: 'fa-chart-pie',
    title: 'Manage everything',
    desc: 'Track attendance, record marks, monitor progress, and get real-time insights — all from one unified dashboard.',
    color: 'from-violet-600 to-purple-600',
    bg: 'bg-violet-50',
    text: 'text-violet-600',
  },
];

const HowItWorks = () => (
  <section className="py-28 px-6 md:px-10 bg-slate-50">
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-4 py-1.5 rounded-full">
          <i className="fa-solid fa-circle-play text-[10px]" />
          How it works
        </span>
        <h2 className="mt-5 text-4xl md:text-5xl font-black text-gray-900 leading-tight tracking-tight font-['Syne']">
          Up and running{' '}
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            in minutes
          </span>
        </h2>
        <p className="mt-4 text-gray-600 text-lg max-w-md mx-auto">
          Three simple steps to transform how your institution operates.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 relative">
        {/* Connector line */}
        <div className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-blue-200 via-indigo-200 to-violet-200" />

        {STEPS.map((s, i) => (
          <div key={i} className="flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className={`w-20 h-20 rounded-2xl ${s.bg} border border-gray-100 shadow-md flex items-center justify-center`}>
                <i className={`fa-solid ${s.icon} ${s.text} text-2xl`} />
              </div>
              <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br ${s.color} flex items-center justify-center shadow-md`}>
                <span className="text-white text-[10px] font-black">{i + 1}</span>
              </div>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">{s.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed max-w-xs">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
