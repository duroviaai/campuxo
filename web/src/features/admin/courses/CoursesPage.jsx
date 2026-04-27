import { useState } from 'react';
import BatchList from './BatchList';
import DepartmentPanel from './DepartmentPanel';
import SemesterGrid from './SemesterGrid';
import CourseManager from './CourseManager';
import { useGetClassStructureQuery } from './coursesAdminApi';

// Level constants
const LEVEL = { BATCH: 'batch', DEPT: 'dept', SEMESTER: 'semester', COURSES: 'courses' };

/* Thin wrapper to load existing class structures before rendering SemesterGrid */
const SemesterLevel = ({ batch, dept, spec, onSelect, onBack }) => {
  const { data: structures = [], isLoading } = useGetClassStructureQuery(
    { batchId: batch.id, deptId: dept.id, specId: spec?.id ?? undefined },
    { skip: !batch.id || !dept.id }
  );

  if (isLoading) return (
    <div className="grid grid-cols-2 gap-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
      ))}
    </div>
  );

  return (
    <SemesterGrid
      batch={batch} dept={dept} spec={spec}
      existingStructures={structures}
      onSelect={onSelect} onBack={onBack}
    />
  );
};

const CoursesPage = () => {
  const [level, setLevel] = useState(LEVEL.BATCH);
  const [batch, setBatch] = useState(null);
  const [dept, setDept] = useState(null);
  const [spec, setSpec] = useState(null);
  const [classStructure, setClassStructure] = useState(null);

  const handleBatchSelect = (b) => { setBatch(b); setLevel(LEVEL.DEPT); };

  const handleDeptSpecSelect = (d, s) => { setDept(d); setSpec(s); setLevel(LEVEL.SEMESTER); };

  const handleSemesterSelect = (cs) => { setClassStructure(cs); setLevel(LEVEL.COURSES); };

  const handleBack = (to) => {
    if (to === 'batch')    { setBatch(null); setDept(null); setSpec(null); setClassStructure(null); setLevel(LEVEL.BATCH); }
    if (to === 'dept')     { setDept(null); setSpec(null); setClassStructure(null); setLevel(LEVEL.DEPT); }
    if (to === 'semester') { setClassStructure(null); setLevel(LEVEL.SEMESTER); }
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {level === LEVEL.BATCH && (
          <BatchList onSelect={handleBatchSelect} />
        )}
        {level === LEVEL.DEPT && batch && (
          <DepartmentPanel batch={batch} onSelect={handleDeptSpecSelect} onBack={() => handleBack('batch')} />
        )}
        {level === LEVEL.SEMESTER && batch && dept && (
          <SemesterLevel
            batch={batch} dept={dept} spec={spec}
            onSelect={handleSemesterSelect}
            onBack={handleBack}
          />
        )}
        {level === LEVEL.COURSES && batch && dept && classStructure && (
          <CourseManager
            batch={batch} dept={dept} spec={spec}
            classStructure={classStructure}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
