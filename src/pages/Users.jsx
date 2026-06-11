import { useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { UserCog, Shield, Code2, Briefcase } from 'lucide-react';

export default function Users() {
  const { users, teams, fetchUsers, fetchTeams, loading } = useData();

  useEffect(() => {
    fetchUsers();
    if (teams.length === 0) fetchTeams();
  }, []);

  if (loading && users.length === 0) return <LoadingSpinner />;

  const getTeamName = (teamId) => {
    if (!teamId) return 'No team';
    const team = teams.find(t => t.id === teamId);
    return team?.name || 'Unknown';
  };

  const roleIcon = (role) => {
    if (role === 'admin') return <Shield className="h-4 w-4 text-primary-500" />;
    if (role === 'lead') return <Briefcase className="h-4 w-4 text-warning-500" />;
    return <Code2 className="h-4 w-4 text-success-500" />;
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Users</h2>
        <p className="text-sm text-gray-500">Manage users and their roles</p>
      </div>

      {users.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white py-12 text-center">
          <UserCog className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-500">No users found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-500">User</th>
                <th className="px-6 py-3 font-medium text-gray-500">Role</th>
                <th className="px-6 py-3 font-medium text-gray-500">Team</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {roleIcon(u.role)}
                      <span className="capitalize text-gray-700">{u.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{getTeamName(u.teamId)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
