import { memo } from 'react';
import UserRow from './UserRow';

const COLUMNS = ['Name', 'Email', 'Role', 'Actions'];

const PendingUsersTable = memo(({ users, onApprove, onReject }) => (
  <div className="overflow-x-auto rounded-lg border border-gray-100">
    <table className="w-full text-sm text-left">
      <thead className="sticky top-0 bg-gray-50 z-10">
        <tr>
          {COLUMNS.map((col) => (
            <th key={col} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200">{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {users.map((user, i) => (
          <UserRow key={user.id} user={user} onApprove={onApprove} onReject={onReject} zebra={i % 2 === 1} />
        ))}
      </tbody>
    </table>
  </div>
));

export default PendingUsersTable;
