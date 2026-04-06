import toast from 'react-hot-toast';
import { useGetPendingUsersQuery, useApproveUserMutation, useRejectUserMutation } from '../state/adminApi';

const usePendingUsers = () => {
  const { data: users = [], isLoading: loading, error } = useGetPendingUsersQuery();
  const [approveUserMutation] = useApproveUserMutation();
  const [rejectUserMutation]  = useRejectUserMutation();

  const approveUser = (id) =>
    approveUserMutation(id).then(() => toast.success('User approved successfully'));

  const rejectUser = (id) =>
    rejectUserMutation(id).then(() => toast.success('User rejected successfully'));

  return { users, loading, error, approveUser, rejectUser };
};

export default usePendingUsers;
