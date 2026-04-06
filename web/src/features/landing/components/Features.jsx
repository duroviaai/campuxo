const FEATURES = [
  { icon: '👥', title: 'Student Management', desc: 'Manage profiles, enrollments, and academic records with ease.', accent: 'blue' },
  { icon: '📚', title: 'Course Management', desc: 'Create courses, assign faculty, and organize content seamlessly.', accent: 'indigo' },
  { icon: '📊', title: 'Attendance Tracking', desc: 'Monitor attendance across all courses in real time.', accent: 'violet' },
  { icon: '👩‍🏫', title: 'Faculty Portal', desc: 'Empower faculty to manage courses, grades, and student progress.', accent: 'sky' },
  { icon: '🛡️', title: 'Role-Based Access', desc: 'Granular, secure access control for every stakeholder.', accent: 'emerald' },
  { icon: '⚡', title: 'Real-Time Updates', desc: 'Instant notifications keep everyone on the same page.', accent: 'amber' },
];

const ACCENT = {
  blue:    { icon: 'bg-blue-50 text-blue-600',    ring: 'group-hover:ring-blue-100' },
  indigo:  { icon: 'bg-indigo-50 text-indigo-600', ring: 'group-hover:ring-indigo-100' },
  violet:  { icon: 'bg-violet-50 text-violet-600', ring: 'group-hover:ring-violet-100' },
  sky:     { icon: 'bg-sky-50 text-sky-600',       ring: 'group-hover:ring-sky-100' },
  emerald: { icon: 'bg-emerald-50 text-emerald-600', ring: 'group-hover:ring-emerald-100' },
  amber:   { icon: 'bg-amber-50 text-amber-600',   ring: 'group-hover:ring-amber-100' },
};

const Features = () => (
  <section className="py-28 px-6 md:px-10 bg-white">
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16">
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Features
        </span>
        <h2 className="mt-5 text-4xl md:text-5xl font-black text-gray-900 leading-tight tracking-tight">
          Everything you need,{' '}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            all in one place
          </span>
        </h2>
        <p className="mt-4 text-gray-400 text-lg max-w-lg mx-auto">
          A complete suite of tools designed for modern educational institutions.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((f) => {
          const a = ACCENT[f.accent];
          return (
            <div
              key={f.title}
              className={`group p-7 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 hover:-translate-y-1.5 hover:shadow-xl ring-4 ring-transparent ${a.ring} transition-all duration-300 cursor-default`}
            >
              <div className={`w-11 h-11 rounded-xl ${a.icon} flex items-center justify-center text-xl mb-5`}>
                {f.icon}
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default Features;
