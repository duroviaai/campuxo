import { useState } from 'react';
import {
  useGetMyCoursesQuery,
  useGetMyClassStructureIdQuery,
  useGetMyIAMarksQuery,
  useGetMyAssignmentQuery,
  useGetMySeminarQuery,
  useGetMyFinalMarksQuery,
} from '../state/studentApi';
import { Card, Tabs, Badge, SelectInput, TableWrap, Thead, Tr, Td } from '../../../shared/components/ui/PageShell';

const TABS = [
  { key: 'ia',       label: 'IA Marks'    },
  { key: 'assign',   label: 'Assignments' },
  { key: 'seminar',  label: 'Seminars'    },
  { key: 'final',    label: 'Final Marks' },
];

const Empty = () => (
  <p className="text-sm text-center py-10" style={{ color: '#94a3b8' }}>Marks not yet entered.</p>
);

const PctBar = ({ value, max }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const color = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
  const textColor = pct >= 75 ? '#059669' : pct >= 50 ? '#d97706' : '#dc2626';
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-24 rounded-full h-1.5" style={{ background: '#f1f5f9' }}>
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-semibold tabular-nums" style={{ color: textColor }}>{pct}%</span>
    </div>
  );
};

// ── IA Marks Tab ──────────────────────────────────────────────────────────────
const IATab = ({ courseId, classStructureId }) => {
  const { data, isLoading } = useGetMyIAMarksQuery({ courseId, classStructureId });

  if (isLoading) return <div className="h-24 skeleton rounded-xl" />;
  if (!data?.marks || Object.keys(data.marks).length === 0) return <Empty />;

  const iaNumbers = Object.keys(data.marks).map(Number).sort();

  return (
    <TableWrap>
      <Thead cols={['IA No.', 'Marks Obtained', 'Max Marks', 'Percentage', 'Date']} />
      <tbody>
        {iaNumbers.map(n => {
          const obtained = Number(data.marks[n]);
          const max      = Number(data.maxMarks?.[n] ?? 0);
          const date     = data.dates?.[n];
          return (
            <Tr key={n}>
              <Td><span className="font-semibold" style={{ color: '#7c3aed' }}>IA {n}</span></Td>
              <Td>{obtained}</Td>
              <Td muted>{max}</Td>
              <Td><PctBar value={obtained} max={max} /></Td>
              <Td muted>{date ?? '—'}</Td>
            </Tr>
          );
        })}
      </tbody>
    </TableWrap>
  );
};

// ── Assignments Tab ───────────────────────────────────────────────────────────
const AssignTab = ({ courseId, classStructureId }) => {
  const { data, isLoading } = useGetMyAssignmentQuery({ courseId, classStructureId });

  if (isLoading) return <div className="h-24 skeleton rounded-xl" />;
  if (!data) return <Empty />;

  const obtained = Number(data.marksObtained ?? 0);
  const max      = Number(data.maxMarks ?? 0);

  return (
    <Card>
      <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#94a3b8' }}>Status</p>
          <Badge color={data.submitted ? 'green' : 'red'}>{data.submitted ? 'Submitted' : 'Not Submitted'}</Badge>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#94a3b8' }}>Marks</p>
          <p className="text-lg font-bold" style={{ color: '#0f172a' }}>
            {data.marksObtained != null ? `${obtained} / ${max}` : '—'}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#94a3b8' }}>Percentage</p>
          {data.marksObtained != null ? <PctBar value={obtained} max={max} /> : <p className="text-sm" style={{ color: '#94a3b8' }}>—</p>}
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#94a3b8' }}>Date</p>
          <p className="text-sm" style={{ color: '#334155' }}>{data.assignmentDate ?? '—'}</p>
        </div>
      </div>
    </Card>
  );
};

// ── Seminars Tab ──────────────────────────────────────────────────────────────
const SeminarTab = ({ courseId, classStructureId }) => {
  const { data, isLoading } = useGetMySeminarQuery({ courseId, classStructureId });

  if (isLoading) return <div className="h-24 skeleton rounded-xl" />;
  if (!data) return <Empty />;

  const obtained = Number(data.marksObtained ?? 0);
  const max      = Number(data.maxMarks ?? 0);

  return (
    <Card>
      <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#94a3b8' }}>Seminar Done</p>
          <Badge color={data.done ? 'green' : 'amber'}>{data.done ? 'Done' : 'Pending'}</Badge>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#94a3b8' }}>Script Submitted</p>
          <Badge color={data.scriptSubmitted ? 'green' : 'red'}>{data.scriptSubmitted ? 'Submitted' : 'Not Submitted'}</Badge>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#94a3b8' }}>Marks</p>
          <p className="text-lg font-bold" style={{ color: '#0f172a' }}>
            {data.marksObtained != null ? `${obtained} / ${max}` : '—'}
          </p>
          {data.marksObtained != null && <PctBar value={obtained} max={max} />}
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#94a3b8' }}>Date</p>
          <p className="text-sm" style={{ color: '#334155' }}>{data.seminarDate ?? '—'}</p>
        </div>
      </div>
    </Card>
  );
};

// ── Final Marks Tab ───────────────────────────────────────────────────────────
const FinalTab = ({ courseId, classStructureId }) => {
  const { data, isLoading } = useGetMyFinalMarksQuery({ courseId, classStructureId });

  if (isLoading) return <div className="h-24 skeleton rounded-xl" />;
  if (!data) return <Empty />;

  const final = Number(data.finalMarks ?? 0);
  const max   = 20;

  const iaRows = [
    { label: 'IA 1', value: data.ia1Marks },
    { label: 'IA 2', value: data.ia2Marks },
    { label: 'IA 3', value: data.ia3Marks },
  ].filter(r => r.value != null);

  return (
    <div className="space-y-4">
      {/* Final marks hero */}
      <Card>
        <div className="p-5 flex items-center gap-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#94a3b8' }}>Final Marks</p>
            <p className="text-3xl font-bold tabular-nums" style={{ color: final >= 14 ? '#059669' : final >= 10 ? '#d97706' : '#dc2626' }}>
              {final} <span className="text-base font-medium" style={{ color: '#94a3b8' }}>/ {max}</span>
            </p>
          </div>
          <div className="flex-1">
            <div className="w-full rounded-full h-2" style={{ background: '#f1f5f9' }}>
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min((final / max) * 100, 100)}%`,
                  background: final >= 14 ? '#10b981' : final >= 10 ? '#f59e0b' : '#ef4444',
                }}
              />
            </div>
            <p className="text-[11px] mt-1" style={{ color: '#94a3b8' }}>
              {data.calculatedDate ? `Calculated on ${data.calculatedDate}` : 'Not yet calculated'}
            </p>
          </div>
        </div>
      </Card>

      {/* IA breakdown */}
      {iaRows.length > 0 && (
        <TableWrap>
          <Thead cols={['Component', 'Marks Obtained', 'Max Marks', 'Percentage']} />
          <tbody>
            {iaRows.map(({ label, value }) => {
              const v = Number(value);
              return (
                <Tr key={label}>
                  <Td><span className="font-semibold" style={{ color: '#7c3aed' }}>{label}</span></Td>
                  <Td>{v}</Td>
                  <Td muted>20</Td>
                  <Td><PctBar value={v} max={20} /></Td>
                </Tr>
              );
            })}
            {data.topTwoAverage != null && (
              <Tr>
                <Td><span className="font-semibold" style={{ color: '#0f172a' }}>Top 2 Average</span></Td>
                <Td><span className="font-bold">{Number(data.topTwoAverage)}</span></Td>
                <Td muted>20</Td>
                <Td><PctBar value={Number(data.topTwoAverage)} max={20} /></Td>
              </Tr>
            )}
          </tbody>
        </TableWrap>
      )}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const StudentIAPage = () => {
  const [courseId, setCourseId] = useState('');
  const [tab, setTab]           = useState('ia');

  const { data: courses = [], isLoading: coursesLoading } = useGetMyCoursesQuery();
  const { data: classStructureId }                        = useGetMyClassStructureIdQuery();

  const selectedCourse = courses.find(c => String(c.id) === courseId);
  const ready = courseId && classStructureId;

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Course selector */}
      <Card>
        <div className="p-4 flex flex-wrap items-center gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>Course</span>
          <SelectInput value={courseId} onChange={v => { setCourseId(v); setTab('ia'); }}>
            <option value="">{coursesLoading ? 'Loading…' : 'Select a course'}</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
            ))}
          </SelectInput>
          {selectedCourse && (
            <span className="text-xs" style={{ color: '#94a3b8' }}>
              {selectedCourse.facultyName || 'No instructor'} · {selectedCourse.credits ?? 0} credits
            </span>
          )}
        </div>
      </Card>

      {!courseId && (
        <p className="text-sm text-center py-10" style={{ color: '#94a3b8' }}>Select a course to view your marks.</p>
      )}

      {courseId && !classStructureId && (
        <p className="text-sm text-center py-10" style={{ color: '#94a3b8' }}>
          No class structure found for your profile. Contact your administrator.
        </p>
      )}

      {ready && (
        <div className="space-y-4">
          <Tabs tabs={TABS} active={tab} onChange={setTab} />
          {tab === 'ia'      && <IATab      courseId={Number(courseId)} classStructureId={classStructureId} />}
          {tab === 'assign'  && <AssignTab  courseId={Number(courseId)} classStructureId={classStructureId} />}
          {tab === 'seminar' && <SeminarTab courseId={Number(courseId)} classStructureId={classStructureId} />}
          {tab === 'final'   && <FinalTab   courseId={Number(courseId)} classStructureId={classStructureId} />}
        </div>
      )}
    </div>
  );
};

export default StudentIAPage;
