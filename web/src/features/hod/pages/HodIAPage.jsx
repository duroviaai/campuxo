import { useState } from 'react';
import {
  useGetBatchesQuery,
  useGetClassStructureQuery,
  useGetAdminCoursesQuery,
} from '../../admin/courses/coursesAdminApi';
import { useGetIAMarksQuery, useGetAssignmentsQuery, useGetSeminarsQuery } from '../../admin/ia/iaApi';
import { useGetHodDeptQuery } from '../state/hodApi';

// ── IA business logic ─────────────────────────────────────────────────────────
const scaleToTen = (raw) => Math.ceil(Number(raw) / 2);

const needsIA3 = (r) => {
  const ia1 = r.marks?.[1]; const max1 = Number(r.maxMarks?.[1] ?? 20);
  const ia2 = r.marks?.[2]; const max2 = Number(r.maxMarks?.[2] ?? 20);
  return ia1 === undefined || ia2 === undefined || Number(ia1) < 0.35 * max1 || Number(ia2) < 0.35 * max2;
};

const computeFinal = (r) => {
  const candidates = [1, 2, 3]
    .filter(n => r.marks?.[n] !== undefined)
    .map(n => ({ n, scaled: scaleToTen(r.marks[n]) }))
    .sort((a, b) => b.scaled - a.scaled);
  if (!candidates.length) return null;
  const best = candidates.slice(0, 2);
  return { total: best.reduce((s, c) => s + c.scaled, 0), used: best.map(c => c.n) };
};

// ── IA View Panel ─────────────────────────────────────────────────────────────
const IAViewPanel = ({ course, classStructure }) => {
  const [activeIA, setActiveIA] = useState(1);
  const [search, setSearch]     = useState('');
  const [tab, setTab]           = useState('ia');

  const { data: iaRows = [], isLoading: iaLoading }   = useGetIAMarksQuery({ classStructureId: classStructure.id, courseId: course.id });
  const { data: asgRows = [], isLoading: asgLoading } = useGetAssignmentsQuery({ classStructureId: classStructure.id, courseId: course.id });
  const { data: semRows = [], isLoading: semLoading } = useGetSeminarsQuery({ classStructureId: classStructure.id, courseId: course.id });

  const ia3EligibleCount = iaRows.filter(needsIA3).length;

  const displayIA  = iaRows.filter(r => { const q = search.toLowerCase(); return !q || r.studentName?.toLowerCase().includes(q) || r.registrationNumber?.toLowerCase().includes(q); });
  const displayAsg = asgRows.filter(r => { const q = search.toLowerCase(); return !q || r.studentName?.toLowerCase().includes(q) || r.registrationNumber?.toLowerCase().includes(q); });
  const displaySem = semRows.filter(r => { const q = search.toLowerCase(); return !q || r.studentName?.toLowerCase().includes(q) || r.registrationNumber?.toLowerCase().includes(q); });

  const iaAvg = (() => {
    const finals = iaRows.map(computeFinal).filter(Boolean);
    if (!finals.length) return null;
    return (finals.reduce((s, f) => s + f.total, 0) / finals.length).toFixed(1);
  })();

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold" style={{ color: '#0f172a' }}>{course.name}</p>
        <p className="text-xs font-mono" style={{ color: '#94a3b8' }}>{course.code} · Semester {classStructure.semester}</p>
        {course.facultyName && <p className="text-xs mt-0.5" style={{ color: '#7c3aed' }}>{course.facultyName}</p>}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-0.5 p-1 rounded-lg w-fit" style={{ background: '#f1f5f9' }}>
        {[['ia', 'Internal Assessment'], ['assignment', 'Assignment'], ['seminar', 'Seminar']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className="px-4 py-1.5 text-xs font-semibold rounded-md transition-all"
            style={tab === key ? { background: '#fff', color: '#0f172a', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } : { color: '#64748b' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or reg no…"
        className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 w-64"
        style={{ border: '1px solid #e2e8f0' }} />

      {/* ── IA Tab ── */}
      {tab === 'ia' && (
        <div className="space-y-3">
          <div className="flex gap-1 p-1 rounded-lg w-fit" style={{ background: '#f1f5f9' }}>
            {[1, 2, 3].map(n => (
              <button key={n} onClick={() => setActiveIA(n)}
                className="px-5 py-2 text-sm font-semibold rounded-md transition-colors"
                style={activeIA === n ? { background: '#fff', color: '#7c3aed', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } : { color: '#64748b' }}>
                IA {n}
                {n === 3 && ia3EligibleCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ background: '#fffbeb', color: '#d97706' }}>{ia3EligibleCount}</span>
                )}
              </button>
            ))}
          </div>

          {iaLoading ? <p className="text-sm" style={{ color: '#94a3b8' }}>Loading…</p> : (
            <>
              {iaAvg && (
                <p className="text-xs" style={{ color: '#64748b' }}>
                  Class final avg: <span className="font-semibold" style={{ color: '#7c3aed' }}>{iaAvg}/20</span>
                </p>
              )}
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
                <table className="min-w-full text-sm">
                  <thead style={{ background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                    <tr>
                      {['#', 'Student', 'Reg No', 'IA1 /20→/10', 'IA2 /20→/10', 'IA3 /20→/10', 'Final /20'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayIA.length === 0 ? (
                      <tr><td colSpan={7} className="px-4 py-8 text-center text-sm" style={{ color: '#94a3b8' }}>No data.</td></tr>
                    ) : displayIA.map((r, i) => {
                      const eligible = needsIA3(r);
                      const final    = computeFinal(r);
                      return (
                        <tr key={r.studentId} style={{ borderBottom: '1px solid #f8fafc' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                          onMouseLeave={e => e.currentTarget.style.background = ''}>
                          <td className="px-4 py-3 text-xs" style={{ color: '#94a3b8' }}>{i + 1}</td>
                          <td className="px-4 py-3 font-medium" style={{ color: '#0f172a' }}>
                            {r.studentName}
                            {eligible && <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' }}>IA3</span>}
                          </td>
                          <td className="px-4 py-3 text-xs font-mono" style={{ color: '#94a3b8' }}>{r.registrationNumber || '—'}</td>
                          {[1, 2, 3].map(n => {
                            const raw    = r.marks?.[n];
                            const mx     = Number(r.maxMarks?.[n] ?? 20);
                            const scaled = raw !== undefined ? scaleToTen(raw) : null;
                            const isUsed = final?.used?.includes(n);
                            const isFail = raw !== undefined && Number(raw) < 0.35 * mx;
                            return (
                              <td key={n} className="px-4 py-3">
                                {raw !== undefined ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                                    style={isUsed ? { background: '#ecfdf5', color: '#059669' } : isFail ? { background: '#fef2f2', color: '#dc2626' } : { background: '#f1f5f9', color: '#64748b' }}>
                                    {raw}/{mx}→{scaled}{isUsed ? ' ✓' : ''}
                                  </span>
                                ) : n <= 2 && eligible ? (
                                  <span className="text-xs font-semibold" style={{ color: '#ef4444' }}>Absent</span>
                                ) : (
                                  <span style={{ color: '#cbd5e1' }}>—</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="px-4 py-3">
                            {final ? (
                              <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                                style={final.total >= 14 ? { background: '#ecfdf5', color: '#059669' } : final.total >= 10 ? { background: '#fffbeb', color: '#d97706' } : { background: '#fef2f2', color: '#dc2626' }}>
                                {final.total}/20
                              </span>
                            ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Assignment Tab ── */}
      {tab === 'assignment' && (
        asgLoading ? <p className="text-sm" style={{ color: '#94a3b8' }}>Loading…</p> : (
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
            <table className="min-w-full text-sm">
              <thead style={{ background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                <tr>
                  {['#', 'Student', 'Reg No', 'Submitted', 'Marks'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayAsg.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-sm" style={{ color: '#94a3b8' }}>No data.</td></tr>
                ) : displayAsg.map((r, i) => (
                  <tr key={r.studentId} style={{ borderBottom: '1px solid #f8fafc' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td className="px-4 py-3 text-xs" style={{ color: '#94a3b8' }}>{i + 1}</td>
                    <td className="px-4 py-3 font-medium" style={{ color: '#0f172a' }}>{r.studentName}</td>
                    <td className="px-4 py-3 text-xs font-mono" style={{ color: '#94a3b8' }}>{r.registrationNumber || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={r.submitted ? { background: '#ecfdf5', color: '#059669' } : { background: '#fef2f2', color: '#dc2626' }}>
                        {r.submitted ? '✓ Submitted' : '✗ Not Submitted'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold" style={{ color: '#334155' }}>
                      {r.marksObtained != null ? `${r.marksObtained}/${r.maxMarks ?? '?'}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* ── Seminar Tab ── */}
      {tab === 'seminar' && (
        semLoading ? <p className="text-sm" style={{ color: '#94a3b8' }}>Loading…</p> : (
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
            <table className="min-w-full text-sm">
              <thead style={{ background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                <tr>
                  {['#', 'Student', 'Reg No', 'Done', 'Script', 'Marks'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displaySem.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: '#94a3b8' }}>No data.</td></tr>
                ) : displaySem.map((r, i) => (
                  <tr key={r.studentId} style={{ borderBottom: '1px solid #f8fafc' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td className="px-4 py-3 text-xs" style={{ color: '#94a3b8' }}>{i + 1}</td>
                    <td className="px-4 py-3 font-medium" style={{ color: '#0f172a' }}>{r.studentName}</td>
                    <td className="px-4 py-3 text-xs font-mono" style={{ color: '#94a3b8' }}>{r.registrationNumber || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={r.done ? { background: '#ecfdf5', color: '#059669' } : { background: '#f1f5f9', color: '#64748b' }}>
                        {r.done ? '✓ Done' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={r.scriptSubmitted ? { background: '#eff6ff', color: '#2563eb' } : { background: '#f1f5f9', color: '#64748b' }}>
                        {r.scriptSubmitted ? '✓ Submitted' : 'Not Submitted'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold" style={{ color: '#334155' }}>
                      {r.marksObtained != null ? `${r.marksObtained}/${r.maxMarks ?? '?'}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const HodIAPage = () => {
  const { data: dept, isLoading: deptLoading } = useGetHodDeptQuery();

  const [batchId, setBatchId]   = useState('');
  const [csId, setCsId]         = useState('');
  const [courseId, setCourseId] = useState('');

  const { data: batches = [] }    = useGetBatchesQuery();
  const { data: structures = [] } = useGetClassStructureQuery(
    { batchId, deptId: dept?.id ?? 0 }, { skip: !batchId || !dept?.id }
  );
  const { data: courses = [] } = useGetAdminCoursesQuery(
    { classStructureId: csId }, { skip: !csId }
  );

  const selectedCourse    = courses.find(c => c.id === Number(courseId));
  const selectedStructure = structures.find(cs => cs.id === Number(csId));

  if (deptLoading) return <p className="text-sm" style={{ color: '#94a3b8' }}>Loading…</p>;

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Cascading dropdowns */}
      <div className="rounded-xl p-4 space-y-4" style={{ border: '1px solid #e2e8f0', background: '#fff' }}>
        <div>
          <label className="text-xs font-semibold block mb-1.5" style={{ color: '#64748b' }}>Batch</label>
          <select value={batchId} onChange={e => { setBatchId(e.target.value); setCsId(''); setCourseId(''); }}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            style={{ border: '1px solid #e2e8f0' }}>
            <option value="">Select batch</option>
            {batches.map(b => <option key={b.id} value={b.id}>{b.startYear}–{b.endYear} ({b.scheme})</option>)}
          </select>
        </div>
        {batchId && (
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: '#64748b' }}>Semester</label>
            <select value={csId} onChange={e => { setCsId(e.target.value); setCourseId(''); }}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              style={{ border: '1px solid #e2e8f0' }}>
              <option value="">Select semester</option>
              {structures.map(cs => (
                <option key={cs.id} value={cs.id}>Year {cs.yearOfStudy} · Sem {cs.semester}</option>
              ))}
            </select>
          </div>
        )}
        {csId && (
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: '#64748b' }}>Program</label>
            <select value={courseId} onChange={e => setCourseId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              style={{ border: '1px solid #e2e8f0' }}>
              <option value="">Select program</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
            </select>
          </div>
        )}
      </div>

      {selectedCourse && selectedStructure && (
        <div className="bg-white rounded-xl p-6" style={{ border: '1px solid #e2e8f0' }}>
          <IAViewPanel key={courseId} course={selectedCourse} classStructure={selectedStructure} />
        </div>
      )}
    </div>
  );
};

export default HodIAPage;
