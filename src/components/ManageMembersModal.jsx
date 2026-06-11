import { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { X, UserPlus, UserMinus } from 'lucide-react';

export default function ManageMembersModal({ open, onClose, team }) {
  const { fetchTeamMembers, addTeamMember, removeTeamMember, fetchUsers } = useData();
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('dev');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (team && open) {
      loadMembers();
      loadAllUsers();
    }
  }, [team, open]);

  const loadMembers = async () => {
    if (!team) return;
    const res = await fetchTeamMembers(team.id);
    if (res.ok) setMembers(res.data.members);
  };

  const loadAllUsers = async () => {
    const res = await fetchUsers();
    if (res.ok) setAllUsers(res.data.users);
  };

  const handleAdd = async () => {
    if (!selectedUserId) return;
    setSaving(true);
    await addTeamMember(team.id, selectedUserId, selectedRole);
    await loadMembers();
    setSelectedUserId('');
    setSaving(false);
  };

  const handleRemove = async (userId) => {
    setSaving(true);
    await removeTeamMember(team.id, userId);
    await loadMembers();
    setSaving(false);
  };

  if (!open || !team) return null;

  const unassigned = allUsers.filter(u => !members.find(m => m.id === u.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Manage Members — {team.name}
          </h3>
          <button onClick={onClose} className="rounded p-1 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="mb-6">
          <h4 className="mb-2 text-sm font-medium text-gray-700">Current Members</h4>
          {members.length === 0 ? (
            <p className="text-sm text-gray-400">No members yet</p>
          ) : (
            <div className="space-y-2">
              {members.map(member => (
                <div key={member.id} className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-600">
                      {member.role}
                    </span>
                    <button
                      onClick={() => handleRemove(member.id)}
                      disabled={saving}
                      className="rounded p-1 text-gray-400 hover:bg-danger-50 hover:text-danger-600"
                    >
                      <UserMinus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-700">Add Member</h4>
          {unassigned.length === 0 ? (
            <p className="text-sm text-gray-400">All users are already members</p>
          ) : (
            <div className="flex gap-2">
              <select
                value={selectedUserId}
                onChange={e => setSelectedUserId(e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Select user</option>
                {unassigned.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="dev">Developer</option>
                <option value="lead">Lead</option>
              </select>
              <button
                onClick={handleAdd}
                disabled={saving || !selectedUserId}
                className="flex items-center gap-1 rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              >
                <UserPlus className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
