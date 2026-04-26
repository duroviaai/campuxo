import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetBatchesQuery,
  useGetDepartmentsQuery,
  useGetSpecializationsByDeptQuery,
  useGetClassStructureQuery,
  useGetAdminCoursesQuery,
} from './coursesAdminApi';
import { useGetStatsQuery } from '../state/adminApi';
import { useGetFacultyQuery } from '../../faculty/state/facultyApi';
import ROUTES from '../../../app/routes/routeConstants';

// -- Stats Bar ----------------------------------------------------------------
const StatCard = ({ label, value, to, color }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className={`flex-1 min-w-[120px] bg-white rounded-xl border p-4 text-left hover:shadow-md transition-all group ${color.border}`}
    >
      <p className={`text-2xl font-black ${color.text}`}>{value ?? '-'}</p>
      <p className="text-xs text-gray-500 mt-0.5 group-hover:text-gray-700">{label}</p>
    </button>
  );
};

const StatsBar = () => {
  const { data } = useGetStatsQuery();
  const items = [
    { label: 'Students',          value: data?.totalStudents,    to: ROUTES.ADMIN_STUDENTS,  color: { border: 'border-blue-100',    text: 'text-blue-600'    } },
    { label: 'Faculty',           value: data?.totalFaculty,     to: ROUTES.ADMIN_FACULTY,   color: { border: 'border-indigo-100',  text: 'text-indigo-600'  } },
    { label: 'Courses',           value: data?.totalCourses,     to: ROUTES.ADMIN_COURSES,   color: { border: 'border-emerald-100', text: 'text-emerald-600' } },
    { label: 'Pending Approvals', value: data?.pendingApprovals, to: ROUTES.ADMIN_APPROVALS, color: { border: 'border-amber-100',   text: 'text-amber-600'   } },
  ];
  return (
    <div className="flex flex-wrap gap-3">
      {items.map((item) => <StatCard key={item.label} {...item} />)}
    </div>
  );
};

// -- Helpers ------------------------------------------------------------------
const SchemeBadge = ({ scheme }) => (
  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
    scheme === 'NEP' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
  }`}>{scheme}</span>
);

const Crumb = ({ label, onClick }) => (
  <>
    <button onClick={onClick} className="text-indigo-600 hover:underline text-xs">{label}</button>
    <span className="text-gray-300 text-xs">/</span>
  </>
);

// -- Course card --------------------------------------------------------------
const CourseCard = ({ course, faculty = [], onAssignFaculty }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-indigo-200 hover:shadow-sm transition-all flex flex-col gap-2">
    <div className="flex items-start justify-between gap-2">
      <p className="text-sm font-semibold text-gray-900 leading-snug">{course.name}</p>
      {course.type && (
        <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-semibold ${
          course.type === 'ELECTIVE'
            ? 'bg-purple-50 text-purple-600 border border-purple-100'
            : 'bg-gray-100 text-gray-500'
        }`}>
          {course.type.charAt(0) + course.type.slice(1).toLowerCase()}
        </span>
      )}
    </div>
    <p className="text-xs text-gray-400 font-mono">
      {course.code}{course.credits ? ` · ${course.credits} cr` : ''}
    </p>
    <div className="mt-1 flex flex-wrap gap-1.5">
      {faculty.length === 0 ? (
        <button
          onClick={onAssignFaculty}
          className="text-[10px] px-2.5 py-1 rounded-lg border border-dashed border-amber-300 text-amber-600 hover:bg-amber-50 hover:border-amber-400 transition-colors font-semibold"
        >
          + Assign Faculty
        </button>
      ) : (
        faculty.map((f) => (
          <span key={f.id}
            className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
            {f.fullName || `${f.firstName ?? ''} ${f.lastName ?? ''}`.trim() || '-'}
          </span>
        ))
      )}
    </div>
  </div>
);

// -- Semester courses view ----------------------------------------------------
const SemesterCourses = ({ classStructure, dept, batch, spec, onBack }) => {
  const navigate = useNavigate();
  const { data: courses = [], isLoading } = useGetAdminCoursesQuery({ classStructureId: classStructure.id });
  const getFaculty = (course) => course.assignedFaculty ?? [];
  const unassigned = courses.filter((c) => getFaculty(c).length === 0).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 flex-wrap">
        <Crumb label="Batches" onClick={() => onBack('batch')} />
        <Crumb label={`${batch.startYear}-${batch.endYear}`} onClick={() => onBack('dept')} />
        <Crumb label={`${dept.name}${spec ? ` · ${spec.name}` : ''}`} onClick={() => onBack('semester')} />
        <span className="text-xs font-semibold text-gray-800">Semester {classStructure.semester}</span>
      </div>

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">
            Semester {classStructure.semester}
            <span className="ml-2 text-xs font-normal text-gray-400">Year {classStructure.yearOfStudy}</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {dept.name}{spec ? ` · ${spec.name}` : ''} · {batch.startYear}-{batch.endYear}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {!isLoading && unassigned > 0 && (
            <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-1 rounded-full font-semibold">
              {unassigned} without faculty
            </span>
          )}
          <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-semibold">
            {courses.length} course{courses.length !== 1 ? 's' : ''}
          </span>
          <button onClick={() => navigate(ROUTES.ADMIN_FACULTY)}
            className="text-xs font-semibold text-indigo-600 hover:underline">
            Assign Faculty &rarr;
          </button>
          <button onClick={() => navigate(ROUTES.ADMIN_COURSES)}
            className="text-xs text-gray-400 hover:text-gray-600 hover:underline">
            Manage Courses
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : courses.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <p className="text-3xl">📚</p>
          <p className="text-sm font-semibold text-gray-700">No courses assigned yet</p>
          <button onClick={() => navigate(ROUTES.ADMIN_COURSES)}
            className="text-xs text-indigo-600 hover:underline">
            Go to Courses to assign courses to this semester
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              faculty={getFaculty(course)}
              onAssignFaculty={() => navigate(ROUTES.ADMIN_FACULTY)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// -- Semester grid ------------------------------------------------------------
const YEAR_GROUPS = [
  { year: 1, label: 'Year 1', semesters: [1, 2] },
  { year: 2, label: 'Year 2', semesters: [3, 4] },
  { year: 3, label: 'Year 3', semesters: [5, 6] },
];

const SemesterLevel = ({ batch, dept, spec, onSelect, onBack }) => {
  const navigate = useNavigate();
  const { data: structures = [], isLoading } = useGetClassStructureQuery(
    { batchId: batch.id, deptId: dept.id, specId: spec?.id ?? undefined },
    { skip: !batch.id || !dept.id }
  );
  const existingMap = Object.fromEntries(
    structures.map((cs) => [`${cs.yearOfStudy}-${cs.semester}`, cs])
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 flex-wrap">
        <Crumb label="Batches" onClick={() => onBack('batch')} />
        <Crumb label={`${batch.startYear}-${batch.endYear}`} onClick={() => onBack('dept')} />
        <span className="text-xs font-semibold text-gray-800">
          {dept.name}{spec ? ` · ${spec.name}` : ''}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">{dept.name}{spec ? ` · ${spec.name}` : ''}</h2>
          <p className="text-xs text-gray-400 mt-0.5">Select a semester to view its courses and faculty assignments.</p>
        </div>
        <button onClick={() => navigate(ROUTES.ADMIN_COURSES)}
          className="text-xs font-semibold text-indigo-600 hover:underline">
          Manage Courses &rarr;
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1,2,3,4,5,6].map((i) => <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {YEAR_GROUPS.map(({ year, label, semesters }) => (
            <div key={year}>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{label}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {semesters.map((sem) => {
                  const cs = existingMap[`${year}-${sem}`];
                  return (
                    <button key={sem}
                      onClick={() => cs && onSelect(cs)}
                      disabled={!cs}
                      className={`py-5 rounded-xl border-2 text-sm font-bold transition-all ${
                        cs
                          ? 'border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 cursor-pointer'
                          : 'border-dashed border-gray-200 text-gray-300 cursor-not-allowed'
                      }`}>
                      Semester {sem}
                      <span className={`block text-[10px] font-normal mt-0.5 ${cs ? 'text-indigo-400' : 'text-gray-300'}`}>
                        {cs ? (cs.totalCourses != null ? `${cs.totalCourses} courses` : 'configured') : 'not set up'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// -- Dept + Spec picker -------------------------------------------------------
const DeptSpecChips = ({ dept, batch, onSelect }) => {
  const { data: specs = [] } = useGetSpecializationsByDeptQuery(
    { deptId: dept.id, scheme: batch.scheme },
    { skip: !dept.id }
  );
  return (
    <div className="flex flex-wrap gap-1.5 mt-2" onClick={(e) => e.stopPropagation()}>
      <button onClick={() => onSelect(dept, null)}
        className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-600 text-white hover:bg-indigo-700">
        All
      </button>
      {specs.map((s) => (
        <button key={s.id} onClick={() => onSelect(dept, s)}
          className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-gray-200 bg-gray-50 text-gray-700 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700">
          {s.name}
        </button>
      ))}
    </div>
  );
};

const DeptLevel = ({ batch, onSelect, onBack }) => {
  const navigate = useNavigate();
  const { data: departments = [], isLoading } = useGetDepartmentsQuery();
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Crumb label="Batches" onClick={onBack} />
        <span className="text-xs font-semibold text-gray-800">
          {batch.startYear}-{batch.endYear} <SchemeBadge scheme={batch.scheme} />
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">Departments</h2>
          <p className="text-xs text-gray-400 mt-0.5">Select a department and optionally a specialization to view semesters.</p>
        </div>
        <button onClick={() => navigate(ROUTES.ADMIN_FACULTY)}
          className="text-xs font-semibold text-indigo-600 hover:underline">
          Manage Faculty &rarr;
        </button>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1,2,3,4].map((i) => <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : departments.length === 0 ? (
        <div className="py-16 text-center space-y-2">
          <p className="text-3xl">🏛️</p>
          <p className="text-sm font-semibold text-gray-700">No departments configured</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {departments.map((dept) => (
            <div key={dept.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-indigo-300 transition-colors">
              <div className="flex items-start justify-between">
                <p className="text-sm font-semibold text-gray-900">{dept.name}</p>
                {dept.totalFaculty != null && (
                  <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-semibold shrink-0 ml-2">
                    {dept.totalFaculty} faculty
                  </span>
                )}
              </div>
              <DeptSpecChips dept={dept} batch={batch} onSelect={onSelect} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// -- Batch list ---------------------------------------------------------------
const BatchLevel = ({ onSelect }) => {
  const navigate = useNavigate();
  const { data: batches = [], isLoading } = useGetBatchesQuery();
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">Batches</h2>
          <p className="text-xs text-gray-400 mt-0.5">Select a batch to explore its departments, semesters and assignments.</p>
        </div>
        <button onClick={() => navigate(ROUTES.ADMIN_COURSES)}
          className="text-xs font-semibold text-indigo-600 hover:underline">
          + Manage Courses
        </button>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map((i) => <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : batches.length === 0 ? (
        <div className="py-16 text-center space-y-2">
          <p className="text-3xl">🏫</p>
          <p className="text-sm font-semibold text-gray-700">No batches configured yet</p>
          <button onClick={() => navigate(ROUTES.ADMIN_COURSES)}
            className="text-xs text-indigo-600 hover:underline">
            Go to Courses to add batches
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map((b) => (
            <button key={b.id} onClick={() => onSelect(b)}
              className="text-left bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-400 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-3">
                <p className="text-lg font-bold text-gray-900 font-mono">{b.startYear} - {b.endYear}</p>
                <SchemeBadge scheme={b.scheme} />
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                <span><span className="font-bold text-gray-800">{b.totalDepartments ?? 0}</span> dept{b.totalDepartments !== 1 ? 's' : ''}</span>
                <span><span className="font-bold text-gray-800">{b.totalCourses ?? 0}</span> courses</span>
                {b.totalStudents != null && (
                  <span><span className="font-bold text-gray-800">{b.totalStudents}</span> students</span>
                )}
              </div>
              <p className="text-indigo-500 text-xs font-semibold mt-3 opacity-0 group-hover:opacity-100 transition-opacity">Explore &rarr;</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// -- Tab bar ------------------------------------------------------------------
const TABS = [
  { key: 'courses',  label: 'Courses'  },
  { key: 'faculty',  label: 'Faculty'  },
  { key: 'students', label: 'Students' },
];

const TabBar = ({ active, onChange }) => (
  <div className="flex gap-1 border-b border-gray-200">
    {TABS.map((t) => (
      <button key={t.key} onClick={() => onChange(t.key)}
        className={`px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
          active === t.key
            ? 'border-indigo-600 text-indigo-600'
            : 'border-transparent text-gray-400 hover:text-gray-700'
        }`}>
        {t.label}
      </button>
    ))}
  </div>
);

// -- Courses tab (existing drill-down) ----------------------------------------
const LEVEL = { BATCH: 'batch', DEPT: 'dept', SEMESTER: 'semester', COURSES: 'courses' };

const CoursesTab = () => {
  const [level, setLevel] = useState(LEVEL.BATCH);
  const [batch, setBatch] = useState(null);
  const [dept, setDept] = useState(null);
  const [spec, setSpec] = useState(null);
  const [classStructure, setClassStructure] = useState(null);

  const handleBack = (to) => {
    if (to === 'batch')    { setBatch(null); setDept(null); setSpec(null); setClassStructure(null); setLevel(LEVEL.BATCH); }
    if (to === 'dept')     { setDept(null); setSpec(null); setClassStructure(null); setLevel(LEVEL.DEPT); }
    if (to === 'semester') { setClassStructure(null); setLevel(LEVEL.SEMESTER); }
  };

  return (
    <>
      {level === LEVEL.BATCH && (
        <BatchLevel onSelect={(b) => { setBatch(b); setLevel(LEVEL.DEPT); }} />
      )}
      {level === LEVEL.DEPT && batch && (
        <DeptLevel
          batch={batch}
          onSelect={(d, s) => { setDept(d); setSpec(s); setLevel(LEVEL.SEMESTER); }}
          onBack={() => handleBack('batch')}
        />
      )}
      {level === LEVEL.SEMESTER && batch && dept && (
        <SemesterLevel
          batch={batch} dept={dept} spec={spec}
          onSelect={(cs) => { setClassStructure(cs); setLevel(LEVEL.COURSES); }}
          onBack={handleBack}
        />
      )}
      {level === LEVEL.COURSES && batch && dept && classStructure && (
        <SemesterCourses
          batch={batch} dept={dept} spec={spec}
          classStructure={classStructure}
          onBack={handleBack}
        />
      )}
    </>
  );
};

// -- Placeholder tabs (to be built next) --------------------------------------
const FacultyTab = () => {
  const [dept, setDept] = useState(null);
  const { data: departments = [], isLoading: deptsLoading } = useGetDepartmentsQuery();
  const { data: facultyData, isLoading: facultyLoading } = useGetFacultyQuery(
    { page: 0, size: 200, sort: 'id', department: dept?.name },
    { skip: !dept }
  );
  const allFaculty = facultyData?.content ?? facultyData ?? [];
  const hod  = allFaculty.find((f) => f.hod);
  const rest = allFaculty.filter((f) => !f.hod);

  const getName = (f) => [f.firstName, f.lastName].filter(Boolean).join(' ') || f.fullName || '-';
  const initials = (f) => getName(f).split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';

  if (dept) return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-xs">
        <button onClick={() => setDept(null)} className="text-indigo-600 hover:underline">Departments</button>
        <span className="text-gray-300">/</span>
        <span className="font-semibold text-gray-800">{dept.name}</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">{dept.name}</h2>
          {!facultyLoading && <p className="text-xs text-gray-400 mt-0.5">{allFaculty.length} member{allFaculty.length !== 1 ? 's' : ''}</p>}
        </div>
      </div>

      {facultyLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map((i) => <div key={i} className="h-32 rounded-xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : allFaculty.length === 0 ? (
        <div className="py-16 text-center space-y-2">
          <p className="text-3xl">👨‍🏫</p>
          <p className="text-sm font-semibold text-gray-700">No faculty in {dept.name}</p>
        </div>
      ) : (
        <div className="space-y-5">
          {hod && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-violet-500 uppercase tracking-widest">Head of Department</p>
              <div className="max-w-sm">
                <FacultyViewCard f={hod} getName={getName} initials={initials} />
              </div>
            </div>
          )}
          {rest.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Faculty Members</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rest.map((f) => <FacultyViewCard key={f.id} f={f} getName={getName} initials={initials} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">Faculty by Department</h2>
          <p className="text-xs text-gray-400 mt-0.5">Select a department to view its faculty members.</p>
        </div>
      </div>
      {deptsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4].map((i) => <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((d) => (
            <button key={d.id} onClick={() => setDept(d)}
              className="text-left bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-400 hover:shadow-md transition-all group">
              <p className="text-base font-bold text-gray-900">{d.name}</p>
              <p className="text-indigo-400 text-xs mt-3 opacity-0 group-hover:opacity-100 transition-opacity">View faculty &rarr;</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const FacultyViewCard = ({ f, getName, initials }) => (
  <div className={`bg-white rounded-xl border p-4 ${
    f.hod ? 'border-violet-300' : 'border-gray-200'
  } ${f.status === 'inactive' ? 'opacity-60' : ''}`}>
    <div className="flex items-start gap-3 mb-3">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
        f.hod ? 'bg-violet-100 text-violet-700' : 'bg-indigo-100 text-indigo-700'
      }`}>{initials(f)}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-sm font-bold text-gray-900 truncate">{getName(f)}</p>
          {f.hod && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700 font-bold">HOD</span>}
        </div>
        <p className="text-xs text-gray-400 truncate">{f.email || '-'}</p>
      </div>
      <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-bold ${
        f.status !== 'inactive' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'
      }`}>{f.status !== 'inactive' ? 'Active' : 'Inactive'}</span>
    </div>
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
      {f.designation && <span>{f.designation}</span>}
      {f.qualification && <span className="text-gray-400">{f.qualification}</span>}
      {f.experience != null && <span>{f.experience} yr{f.experience !== 1 ? 's' : ''} exp</span>}
      {f.facultyId && <span className="font-mono text-gray-400">{f.facultyId}</span>}
      <span><span className="font-bold text-gray-700">{f.courseCount ?? 0}</span> course{f.courseCount !== 1 ? 's' : ''}</span>
    </div>
    {f.subjects && (
      <p className="text-xs text-gray-400 mt-2 truncate">📚 {f.subjects}</p>
    )}
  </div>
);

const StudentsTab = () => {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [page, setPage] = useState(0);
  const [detail, setDetail] = useState(null);

  const { data: depts = [] } = useGetDepartmentsQuery();
  const { data, isLoading } = useGetStudentsQuery(
    { page, size: 15, sort: 'id', ...(search ? { search } : {}), ...(deptFilter ? { department: deptFilter } : {}) },
  );
  const students = data?.content ?? data ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const getName = (s) => [s.firstName, s.lastName].filter(Boolean).join(' ') || s.fullName || '-';
  const initials = (s) => getName(s).split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">Students</h2>
          {!isLoading && <p className="text-xs text-gray-400 mt-0.5">{totalElements} total</p>}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          placeholder="Search name, email or reg. no."
          className="border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300 min-w-[220px]"
        />
        <select
          value={deptFilter}
          onChange={(e) => { setDeptFilter(e.target.value); setPage(0); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="">All Departments</option>
          {depts.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1,2,3,4,5].map((i) => <div key={i} className="h-10 rounded-lg bg-gray-100 animate-pulse" />)}
          </div>
        ) : students.length === 0 ? (
          <div className="py-14 text-center space-y-2">
            <p className="text-3xl">🎓</p>
            <p className="text-sm font-semibold text-gray-700">
              {search || deptFilter ? 'No students match your filters.' : 'No students yet.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Student', 'Reg. No.', 'Department', 'Year', 'Batch', 'Scheme'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={s.id}
                  onClick={() => setDetail(s)}
                  className={`border-b border-gray-100 last:border-0 cursor-pointer hover:bg-indigo-50/40 transition-colors ${
                    i % 2 === 1 ? 'bg-gray-50/40' : 'bg-white'
                  }`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">
                        {initials(s)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{getName(s)}</p>
                        <p className="text-[10px] text-gray-400 truncate">{s.email || '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 font-mono">{s.registrationNumber || '-'}</td>
                  <td className="px-4 py-3 text-xs">
                    {s.department
                      ? <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold">{s.department}</span>
                      : <span className="text-gray-300">-</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {s.yearOfStudy ? `Year ${s.yearOfStudy}` : <span className="text-gray-300">-</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                    {s.classBatchStartYear ? `${s.classBatchStartYear}-${s.classBatchEndYear}` : <span className="text-gray-300">-</span>}
                  </td>
                  <td className="px-4 py-3">
                    {s.scheme
                      ? <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          s.scheme === 'NEP' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                        }`}>{s.scheme}</span>
                      : <span className="text-gray-300 text-xs">-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">Page {page + 1} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => p - 1)} disabled={page === 0}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
                Prev
              </button>
              <button onClick={() => setPage((p) => p + 1)} disabled={page + 1 >= totalPages}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail slide-over */}
      {detail && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30" onClick={() => setDetail(null)} />
          <div className="w-full max-w-sm bg-white shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <button onClick={() => setDetail(null)} className="text-xs text-indigo-600 hover:underline">Back</button>
              <p className="text-sm font-bold text-gray-900">{getName(detail)}</p>
              <div className="w-10" />
            </div>
            <div className="overflow-y-auto flex-1 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-base font-bold text-indigo-700">
                  {initials(detail)}
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900">{getName(detail)}</p>
                  {detail.registrationNumber && (
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{detail.registrationNumber}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Email',    detail.email],
                  ['Phone',    detail.phone],
                  ['Dept',     detail.department],
                  ['Year',     detail.yearOfStudy ? `Year ${detail.yearOfStudy}` : null],
                  ['Batch',    detail.classBatchStartYear ? `${detail.classBatchStartYear}-${detail.classBatchEndYear}` : null],
                  ['Scheme',   detail.scheme],
                  ['DOB',      detail.dateOfBirth],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
                    <p className="text-xs font-semibold text-gray-800 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// -- Main Page ----------------------------------------------------------------
const OverviewPage = () => {
  const [tab, setTab] = useState('courses');

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">View and manage courses, faculty and students in one place</p>
      </div>

      <StatsBar />

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 pt-4">
          <TabBar active={tab} onChange={setTab} />
        </div>
        <div className="p-6">
          {tab === 'courses'  && <CoursesTab />}
          {tab === 'faculty'  && <FacultyTab />}
          {tab === 'students' && <StudentsTab />}
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;
