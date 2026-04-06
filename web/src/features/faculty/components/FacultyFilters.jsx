import { memo, useState, useEffect } from 'react';
import useDebounce from '../../../shared/hooks/useDebounce';

const FacultyFilters = memo(({ search, setSearch }) => {
  const [value, setValue] = useState(search);
  const debounced = useDebounce(value, 300);

  useEffect(() => { setSearch(debounced); }, [debounced]);

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Search by name or email"
      className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
    />
  );
});

export default FacultyFilters;
