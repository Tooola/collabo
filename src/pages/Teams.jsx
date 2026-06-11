import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import LoadingSpinner from '../components/LoadingSpinner';
import TeamFormModal from '../components/TeamFormModal';
import ManageMembersModal from '../components/ManageMembersModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { Plus, Trash2, Edit, UsersRound, UserPlus } from 'lucide-react';

export default function Teams() {
  const { hasRole } = useAuth();
  const { teams, fetchTeams, deleteTeam, fetchTeamMembers } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editTeam, setEditTeam] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [manageTeam, setManageTeam] = useState(null);
  const [membersMap, setMembersMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const loadMembers = async () => {
      const map = {};
      for (const team of teams) {
        const res = await fetchTeamMembers(team.id);
        if (res.ok) map[team.id] = res.data.members;
      }
      setMembersMap(map);
    };
    if (teams.length > 0) loadMembers();
  }, [teams]);

  const handleDelete = async () => {
    if (deleteId) {
      await deleteTeam(deleteId);
      setDeleteId(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Teams</h2>
        {hasRole('admin') && (
          <button
            onClick={() => { setEditTeam(null); setShowForm(true); }}
            className="flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
            New Team
          </button>
        )}
      </div>

      {teams.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white py-12 text-center">
          <UsersRound className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-500">No teams found</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {teams.map(team => {
            const members = membersMap[team.id] || [];
            return (
              <div key={team.id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{team.name}</h3>
                    <p className="text-sm text-gray-500">{team.description}</p>
                  </div>
                  {hasRole('admin') && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditTeam(team); setShowForm(true); }}
                        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(team.id)}
                        className="rounded p-1.5 text-gray-400 hover:bg-danger-50 hover:text-danger-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="mb-3 text-xs text-gray-400">Created: {team.createdAt}</p>

                <div className="mb-3">
                  <p className="mb-2 text-xs font-medium text-gray-500">
                    Members ({members.length})
                  </p>
                  <div className="space-y-1.5">
                    {members.slice(0, 4).map(m => (
                      <div key={m.id} className="flex items-center justify-between rounded bg-gray-50 px-3 py-1.5">
                        <span className="text-sm text-gray-700">{m.name}</span>
                        <span className="text-xs capitalize text-gray-400">{m.role}</span>
                      </div>
                    ))}
                    {members.length > 4 && (
                      <p className="text-xs text-gray-400">+{members.length - 4} more</p>
                    )}
                  </div>
                </div>

                {hasRole('admin') && (
                  <button
                    onClick={() => setManageTeam(team)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    <UserPlus className="h-4 w-4" />
                    Manage Members
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <TeamFormModal
        open={showForm}
        onClose={() => { setShowForm(false); setEditTeam(null); }}
        team={editTeam}
      />

      <ManageMembersModal
        open={!!manageTeam}
        onClose={() => setManageTeam(null)}
        team={manageTeam}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Team"
        message="Are you sure you want to delete this team? Members will be unassigned."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
