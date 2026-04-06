/**
 * Extracts a user-friendly message from an Axios error.
 * Handles the standard API error shape: { message, error, errors[] }
 */
export const parseApiError = (error) => {
  if (!error.response) {
    // Network / timeout — no response at all
    return 'Network error. Please check your connection.';
  }

  const { status, data } = error.response;

  // Try to pull a message from the response body first
  const serverMsg =
    data?.message ||
    data?.error ||
    (Array.isArray(data?.errors) ? data.errors[0] : null) ||
    null;

  switch (status) {
    case 400: return serverMsg || 'Invalid request. Please check your input.';
    case 401: return 'Unauthorized access. Please sign in again.';
    case 403: return 'You do not have permission to perform this action.';
    case 404: return serverMsg || 'The requested resource was not found.';
    case 409: return serverMsg || 'A conflict occurred. The record may already exist.';
    case 422: return serverMsg || 'Validation failed. Please check your input.';
    case 500: return 'Something went wrong on the server. Please try again later.';
    case 503: return 'Service unavailable. Please try again later.';
    default:  return serverMsg || 'Something went wrong. Please try again.';
  }
};
