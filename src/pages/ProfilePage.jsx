import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, uploadAvatar, deleteAvatar } from '../lib/supabase';
import { Upload, Save, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  // Cargar datos del usuario
  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setAvatarUrl(user.avatar_url);
    } else {
      navigate('/login');
    }
  }, [user]);
  // Manejar selección de archivo de avatar
  const handleAvatarChange = (e) => {
    try {
      if (!e.target.files || !e.target.files[0]) return;

      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        toast.error('La imagen no puede ser mayor a 2MB');
        return;
      }

      setAvatarFile(file);
      setAvatarUrl(URL.createObjectURL(file));
    } catch (error) {
      console.error('Error handling avatar change:', error);
      toast.error('Error al procesar la imagen');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    // Eliminar espacios en blanco del nombre de usuario
    const trimmedUsername = username.trim();
    
    // Validación básica
    if (!trimmedUsername) {
      toast.error('El nombre de usuario es obligatorio');
      return;
    }
    
    if (trimmedUsername.length < 3) {
      toast.error('El nombre de usuario debe tener al menos 3 caracteres');
      return;
    }
    
    setSaving(true);
    
    try {
      // Verificar si el nombre de usuario está en uso (solo si cambió)
      if (trimmedUsername !== user.username) {
        const { data: existingUser, error: checkError } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', trimmedUsername)
          .neq('id', user.id)
          .maybeSingle();
        
        if (checkError) throw checkError;
        
        if (existingUser) {
          throw new Error('Este nombre de usuario ya está en uso');
        }
      }
      
      let newAvatarUrl = avatarUrl;
      
      if (avatarFile) {
        // Eliminar avatar antiguo si existe
        if (user.avatar_url) {
          await deleteAvatar(user.avatar_url);
        }
        
        // Subir nuevo avatar
        newAvatarUrl = await uploadAvatar(avatarFile, user.id);
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({
          username: trimmedUsername,
          avatar_url: newAvatarUrl
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      await refreshUser();
      toast.success('Perfil actualizado exitosamente');
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.message === 'Este nombre de usuario ya está en uso' 
        ? error.message 
        : 'Error al actualizar el perfil';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          No has iniciado sesión
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Debes iniciar sesión para ver tu perfil.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tu perfil</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Actualiza tu información personal
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 mb-6 md:mb-0">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={username}
                      className="h-32 w-32 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-32 w-32 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <UserIcon className="h-16 w-16 text-gray-400 dark:text-gray-300" />
                    </div>
                  )}
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600"
                  >
                    <Upload className="h-4 w-4" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Haz clic en el icono para cambiar tu avatar
                </p>
              </div>
            </div>

            <div className="md:w-2/3 md:pl-8">
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  value={user.email}
                  disabled
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  No puedes cambiar tu correo electrónico
                </p>
              </div>

              <div className="mb-6">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre de usuario
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                >
                  {saving ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Save className="h-4 w-4 mr-2" />
                      Guardar cambios
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;