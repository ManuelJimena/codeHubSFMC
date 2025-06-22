import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, uploadAvatar, deleteAvatar } from '/lib/supabase';
import { Upload, Save, User as UserIcon, KeyRound, ShieldCheck} from 'lucide-react';
import { useAuth } from '/context/AuthContext';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();

  /* ---------- estado “info de perfil” ---------- */
  const [username,   setUsername]   = useState('');
  const [avatarUrl,  setAvatarUrl]  = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving,     setSaving]     = useState(false);

  /* ---------- estado “cambiar contraseña” ------ */
  const [showPassForm,   setShowPassForm]   = useState(false);
  const [currentPass,    setCurrentPass]    = useState('');
  const [newPass,        setNewPass]        = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [changingPass,   setChangingPass]   = useState(false);

  const navigate = useNavigate();

  /* ---------- cargar usuario o redirigir ------- */
  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setAvatarUrl(user.avatar_url);
    } else {
      navigate('/login');
    }
  }, [user, navigate]);   // ← el navigate evita warning de React

  /* ---------------- cambiar avatar ------------- */
  const handleAvatarChange = (e) => {
    try {
      if (!e.target.files?.[0]) return;
      const file = e.target.files[0];

      if (file.size > 2 * 1024 * 1024) {
        toast.error('La imagen no puede ser mayor a 2 MB');
        return;
      }

      setAvatarFile(file);
      setAvatarUrl(URL.createObjectURL(file));
    } catch (err) {
      console.error(err);
      toast.error('Error al procesar la imagen');
    }
  };

  /* -------------- guardar perfil --------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    const trimmed = username.trim();
    if (!trimmed)           { toast.error('El nombre de usuario es obligatorio');  return; }
    if (trimmed.length < 3) { toast.error('Debe tener al menos 3 caracteres');     return; }

    setSaving(true);
    try {
      if (trimmed !== user.username) {
        const { data: dup, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', trimmed)
          .neq('id', user.id)
          .maybeSingle();
        if (error) throw error;
        if (dup)   { toast.error('Ese nombre de usuario ya existe'); setSaving(false); return; }
      }

      let newAvatarUrl = avatarUrl;
      if (avatarFile) {
        if (user.avatar_url) await deleteAvatar(user.avatar_url);
        newAvatarUrl = await uploadAvatar(avatarFile, user.id);
      }

      const { error } = await supabase
        .from('profiles')
        .update({ username: trimmed, avatar_url: newAvatarUrl })
        .eq('id', user.id);
      if (error) throw error;

      await refreshUser();
      toast.success('Perfil actualizado');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  /* ----------- cambiar contraseña -------------- */
  const handleChangePassword = async (e) => {
    e.preventDefault();
    e.stopPropagation();  // por si el botón quedara dentro de otro <form>

    if (newPass.length < 6)         { toast.error('La nueva contraseña debe tener al menos 6 caracteres'); return; }
    if (newPass !== confirmNewPass) { toast.error('Las contraseñas no coinciden');                         return; }

    setChangingPass(true);
    try {
      const { error: signErr } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPass
      });
      if (signErr) {
        toast.error('La contraseña actual es incorrecta');
        setChangingPass(false);
        return;
      }

      const { error: updErr } = await supabase.auth.updateUser({ password: newPass });
      if (updErr) throw updErr;

      toast.success('Contraseña cambiada correctamente');
      setCurrentPass('');
      setNewPass('');
      setConfirmNewPass('');
      setShowPassForm(false);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'No se pudo cambiar la contraseña');
    } finally {
      setChangingPass(false);
    }
  };

  /* ---------- vista sin sesión ----------------- */
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
          className="inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Iniciar sesión
        </button>
      </div>
    );
  }

  /* ------------------- UI ---------------------- */
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tu perfil</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Actualiza tu información personal
        </p>
      </div>

      {/* ---------- tarjeta PERFIL ---------- */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row">
          {/* Avatar ------------------------------------------------ */}
          <div className="md:w-1/3 mb-6 md:mb-0 flex flex-col items-center">
            <div className="relative mb-4">
              {avatarUrl ? (
                <img src={avatarUrl} alt={username} className="h-32 w-32 rounded-full object-cover" />
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

          {/* Datos ------------------------------------------------- */}
          <div className="md:w-2/3 md:pl-8">
            {/* Email (solo lectura) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                No puedes cambiar tu correo electrónico
              </p>
            </div>

            {/* Nombre de usuario */}
            <div className="mb-6">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre de usuario
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Botones acción */}
            <div className="flex justify-between flex-wrap gap-4">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>

              <button
                type="button"
                onClick={() => setShowPassForm(!showPassForm)}
                className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-gray-700 dark:text-blue-200"
              >
                <KeyRound className="h-4 w-4 mr-2" />
                {showPassForm ? 'Cancelar' : 'Cambiar contraseña'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* ---------- tarjeta CONTRASEÑA ---------- */}
      {showPassForm && (
        <form
          onSubmit={handleChangePassword}
          className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mt-8 space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contraseña actual
            </label>
            <input
              type="password"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              required
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nueva contraseña
            </label>
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              required
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirmar nueva contraseña
            </label>
            <input
              type="password"
              value={confirmNewPass}
              onChange={(e) => setConfirmNewPass(e.target.value)}
              required
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 sm:text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={changingPass}
            className="inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            {changingPass ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <ShieldCheck className="h-4 w-4 mr-2" />
            )}
            {changingPass ? 'Cambiando…' : 'Guardar nueva contraseña'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ProfilePage;
