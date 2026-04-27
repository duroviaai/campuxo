import { useState } from 'react';
import { useGetHodStudentsQuery } from '../state/hodApi';
import { TableWrap, Thead, Tr, Td, EmptyState, Badge, SearchInput } from '../../../shared/components/ui/PageShell';

const HodStudentsPage = () => {
  const { data: students = [], isLoading, isError } = useGetHodStudentsQuery();
  const [search, setSearch] = useState('');

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return !q || s.fullName?.toLowerCase().includes(q) || s.registrationNumber?.toLowerCase().includes(q);
  });

  if (isLoading) return <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="rounded-xl h-12 skeleton" />)}</div>;
  if (isError)   return <p className="text-sm" style={{ color: '#dc2626' }}>Failed to load students.</p>;

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium" style={{ color: '#64748b' }}>{filtered.length} student{filtered.length !== 1 ? 's' : ''}</p>
        <SearchInput value={search} onChange={setSearch} placeholder="Search name or reg no..." />
      </div>

      {filtered.length === 0
        ? <EmptyState message={search ? 'No students match your search.' : 'No students in your department.'} />
        : (
          <TableWrap>
            <Thead cols={['#', 'Name', 'Reg No.', 'Class', 'Year', 'Scheme']} />
            <tbody>
              {filtered.map((s, i) => (
                <Tr key={s.id}>
                  <Td muted>{i + 1}</Td>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{ background: '#059669' }}>
                        {s.fullName?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <span className="font-medium">{s.fullName}</span>
                    </div>
                  </Td>
                  <Td mono muted>{s.registrationNumber ?? '—'}</Td>
                  <Td muted>{s.classBatchDisplayName ?? s.classBatchName ?? '—'}</Td>
                  <Td muted>{s.yearOfStudy ? `Year ${s.yearOfStudy}` : '—'}</Td>
                  <Td>
                    {s.scheme
                      ? <Badge color={s.scheme === 'NEP' ? 'blue' : 'violet'}>{s.scheme}</Badge>
                      : <span style={{ color: '#cbd5e1' }}>—</span>
                    }
                  </Td>
                </Tr>
              ))}
            </tbody>
          </TableWrap>
        )
      }
    </div>
  );
};

export default HodStudentsPage;
