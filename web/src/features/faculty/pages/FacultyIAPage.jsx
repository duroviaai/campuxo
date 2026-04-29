import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useGetFacultyCoursesQuery, useGetFacultyAssignmentsQuery } from '../state/facultyApi';
import {
  useGetIAMarksQuery, useSaveIAMarksMutation,
  useGetAssignmentsQuery, useSaveAssignmentsMutation,
  useGetSeminarsQuery, useSaveSeminarsMutation,
  useGetFinalMarksQuery, useCalculateFinalMarksMutation,
} from '../../admin/ia/iaApi';

// ─── IA helpers ───────────────────────────────────────────────────────────────
const scaleToTen = (raw) => Math.ceil(Number(raw) / 2);

const needsIA3 = (r) => {
  const ia1 = r.marks?.[1]; const max1 = Number(r.maxMarks?.[1] ?? 20);
  const ia2 = r.marks?.[2]; const max2 = Number(r.maxMarks?.[2] ?? 20);
  return ia1 === undefined || ia2 === undefined ||
    Number(ia1) < 0.35 * max1 || Number(ia2) < 0.35 * max2;
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

const sel = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50 disabled:bg-gray-50';
const inputCls = 'border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
const numCls = 'w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

// ─── IA Panel ─────────────────────────────────────────────────────────────────
const IAPanel = ({ course, classStructure }) => {
  const [activeIA, setActiveIA] = useState(1);
  const [maxMarks, setMaxMarks] = useState('20');
  const [iaDate, setIaDate] = useState('');
  const [localMarks, setLocalMarks] = useState({});

  const { data: rows = [], isLoading, isFetching } = useGetIAMarksQuery({
    classStructureId: classStructure.id, courseId: course.id,
  });
  const [saveMarks, { isLoading: saving }] = useSaveIAMarksMutation();

  useEffect(() => {
    const init = {}; let detectedMax = '20'; let detectedDate = '';
    rows.forEach((r) => {
      const m = r.marks?.[activeIA]; const mx = r.maxMarks?.[activeIA]; const dt = r.dates?.[activeIA];
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
      await saveMarks({ classStructureId: classStructure.id, courseId: course.id,
        iaNumber: activeIA, maxMarks: max, iaDate: iaDate || null, marks: marksToSave }).unwrap();
      toast.success(`IA ${activeIA} marks saved!`);
    } catch { toast.error('Failed to save marks.'); }
  };

  const ia3EligibleCount = rows.filter(needsIA3).length;

  if (isLoading) return <p className="text-sm text-gray-400">Loading students…</p>;
  if (!rows.length) return <p className="text-sm text-gray-400">No students found for this class.</p>;

  return (
    <div className="space-y-4">
      {/* IA tab switcher */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {[1, 2, 3].map((n) => (
          <button key={n} onClick={() => setActiveIA(n)}
            className={`px-5 py-2 text-sm font-semibold rounded-md transition-colors ${
              activeIA === n ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            IA {n}
            {n === 3 && ia3EligibleCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                {ia3EligibleCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeIA === 3 && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800 space-y-1">
          <p><span className="font-semibold">Who writes IA3?</span> Students absent for IA1/IA2 or scored below 35%.</p>
          <p><span className="font-semibold">Scaling:</span> Each IA /20 → /10 via ⌈marks ÷ 2⌉. Final = best 2 of IA1/IA2/IA3 → /20.</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-xs font-medium text-gray-500">Max Marks (IA {activeIA})</label>
        <input type="number" min="1" value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)} className={numCls} />
        <label className="text-xs font-medium text-gray-500">IA {activeIA} Date</label>
        <input type="date" value={iaDate} onChange={(e) => setIaDate(e.target.value)} className={inputCls} />
        <span className="text-xs text-gray-400">
          {rows.filter((r) => r.marks?.[activeIA] !== undefined).length}/{rows.length} filled
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Student</th>
              <th className="px-4 py-3 text-left">Reg No</th>
              <th className="px-4 py-3 text-left">IA1 /20→/10</th>
              <th className="px-4 py-3 text-left">IA2 /20→/10</th>
              <th className="px-4 py-3 text-left">IA3 /20→/10</th>
              <th className="px-4 py-3 text-left">Final /20</th>
              <th className="px-4 py-3 text-left">Enter IA {activeIA}</th>
              <th className="px-4 py-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r, i) => {
              const eligible = needsIA3(r);
              const final    = computeFinal(r);
              const dimRow   = activeIA === 3 && !eligible;
              return (
                <tr key={r.studentId} className={`hover:bg-gray-50 ${dimRow ? 'opacity-40' : ''}`}>
                  <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {r.studentName}
                    {eligible && (
                      <span className="ml-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">IA3</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs font-mono">{r.registrationNumber || '—'}</td>
                  {[1, 2, 3].map((n) => {
                    const raw = r.marks?.[n]; const mx = Number(r.maxMarks?.[n] ?? 20);
                    const scaled = raw !== undefined ? scaleToTen(raw) : null;
                    const isUsed = final?.used?.includes(n);
                    const isFail = raw !== undefined && Number(raw) < 0.35 * mx;
                    return (
                      <td key={n} className="px-4 py-3">
                        {raw !== undefined ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                            isUsed ? 'bg-green-100 text-green-700' : isFail ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                          }`}>{raw}/{mx}→{scaled}{isUsed && <span>✓</span>}</span>
                        ) : n <= 2 && eligible ? (
                          <span className="text-xs font-semibold text-red-400">Absent</span>
                        ) : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3">
                    {final ? (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        final.total >= 14 ? 'bg-green-100 text-green-700' : final.total >= 10 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'
                      }`}>{final.total}/20</span>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {activeIA !== 3 || eligible ? (
                      <input type="number" min="0" max={maxMarks}
                        value={localMarks[r.studentId]?.marks ?? ''}
                        onChange={(e) => setLocalMarks((p) => ({ ...p, [r.studentId]: { ...p[r.studentId], marks: e.target.value } }))}
                        placeholder="0" className={numCls} />
                    ) : <span className="text-gray-300 text-xs">N/A</span>}
                  </td>
                  <td className="px-4 py-3">
                    {activeIA !== 3 || eligible ? (
                      <input type="date"
                        value={localMarks[r.studentId]?.date ?? ''}
                        onChange={(e) => setLocalMarks((p) => ({ ...p, [r.studentId]: { ...p[r.studentId], date: e.target.value } }))}
                        className={inputCls} />
                    ) : <span className="text-gray-300 text-xs">N/A</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-4 pt-1 flex-wrap">
        <button onClick={handleSave} disabled={saving || isFetching}
          className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">
          {saving ? 'Saving…' : `Save IA ${activeIA} Marks`}
        </button>
        {(() => {
          const finals = rows.map(computeFinal).filter(Boolean);
          if (!finals.length) return null;
          const avg = finals.reduce((s, f) => s + f.total, 0) / finals.length;
          return <span className="text-xs text-gray-500">Class avg: <span className="font-semibold text-indigo-600">{avg.toFixed(1)}/20</span></span>;
        })()}
      </div>
    </div>
  );
};

// ─── Assignment Panel ─────────────────────────────────────────────────────────
const AssignmentPanel = ({ course, classStructure }) => {
  const [maxMarks, setMaxMarks] = useState('10');
  const [date, setDate] = useState('');
  const [local, setLocal] = useState({});

  const { data: rows = [], isLoading, isFetching } = useGetAssignmentsQuery({
    classStructureId: classStructure.id, courseId: course.id,
  });
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

  const handleSave = async () => {
    const max = parseFloat(maxMarks);
    if (!max || max <= 0) { toast.error('Max marks must be > 0'); return; }
    try {
      await save({
        classStructureId: classStructure.id, courseId: course.id,
        maxMarks: max, assignmentDate: date || null,
        records: rows.map((r) => ({
          studentId: r.studentId,
          submitted: local[r.studentId]?.submitted ?? false,
          marksObtained: local[r.studentId]?.marks ? parseFloat(local[r.studentId].marks) : null,
        })),
      }).unwrap();
      toast.success('Assignment records saved!');
    } catch { toast.error('Failed to save.'); }
  };

  if (isLoading) return <p className="text-sm text-gray-400">Loading students…</p>;
  if (!rows.length) return <p className="text-sm text-gray-400">No students found for this class.</p>;

  const submittedCount = rows.filter((r) => local[r.studentId]?.submitted).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Max Marks</label>
          <input type="number" min="1" value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)} className={numCls} />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Assignment Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Submitted: <span className="text-green-600 font-semibold">{submittedCount}</span> / {rows.length}
        </p>
      </div>
      <div className="rounded-xl border border-gray-200 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Student</th>
              <th className="px-4 py-3 text-left">Reg No</th>
              <th className="px-4 py-3 text-center">Submitted</th>
              <th className="px-4 py-3 text-left">Marks / {maxMarks}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r, i) => {
              const isSubmitted = local[r.studentId]?.submitted ?? false;
              return (
                <tr key={r.studentId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{r.studentName}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs font-mono">{r.registrationNumber || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setLocal((p) => ({ ...p, [r.studentId]: { ...p[r.studentId], submitted: !p[r.studentId]?.submitted } }))}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        isSubmitted ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-50 text-red-500 hover:bg-red-100'
                      }`}>
                      {isSubmitted ? '✓ Submitted' : '✗ Not Submitted'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <input type="number" min="0" max={maxMarks}
                      value={local[r.studentId]?.marks ?? ''}
                      onChange={(e) => setLocal((p) => ({ ...p, [r.studentId]: { ...p[r.studentId], marks: e.target.value } }))}
                      placeholder="0" disabled={!isSubmitted}
                      className={`${numCls} disabled:opacity-40 disabled:bg-gray-50`} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button onClick={handleSave} disabled={saving || isFetching}
        className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">
        {saving ? 'Saving…' : 'Save Assignment Records'}
      </button>
    </div>
  );
};

// ─── Seminar Panel ────────────────────────────────────────────────────────────
const SeminarPanel = ({ course, classStructure }) => {
  const [maxMarks, setMaxMarks] = useState('10');
  const [date, setDate] = useState('');
  const [local, setLocal] = useState({});

  const { data: rows = [], isLoading, isFetching } = useGetSeminarsQuery({
    classStructureId: classStructure.id, courseId: course.id,
  });
  const [save, { isLoading: saving }] = useSaveSeminarsMutation();

  useEffect(() => {
    const init = {}; let detectedMax = '10'; let detectedDate = '';
    rows.forEach((r) => {
      init[r.studentId] = {
        done: r.done ?? false, scriptSubmitted: r.scriptSubmitted ?? false,
        marks: r.marksObtained != null ? String(r.marksObtained) : '',
        submittedDate: r.submittedDate ?? '',
      };
      if (r.maxMarks != null) detectedMax = String(r.maxMarks);
      if (r.seminarDate && !detectedDate) detectedDate = r.seminarDate;
    });
    setLocal(init); setMaxMarks(detectedMax); setDate(detectedDate);
  }, [rows]);

  const handleSave = async () => {
    const max = parseFloat(maxMarks);
    if (!max || max <= 0) { toast.error('Max marks must be > 0'); return; }
    try {
      await save({
        classStructureId: classStructure.id, courseId: course.id,
        maxMarks: max, seminarDate: date || null,
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

  if (isLoading) return <p className="text-sm text-gray-400">Loading students…</p>;
  if (!rows.length) return <p className="text-sm text-gray-400">No students found for this class.</p>;

  const doneCount   = rows.filter((r) => local[r.studentId]?.done).length;
  const scriptCount = rows.filter((r) => local[r.studentId]?.scriptSubmitted).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Max Marks</label>
          <input type="number" min="1" value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)} className={numCls} />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Seminar Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
        </div>
        <div className="text-xs text-gray-500 mt-4 flex gap-4">
          <span>Done: <span className="text-indigo-600 font-semibold">{doneCount}</span>/{rows.length}</span>
          <span>Script: <span className="text-indigo-600 font-semibold">{scriptCount}</span>/{rows.length}</span>
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Student</th>
              <th className="px-4 py-3 text-left">Reg No</th>
              <th className="px-4 py-3 text-center">Done</th>
              <th className="px-4 py-3 text-center">Script</th>
              <th className="px-4 py-3 text-left">Marks / {maxMarks}</th>
              <th className="px-4 py-3 text-left">Submitted Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r, i) => {
              const isDone    = local[r.studentId]?.done ?? false;
              const hasScript = local[r.studentId]?.scriptSubmitted ?? false;
              return (
                <tr key={r.studentId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{r.studentName}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs font-mono">{r.registrationNumber || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => setLocal((p) => ({ ...p, [r.studentId]: { ...p[r.studentId], done: !p[r.studentId]?.done } }))}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        isDone ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}>
                      {isDone ? '✓ Done' : 'Pending'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => setLocal((p) => ({ ...p, [r.studentId]: { ...p[r.studentId], scriptSubmitted: !p[r.studentId]?.scriptSubmitted } }))}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        hasScript ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}>
                      {hasScript ? '✓ Submitted' : 'Not Submitted'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <input type="number" min="0" max={maxMarks}
                      value={local[r.studentId]?.marks ?? ''}
                      onChange={(e) => setLocal((p) => ({ ...p, [r.studentId]: { ...p[r.studentId], marks: e.target.value } }))}
                      placeholder="0" disabled={!isDone}
                      className={`${numCls} disabled:opacity-40 disabled:bg-gray-50`} />
                  </td>
                  <td className="px-4 py-3">
                    <input type="date"
                      value={local[r.studentId]?.submittedDate ?? ''}
                      onChange={(e) => setLocal((p) => ({ ...p, [r.studentId]: { ...p[r.studentId], submittedDate: e.target.value } }))}
                      disabled={!isDone}
                      className={`${inputCls} disabled:opacity-40 disabled:bg-gray-50`} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button onClick={handleSave} disabled={saving || isFetching}
        className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">
        {saving ? 'Saving…' : 'Save Seminar Records'}
      </button>
    </div>
  );
};

// ─── Final Marks Panel ────────────────────────────────────────────────────────
const FinalMarksPanel = ({ course, classStructure }) => {
  const { data: rows = [], isLoading, refetch } = useGetFinalMarksQuery({
    classStructureId: classStructure.id, courseId: course.id,
  });
  const [calculate, { isLoading: calculating }] = useCalculateFinalMarksMutation();

  const handleCalculate = async () => {
    try {
      await calculate({ classStructureId: classStructure.id, courseId: course.id }).unwrap();
      toast.success('Final marks calculated!');
      refetch();
    } catch { toast.error('Failed to calculate.'); }
  };

  if (isLoading) return <p className="text-sm text-gray-400">Loading…</p>;

  return (
    <div className="space-y-4">
      <button onClick={handleCalculate} disabled={calculating}
        className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">
        {calculating ? 'Calculating…' : 'Calculate Final Marks'}
      </button>
      {rows.length > 0 && (
        <div className="rounded-xl border border-gray-200 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Student</th>
                <th className="px-4 py-3 text-left">Reg No</th>
                <th className="px-4 py-3 text-left">IA1</th>
                <th className="px-4 py-3 text-left">IA2</th>
                <th className="px-4 py-3 text-left">IA3</th>
                <th className="px-4 py-3 text-left">Final /20</th>
                <th className="px-4 py-3 text-left">Calculated On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r, i) => (
                <tr key={r.studentId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{r.studentName}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs font-mono">{r.registrationNumber || '—'}</td>
                  <td className="px-4 py-3 text-xs">{r.ia1Marks ?? '—'}</td>
                  <td className="px-4 py-3 text-xs">{r.ia2Marks ?? '—'}</td>
                  <td className="px-4 py-3 text-xs">{r.ia3Marks ?? '—'}</td>
                  <td className="px-4 py-3">
                    {r.finalMarks != null ? (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        r.finalMarks >= 14 ? 'bg-green-100 text-green-700'
                        : r.finalMarks >= 10 ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-600'
                      }`}>{r.finalMarks}/20</span>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{r.calculatedDate ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!rows.length && <p className="text-sm text-gray-400">No final marks yet. Click Calculate to generate.</p>}
    </div>
  );
};

// ─── Course Panel (tabs) ──────────────────────────────────────────────────────
const CoursePanel = ({ course, classStructure }) => {
  const [tab, setTab] = useState('ia');
  const TABS = [['ia', 'IA Marks'], ['assignment', 'Assignments'], ['seminar', 'Seminars'], ['final', 'Final Marks']];
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold text-gray-800">{course.name}</p>
        <p className="text-xs text-gray-400 font-mono">{course.code} · Semester {classStructure.semester ?? '—'}</p>
      </div>
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit flex-wrap">
        {TABS.map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
              tab === key ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>{label}</button>
        ))}
      </div>
      {tab === 'ia'         && <IAPanel         course={course} classStructure={classStructure} />}
      {tab === 'assignment' && <AssignmentPanel  course={course} classStructure={classStructure} />}
      {tab === 'seminar'    && <SeminarPanel     course={course} classStructure={classStructure} />}
      {tab === 'final'      && <FinalMarksPanel  course={course} classStructure={classStructure} />}
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const FacultyIAPage = () => {
  const [courseId, setCourseId]   = useState('');
  const [csId, setCsId]           = useState('');

  const { data: courses = [],     isLoading: coursesLoading }     = useGetFacultyCoursesQuery();
  const { data: assignments = [], isLoading: assignmentsLoading } = useGetFacultyAssignmentsQuery();

  // Class structures for the selected course — derived from assignments
  const classStructures = assignments.filter(
    (a) => String(a.courseId) === courseId && a.classStructureId != null
  );

  // Reset class structure when course changes
  const handleCourseChange = (e) => { setCourseId(e.target.value); setCsId(''); };

  const selectedCourse = courses.find((c) => String(c.id) === courseId);
  const selectedCs     = classStructures.find((a) => String(a.classStructureId) === csId);

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Selectors */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Course</label>
          <select value={courseId} onChange={handleCourseChange} className={sel} disabled={coursesLoading}>
            <option value="">{coursesLoading ? 'Loading…' : 'Select course'}</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Class Structure</label>
          <select value={csId} onChange={(e) => setCsId(e.target.value)} className={sel}
            disabled={!courseId || assignmentsLoading || !classStructures.length}>
            <option value="">
              {!courseId ? 'Select a course first'
                : assignmentsLoading ? 'Loading…'
                : !classStructures.length ? 'No classes assigned'
                : 'Select class'}
            </option>
            {classStructures.map((a) => (
              <option key={a.classStructureId} value={a.classStructureId}>
                {a.classDisplayName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Panel */}
      {selectedCourse && selectedCs && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <CoursePanel
            key={`${selectedCs.classStructureId}-${selectedCourse.id}`}
            course={selectedCourse}
            classStructure={{ id: selectedCs.classStructureId, semester: selectedCs.semester }}
          />
        </div>
      )}

      {courseId && !csId && classStructures.length > 0 && (
        <p className="text-sm text-gray-400 text-center py-8">Select a class structure to manage marks.</p>
      )}
    </div>
  );
};

export default FacultyIAPage;
