import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Users, Code, Shield, Key, Bug } from 'lucide-react';
import DebugInfo from '../components/DebugInfo';
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
      console.error('Error al obtener usuarios:', error);
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
      console.error('Error al obtener fragmentos:', error);
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
      console.error('Error al obtener claves API:', error);
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
      console.error('Error al actualizar usuario:', error);
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
        console.error('Error al eliminar fragmento:', error);
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
      console.error('Error al añadir clave API:', error);
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
        console.error('Error al eliminar clave API:', error);
        toast.error('Error al eliminar la clave API');
      } else {
        toast.success('Clave API eliminada correctamente');
        fetchApiKeys();
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Panel de Administración</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Gestiona usuarios y contenido de la plataforma
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('users')}
              className={`${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              } flex items-center min-w-0 flex-1 sm:flex-none sm:w-auto py-3 sm:py-4 px-3 sm:px-6 border-b-2 font-medium text-xs sm:text-sm focus:outline-none whitespace-nowrap`}
            >
              <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Usuarios</span>
              <span className="sm:hidden">Users</span>
            </button>
            <button
              onClick={() => setActiveTab('snippets')}
              className={`${
                activeTab === 'snippets'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              } flex items-center min-w-0 flex-1 sm:flex-none sm:w-auto py-3 sm:py-4 px-3 sm:px-6 border-b-2 font-medium text-xs sm:text-sm focus:outline-none whitespace-nowrap`}
            >
              <Code className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Fragmentos</span>
              <span className="sm:hidden">Code</span>
            </button>
            <button
              onClick={() => setActiveTab('api-keys')}
              className={`${
                activeTab === 'api-keys'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              } flex items-center min-w-0 flex-1 sm:flex-none sm:w-auto py-3 sm:py-4 px-3 sm:px-6 border-b-2 font-medium text-xs sm:text-sm focus:outline-none whitespace-nowrap`}
            >
              <Key className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Claves API</span>
              <span className="sm:hidden">API</span>
            </button>
            <button
              onClick={() => setActiveTab('debug')}
              className={`${
                activeTab === 'debug'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              } flex items-center min-w-0 flex-1 sm:flex-none sm:w-auto py-3 sm:py-4 px-3 sm:px-6 border-b-2 font-medium text-xs sm:text-sm focus:outline-none whitespace-nowrap`}
            >
              <Bug className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Debug</span>
              <span className="sm:hidden">Debug</span>
            </button>
          </nav>
        </div>

        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex justify-center items-center h-32 sm:h-64">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {activeTab === 'users' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="mb-4">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Gestión de Usuarios</h3>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      Administra los usuarios de la plataforma. Puedes otorgar o revocar privilegios de administrador.
                    </p>
                  </div>
                  
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="inline-block min-w-full align-middle">
                      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Usuario
                              </th>
                              <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Email
                              </th>
                              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Rol
                              </th>
                              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Acciones
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {users.map(user => (
                              <tr key={user.id}>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    {user.avatar_url ? (
                                      <img
                                        src={user.avatar_url}
                                        alt={user.username}
                                        className="h-6 w-6 sm:h-8 sm:w-8 rounded-full"
                                      />
                                    ) : (
                                      <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                                    )}
                                    <div className="ml-2 sm:ml-3">
                                      <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {user.username}
                                      </span>
                                      <div className="sm:hidden text-xs text-gray-500 dark:text-gray-400 truncate max-w-24">
                                        {user.email}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {user.email}
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
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
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                  <button
                                    onClick={() => toggleUserAdmin(user.id, user.is_admin)}
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center text-xs sm:text-sm"
                                    title={user.is_admin ? "Revocar permisos de administrador" : "Otorgar permisos de administrador"}
                                    aria-label={user.is_admin ? "Revocar permisos de administrador" : "Otorgar permisos de administrador"}
                                  >
                                    <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                    <span className="hidden sm:inline">
                                      {user.is_admin ? "Revocar admin" : "Hacer admin"}
                                    </span>
                                    <span className="sm:hidden">
                                      {user.is_admin ? "Revocar" : "Admin"}
                                    </span>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'snippets' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="mb-4">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Gestión de Fragmentos de Código</h3>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      Administra todos los fragmentos de código en la plataforma. Puedes eliminar fragmentos inapropiados o spam.
                    </p>
                  </div>
                  
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="inline-block min-w-full align-middle">
                      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Título
                              </th>
                              <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Autor
                              </th>
                              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Lenguaje
                              </th>
                              <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Visibilidad
                              </th>
                              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Acciones
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {snippets.map(snippet => (
                              <tr key={snippet.id}>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                  <div>
                                    <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100" title={snippet.title}>
                                      {snippet.title.length > 20 ? snippet.title.substring(0, 20) + '...' : snippet.title}
                                    </span>
                                    <div className="sm:hidden text-xs text-gray-500 dark:text-gray-400">
                                      {snippet.user?.username}
                                    </div>
                                  </div>
                                </td>
                                <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {snippet.user?.username}
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    snippet.language === 'ssjs' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                                    snippet.language === 'sql' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
                                    'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                  }`}>
                                    {snippet.language.toUpperCase()}
                                  </span>
                                </td>
                                <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm">
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
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                  <button
                                    onClick={() => deleteSnippet(snippet.id)}
                                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center"
                                    title="Eliminar este fragmento de código"
                                    aria-label="Eliminar fragmento de código"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <span className="hidden sm:inline">Eliminar</span>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'api-keys' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="mb-4">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Gestión de Claves API</h3>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      Administra las claves API utilizadas para servicios externos como OpenAI.
                    </p>
                  </div>
                  
                  <form onSubmit={handleAddApiKey} className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3 sm:space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">Añadir nueva clave API</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label htmlFor="keyName" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                          Nombre de la clave
                        </label>
                        <input
                          type="text"
                          id="keyName"
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 text-xs sm:text-sm dark:bg-gray-700 dark:text-gray-100"
                          placeholder="Ej: OPENROUTER_API_KEY"
                        />
                      </div>
                      <div>
                        <label htmlFor="keyValue" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                          Valor de la clave
                        </label>
                        <input
                          type="text"
                          id="keyValue"
                          value={newKeyValue}
                          onChange={(e) => setNewKeyValue(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 text-xs sm:text-sm dark:bg-gray-700 dark:text-gray-100"
                          placeholder="Ingresa el valor de la clave API"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-3 sm:px-4 border border-transparent shadow-sm text-xs sm:text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                    >
                      Añadir clave API
                    </button>
                  </form>

                  <div className="mt-4 sm:mt-6">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 sm:mb-4 text-sm">
                      Claves API configuradas
                    </h4>
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                      <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                              <tr>
                                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Nombre
                                </th>
                                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Valor
                                </th>
                                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Fecha de creación
                                </th>
                                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Acciones
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                              {apiKeys.map(key => (
                                <tr key={key.id}>
                                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {key.key_name}
                                  </td>
                                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                    <span className="font-mono">
                                      {key.key_value.substring(0, 6)}...{key.key_value.substring(key.key_value.length - 6)}
                                    </span>
                                  </td>
                                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(key.created_at).toLocaleDateString()}
                                  </td>
                                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                    <button
                                      onClick={() => deleteApiKey(key.id)}
                                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center"
                                      title="Eliminar esta clave API"
                                      aria-label="Eliminar clave API"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                      <span className="hidden sm:inline">Eliminar</span>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                              {apiKeys.length === 0 && (
                                <tr>
                                  <td colSpan="4" className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                    No hay claves API configuradas
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'debug' && (
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Herramientas de Depuración</h3>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Información de diagnóstico para administradores
                    </p>
                    <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4">
                      <DebugInfo alwaysVisible={true} />
                    </div>
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