/*
  # Configuración del almacenamiento para avatares

  1. Configuración
    - Crear bucket "avatars" para almacenar imágenes de perfil
    - Establecer políticas de acceso público para lectura
    - Permitir escritura solo a usuarios autenticados
    - Permitir eliminación solo a propietarios

  2. Políticas
    - Lectura pública de avatares
    - Escritura para usuarios autenticados
    - Eliminación para propietarios
*/

-- Crear bucket para avatares si no existe
INSERT INTO storage.buckets (id, name)
VALUES ('avatars', 'avatars')
ON CONFLICT (id) DO NOTHING;

-- Política de lectura pública
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Política de escritura para usuarios autenticados
CREATE POLICY "Users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated'
);

-- Política de eliminación para propietarios
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);