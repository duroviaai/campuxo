import { memo, useState } from 'react';

const UserRow = memo(({ user, onApprove, onReject, onRevoke, zebra, mode = 'pending' }) => {
  const [loadingAction, setLoadingAction] = useState(null);

  const handle = async (action, fn) => {
    setLoadingAction(action);
    try { await fn(user.id); } finally { setLoadingAction(null); }
  };

  const role = [...user.roles][0]?.replace('ROLE_', '');
  const identifier = user.registrationNumber || user.facultyId || '—';
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  return (
    <tr className={`border-b border-gray-100 last:border-0 hover:bg-indigo-50 transition-colors ${zebra ? 'bg-gray-50/60' : 'bg-white'}`}>
      <td className="px-4 py-3">
        <p className="font-medium text-gray-900 text-sm">{user.fullName}</p>
        <p className="text-xs text-gray-400">{identifier}</p>
      </td>
      <td className="px-4 py-3 text-gray-500 text-sm">{user.email}</td>
      <td className="px-4 py-3">
        <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">{role}</span>
      </td>
      <td className="px-4 py-3 text-xs text-gray-400">{joinedDate}</td>
      <td className="px-4 py-3 flex gap-2">
        {mode === 'pending' && (
          <>
            <button
              disabled={!!loadingAction}
              onClick={() => handle('approve', onApprove)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white transition-colors shadow-sm"
            >
              {loadingAction === 'approve' ? '…' : 'Approve'}
            </button>
            <button
              disabled={!!loadingAction}
              onClick={() => {
                if (window.confirm(`Reject and delete ${user.fullName}?`)) handle('reject', onReject);
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white transition-colors shadow-sm"
            >
              {loadingAction === 'reject' ? '…' : 'Reject'}
            </button>
          </>
        )}
        {mode === 'approved' && (
          <button
            disabled={!!loadingAction}
            onClick={() => {
              if (window.confirm(`Revoke access for ${user.fullName}?`)) handle('revoke', onRevoke);
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white transition-colors shadow-sm"
          >
            {loadingAction === 'revoke' ? '…' : 'Revoke'}
          </button>
        )}
      </td>
    </tr>
  );
});

export default UserRow;
