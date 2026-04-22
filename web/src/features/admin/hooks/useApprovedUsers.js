import toast from 'react-hot-toast';
import { useGetApprovedUsersQuery, useRevokeUserMutation } from '../state/adminApi';

const useApprovedUsers = (role = null) => {
  const { data: users = [], isLoading: loading, error } = useGetApprovedUsersQuery(role);
  const [revokeUserMutation] = useRevokeUserMutation();

  const revokeUser = (id) =>
    revokeUserMutation(id).unwrap()
      .then(() => toast.success('Access revoked'))
      .catch(() => toast.error('Failed to revoke access'));

  return { users, loading, error, revokeUser };
};

export default useApprovedUsers;
