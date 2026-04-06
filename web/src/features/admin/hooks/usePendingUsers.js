import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  getPendingUsers,
  approveUser as approveUserService,
  rejectUser as rejectUserService,
} from '../../../services/adminService';

const usePendingUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPendingUsers()
      .then(setUsers)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  const removeUser = useCallback((id) => setUsers((prev) => prev.filter((u) => u.id !== id)), []);

  const approveUser = useCallback((id) =>
    approveUserService(id).then(() => {
      removeUser(id);
      toast.success('User approved successfully');
    }), [removeUser]);

  const rejectUser = useCallback((id) =>
    rejectUserService(id).then(() => {
      removeUser(id);
      toast.success('User rejected successfully');
    }), [removeUser]);

  return { users, loading, error, approveUser, rejectUser };
};

export default usePendingUsers;
