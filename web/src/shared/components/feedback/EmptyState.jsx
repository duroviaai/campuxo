const EmptyState = ({ message = 'No data found.' }) => (
  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
    <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 17v-2a4 4 0 014-4h0a4 4 0 014 4v2M9 7a3 3 0 116 0 3 3 0 01-6 0M3 20a9 9 0 0118 0" />
    </svg>
    <p className="text-sm">{message}</p>
  </div>
);

export default EmptyState;
