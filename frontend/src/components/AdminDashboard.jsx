import { useEffect, useState } from 'react';
import { Shield, Users, UserX, Trash2, RefreshCw, History, Eye, X } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { useAuth } from '../context/AuthContext';
import {
  getAdminUserById,
  getAdminUsers,
  getAuditLogs,
  restoreUserByAdmin,
  setAdminUserStatus,
  softDeleteUserByAdmin
} from '../services/adminService';

const fmtDate = (value) => {
  if (!value) return 'N/D';
  return new Date(value).toLocaleString('es-ES');
};

export function AdminDashboard() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingById, setActionLoadingById] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);

  const setActionLoading = (id, value) => {
    setActionLoadingById((prev) => ({ ...prev, [id]: value }));
  };

  const loadData = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError('');
      const [usersResponse, logsResponse] = await Promise.all([
        getAdminUsers(token),
        getAuditLogs(token, 30)
      ]);

      setUsers(Array.isArray(usersResponse?.data) ? usersResponse.data : []);
      setLogs(Array.isArray(logsResponse?.data) ? logsResponse.data : []);
    } catch (loadError) {
      setError(loadError.message || 'No se pudo cargar el panel de admin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleSuspendToggle = async (user) => {
    try {
      setActionLoading(user.id, true);
      await setAdminUserStatus(user.id, !user.isActive, token);
      await loadData();
    } catch (actionError) {
      setError(actionError.message || 'No se pudo actualizar el estado del usuario');
    } finally {
      setActionLoading(user.id, false);
    }
  };

  const handleSoftDelete = async (user) => {
    try {
      setActionLoading(user.id, true);
      await softDeleteUserByAdmin(user.id, token);
      await loadData();
    } catch (actionError) {
      setError(actionError.message || 'No se pudo eliminar el usuario');
    } finally {
      setActionLoading(user.id, false);
    }
  };

  const handleRestore = async (user) => {
    try {
      setActionLoading(user.id, true);
      await restoreUserByAdmin(user.id, token);
      await loadData();
    } catch (actionError) {
      setError(actionError.message || 'No se pudo restaurar el usuario');
    } finally {
      setActionLoading(user.id, false);
    }
  };

  const handleOpenUserDetail = async (user) => {
    try {
      setLoadingUserDetail(true);
      const response = await getAdminUserById(user.id, token);
      setSelectedUser(response?.data || null);
    } catch (actionError) {
      setError(actionError.message || 'No se pudo cargar el detalle del usuario');
    } finally {
      setLoadingUserDetail(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8 dark-pink-fields">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="p-6 md:p-8 bg-white border-2 border-pink-accent shadow-[8px_8px_0px_0px_#ff0a60] rounded-none">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <Shield className="w-7 h-7 text-pink-accent" />
              <div>
                <h1 className="text-4xl text-gray-900">Panel de Administracion</h1>
                <p className="text-gray-600 mt-2">
                  Gestion de cuentas, moderacion y auditoria de acciones administrativas.
                </p>
              </div>
            </div>
            <Button variant="outline" className="border-2 border-gray-900" onClick={loadData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </Card>

        {error ? <Card className="p-4 border-2 border-red-400 text-red-700">{error}</Card> : null}
        {loading ? <Card className="p-4">Cargando...</Card> : null}

        <Card className="p-5 border-2 border-pink-accent rounded-none">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-pink-accent" />
            <h2 className="font-bold text-gray-900 text-xl">Usuarios</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200">
                  <th className="py-2 pr-2">Alias</th>
                  <th className="py-2 pr-2">Email</th>
                  <th className="py-2 pr-2">Rol</th>
                  <th className="py-2 pr-2">Estado</th>
                  <th className="py-2 pr-2">Recetas</th>
                  <th className="py-2 pr-2">Borrado</th>
                  <th className="py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const busy = Boolean(actionLoadingById[user.id]);
                  const isDeleted = Boolean(user.deletedAt);

                  return (
                    <tr key={user.id} className="border-b border-gray-100">
                      <td className="py-2 pr-2 font-semibold">{user.name}</td>
                      <td className="py-2 pr-2">{user.email}</td>
                      <td className="py-2 pr-2 uppercase">{user.role}</td>
                      <td className="py-2 pr-2">{user.isActive ? 'Activo' : 'Suspendido'}</td>
                      <td className="py-2 pr-2">{user.recipesCount || 0}</td>
                      <td className="py-2 pr-2">{isDeleted ? fmtDate(user.deletedAt) : 'No'}</td>
                      <td className="py-2">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            className="h-8 border-2 border-gray-900"
                            onClick={() => handleOpenUserDetail(user)}
                            disabled={busy}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>

                          <Button
                            variant="outline"
                            className="h-8 border-2 border-gray-900"
                            onClick={() => handleSuspendToggle(user)}
                            disabled={busy || isDeleted}
                          >
                            <UserX className="w-4 h-4 mr-1" />
                            {user.isActive ? 'Suspender' : 'Reactivar'}
                          </Button>

                          <Button
                            variant="outline"
                            className="h-8 border-2 border-gray-900 hover:bg-red-600 hover:text-white"
                            onClick={() => handleSoftDelete(user)}
                            disabled={busy || isDeleted}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Eliminar
                          </Button>

                          <Button
                            variant="outline"
                            className="h-8 border-2 border-gray-900"
                            onClick={() => handleRestore(user)}
                            disabled={busy || !isDeleted}
                          >
                            Restaurar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {loadingUserDetail ? <Card className="p-4 border-2 border-pink-accent rounded-none">Cargando detalle de usuario...</Card> : null}

        <Card className="p-5 border-2 border-pink-accent rounded-none">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-pink-accent" />
            <h2 className="font-bold text-gray-900 text-xl">Auditoria</h2>
          </div>

          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {logs.map((log) => (
              <div key={log._id} className="border border-gray-200 p-3">
                <p className="text-sm font-semibold text-gray-900">
                  {log.action} · {fmtDate(log.createdAt)}
                </p>
                <p className="text-xs text-gray-600">
                  Actor: {log.actor?.name || 'N/D'} ({log.actorRole}) · Target: {log.targetType} {log.targetId || ''}
                </p>
              </div>
            ))}
            {logs.length === 0 ? <p className="text-sm text-gray-500">Sin eventos recientes.</p> : null}
          </div>
        </Card>
      </div>

      {selectedUser ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/40 modal-overlay-enter" onClick={() => setSelectedUser(null)}>
          <Card
            className="w-full max-w-4xl max-h-[88vh] overflow-y-auto p-6 md:p-8 border-2 border-pink-accent shadow-[8px_8px_0px_0px_#ff0a60] rounded-none modal-content-enter bg-white"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-3xl text-gray-900">
                Perfil de <span className="text-pink-accent">{selectedUser.name}</span>
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setSelectedUser(null)}>
                <X className="w-5 h-5 text-pink-accent" />
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <Card className="p-4 border-2 border-pink-accent rounded-none">
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{selectedUser.email}</p>
                <p className="text-sm text-gray-600 mt-2">Rol: <span className="font-semibold uppercase text-gray-900">{selectedUser.role}</span></p>
                <p className="text-sm text-gray-600">Estado: <span className="font-semibold text-gray-900">{selectedUser.isActive ? 'Activo' : 'Suspendido'}</span></p>
              </Card>

              <Card className="p-4 border-2 border-pink-accent rounded-none">
                <p className="text-sm text-gray-600">Recetas creadas</p>
                <p className="text-2xl font-bold text-pink-accent">{selectedUser.recipesCount || 0}</p>
                <p className="text-sm text-gray-600 mt-2">Reviews hechas</p>
                <p className="text-xl font-semibold text-gray-900">{selectedUser.reviewsCount || 0}</p>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-4 border-2 border-pink-accent rounded-none">
                <h4 className="font-bold text-gray-900 mb-2">Recetas favoritas</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(selectedUser.favoriteRecipes || []).length === 0 ? (
                    <p className="text-sm text-gray-500">Sin recetas favoritas.</p>
                  ) : (
                    selectedUser.favoriteRecipes.map((recipe) => (
                      <div key={recipe._id} className="border border-gray-200 p-2">
                        <p className="text-sm font-semibold text-gray-900">{recipe.title}</p>
                        <p className="text-xs text-gray-600">{recipe.category} · {recipe.prepTime || 0} min</p>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              <Card className="p-4 border-2 border-pink-accent rounded-none">
                <h4 className="font-bold text-gray-900 mb-2">Noticias guardadas</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(selectedUser.savedNews || []).length === 0 ? (
                    <p className="text-sm text-gray-500">Sin noticias guardadas.</p>
                  ) : (
                    selectedUser.savedNews.map((news) => (
                      <div key={news._id} className="border border-gray-200 p-2">
                        <p className="text-sm font-semibold text-gray-900">{news.title}</p>
                        <p className="text-xs text-gray-600">{news.category}</p>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
