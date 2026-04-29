import { useState } from 'react';
import {
  useGetHodMeQuery,
  useGetHodFacultyAssignmentsQuery,
  useGetHodCourseStudentsPerformanceQuery,
} from '../state/hodApi';
import { PctBar } from '../../../shared/components/ui/PageShell';
import HodMarkAttendancePage from './HodMarkAttendancePage';
import HodMyIAPage from './HodMyIAPage';
import env from '../../../config/env';

const downloadFile = async (url, filename) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${env.API_BASE_URL}${url}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const blob = await res.blob();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

const PAGE_TABS = [
  { key: 'courses',    label: 'My Programs' },
  { key: 'attendance', label: 'My Attendance' },
  { key: 'ia',         label: 'My IA' },
];

const pctColor = (p) => p >= 75 ? '#059669' : p >= 50 ? '#d97706' : '#dc2626';

// ── Course detail ─────────────────────────────────────────────────────────────
const CourseDetail = ({ assignment }) => {
  const { data: students = [], isLoading, isError } = useGetHodCourseStudentsPerformanceQuery(
    { courseId: assignment.courseId, classStructureId: assignment.classStructureId },
    { skip: !assignment.classStructureId }
  );
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    if (q && !s.studentName.toLowerCase().includes(q) && !(s.registrationNumber ?? '').toLowerCase().includes(q)) return false;
    if (filter === 'shortage' && s.attendancePercentage >= 75) return false;
    if (filter === 'ok'       && s.attendancePercentage <  75) return false;
    return true;
  });

  const shortageCount = students.filter(s => s.attendancePercentage < 75).length;
  const avgPct = students.length
    ? (students.reduce((sum, s) => sum + s.attendancePercentage, 0) / students.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl p-5" style={{ border: '1px solid #e2e8f0', background: '#fafafa' }}>
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold text-white shrink-0"
            style={{ background: '#7c3aed' }}>
            {assignment.courseCode?.slice(0, 2) ?? '??'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold" style={{ color: '#0f172a' }}>{assignment.courseName}</p>
            <p className="text-xs font-mono mt-0.5" style={{ color: '#64748b' }}>
              {assignment.courseCode}{assignment.credits ? ` · ${assignment.credits} cr` : ''}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {assignment.semester && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                  Sem {assignment.semester}
                </span>
              )}
              {assignment.yearOfStudy && (
                <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: '#eff6ff', color: '#2563eb' }}>{assignment.yearOfStudy} Year</span>
              )}
              {assignment.batchStartYear && (
                <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: '#f1f5f9', color: '#64748b' }}>
                  {assignment.batchStartYear}–{assignment.batchEndYear}{assignment.batchScheme ? ` (${assignment.batchScheme})` : ''}
                </span>
              )}
              {assignment.specialization && <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: '#f1f5f9', color: '#64748b' }}>{assignment.specialization}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      {!isLoading && students.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Students',  value: students.length, color: '#334155' },
            { label: 'Shortage (<75%)', value: shortageCount,   color: '#dc2626' },
            { label: 'Class Average',   value: `${avgPct}%`,    color: pctColor(Number(avgPct)) },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name / reg no…"
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 w-52"
            style={{ border: '1px solid #e2e8f0' }} />
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none"
            style={{ border: '1px solid #e2e8f0' }}>
            <option value="all">All Students</option>
            <option value="shortage">Shortage (&lt;75%)</option>
            <option value="ok">75% and above</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs" style={{ color: '#94a3b8' }}>{filtered.length} student{filtered.length !== 1 ? 's' : ''}</p>
          {assignment.classStructureId && (
            <>
              <button
                onClick={() => downloadFile(
                  `/api/v1/reports/attendance/excel?classStructureId=${assignment.classStructureId}&courseId=${assignment.courseId}`,
                  `attendance_${assignment.courseName}.xlsx`
                )}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white"
                style={{ background: '#059669' }}>
                ↓ Excel
              </button>
              <button
                onClick={() => downloadFile(
                  `/api/v1/reports/attendance/pdf?classStructureId=${assignment.classStructureId}&courseId=${assignment.courseId}`,
                  `attendance_${assignment.courseName}.pdf`
                )}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white"
                style={{ background: '#dc2626' }}>
                ↓ PDF
              </button>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      {isLoading
        ? <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 rounded-lg skeleton" />)}</div>
        : isError
        ? <p className="text-sm" style={{ color: '#dc2626' }}>Failed to load student data.</p>
        : !assignment.classStructureId
        ? <p className="text-sm py-8 text-center" style={{ color: '#94a3b8' }}>No class structure linked to this program.</p>
        : students.length === 0
        ? <p className="text-sm py-8 text-center" style={{ color: '#94a3b8' }}>No students found for this program.</p>
        : (
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
            <table className="min-w-full text-sm">
              <thead style={{ background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                <tr>
                  {['#', 'Student', 'Reg No', 'Total Classes', 'Present', 'Absent', 'Attendance'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={7} className="px-4 py-8 text-center text-sm" style={{ color: '#94a3b8' }}>No students match the filter.</td></tr>
                  : filtered.map((s, i) => {
                    const shortage = s.attendancePercentage < 75;
                    const absent   = s.totalClasses - s.attendedClasses;
                    const needed   = shortage && s.totalClasses > 0
                      ? Math.ceil((0.75 * s.totalClasses - s.attendedClasses) / 0.25) : 0;
                    return (
                      <tr key={s.studentId} style={{ borderBottom: '1px solid #f8fafc' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <td className="px-4 py-3 text-xs" style={{ color: '#94a3b8' }}>{i + 1}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-sm" style={{ color: '#0f172a' }}>{s.studentName}</p>
                          {shortage && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#fef2f2', color: '#dc2626' }}>
                              Shortage{needed > 0 ? ` · +${needed} needed` : ''}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs font-mono" style={{ color: '#94a3b8' }}>{s.registrationNumber || '—'}</td>
                        <td className="px-4 py-3 text-xs font-semibold text-center" style={{ color: '#334155' }}>{s.totalClasses}</td>
                        <td className="px-4 py-3 text-xs font-semibold text-center" style={{ color: '#059669' }}>{s.attendedClasses}</td>
                        <td className="px-4 py-3 text-xs font-semibold text-center" style={{ color: '#dc2626' }}>{absent}</td>
                        <td className="px-4 py-3"><PctBar pct={s.attendancePercentage} /></td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>
        )
      }
    </div>
  );
};

// ── Courses Tab ───────────────────────────────────────────────────────────────
const CoursesTab = () => {
  const { data: me, isLoading: meLoading } = useGetHodMeQuery();
  const { data: assignments = [], isLoading: assignmentsLoading } = useGetHodFacultyAssignmentsQuery(
    me?.id, { skip: !me?.id }
  );
  const [selKey, setSelKey] = useState('');
  const isLoading = meLoading || assignmentsLoading;

  const selected = assignments.find(a => `${a.courseId}|${a.classStructureId}` === selKey);

  return (
    <div className="space-y-4">
      {/* Course dropdown */}
      <div className="rounded-xl p-4" style={{ border: '1px solid #e2e8f0', background: '#fff' }}>
        <label className="text-xs font-semibold block mb-1.5" style={{ color: '#64748b' }}>Select Program</label>
        <select
          value={selKey}
          onChange={e => setSelKey(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          style={{ border: '1px solid #e2e8f0' }}
          disabled={isLoading}>
          <option value="">{isLoading ? 'Loading programs…' : 'Select a program'}</option>
          {assignments.map(a => (
            <option key={`${a.courseId}|${a.classStructureId}`} value={`${a.courseId}|${a.classStructureId}`}>
              {a.courseName} — Sem {a.semester}{a.specialization ? ` (${a.specialization})` : ''}
            </option>
          ))}
        </select>
      </div>

      {selected && (
        <div className="bg-white rounded-xl p-6" style={{ border: '1px solid #e2e8f0' }}>
          <CourseDetail key={selKey} assignment={selected} />
        </div>
      )}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const HodMyCoursesPage = () => {
  const [activeTab, setActiveTab] = useState('courses');

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-lg w-fit" style={{ background: '#f1f5f9' }}>
        {PAGE_TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className="px-5 py-2 text-sm font-semibold rounded-md transition-colors"
            style={activeTab === t.key
              ? { background: '#fff', color: '#7c3aed', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
              : { color: '#64748b' }}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'courses'    && <CoursesTab />}
      {activeTab === 'attendance'  && <HodMarkAttendancePage embedded />}
      {activeTab === 'ia'          && <HodMyIAPage embedded />}
    </div>
  );
};

export default HodMyCoursesPage;
