import toast from 'react-hot-toast';
import { useGetPendingUsersQuery, useApproveUserMutation, useRejectUserMutation } from '../state/adminApi';

const usePendingUsers = (role = null) => {
  const { data: users = [], isLoading: loading, error } = useGetPendingUsersQuery(role);
  const [approveUserMutation] = useApproveUserMutation();
  const [rejectUserMutation]  = useRejectUserMutation();

  const approveUser = (id) =>
    approveUserMutation(id).unwrap()
      .then(() => toast.success('User approved'))
      .catch(() => toast.error('Failed to approve user'));

  const rejectUser = (id) =>
    rejectUserMutation(id).unwrap()
      .then(() => toast.success('User rejected and removed'))
      .catch(() => toast.error('Failed to reject user'));

  return { users, loading, error, approveUser, rejectUser };
};

export default usePendingUsers;
