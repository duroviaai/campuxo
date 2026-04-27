const FEATURES = [
  {
    icon: 'fa-users',
    title: 'Student Management',
    desc: 'Manage profiles, enrollments, academic records, and performance history from a single dashboard.',
    accent: 'blue',
  },
  {
    icon: 'fa-book-open',
    title: 'Course Management',
    desc: 'Create and organize courses, assign faculty, set schedules, and manage course materials effortlessly.',
    accent: 'indigo',
  },
  {
    icon: 'fa-clipboard-check',
    title: 'Attendance Tracking',
    desc: 'Mark, monitor, and export attendance across all courses in real time with automated alerts.',
    accent: 'violet',
  },
  {
    icon: 'fa-chalkboard-user',
    title: 'Faculty Portal',
    desc: 'Empower faculty to manage courses, upload grades, track student progress, and communicate instantly.',
    accent: 'sky',
  },
  {
    icon: 'fa-shield-halved',
    title: 'Role-Based Access',
    desc: 'Granular, secure access control for admins, HODs, faculty, and students — each sees only what they need.',
    accent: 'emerald',
  },
  {
    icon: 'fa-chart-line',
    title: 'Analytics & Reports',
    desc: 'Visualize attendance trends, grade distributions, and institutional KPIs with exportable reports.',
    accent: 'amber',
  },
  {
    icon: 'fa-bell',
    title: 'Smart Notifications',
    desc: 'Automated alerts for low attendance, upcoming deadlines, and important announcements.',
    accent: 'rose',
  },
  {
    icon: 'fa-file-invoice',
    title: 'Marks & Grading',
    desc: 'Record internal marks, finals, and generate grade sheets with configurable grading schemes.',
    accent: 'teal',
  },
  {
    icon: 'fa-cloud',
    title: 'Cloud-Native & Secure',
    desc: '99.9% uptime SLA, end-to-end encryption, and automatic backups keep your data safe always.',
    accent: 'purple',
  },
];

const ACCENT = {
  blue:    { wrap: 'bg-blue-50 text-blue-600',      ring: 'group-hover:ring-blue-100',    badge: 'bg-blue-600' },
  indigo:  { wrap: 'bg-indigo-50 text-indigo-600',  ring: 'group-hover:ring-indigo-100',  badge: 'bg-indigo-600' },
  violet:  { wrap: 'bg-violet-50 text-violet-600',  ring: 'group-hover:ring-violet-100',  badge: 'bg-violet-600' },
  sky:     { wrap: 'bg-sky-50 text-sky-600',         ring: 'group-hover:ring-sky-100',     badge: 'bg-sky-600' },
  emerald: { wrap: 'bg-emerald-50 text-emerald-600', ring: 'group-hover:ring-emerald-100', badge: 'bg-emerald-600' },
  amber:   { wrap: 'bg-amber-50 text-amber-600',    ring: 'group-hover:ring-amber-100',   badge: 'bg-amber-500' },
  rose:    { wrap: 'bg-rose-50 text-rose-600',       ring: 'group-hover:ring-rose-100',    badge: 'bg-rose-600' },
  teal:    { wrap: 'bg-teal-50 text-teal-600',       ring: 'group-hover:ring-teal-100',    badge: 'bg-teal-600' },
  purple:  { wrap: 'bg-purple-50 text-purple-600',   ring: 'group-hover:ring-purple-100',  badge: 'bg-purple-600' },
};

const Features = () => (
  <section className="py-28 px-6 md:px-10 bg-white">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full">
          <i className="fa-solid fa-star text-[10px]" />
          Features
        </span>
        <h2 className="mt-5 text-4xl md:text-5xl font-black text-gray-900 leading-tight tracking-tight font-['Syne']">
          Everything you need,{' '}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            all in one place
          </span>
        </h2>
        <p className="mt-4 text-gray-600 text-lg max-w-lg mx-auto">
          A complete suite of tools designed for modern educational institutions — from enrollment to graduation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((f) => {
          const a = ACCENT[f.accent];
          return (
            <div
              key={f.title}
              className={`group p-7 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 hover:-translate-y-1.5 hover:shadow-xl ring-4 ring-transparent ${a.ring} transition-all duration-300 cursor-default`}
            >
              <div className={`w-11 h-11 rounded-xl ${a.wrap} flex items-center justify-center mb-5`}>
                <i className={`fa-solid ${f.icon} text-base`} />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default Features;
