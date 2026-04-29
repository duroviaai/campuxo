import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  useGetTimetableByClassStructureQuery,
  useCreateTimetableEntryMutation,
  useUpdateTimetableEntryMutation,
  useDeleteTimetableEntryMutation,
} from '../state/timetableApi';
import {
  useGetBatchesQuery,
  useGetDepartmentsQuery,
  useGetClassStructureQuery,
  useGetAdminCoursesQuery,
} from '../courses/coursesAdminApi';
import { useGetFacultyAssignedCoursesQuery } from '../../faculty/state/facultyApi';

// ── Constants ─────────────────────────────────────────────────────────────────

const DAYS = [
  { key: 'MON', label: 'Monday' },
  { key: 'TUE', label: 'Tuesday' },
  { key: 'WED', label: 'Wednesday' },
  { key: 'THU', label: 'Thursday' },
  { key: 'FRI', label: 'Friday' },
  { key: 'SAT', label: 'Saturday' },
];

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8);

const TYPE_STYLE = {
  LECTURE:  { bg: '#f5f3ff', border: '#7c3aed', text: '#5b21b6', badge: '#ede9fe' },
  LAB:      { bg: '#eff6ff', border: '#2563eb', text: '#1d4ed8', badge: '#dbeafe' },
  TUTORIAL: { bg: '#f0fdf4', border: '#16a34a', text: '#15803d', badge: '#dcfce7' },
};

const ENTRY_TYPES = ['LECTURE', 'LAB', 'TUTORIAL'];

const EMPTY_FORM = {
  dayOfWeek: 'MON', courseId: '', facultyId: '', startTime: '09:00',
  endTime: '10:00', room: '', type: 'LECTURE',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt12 = (time) => {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

const timeToDecimal = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h + m / 60;
};

const sel = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 disabled:opacity-50 disabled:bg-gray-50';
const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400';

// ── Entry card ────────────────────────────────────────────────────────────────

const EntryCard = ({ entry, onClick }) => {
  const style  = TYPE_STYLE[entry.type] ?? TYPE_STYLE.LECTURE;
  const start  = timeToDecimal(entry.startTime);
  const end    = timeToDecimal(entry.endTime);
  const top    = (start - 8) * 64;
  const height = Math.max((end - start) * 64 - 4, 28);

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick(entry); }}
      className="absolute left-1 right-1 rounded-lg px-2 py-1.5 overflow-hidden cursor-pointer group"
      style={{ top: `${top}px`, height: `${height}px`, background: style.bg, border: `1.5px solid ${style.border}` }}
      title={`${entry.courseName} · ${fmt12(entry.startTime)}–${fmt12(entry.endTime)}${entry.room ? ` · ${entry.room}` : ''}`}
    >
      <p className="text-[11px] font-bold leading-tight truncate" style={{ color: style.text }}>{entry.courseCode}</p>
      {height >= 44 && (
        <p className="text-[10px] leading-tight truncate mt-0.5" style={{ color: style.text, opacity: 0.8 }}>
          {entry.room || entry.courseName}
        </p>
      )}
      {height >= 58 && entry.facultyName && (
        <p className="text-[10px] leading-tight truncate" style={{ color: style.text, opacity: 0.65 }}>{entry.facultyName}</p>
      )}
      <span className="absolute top-1 right-1 text-[9px] font-bold px-1 rounded"
        style={{ background: style.badge, color: style.text }}>{entry.type[0]}</span>
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
        style={{ background: 'rgba(0,0,0,0.08)' }}>
        <span className="text-[10px] font-bold" style={{ color: style.text }}>Edit</span>
      </div>
    </div>
  );
};

// ── Modal ─────────────────────────────────────────────────────────────────────

const EntryModal = ({ entry, classStructureId, courses, onClose, onSaved }) => {
  const isEdit = !!entry?.id;
  const [form, setForm] = useState(entry?.id ? {
    dayOfWeek:  entry.dayOfWeek,
    courseId:   String(entry.courseId),
    facultyId:  entry.facultyId ? String(entry.facultyId) : '',
    startTime:  entry.startTime,
    endTime:    entry.endTime,
    room:       entry.room ?? '',
    type:       entry.type,
  } : { ...EMPTY_FORM, dayOfWeek: entry?.dayOfWeek ?? 'MON' });

  const [create, { isLoading: creating }] = useCreateTimetableEntryMutation();
  const [update, { isLoading: updating }] = useUpdateTimetableEntryMutation();
  const [remove, { isLoading: deleting }] = useDeleteTimetableEntryMutation();

  const saving = creating || updating;

  // Fetch faculty assigned to selected course
  const selectedCourse = courses.find(c => String(c.id) === form.courseId);
  const { data: assignedFaculty = [] } = useGetFacultyAssignedCoursesQuery(
    selectedCourse?.id,
    { skip: !selectedCourse?.id }
  );

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      classStructureId,
      courseId:   Number(form.courseId),
      facultyId:  form.facultyId ? Number(form.facultyId) : null,
      dayOfWeek:  form.dayOfWeek,
      startTime:  form.startTime,
      endTime:    form.endTime,
      room:       form.room || null,
      type:       form.type,
    };
    try {
      if (isEdit) await update({ id: entry.id, ...payload }).unwrap();
      else        await create(payload).unwrap();
      toast.success(isEdit ? 'Entry updated' : 'Entry added');
      onSaved();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save entry');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this timetable entry?')) return;
    try {
      await remove({ id: entry.id, classStructureId }).unwrap();
      toast.success('Entry deleted');
      onSaved();
    } catch {
      toast.error('Failed to delete entry');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
          <h2 className="text-sm font-bold" style={{ color: '#0f172a' }}>{isEdit ? 'Edit Entry' : 'Add Entry'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* Day + Type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold" style={{ color: '#64748b' }}>Day</label>
              <select value={form.dayOfWeek} onChange={e => set('dayOfWeek', e.target.value)} className={sel}>
                {DAYS.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold" style={{ color: '#64748b' }}>Type</label>
              <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
                {ENTRY_TYPES.map(t => {
                  const s = TYPE_STYLE[t];
                  const active = form.type === t;
                  return (
                    <button key={t} type="button" onClick={() => set('type', t)}
                      className="flex-1 py-2 text-[11px] font-bold transition-colors"
                      style={active ? { background: s.bg, color: s.text, borderBottom: `2px solid ${s.border}` } : { color: '#94a3b8' }}>
                      {t[0] + t.slice(1).toLowerCase()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Course */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold" style={{ color: '#64748b' }}>Course<span className="text-red-500 ml-0.5">*</span></label>
            <select required value={form.courseId} onChange={e => { set('courseId', e.target.value); set('facultyId', ''); }} className={sel}>
              <option value="">Select course</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
            </select>
          </div>

          {/* Faculty */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold" style={{ color: '#64748b' }}>Faculty</label>
            <select value={form.facultyId} onChange={e => set('facultyId', e.target.value)} className={sel} disabled={!form.courseId}>
              <option value="">None / TBD</option>
              {assignedFaculty.map(f => (
                <option key={f.id} value={f.id}>{f.firstName} {f.lastName}</option>
              ))}
            </select>
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold" style={{ color: '#64748b' }}>Start Time<span className="text-red-500 ml-0.5">*</span></label>
              <input required type="time" value={form.startTime} onChange={e => set('startTime', e.target.value)} className={inp} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold" style={{ color: '#64748b' }}>End Time<span className="text-red-500 ml-0.5">*</span></label>
              <input required type="time" value={form.endTime} onChange={e => set('endTime', e.target.value)} className={inp} />
            </div>
          </div>

          {/* Room */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold" style={{ color: '#64748b' }}>Room</label>
            <input type="text" value={form.room} onChange={e => set('room', e.target.value)} placeholder="e.g. A-101" className={inp} />
          </div>

          <div className="flex items-center gap-2 pt-1">
            {isEdit && (
              <button type="button" onClick={handleDelete} disabled={deleting}
                className="px-4 py-2 text-xs font-semibold rounded-lg disabled:opacity-50"
                style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            )}
            <div className="flex-1" />
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg"
              style={{ background: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 text-xs font-bold rounded-lg text-white disabled:opacity-50"
              style={{ background: '#7c3aed' }}>
              {saving ? 'Saving…' : isEdit ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Grid ──────────────────────────────────────────────────────────────────────

const TimetableGrid = ({ entries, courses, classStructureId, onEntryClick, onCellClick }) => {
  const byDay = Object.fromEntries(DAYS.map(d => [d.key, []]));
  entries.forEach(e => { if (byDay[e.dayOfWeek]) byDay[e.dayOfWeek].push(e); });

  const legend = Object.entries(TYPE_STYLE).map(([type, s]) => ({ type, ...s }));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 flex-wrap">
        {legend.map(({ type, border, text, bg }) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: bg, border: `1.5px solid ${border}` }} />
            <span className="text-xs font-semibold" style={{ color: text }}>{type[0] + type.slice(1).toLowerCase()}</span>
          </div>
        ))}
        <span className="text-xs ml-auto" style={{ color: '#94a3b8' }}>Click a cell to add · Click an entry to edit</span>
      </div>

      <div className="rounded-xl overflow-auto" style={{ border: '1px solid #e2e8f0' }}>
        <div className="min-w-[700px]">
          {/* Header */}
          <div className="grid" style={{ gridTemplateColumns: '56px repeat(6, 1fr)', background: '#fafafa', borderBottom: '1px solid #e2e8f0' }}>
            <div className="px-2 py-3" />
            {DAYS.map(d => (
              <div key={d.key} className="px-2 py-3 text-center">
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#334155' }}>{d.label.slice(0, 3)}</p>
                <p className="text-[10px] hidden sm:block mt-0.5" style={{ color: '#94a3b8' }}>{d.label}</p>
              </div>
            ))}
          </div>

          {/* Body */}
          <div className="grid" style={{ gridTemplateColumns: '56px repeat(6, 1fr)' }}>
            {/* Time labels */}
            <div>
              {HOURS.map(h => (
                <div key={h} className="flex items-start justify-end pr-2 pt-1"
                  style={{ height: '64px', borderBottom: '1px solid #f1f5f9' }}>
                  <span className="text-[10px] font-medium" style={{ color: '#94a3b8' }}>
                    {h % 12 || 12}{h < 12 ? 'am' : 'pm'}
                  </span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {DAYS.map(d => (
              <div key={d.key} className="relative cursor-pointer group/col"
                style={{ borderLeft: '1px solid #f1f5f9' }}
                onClick={() => onCellClick(d.key)}>
                {HOURS.map(h => (
                  <div key={h} className="group-hover/col:bg-violet-50/30 transition-colors"
                    style={{ height: '64px', borderBottom: '1px solid #f8fafc' }} />
                ))}
                {byDay[d.key].map(entry => (
                  <EntryCard key={entry.id} entry={entry} onClick={onEntryClick} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Class structure selector ──────────────────────────────────────────────────

const ClassStructureSelector = ({ value, onChange }) => {
  const [batchId, setBatchId] = useState('');
  const [deptId,  setDeptId]  = useState('');

  const { data: batches = [],    isLoading: bl } = useGetBatchesQuery();
  const { data: depts = [],      isLoading: dl } = useGetDepartmentsQuery();
  const { data: structures = [], isLoading: sl } = useGetClassStructureQuery(
    { batchId: Number(batchId), deptId: Number(deptId) },
    { skip: !batchId || !deptId }
  );

  return (
    <div className="bg-white rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3" style={{ border: '1px solid #e2e8f0' }}>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold" style={{ color: '#64748b' }}>Batch</label>
        <select value={batchId} onChange={e => { setBatchId(e.target.value); setDeptId(''); onChange(''); }} className={sel} disabled={bl}>
          <option value="">{bl ? 'Loading…' : 'Select batch'}</option>
          {batches.map(b => <option key={b.id} value={b.id}>{b.startYear}–{b.endYear} ({b.scheme})</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold" style={{ color: '#64748b' }}>Department</label>
        <select value={deptId} onChange={e => { setDeptId(e.target.value); onChange(''); }} className={sel} disabled={!batchId || dl}>
          <option value="">{dl ? 'Loading…' : 'Select department'}</option>
          {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold" style={{ color: '#64748b' }}>Semester</label>
        <select value={value} onChange={e => onChange(e.target.value)} className={sel} disabled={!deptId || sl}>
          <option value="">{sl ? 'Loading…' : 'Select semester'}</option>
          {structures.map(s => <option key={s.id} value={s.id}>Sem {s.semester} · Year {s.yearOfStudy}</option>)}
        </select>
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────

const AdminTimetablePage = () => {
  const [csId,   setCsId]   = useState('');
  const [modal,  setModal]  = useState(null); // null | { entry?, dayOfWeek? }

  const { data: entries = [], isLoading } = useGetTimetableByClassStructureQuery(
    Number(csId), { skip: !csId }
  );
  const { data: courses = [] } = useGetAdminCoursesQuery(
    { classStructureId: Number(csId) }, { skip: !csId }
  );

  const openAdd  = (dayOfWeek) => setModal({ dayOfWeek });
  const openEdit = (entry)     => setModal({ entry });
  const close    = ()          => setModal(null);

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-base font-bold" style={{ color: '#0f172a' }}>Timetable Management</h1>
        {csId && (
          <button onClick={() => openAdd('MON')}
            className="px-4 py-2 text-xs font-bold rounded-lg text-white"
            style={{ background: '#7c3aed' }}>
            + Add Entry
          </button>
        )}
      </div>

      <ClassStructureSelector value={csId} onChange={setCsId} />

      {csId && (
        isLoading
          ? <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-32 rounded-xl skeleton" />)}</div>
          : <TimetableGrid
              entries={entries}
              courses={courses}
              classStructureId={Number(csId)}
              onEntryClick={openEdit}
              onCellClick={openAdd}
            />
      )}

      {!csId && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: '#f5f3ff' }}>📅</div>
          <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>Select a class structure to manage its timetable</p>
        </div>
      )}

      {modal && (
        <EntryModal
          entry={modal.entry ?? { dayOfWeek: modal.dayOfWeek }}
          classStructureId={Number(csId)}
          courses={courses}
          onClose={close}
          onSaved={close}
        />
      )}
    </div>
  );
};

export default AdminTimetablePage;
