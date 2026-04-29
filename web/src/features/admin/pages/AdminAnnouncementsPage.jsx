import { useState } from 'react';
import toast from 'react-hot-toast';
import { useSendAnnouncementMutation } from '../state/adminApi';

const TARGETS = [
  { label: 'All Users',      value: null },
  { label: 'Students only',  value: 'ROLE_STUDENT' },
  { label: 'Faculty only',   value: 'ROLE_FACULTY' },
  { label: 'HOD only',       value: 'ROLE_HOD' },
];

const MAX_TITLE   = 100;
const MAX_MESSAGE = 500;

const AdminAnnouncementsPage = () => {
  const [title,      setTitle]      = useState('');
  const [message,    setMessage]    = useState('');
  const [targetRole, setTargetRole] = useState(null);

  const [sendAnnouncement, { isLoading }] = useSendAnnouncementMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    try {
      await sendAnnouncement({
        title:      title.trim(),
        message:    message.trim(),
        targetRole: targetRole ?? undefined,
      }).unwrap();
      const audience = TARGETS.find(t => t.value === targetRole)?.label ?? 'All Users';
      toast.success(`Announcement sent to ${audience}`);
      setTitle('');
      setMessage('');
      setTargetRole(null);
    } catch {
      toast.error('Failed to send announcement');
    }
  };

  return (
    <div className="max-w-xl space-y-5">
      {/* Header */}
      <div>
        <h1
          className="text-lg font-bold"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#0f172a', letterSpacing: '-0.02em' }}
        >
          Announcements
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>
          Broadcast a message to all users or a specific role.
        </p>
      </div>

      {/* Form card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl p-6 space-y-5"
        style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
      >
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold" style={{ color: '#374151' }}>
            Title <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value.slice(0, MAX_TITLE))}
            placeholder="e.g. Exam schedule updated"
            required
            className="w-full px-3 py-2.5 text-sm rounded-xl outline-none transition-all"
            style={{ border: '1.5px solid #e2e8f0', color: '#0f172a', background: '#fff' }}
            onFocus={e => { e.target.style.borderColor = '#7c3aed'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; }}
            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = ''; }}
          />
          <p className="text-[11px] text-right" style={{ color: '#94a3b8' }}>{title.length}/{MAX_TITLE}</p>
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold" style={{ color: '#374151' }}>
            Message <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value.slice(0, MAX_MESSAGE))}
            placeholder="Write your announcement here..."
            required
            rows={3}
            className="w-full px-3 py-2.5 text-sm rounded-xl outline-none transition-all resize-none"
            style={{ border: '1.5px solid #e2e8f0', color: '#0f172a', background: '#fff' }}
            onFocus={e => { e.target.style.borderColor = '#7c3aed'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; }}
            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = ''; }}
          />
          <p className="text-[11px] text-right" style={{ color: message.length >= MAX_MESSAGE ? '#ef4444' : '#94a3b8' }}>
            {message.length}/{MAX_MESSAGE}
          </p>
        </div>

        {/* Target audience */}
        <div className="space-y-2">
          <label className="text-xs font-semibold" style={{ color: '#374151' }}>Target Audience</label>
          <div className="grid grid-cols-2 gap-2">
            {TARGETS.map(({ label, value }) => (
              <label
                key={label}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
                style={{
                  border: `1.5px solid ${targetRole === value ? '#7c3aed' : '#e2e8f0'}`,
                  background: targetRole === value ? '#faf5ff' : '#fff',
                }}
              >
                <input
                  type="radio"
                  name="targetRole"
                  checked={targetRole === value}
                  onChange={() => setTargetRole(value)}
                  className="accent-violet-600 shrink-0"
                />
                <span className="text-sm font-medium" style={{ color: targetRole === value ? '#7c3aed' : '#374151' }}>
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || !title.trim() || !message.trim()}
          className="w-full py-2.5 text-sm font-semibold rounded-xl text-white transition-all"
          style={{
            background: isLoading || !title.trim() || !message.trim()
              ? '#c4b5fd'
              : 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
            boxShadow: isLoading || !title.trim() || !message.trim()
              ? 'none'
              : '0 2px 8px rgba(124,58,237,0.35)',
            cursor: isLoading || !title.trim() || !message.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? 'Sending…' : 'Send Announcement'}
        </button>
      </form>
    </div>
  );
};

export default AdminAnnouncementsPage;
