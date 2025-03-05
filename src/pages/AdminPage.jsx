import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Users, Code, Settings, Shield, Key } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [snippets, setSnippets] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'snippets') {
      fetchSnippets();
    } else if (activeTab === 'api-keys') {
      fetchApiKeys();
    }
  }, [activeTab]);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate('/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      navigate('/');
      toast.error('Acceso no autorizado');
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      toast.error('Error al cargar los usuarios');
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const fetchSnippets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('snippets')
      .select(`
        *,
        user:profiles(username)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching snippets:', error);
      toast.error('Error al cargar los fragmentos');
    } else {
      setSnippets(data || []);
    }
    setLoading(false);
  };

  const fetchApiKeys = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching API keys:', error);
      toast.error('Error al cargar las claves API');
    } else {
      setApiKeys(data || []);
    }
    setLoading(false);
  };

  const toggleUserAdmin = async (userId, currentStatus) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: !currentStatus })
      .eq('id', userId);

    if (error) {
      toast.error('Error al actualizar el usuario');
      console.error('Error updating user:', error);
    } else {
      toast.success('Usuario actualizado correctamente');
      fetchUsers();
    }
  };

  const deleteSnippet = async (snippetId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este fragmento?')) {
      const { error } = await supabase
        .from('snippets')
        .delete()
        .eq('id', snippetId);

      if (error) {
        toast.error('Error al eliminar el fragmento');
        console.error('Error deleting snippet:', error);
      } else {
        toast.success('Fragmento eliminado correctamente');
        fetchSnippets();
      }
    }
  };

  const handleAddApiKey = async (e) => {
    e.preventDefault();
    
    if (!newKeyName || !newKeyValue) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    const { error } = await supabase
      .from('api_keys')
      .insert([{
        key_name: newKeyName,
        key_value: newKeyValue
      }]);

    if (error) {
      console.error('Error adding API key:', error);
      toast.error('Error al añadir la clave API');
    } else {
      toast.success('Clave API añadida correctamente');
      setNewKeyName('');
      setNewKeyValue('');
      fetchApiKeys();
    }
  };

  const deleteApiKey = async (keyId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta clave API?')) {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId);

      if (error) {
        console.error('Error deleting API key:', error);
        toast.error('Error al eliminar la clave API');
      } else {
        toast.success('Clave API eliminada correctamente');
        fetchApiKeys();
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Panel de Administración</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Gestiona usuarios y contenido de la plataforma
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('users')}
              className={`${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              } flex items-center w-1/4 py-4 px-1 border-b-2 font-medium text-sm focus:outline-none`}
            >
              <Users className="h-5 w-5 mr-2" />
              Usuarios
            </button>
            <button
              onClick={() => setActiveTab('snippets')}
              className={`${
                activeTab === 'snippets'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              } flex items-center w-1/4 py-4 px-1 border-b-2 font-medium text-sm focus:outline-none`}
            >
              <Code className="h-5 w-5 mr-2" />
              Fragmentos
            </button>
            <button
              onClick={() => setActiveTab('api-keys')}
              className={`${
                activeTab === 'api-keys'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              } flex items-center w-1/4 py-4 px-1 border-b-2 font-medium text-sm focus:outline-none`}
            >
              <Key className="h-5 w-5 mr-2" />
              Claves API
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              } flex items-center w-1/4 py-4 px-1 border-b-2 font-medium text-sm focus:outline-none`}
            >
              <Settings className="h-5 w-5 mr-2" />
              Configuración
            </button>
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {activeTab === 'users' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Usuario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Admin
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {users.map(user => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {user.avatar_url ? (
                                <img
                                  src={user.avatar_url}
                                  alt={user.username}
                                  className="h-8 w-8 rounded-full"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                              )}
                              <span className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                                {user.username}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {user.is_admin ? (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                                Admin
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                Usuario
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <button
                              onClick={() => toggleUserAdmin(user.id, user.is_admin)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            >
                              <Shield className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'snippets' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Título
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Usuario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Lenguaje
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Público
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {snippets.map(snippet => (
                        <tr key={snippet.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {snippet.title}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {snippet.user?.username}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              snippet.language === 'ssjs' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                              snippet.language === 'sql' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
                              'bg-green-100 text-green -800 dark:bg-green-800 dark:text-green-100'
                            }`}>
                              {snippet.language.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {snippet.is_public ? (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                                Público
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                Privado
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <button
                              onClick={() => deleteSnippet(snippet.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'api-keys' && (
                <div className="space-y-6">
                  <form onSubmit={handleAddApiKey} className="space-y-4">
                    <div>
                      <label htmlFor="keyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nombre de la clave
                      </label>
                      <input
                        type="text"
                        id="keyName"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm dark:bg-gray-700 dark:text-gray-100"
                        placeholder="Ej: OPENROUTER_API_KEY"
                      />
                    </div>
                    <div>
                      <label htmlFor="keyValue" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Valor de la clave
                      </label>
                      <input
                        type="text"
                        id="keyValue"
                        value={newKeyValue}
                        onChange={(e) => setNewKeyValue(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm dark:bg-gray-700 dark:text-gray-100"
                        placeholder="Ingresa el valor de la clave API"
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                    >
                      Añadir clave API
                    </button>
                  </form>

                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Claves API existentes
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Nombre
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Valor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Fecha de creación
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {apiKeys.map(key => (
                            <tr key={key.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                {key.key_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-mono">
                                  {key.key_value.substring(0, 8)}...{key.key_value.substring(key.key_value.length - 8)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {new Date(key.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <button
                                  onClick={() => deleteApiKey(key.id)}
                                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                                >
                                  Eliminar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Configuración General</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Esta sección estará disponible próximamente
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;