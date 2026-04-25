import toast from 'react-hot-toast';
import { useGetOrCreateClassStructureMutation } from './coursesAdminApi';

const YEAR_GROUPS = [
  { year: 1, label: 'Year 1', semesters: [1, 2] },
  { year: 2, label: 'Year 2', semesters: [3, 4] },
  { year: 3, label: 'Year 3', semesters: [5, 6] },
];

const SemesterGrid = ({ batch, dept, spec, existingStructures, onSelect, onBack }) => {
  const [getOrCreate, { isLoading }] = useGetOrCreateClassStructureMutation();

  const existingMap = Object.fromEntries(
    (existingStructures || []).map((cs) => [`${cs.yearOfStudy}-${cs.semester}`, cs])
  );

  const handleClick = async (yearOfStudy, semester) => {
    const key = `${yearOfStudy}-${semester}`;
    if (existingMap[key]) { onSelect(existingMap[key]); return; }
    try {
      const cs = await getOrCreate({
        batchId: batch.id,
        departmentId: dept.id,
        specializationId: spec?.id ?? null,
        yearOfStudy,
        semester,
      }).unwrap();
      onSelect(cs);
    } catch { toast.error('Failed to open semester.'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => onBack('batch')} className="text-xs text-indigo-600 hover:underline">← Batches</button>
        <span className="text-gray-300">/</span>
        <button onClick={() => onBack('dept')} className="text-xs text-indigo-600 hover:underline">
          {batch.startYear}–{batch.endYear}
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-semibold text-gray-800">
          {dept.name}{spec ? ` · ${spec.name}` : ''}
        </span>
      </div>
      <p className="text-xs text-gray-400">Click a semester to open its courses. Missing semesters are created automatically.</p>

      <div className="space-y-4">
        {YEAR_GROUPS.map(({ year, label, semesters }) => (
          <div key={year}>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{label}</p>
            <div className="grid grid-cols-2 gap-3">
              {semesters.map((sem) => {
                const key = `${year}-${sem}`;
                const exists = !!existingMap[key];
                return (
                  <button key={sem} onClick={() => handleClick(year, sem)} disabled={isLoading}
                    className={`py-5 rounded-xl border-2 text-sm font-bold transition-all disabled:opacity-50 ${
                      exists
                        ? 'border-indigo-400 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                        : 'border-dashed border-gray-200 text-gray-400 hover:border-indigo-300 hover:text-indigo-600'
                    }`}>
                    Semester {sem}
                    {exists && <span className="block text-xs font-normal text-indigo-400 mt-0.5">configured</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SemesterGrid;
