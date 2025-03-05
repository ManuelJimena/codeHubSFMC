/*
  # Creación de tablas iniciales para la plataforma de código

  1. Nuevas Tablas
    - `profiles`: Almacena información de los usuarios
      - `id` (uuid, clave primaria)
      - `username` (texto, único)
      - `email` (texto)
      - `avatar_url` (texto, opcional)
      - `created_at` (timestamp)
    
    - `snippets`: Almacena fragmentos de código
      - `id` (uuid, clave primaria)
      - `title` (texto)
      - `description` (texto)
      - `code` (texto)
      - `language` (texto)
      - `is_public` (booleano)
      - `user_id` (uuid, clave foránea a profiles)
      - `votes` (entero)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `favorites`: Relación entre usuarios y fragmentos favoritos
      - `id` (uuid, clave primaria)
      - `user_id` (uuid, clave foránea a profiles)
      - `snippet_id` (uuid, clave foránea a snippets)
      - `created_at` (timestamp)

  2. Seguridad
    - Habilitar RLS en todas las tablas
    - Políticas para perfiles:
      - Los usuarios pueden leer todos los perfiles
      - Los usuarios solo pueden actualizar su propio perfil
    - Políticas para fragmentos:
      - Todos pueden leer fragmentos públicos
      - Los usuarios pueden leer sus propios fragmentos privados
      - Los usuarios solo pueden crear, actualizar y eliminar sus propios fragmentos
    - Políticas para favoritos:
      - Los usuarios pueden leer sus propios favoritos
      - Los usuarios solo pueden crear y eliminar sus propios favoritos

  3. Funciones
    - `increment_votes`: Incrementa el contador de votos de un fragmento
    - `decrement_votes`: Decrementa el contador de votos de un fragmento
*/

-- Crear tabla de perfiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de fragmentos de código
CREATE TABLE IF NOT EXISTS snippets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  code text NOT NULL,
  language text NOT NULL,
  is_public boolean DEFAULT true,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  votes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla de favoritos
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  snippet_id uuid REFERENCES snippets(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, snippet_id)
);

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Políticas para perfiles
CREATE POLICY "Cualquiera puede ver perfiles"
  ON profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Políticas para fragmentos
CREATE POLICY "Cualquiera puede ver fragmentos públicos"
  ON snippets
  FOR SELECT
  USING (is_public = true);

CREATE POLICY "Los usuarios pueden ver sus propios fragmentos privados"
  ON snippets
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear sus propios fragmentos"
  ON snippets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios fragmentos"
  ON snippets
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios fragmentos"
  ON snippets
  FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para favoritos
CREATE POLICY "Los usuarios pueden ver sus propios favoritos"
  ON favorites
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear sus propios favoritos"
  ON favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios favoritos"
  ON favorites
  FOR DELETE
  USING (auth.uid() = user_id);

-- Función para incrementar votos
CREATE OR REPLACE FUNCTION increment_votes(snippet_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE snippets
  SET votes = votes + 1
  WHERE id = snippet_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para decrementar votos
CREATE OR REPLACE FUNCTION decrement_votes(snippet_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE snippets
  SET votes = GREATEST(0, votes - 1)
  WHERE id = snippet_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear bucket para avatares
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Política para permitir acceso público a los avatares
CREATE POLICY "Acceso público a avatares"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- Política para permitir a los usuarios subir sus propios avatares
CREATE POLICY "Los usuarios pueden subir sus propios avatares"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
  );