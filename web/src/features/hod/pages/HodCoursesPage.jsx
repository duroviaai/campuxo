import { useState } from 'react';
import { useGetHodCoursesQuery, useGetHodAttendanceQuery } from '../state/hodApi';
import { TableWrap, Thead, Tr, Td, EmptyState, Modal, PctBar, Badge } from '../../../shared/components/ui/PageShell';

const AttendanceModal = ({ courseId, classId, courseName, onClose }) => {
  const { data: overview = [], isLoading } = useGetHodAttendanceQuery({ courseId, classId });

  return (
    <Modal title={`${courseName} — Attendance`} onClose={onClose}>
      {isLoading ? (
        <div className="p-5 space-y-2">{[1,2,3].map(i => <div key={i} className="h-10 rounded-lg skeleton" />)}</div>
      ) : overview.length === 0 ? (
        <p className="text-sm text-center py-10" style={{ color: '#94a3b8' }}>No attendance data available.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
              {['Student', 'Attended', 'Total', 'Attendance'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {overview.map((s) => (
              <tr key={s.studentId} style={{ borderBottom: '1px solid #f8fafc' }}>
                <td className="px-5 py-3 font-medium" style={{ color: '#0f172a' }}>{s.studentName}</td>
                <td className="px-5 py-3" style={{ color: '#64748b' }}>{s.attendedClasses}</td>
                <td className="px-5 py-3" style={{ color: '#64748b' }}>{s.totalClasses}</td>
                <td className="px-5 py-3"><PctBar pct={s.attendancePercentage} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Modal>
  );
};

const HodCoursesPage = () => {
  const { data: courses = [], isLoading, isError } = useGetHodCoursesQuery();
  const [selected, setSelected] = useState(null);

  if (isLoading) return <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="rounded-xl h-12 skeleton" />)}</div>;
  if (isError)   return <p className="text-sm" style={{ color: '#dc2626' }}>Failed to load courses.</p>;
  if (courses.length === 0) return <EmptyState message="No courses in your department." />;

  return (
    <div className="max-w-5xl">
      <TableWrap>
        <Thead cols={['#', 'Course', 'Code', 'Credits', 'Faculty', 'Students']} />
        <tbody>
          {courses.map((c, i) => (
            <Tr key={c.id}>
              <Td muted>{i + 1}</Td>
              <Td>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{ background: '#d97706' }}>
                    {c.code?.slice(0, 2) ?? '??'}
                  </div>
                  <span className="font-medium">{c.name}</span>
                </div>
              </Td>
              <Td mono muted>{c.code ?? '—'}</Td>
              <Td muted>{c.credits ?? '—'}</Td>
              <Td>
                {c.facultyName
                  ? <span style={{ color: '#334155' }}>{c.facultyName}</span>
                  : <Badge color="gray">Unassigned</Badge>
                }
              </Td>
              <Td muted>{c.studentCount ?? 0}</Td>
            </Tr>
          ))}
        </tbody>
      </TableWrap>

      {selected && <AttendanceModal {...selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default HodCoursesPage;
