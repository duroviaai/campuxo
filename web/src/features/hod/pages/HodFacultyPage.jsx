import { useGetHodFacultyQuery } from '../state/hodApi';
import { TableWrap, Thead, Tr, Td, EmptyState, Badge } from '../../../shared/components/ui/PageShell';

const HodFacultyPage = () => {
  const { data: faculty = [], isLoading, isError } = useGetHodFacultyQuery();

  if (isLoading) return <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="rounded-xl h-12 skeleton" />)}</div>;
  if (isError)   return <p className="text-sm" style={{ color: '#dc2626' }}>Failed to load faculty.</p>;
  if (faculty.length === 0) return <EmptyState message="No faculty in your department." />;

  return (
    <div className="max-w-5xl">
      <TableWrap>
        <Thead cols={['#', 'Name', 'Email', 'Faculty ID', 'Courses']} />
        <tbody>
          {faculty.map((f, i) => (
            <Tr key={f.id}>
              <Td muted>{i + 1}</Td>
              <Td>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{ background: '#7c3aed' }}>
                    {f.fullName?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <span className="font-medium">{f.fullName}</span>
                </div>
              </Td>
              <Td muted>{f.email}</Td>
              <Td mono muted>{f.facultyId ?? '—'}</Td>
              <Td>
                <Badge color="violet">{f.courseCount ?? 0} courses</Badge>
              </Td>
            </Tr>
          ))}
        </tbody>
      </TableWrap>
    </div>
  );
};

export default HodFacultyPage;
