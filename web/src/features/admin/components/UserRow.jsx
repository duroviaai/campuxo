import { memo } from 'react';

const UserRow = memo(({ user, onApprove, onReject, zebra }) => (
  <tr className={`border-b border-gray-100 last:border-0 hover:bg-indigo-50 transition-colors ${zebra ? 'bg-gray-50/60' : 'bg-white'}`}>
    <td className="px-4 py-3 font-medium text-gray-900">{user.fullName}</td>
    <td className="px-4 py-3 text-gray-500">{user.email}</td>
    <td className="px-4 py-3">
      <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">
        {[...user.roles][0]?.replace('ROLE_', '')}
      </span>
    </td>
    <td className="px-4 py-3 flex gap-2">
      <button
        onClick={() => onApprove(user.id)}
        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors shadow-sm"
      >
        Approve
      </button>
      <button
        onClick={() => onReject(user.id)}
        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors shadow-sm"
      >
        Reject
      </button>
    </td>
  </tr>
));

export default UserRow;
