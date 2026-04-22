import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClassFilters, getClassesByYearAndSection, getCoursesByClass } from '../../attendance/services/classService';
import { getClassCourseOverview, getStudentAttendanceSummary } from '../../attendance/services/attendanceService';
import ROUTES from '../../../app/routes/routeConstants';

// ─── helpers ────────────────────────────────────────────────────────────────

const fmt = (d) => {
  if (!d) return '—';
  if (Array.isArray(d))
    return `${d[0]}-${String(d[1]).padStart(2, '0')}-${String(d[2]).padStart(2, '0')}`;
  return d;
};

const parseDate = (d) => {
  if (Array.isArray(d)) return new Date(d[0], d[1] - 1, d[2]);
  return new Date(d);
};

const pctBg = (p) => {
  if (p >= 75) return 'bg-green-100 text-green-700';
  if (p >= 50) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
};

const pctBar = (p) => {
  if (p >= 75) return 'bg-green-500';
  if (p >= 50) return 'bg-yellow-400';
  return 'bg-red-500';
};

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const THIS_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: THIS_YEAR - 2019 }, (_, i) => 2020 + i);

const daysInMonth = (year, month) => new Date(year, month, 0).getDate();

// ─── DOB-style date picker ───────────────────────────────────────────────────
const DatePicker = ({ onConfirm }) => {
  const [year,  setYear]  = useState('');
  const [month, setMonth] = useState('');
  const [day,   setDay]   = useState('');

  const maxDay = year && month ? daysInMonth(Number(year), Number(month)) : 31;
  const days   = Array.from({ length: maxDay }, (_, i) => i + 1);

  // reset day if it exceeds new month's max
  const handleMonthChange = (m) => { setMonth(m); if (day && Number(day) > daysInMonth(Number(year), Number(m))) setDay(''); };

  const label = [year, month ? MONTHS[month - 1] : '', day].filter(Boolean).join(' · ') || 'Nothing selected';

  return (
    <div className="space-y-5">
      <p className="text-sm font-medium text-gray-600">Select Date</p>

      {/* 3 dropdowns side by side like DOB */}
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400 font-medium">Year</label>
          <select value={year} onChange={(e) => { setYear(e.target.value); setMonth(''); setDay(''); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[100px]">
            <option value="">Year</option>
            {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400 font-medium">Month <span className="text-gray-300">(optional)</span></label>
          <select value={month} onChange={(e) => handleMonthChange(e.target.value)} disabled={!year}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[130px] disabled:opacity-40">
            <option value="">All months</option>
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400 font-medium">Day <span className="text-gray-300">(optional)</span></label>
          <select value={day} onChange={(e) => setDay(e.target.value)} disabled={!month}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[100px] disabled:opacity-40">
            <option value="">All days</option>
            {days.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Preview */}
      <p className="text-xs text-indigo-500 font-medium">Selected: {label}</p>

      <button
        disabled={!year}
        onClick={() => onConfirm({ year, month, day })}
        className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-40 transition-colors"
      >
        Continue →
      </button>
    </div>
  );
};

// ─── Step indicator ──────────────────────────────────────────────────────────

const steps = ['Department', 'Year', 'Section', 'Subject'];

const StepBar = ({ current }) => (
  <div className="flex items-center gap-0 mb-6">
    {steps.map((label, i) => (
      <div key={label} className="flex items-center">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
          i < current  ? 'bg-indigo-100 text-indigo-600' :
          i === current ? 'bg-indigo-600 text-white' :
                          'bg-gray-100 text-gray-400'
        }`}>
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
            i < current ? 'bg-indigo-600 text-white' :
            i === current ? 'bg-white text-indigo-600' :
                            'bg-gray-300 text-gray-500'
          }`}>{i + 1}</span>
          {label}
        </div>
        {i < steps.length - 1 && (
          <div className={`w-6 h-0.5 ${i < current ? 'bg-indigo-400' : 'bg-gray-200'}`} />
        )}
      </div>
    ))}
  </div>
);

// ─── Breadcrumb ──────────────────────────────────────────────────────────────

const Breadcrumb = ({ items, onNavigate }) => (
  <div className="flex items-center gap-1 text-xs text-gray-500 mb-4 flex-wrap">
    {items.map((item, i) => (
      <span key={i} className="flex items-center gap-1">
        {i > 0 && <span className="text-gray-300">›</span>}
        {i < items.length - 1 ? (
          <button onClick={() => onNavigate(i)} className="text-indigo-600 hover:underline font-medium">
            {item}
          </button>
        ) : (
          <span className="text-gray-700 font-semibold">{item}</span>
        )}
      </span>
    ))}
  </div>
);

// ─── Selection card ──────────────────────────────────────────────────────────

const SelectCard = ({ label, options, onSelect, getLabel, getValue }) => (
  <div className="space-y-3">
    <p className="text-sm font-medium text-gray-600">Select {label}</p>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {options.map((opt) => (
        <button
          key={getValue(opt)}
          onClick={() => onSelect(opt)}
          className="p-4 rounded-xl border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 text-sm font-semibold text-gray-700 transition-all text-left"
        >
          {getLabel(opt)}
        </button>
      ))}
    </div>
    {options.length === 0 && (
      <p className="text-sm text-gray-400">No options available.</p>
    )}
  </div>
);

// ─── Student detail panel ────────────────────────────────────────────────────

const StudentDetailPanel = ({ student, courseName, initialMonth, initialDay, onBack }) => {
  const [summary, setSummary]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [filterMonth, setFilterMonth] = useState(initialMonth ?? '');
  const [filterDay, setFilterDay]     = useState(initialDay ?? '');

  useEffect(() => {
    getStudentAttendanceSummary(student.studentId)
      .then(setSummary)
      .finally(() => setLoading(false));
  }, [student.studentId]);

  // find the course-specific summary entry
  const courseEntry = summary?.find((s) => s.courseName === courseName) ?? null;

  const filterDates = (dates) => {
    if (!dates) return [];
    return dates.filter((d) => {
      const dt = parseDate(d);
      if (filterMonth && dt.getMonth() + 1 !== Number(filterMonth)) return false;
      if (filterDay   && dt.getDate()  !== Number(filterDay))        return false;
      return true;
    });
  };

  const presentFiltered = filterDates(courseEntry?.presentDates ?? student.presentDates);
  const absentFiltered  = filterDates(courseEntry?.absentDates  ?? student.absentDates);
  const totalFiltered   = presentFiltered.length + absentFiltered.length;
  const pct = totalFiltered === 0 ? 0 : Math.round((presentFiltered.length / totalFiltered) * 1000) / 10;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          ← Back
        </button>
        <div>
          <h2 className="text-lg font-bold text-gray-900">{student.studentName}</h2>
          <p className="text-xs text-gray-400">{student.registrationNumber} · {student.email}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Filter by Month</label>
          <select
            value={filterMonth}
            onChange={(e) => { setFilterMonth(e.target.value); setFilterDay(''); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Months</option>
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Filter by Day</label>
          <select
            value={filterDay}
            onChange={(e) => setFilterDay(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Days</option>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        {(filterMonth || filterDay) && (
          <button
            onClick={() => { setFilterMonth(''); setFilterDay(''); }}
            className="text-xs text-indigo-600 hover:underline self-end pb-2"
          >
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          {/* Stats */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">{courseName}</p>
              {(filterMonth || filterDay) && (
                <p className="text-xs text-indigo-500 mt-0.5">
                  Showing: {filterMonth ? MONTHS[Number(filterMonth) - 1] : ''}{filterDay ? ` Day ${filterDay}` : ''}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className={`text-3xl font-bold ${pct >= 75 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                {pct}%
              </p>
              <p className="text-xs text-gray-500">{presentFiltered.length} / {totalFiltered} classes</p>
            </div>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div className={`h-2.5 rounded-full ${pctBar(pct)}`} style={{ width: `${pct}%` }} />
          </div>

          {/* Date grids */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <p className="text-xs font-semibold text-green-600 mb-2">
                ✓ Present ({presentFiltered.length})
              </p>
              {presentFiltered.length === 0 ? (
                <p className="text-xs text-gray-400">No records</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {presentFiltered.map((d) => (
                    <span key={fmt(d)} className="px-2 py-1 rounded-lg text-xs bg-green-50 text-green-700 border border-green-100">
                      {fmt(d)}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-red-600 mb-2">
                ✗ Absent ({absentFiltered.length})
              </p>
              {absentFiltered.length === 0 ? (
                <p className="text-xs text-gray-400">No records</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {absentFiltered.map((d) => (
                    <span key={fmt(d)} className="px-2 py-1 rounded-lg text-xs bg-red-50 text-red-700 border border-red-100">
                      {fmt(d)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Overview table ──────────────────────────────────────────────────────────

const OverviewTable = ({ rows, courseName, onSelectStudent }) => {
  const [search, setSearch]           = useState('');
  const [sortBy, setSortBy]           = useState('name'); // 'name' | 'pct'
  const [sortDir, setSortDir]         = useState('asc');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'low' | 'ok'

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const filtered = rows
    .filter((r) => {
      const q = search.toLowerCase();
      if (q && !r.studentName.toLowerCase().includes(q) &&
               !(r.registrationNumber ?? '').toLowerCase().includes(q)) return false;
      if (filterStatus === 'low' && r.attendancePercentage >= 75) return false;
      if (filterStatus === 'ok'  && r.attendancePercentage < 75)  return false;
      return true;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = a.studentName.localeCompare(b.studentName);
      if (sortBy === 'pct')  cmp = a.attendancePercentage - b.attendancePercentage;
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const SortIcon = ({ col }) => (
    <span className="ml-1 text-gray-400">
      {sortBy === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  return (
    <div className="space-y-4">
      {/* Table controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search student / reg no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-56"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Students</option>
            <option value="low">Below 75%</option>
            <option value="ok">75% and above</option>
          </select>
        </div>
        <p className="text-xs text-gray-400">{filtered.length} student{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-5 py-3 text-left">#</th>
              <th
                className="px-5 py-3 text-left cursor-pointer select-none hover:text-gray-700"
                onClick={() => toggleSort('name')}
              >
                Student <SortIcon col="name" />
              </th>
              <th className="px-5 py-3 text-left">Reg No.</th>
              <th className="px-5 py-3 text-left">Total</th>
              <th className="px-5 py-3 text-left">Attended</th>
              <th
                className="px-5 py-3 text-left cursor-pointer select-none hover:text-gray-700"
                onClick={() => toggleSort('pct')}
              >
                % <SortIcon col="pct" />
              </th>
              <th className="px-5 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-sm text-gray-400">
                  No students found.
                </td>
              </tr>
            ) : (
              filtered.map((r, i) => (
                <tr key={r.studentId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-5 py-3 font-medium text-gray-900">{r.studentName}</td>
                  <td className="px-5 py-3 text-gray-500 font-mono text-xs">{r.registrationNumber ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-600">{r.totalClasses}</td>
                  <td className="px-5 py-3 text-gray-600">{r.attendedClasses}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${pctBg(r.attendancePercentage)}`}>
                      {r.attendancePercentage}%
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => onSelectStudent(r)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary bar */}
      {rows.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Students', value: rows.length, color: 'text-gray-700' },
            { label: 'Below 75%', value: rows.filter((r) => r.attendancePercentage < 75).length, color: 'text-red-600' },
            { label: 'Class Average', value: `${(rows.reduce((s, r) => s + r.attendancePercentage, 0) / rows.length).toFixed(1)}%`, color: 'text-indigo-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main page ───────────────────────────────────────────────────────────────

const AdminAttendancePage = () => {
  const navigate = useNavigate();
  const [filters, setFilters]           = useState(null);
  const [allClasses, setAllClasses]     = useState([]);
  const [step, setStep]                 = useState(0); // 0=dept 1=year 2=section 3=subject 4=overview 5=student

  const [selDept, setSelDept]           = useState(null);
  const [selYear, setSelYear]           = useState(null);   // e.g. '2024'
  const [selMonth, setSelMonth]         = useState(null);   // e.g. '3' or null
  const [selDay, setSelDay]             = useState(null);   // e.g. '15' or null
  const [selSection, setSelSection]     = useState(null);
  const [selCourse, setSelCourse]       = useState(null);
  const [selClass, setSelClass]         = useState(null); // ClassBatch object
  const [selStudent, setSelStudent]     = useState(null);

  const [classes, setClasses]           = useState([]);
  const [courses, setCourses]           = useState([]);
  const [overview, setOverview]         = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);

  // Load filter options on mount
  useEffect(() => {
    getClassFilters().then(setFilters).catch(() => setError('Failed to load filters'));
    getClassesByYearAndSection(null, null).then(setAllClasses).catch(() => {});
  }, []);

  // When year + section selected, find matching class batch
  const loadClasses = useCallback(async (year, section) => {
    setLoading(true);
    try {
      const data = await getClassesByYearAndSection(year, section);
      setClasses(data);
    } catch {
      setError('Failed to load classes');
    } finally {
      setLoading(false);
    }
  }, []);

  // When class selected, load its courses (used as fallback)
  const loadCourses = useCallback(async (classId) => {
    setLoading(true);
    try {
      const data = await getCoursesByClass(classId);
      setCourses(data);
    } catch {
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, []);

  // When course selected, load overview
  const loadOverview = useCallback(async (classId, courseId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getClassCourseOverview(classId, courseId);
      setOverview(data);
    } catch {
      setError('Failed to load attendance overview');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Step handlers ──

  const handleSelectDept = (dept) => {
    setSelDept(dept);
    setSelYear(null); setSelSection(null); setSelCourse(null); setSelClass(null);
    setStep(1);
  };

  const handleSelectYear = ({ year, month, day }) => {
    setSelYear(String(year));
    setSelMonth(month || null);
    setSelDay(day || null);
    setSelSection(null); setSelCourse(null); setSelClass(null);
    setStep(2);
  };

  const handleSelectSection = async (section) => {
    setSelSection(section);
    setSelCourse(null); setSelClass(null);
    setLoading(true);
    setError(null);
    try {
      const batches = await getClassesByYearAndSection(null, section);
      // filter by selected department (ClassBatch.name stores the department)
      const deptBatches = batches.filter((b) => b.name === selDept);
      setClasses(deptBatches);
      if (deptBatches.length > 0) {
        const raw = await getCoursesByClass(deptBatches[0].id);
        setCourses(raw);
      } else {
        setCourses([]);
      }
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
    setStep(3);
  };

  const handleSelectCourse = async (course) => {
    const matchingClass = classes.find((c) => c.name === selDept && c.section === selSection) ?? classes[0];
    if (!matchingClass) {
      setError('No class batch found for this combination.');
      return;
    }
    setSelCourse(course);
    setSelClass(matchingClass);
    await loadOverview(matchingClass.id, course.id);
    setStep(4);
  };

  const handleSelectStudent = (student) => {
    setSelStudent(student);
    setStep(5);
  };

  // ── Breadcrumb navigation ──

  const breadcrumbItems = [
    'Attendance',
    ...(selDept    ? [selDept]                    : []),
    ...(selYear ? [
      [selYear, selMonth ? MONTHS[selMonth - 1] : '', selDay ? `Day ${selDay}` : ''].filter(Boolean).join(' · ')
    ] : []),
    ...(selSection ? [`Section ${selSection}`]     : []),
    ...(selCourse  ? [selCourse.name]              : []),
    ...(selStudent ? [selStudent.studentName]      : []),
  ];

  const handleBreadcrumbNav = (index) => {
    // index 0 = root, 1 = dept, 2 = year, 3 = section, 4 = course, 5 = student
    if (index === 0) { setStep(0); setSelDept(null); setSelYear(null); setSelMonth(null); setSelDay(null); setSelSection(null); setSelCourse(null); setSelStudent(null); }
    if (index === 1) { setStep(1); setSelYear(null); setSelMonth(null); setSelDay(null); setSelSection(null); setSelCourse(null); setSelStudent(null); }
    if (index === 2) { setStep(2); setSelSection(null); setSelCourse(null); setSelStudent(null); }
    if (index === 3) { setStep(3); setSelCourse(null); setSelStudent(null); }
    if (index === 4) { setStep(4); setSelStudent(null); }
  };

  // ── Render ──

  if (!filters && !error) return <p className="text-sm text-gray-500">Loading...</p>;
  if (error && !filters)  return <p className="text-sm text-red-500">{error}</p>;

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div className="flex items-center gap-2">
        {step > 0 ? (
          <button
            onClick={() => handleBreadcrumbNav(step - 1)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors text-sm"
          >
            ←
          </button>
        ) : (
          <button
            onClick={() => navigate(ROUTES.ADMIN_DASHBOARD)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors text-sm"
          >
            ←
          </button>
        )}
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
      </div>

      <Breadcrumb items={breadcrumbItems} onNavigate={handleBreadcrumbNav} />

      {step < 4 && <StepBar current={step} />}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Step 0 — Department */}
      {step === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <SelectCard
            label="Department"
            options={filters?.departments ?? []}
            onSelect={handleSelectDept}
            getLabel={(d) => d}
            getValue={(d) => d}
          />
        </div>
      )}

      {/* Step 1 — Date picker (Year / Month / Day) */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <DatePicker onConfirm={handleSelectYear} />
        </div>
      )}

      {/* Step 2 — Section */}
      {step === 2 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {loading ? <p className="text-sm text-gray-500">Loading...</p> : (
            <SelectCard
              label="Section"
              options={[...new Set(allClasses.filter((b) => b.name === selDept).map((b) => b.section))].sort()}
              onSelect={handleSelectSection}
              getLabel={(s) => `Section ${s}`}
              getValue={(s) => s}
            />
          )}
        </div>
      )}

      {/* Step 3 — Subject */}
      {step === 3 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {loading ? <p className="text-sm text-gray-500">Loading subjects...</p> : (
            <SelectCard
              label="Subject"
              options={courses}
              onSelect={handleSelectCourse}
              getLabel={(c) => `${c.name} (${c.code})`}
              getValue={(c) => c.id}
            />
          )}
        </div>
      )}

      {/* Step 4 — Overview table */}
      {step === 4 && (
        loading ? <p className="text-sm text-gray-500">Loading attendance data...</p> : (
          <OverviewTable
            rows={overview}
            courseName={selCourse?.name}
            onSelectStudent={handleSelectStudent}
          />
        )
      )}

      {/* Step 5 — Student detail */}
      {step === 5 && selStudent && (
        <StudentDetailPanel
          student={selStudent}
          courseName={selCourse?.name}
          initialMonth={selMonth}
          initialDay={selDay}
          onBack={() => setStep(4)}
        />
      )}
    </div>
  );
};

export default AdminAttendancePage;
