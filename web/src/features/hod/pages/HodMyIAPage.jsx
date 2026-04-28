import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useGetHodMeQuery, useGetHodFacultyAssignmentsQuery } from '../state/hodApi';
import {
  useGetIAMarksQuery,
  useSaveIAMarksMutation,
  useGetAssignmentsQuery,
  useSaveAssignmentsMutation,
  useGetSeminarsQuery,
  useSaveSeminarsMutation,
} from '../../admin/ia/iaApi';

// ── IA business logic ─────────────────────────────────────────────────────────
const scaleToTen = (raw) => Math.ceil(Number(raw) / 2);

const needsIA3 = (r) => {
  const ia1 = r.marks?.[1]; const max1 = Number(r.maxMarks?.[1] ?? 20);
  const ia2 = r.marks?.[2]; const max2 = Number(r.maxMarks?.[2] ?? 20);
  return ia1 === undefined || ia2 === undefined || Number(ia1) < 0.35 * max1 || Number(ia2) < 0.35 * max2;
};

const computeFinal = (r) => {
  const candidates = [1, 2, 3]
    .filter((n) => r.marks?.[n] !== undefined)
    .map((n) => ({ n, scaled: scaleToTen(r.marks[n]) }))
    .sort((a, b) => b.scaled - a.scaled);
  if (!candidates.length) return null;
  const best = candidates.slice(0, 2);
  return { total: best.reduce((s, c) => s + c.scaled, 0), used: best.map((c) => c.n) };
};

// ── IAPanel ───────────────────────────────────────────────────────────────────
const IAPanel = ({ courseId, classStructureId }) => {
  const [activeIA, setActiveIA] = useState(1);
  const [maxMarks, setMaxMarks] = useState('20');
  const [iaDate, setIaDate]     = useState('');
  const [localMarks, setLocalMarks] = useState({});
  const [search, setSearch]     = useState('');

  const { data: rows = [], isLoading, isFetching } = useGetIAMarksQuery({ classStructureId, courseId });
  const [saveMarks, { isLoading: saving }] = useSaveIAMarksMutation();

  useEffect(() => {
    const init = {}; let detectedMax = '20'; let detectedDate = '';
    rows.forEach((r) => {
      const m  = r.marks?.[activeIA];
      const mx = r.maxMarks?.[activeIA];
      const dt = r.dates?.[activeIA];
      init[r.studentId] = { marks: m !== undefined ? String(m) : '', date: dt ?? '' };
      if (mx !== undefined) detectedMax = String(mx);
      if (dt && !detectedDate) detectedDate = dt;
    });
    setLocalMarks(init); setMaxMarks(detectedMax); setIaDate(detectedDate);
  }, [rows, activeIA]);

  const handleSave = async () => {
    const max = parseFloat(maxMarks);
    if (!max || max <= 0) { toast.error('Max marks must be > 0'); return; }
    const eligibleIds = new Set(rows.filter(needsIA3).map((r) => r.studentId));
    const marksToSave = rows
      .filter((r) => activeIA !== 3 || eligibleIds.has(r.studentId))
      .map((r) => ({
        studentId: r.studentId,
        marksObtained: parseFloat(localMarks[r.studentId]?.marks ?? 0) || 0,
        submittedDate: localMarks[r.studentId]?.date || null,
      }));
    try {
      await saveMarks({ classStructureId, courseId, iaNumber: activeIA, maxMarks: max, iaDate: iaDate || null, marks: marksToSave }).unwrap();
      toast.success(`IA ${activeIA} marks saved!`);
    } catch { toast.error('Failed to save marks.'); }
  };

  const ia3EligibleCount = rows.filter(needsIA3).length;
  const filledCount      = rows.filter((r) => r.marks?.[activeIA] !== undefined).length;
  const displayed = rows.filter((r) => {
    const q = search.toLowerCase();
    return !q || r.studentName?.toLowerCase().includes(q) || r.registrationNumber?.toLowerCase().includes(q);
  });

  if (isLoading) return <p className="text-sm" style={{ color: '#94a3b8' }}>Loading students…</p>;
  if (!rows.length) return <p className="text-sm" style={{ color: '#94a3b8' }}>No students found for this class.</p>;

  return (
    <div className="space-y-4">
      {/* IA tab switcher */}
      <div className="flex gap-1 p-1 rounded-lg w-fit" style={{ background: '#f1f5f9' }}>
        {[1, 2, 3].map((n) => (
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

      {activeIA === 3 && (
        <div className="rounded-lg px-4 py-3 text-xs space-y-1" style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e' }}>
          <p><span className="font-semibold">Who writes IA3?</span> Students absent for IA1/IA2 or scored below 35%.</p>
          <p><span className="font-semibold">Scaling:</span> ⌈marks ÷ 2⌉ → /10. <span className="font-semibold">Final:</span> best 2 of IA1/IA2/IA3 → /20.</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <input type="text" placeholder="Search name or reg no…" value={search} onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 w-52" style={{ border: '1px solid #e2e8f0' }} />
        <label className="text-xs font-medium" style={{ color: '#64748b' }}>Max Marks</label>
        <input type="number" min="1" value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)}
          className="w-20 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" style={{ border: '1px solid #e2e8f0' }} />
        <label className="text-xs font-medium" style={{ color: '#64748b' }}>Date</label>
        <input type="date" value={iaDate} onChange={(e) => setIaDate(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" style={{ border: '1px solid #e2e8f0' }} />
        <span className="text-xs" style={{ color: '#94a3b8' }}>{filledCount}/{rows.length} filled</span>
        {activeIA === 3 && ia3EligibleCount > 0 && (
          <span className="text-xs font-semibold" style={{ color: '#d97706' }}>{ia3EligibleCount} eligible</span>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-x-auto" style={{ border: '1px solid #e2e8f0' }}>
        <table className="min-w-full text-sm">
          <thead style={{ background: '#fafafa' }}>
            <tr>
              {['#', 'Student', 'Reg No', 'IA1 /20→/10', 'IA2 /20→/10', 'IA3 /20→/10', 'Final /20', `Enter IA ${activeIA}`, 'Date'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.map((r, i) => {
              const eligible = needsIA3(r);
              const final    = computeFinal(r);
              const dimRow   = activeIA === 3 && !eligible;
              return (
                <tr key={r.studentId} style={{ borderBottom: '1px solid #f8fafc', opacity: dimRow ? 0.4 : 1 }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td className="px-4 py-3 text-xs" style={{ color: '#94a3b8' }}>{i + 1}</td>
                  <td className="px-4 py-3 font-medium" style={{ color: '#0f172a' }}>
                    {r.studentName}
                    {eligible && <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' }}>IA3</span>}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: '#94a3b8' }}>{r.registrationNumber || '—'}</td>
                  {[1, 2, 3].map((n) => {
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
                        ) : <span style={{ color: '#cbd5e1' }}>—</span>}
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
                  <td className="px-4 py-3">
                    {activeIA !== 3 || eligible ? (
                      <input type="number" min="0" max={maxMarks}
                        value={localMarks[r.studentId]?.marks ?? ''}
                        onChange={(e) => setLocalMarks((p) => ({ ...p, [r.studentId]: { ...p[r.studentId], marks: e.target.value } }))}
                        placeholder="0"
                        className="w-20 border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" style={{ border: '1px solid #e2e8f0' }} />
                    ) : <span style={{ color: '#cbd5e1' }}>N/A</span>}
                  </td>
                  <td className="px-4 py-3">
                    {activeIA !== 3 || eligible ? (
                      <input type="date"
                        value={localMarks[r.studentId]?.date ?? ''}
                        onChange={(e) => setLocalMarks((p) => ({ ...p, [r.studentId]: { ...p[r.studentId], date: e.target.value } }))}
                        className="border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500" style={{ border: '1px solid #e2e8f0' }} />
                    ) : <span style={{ color: '#cbd5e1' }}>N/A</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Save + avg */}
      <div className="flex items-center gap-4 flex-wrap">
        <button onClick={handleSave} disabled={saving || isFetching}
          className="px-5 py-2 text-sm font-medium rounded-lg text-white disabled:opacity-50"
          style={{ background: '#7c3aed' }}>
          {saving ? 'Saving…' : `Save IA ${activeIA} Marks`}
        </button>
        {(() => {
          const finals = rows.map(computeFinal).filter(Boolean);
          if (!finals.length) return null;
          const avg = (finals.reduce((s, f) => s + f.total, 0) / finals.length).toFixed(1);
          return <span className="text-xs" style={{ color: '#64748b' }}>Class avg: <span className="font-semibold" style={{ color: '#7c3aed' }}>{avg}/20</span></span>;
        })()}
      </div>
    </div>
  );
};

// ── AssignmentPanel ──────────────────────────────────────────────────────────
const AssignmentPanel = ({ courseId, classStructureId }) => {
  const [maxMarks, setMaxMarks] = useState('10');
  const [date, setDate]         = useState('');
  const [local, setLocal]       = useState({});
  const [search, setSearch]     = useState('');

  const { data: rows = [], isLoading, isFetching } = useGetAssignmentsQuery({ classStructureId, courseId });
  const [save, { isLoading: saving }] = useSaveAssignmentsMutation();

  useEffect(() => {
    const init = {}; let detectedMax = '10'; let detectedDate = '';
    rows.forEach((r) => {
      init[r.studentId] = { submitted: r.submitted ?? false, marks: r.marksObtained != null ? String(r.marksObtained) : '' };
      if (r.maxMarks != null) detectedMax = String(r.maxMarks);
      if (r.assignmentDate && !detectedDate) detectedDate = r.assignmentDate;
    });
    setLocal(init); setMaxMarks(detectedMax); setDate(detectedDate);
  }, [rows]);

  const toggle   = (id) => setLocal((p) => ({ ...p, [id]: { ...p[id], submitted: !p[id]?.submitted } }));
  const setMarks = (id, val) => setLocal((p) => ({ ...p, [id]: { ...p[id], marks: val } }));

  const handleSave = async () => {
    const max = parseFloat(maxMarks);
    if (!max || max <= 0) { toast.error('Max marks must be > 0'); return; }
    try {
      await save({
        classStructureId, courseId, maxMarks: max, assignmentDate: date || null,
        records: rows.map((r) => ({
          studentId: r.studentId,
          submitted: local[r.studentId]?.submitted ?? false,
          marksObtained: local[r.studentId]?.marks ? parseFloat(local[r.studentId].marks) : null,
        })),
      }).unwrap();
      toast.success('Assignment records saved!');
    } catch { toast.error('Failed to save.'); }
  };

  const displayed      = rows.filter((r) => { const q = search.toLowerCase(); return !q || r.studentName?.toLowerCase().includes(q) || r.registrationNumber?.toLowerCase().includes(q); });
  const submittedCount = rows.filter((r) => local[r.studentId]?.submitted).length;

  if (isLoading) return <p className="text-sm" style={{ color: '#94a3b8' }}>Loading students…</p>;
  if (!rows.length) return <p className="text-sm" style={{ color: '#94a3b8' }}>No students found for this class.</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: '#64748b' }}>Max Marks</label>
          <input type="number" min="1" value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)}
            className="w-20 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" style={{ border: '1px solid #e2e8f0' }} />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: '#64748b' }}>Assignment Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" style={{ border: '1px solid #e2e8f0' }} />
        </div>
        <p className="text-xs mt-4" style={{ color: '#64748b' }}>Submitted: <span className="font-semibold" style={{ color: '#059669' }}>{submittedCount}</span> / {rows.length}</p>
        <input type="text" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 w-52 mt-4" style={{ border: '1px solid #e2e8f0' }} />
      </div>

      <div className="rounded-xl overflow-x-auto" style={{ border: '1px solid #e2e8f0' }}>
        <table className="min-w-full text-sm">
          <thead style={{ background: '#fafafa' }}>
            <tr>
              {['#', 'Student', 'Reg No', 'Submitted', `Marks / ${maxMarks}`].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.map((r, i) => {
              const isSubmitted = local[r.studentId]?.submitted ?? false;
              return (
                <tr key={r.studentId} style={{ borderBottom: '1px solid #f8fafc' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td className="px-4 py-3 text-xs" style={{ color: '#94a3b8' }}>{i + 1}</td>
                  <td className="px-4 py-3 font-medium" style={{ color: '#0f172a' }}>{r.studentName}</td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: '#94a3b8' }}>{r.registrationNumber || '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggle(r.studentId)}
                      className="px-3 py-1 rounded-full text-xs font-semibold transition-colors"
                      style={isSubmitted ? { background: '#ecfdf5', color: '#059669' } : { background: '#fef2f2', color: '#dc2626' }}>
                      {isSubmitted ? '✓ Submitted' : '✗ Not Submitted'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <input type="number" min="0" max={maxMarks}
                      value={local[r.studentId]?.marks ?? ''}
                      onChange={(e) => setMarks(r.studentId, e.target.value)}
                      placeholder="0" disabled={!isSubmitted}
                      className="w-20 border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-40 disabled:bg-gray-50" style={{ border: '1px solid #e2e8f0' }} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button onClick={handleSave} disabled={saving || isFetching}
        className="px-5 py-2 text-sm font-medium rounded-lg text-white disabled:opacity-50"
        style={{ background: '#7c3aed' }}>
        {saving ? 'Saving…' : 'Save Assignment Records'}
      </button>
    </div>
  );
};

// ── SeminarPanel ─────────────────────────────────────────────────────────────
const SeminarPanel = ({ courseId, classStructureId }) => {
  const [maxMarks, setMaxMarks] = useState('10');
  const [date, setDate]         = useState('');
  const [local, setLocal]       = useState({});
  const [search, setSearch]     = useState('');

  const { data: rows = [], isLoading, isFetching } = useGetSeminarsQuery({ classStructureId, courseId });
  const [save, { isLoading: saving }] = useSaveSeminarsMutation();

  useEffect(() => {
    const init = {}; let detectedMax = '10'; let detectedDate = '';
    rows.forEach((r) => {
      init[r.studentId] = {
        done: r.done ?? false,
        scriptSubmitted: r.scriptSubmitted ?? false,
        marks: r.marksObtained != null ? String(r.marksObtained) : '',
        submittedDate: r.submittedDate ?? '',
      };
      if (r.maxMarks != null) detectedMax = String(r.maxMarks);
      if (r.seminarDate && !detectedDate) detectedDate = r.seminarDate;
    });
    setLocal(init); setMaxMarks(detectedMax); setDate(detectedDate);
  }, [rows]);

  const toggleField = (id, field) => setLocal((p) => ({ ...p, [id]: { ...p[id], [field]: !p[id]?.[field] } }));
  const setMarks    = (id, val)   => setLocal((p) => ({ ...p, [id]: { ...p[id], marks: val } }));

  const handleSave = async () => {
    const max = parseFloat(maxMarks);
    if (!max || max <= 0) { toast.error('Max marks must be > 0'); return; }
    try {
      await save({
        classStructureId, courseId, maxMarks: max, seminarDate: date || null,
        records: rows.map((r) => ({
          studentId: r.studentId,
          done: local[r.studentId]?.done ?? false,
          scriptSubmitted: local[r.studentId]?.scriptSubmitted ?? false,
          marksObtained: local[r.studentId]?.marks ? parseFloat(local[r.studentId].marks) : null,
          submittedDate: local[r.studentId]?.submittedDate || null,
        })),
      }).unwrap();
      toast.success('Seminar records saved!');
    } catch { toast.error('Failed to save.'); }
  };

  const displayed   = rows.filter((r) => { const q = search.toLowerCase(); return !q || r.studentName?.toLowerCase().includes(q) || r.registrationNumber?.toLowerCase().includes(q); });
  const doneCount   = rows.filter((r) => local[r.studentId]?.done).length;
  const scriptCount = rows.filter((r) => local[r.studentId]?.scriptSubmitted).length;

  if (isLoading) return <p className="text-sm" style={{ color: '#94a3b8' }}>Loading students…</p>;
  if (!rows.length) return <p className="text-sm" style={{ color: '#94a3b8' }}>No students found for this class.</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: '#64748b' }}>Max Marks</label>
          <input type="number" min="1" value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)}
            className="w-20 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" style={{ border: '1px solid #e2e8f0' }} />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: '#64748b' }}>Seminar Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" style={{ border: '1px solid #e2e8f0' }} />
        </div>
        <div className="text-xs mt-4 flex gap-4" style={{ color: '#64748b' }}>
          <span>Done: <span className="font-semibold" style={{ color: '#7c3aed' }}>{doneCount}</span>/{rows.length}</span>
          <span>Script: <span className="font-semibold" style={{ color: '#7c3aed' }}>{scriptCount}</span>/{rows.length}</span>
        </div>
        <input type="text" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 w-52 mt-4" style={{ border: '1px solid #e2e8f0' }} />
      </div>

      <div className="rounded-xl overflow-x-auto" style={{ border: '1px solid #e2e8f0' }}>
        <table className="min-w-full text-sm">
          <thead style={{ background: '#fafafa' }}>
            <tr>
              {['#', 'Student', 'Reg No', 'Seminar Done', 'Script Submitted', `Marks / ${maxMarks}`, 'Submitted Date'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.map((r, i) => {
              const isDone    = local[r.studentId]?.done ?? false;
              const hasScript = local[r.studentId]?.scriptSubmitted ?? false;
              return (
                <tr key={r.studentId} style={{ borderBottom: '1px solid #f8fafc' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td className="px-4 py-3 text-xs" style={{ color: '#94a3b8' }}>{i + 1}</td>
                  <td className="px-4 py-3 font-medium" style={{ color: '#0f172a' }}>{r.studentName}</td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: '#94a3b8' }}>{r.registrationNumber || '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleField(r.studentId, 'done')}
                      className="px-3 py-1 rounded-full text-xs font-semibold transition-colors"
                      style={isDone ? { background: '#ecfdf5', color: '#059669' } : { background: '#f1f5f9', color: '#64748b' }}>
                      {isDone ? '✓ Done' : 'Pending'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleField(r.studentId, 'scriptSubmitted')}
                      className="px-3 py-1 rounded-full text-xs font-semibold transition-colors"
                      style={hasScript ? { background: '#eff6ff', color: '#2563eb' } : { background: '#f1f5f9', color: '#64748b' }}>
                      {hasScript ? '✓ Submitted' : 'Not Submitted'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <input type="number" min="0" max={maxMarks}
                      value={local[r.studentId]?.marks ?? ''}
                      onChange={(e) => setMarks(r.studentId, e.target.value)}
                      placeholder="0" disabled={!isDone}
                      className="w-20 border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-40 disabled:bg-gray-50" style={{ border: '1px solid #e2e8f0' }} />
                  </td>
                  <td className="px-4 py-3">
                    <input type="date"
                      value={local[r.studentId]?.submittedDate ?? ''}
                      onChange={(e) => setLocal((p) => ({ ...p, [r.studentId]: { ...p[r.studentId], submittedDate: e.target.value } }))}
                      disabled={!isDone}
                      className="border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-40 disabled:bg-gray-50" style={{ border: '1px solid #e2e8f0' }} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button onClick={handleSave} disabled={saving || isFetching}
        className="px-5 py-2 text-sm font-medium rounded-lg text-white disabled:opacity-50"
        style={{ background: '#7c3aed' }}>
        {saving ? 'Saving…' : 'Save Seminar Records'}
      </button>
    </div>
  );
};

// ── CoursePanel (IA / Assignment / Seminar tabs) ───────────────────────────────
const CoursePanel = ({ assignment }) => {
  const [tab, setTab] = useState('ia');
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold" style={{ color: '#0f172a' }}>{assignment.courseName}</p>
        <p className="text-xs font-mono mt-0.5" style={{ color: '#94a3b8' }}>
          {assignment.courseCode} · Semester {assignment.semester}
        </p>
      </div>
      <div className="flex gap-1 p-1 rounded-lg w-fit" style={{ background: '#f1f5f9' }}>
        {[['ia', 'Internal Assessment'], ['assignment', 'Assignment'], ['seminar', 'Seminar']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className="px-4 py-2 text-sm font-semibold rounded-md transition-colors"
            style={tab === key ? { background: '#fff', color: '#7c3aed', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } : { color: '#64748b' }}>
            {label}
          </button>
        ))}
      </div>
      {tab === 'ia'         && <IAPanel         courseId={assignment.courseId} classStructureId={assignment.classStructureId} />}
      {tab === 'assignment' && <AssignmentPanel  courseId={assignment.courseId} classStructureId={assignment.classStructureId} />}
      {tab === 'seminar'    && <SeminarPanel     courseId={assignment.courseId} classStructureId={assignment.classStructureId} />}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const HodMyIAPage = ({ embedded = false }) => {
  const { data: me, isLoading: meLoading } = useGetHodMeQuery();
  const { data: assignments = [], isLoading: assignLoading } = useGetHodFacultyAssignmentsQuery(
    me?.id, { skip: !me?.id }
  );
  const [selKey, setSelKey] = useState('');

  const isLoading = meLoading || assignLoading;
  const selected = assignments.find(a => `${a.courseId}|${a.classStructureId}` === selKey);

  if (isLoading) return <p className="text-sm" style={{ color: '#94a3b8' }}>Loading…</p>;

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Course dropdown */}
      <div className="rounded-xl p-4" style={{ border: '1px solid #e2e8f0', background: '#fff' }}>
        <label className="text-xs font-semibold block mb-1.5" style={{ color: '#64748b' }}>Select Program</label>
        <select
          value={selKey}
          onChange={e => setSelKey(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          style={{ border: '1px solid #e2e8f0' }}>
          <option value="">Select a program</option>
          {assignments.map(a => (
            <option key={`${a.courseId}|${a.classStructureId}`} value={`${a.courseId}|${a.classStructureId}`}>
              {a.courseName} — Sem {a.semester}{a.specialization ? ` (${a.specialization})` : ''}
            </option>
          ))}
        </select>
      </div>

      {selected && (
        <div className="bg-white rounded-xl p-6" style={{ border: '1px solid #e2e8f0' }}>
          <CoursePanel key={selKey} assignment={selected} />
        </div>
      )}
    </div>
  );
};

export default HodMyIAPage;
