import { useState } from 'react';
import DeptList from '../components/DeptList';
import FacultyManager from '../components/FacultyManager';

const LEVEL = { DEPT: 'dept', FACULTY: 'faculty' };

const FacultyListPage = () => {
  const [level, setLevel] = useState(LEVEL.DEPT);
  const [dept, setDept] = useState(null);

  const handleDeptSelect = (d) => { setDept(d); setLevel(LEVEL.FACULTY); };
  const handleBack = () => { setDept(null); setLevel(LEVEL.DEPT); };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {level === LEVEL.DEPT && (
        <DeptList onSelect={handleDeptSelect} />
      )}
      {level === LEVEL.FACULTY && dept && (
        <FacultyManager dept={dept} onBack={handleBack} />
      )}
    </div>
  );
};

export default FacultyListPage;
