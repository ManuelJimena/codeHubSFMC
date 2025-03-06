# codeHubSFMC - Plataforma de Fragmentos de Código

Una plataforma moderna para compartir y gestionar fragmentos de código de Marketing Cloud, construida con React y Supabase.

## 🚀 Características

- 🔐 Autenticación de usuarios con email y contraseña
- 💾 Guardar y compartir fragmentos de código (SSJS, SQL, AMPscript)
- ❤️ Sistema de favoritos
- 🌓 Modo claro/oscuro
- 🔍 Búsqueda avanzada de fragmentos
- 📱 Diseño responsive
- 👤 Panel de administración
- 🔒 Control de visibilidad (público/privado)
- 🤖 Asistente IA para SFMC
- 🔑 Gestión de claves API
- 📊 Estadísticas de uso

## 🛠️ Tecnologías

- React 18
- Vite
- Tailwind CSS
- Supabase (base de datos y autenticación)
- React Router
- React Syntax Highlighter
- Lucide React (iconos)
- OpenAI API (asistente IA)
- React Hot Toast (notificaciones)

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- npm o yarn
- Cuenta de Supabase
- Clave API de OpenRouter (para el asistente IA)

## 🚀 Instalación

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd codehubsfmc
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea un archivo `.env` en el directorio raíz y añade tus credenciales:
```env
VITE_SUPABASE_URL=tu-url-de-supabase
VITE_SUPABASE_ANON_KEY=tu-clave-anonima-de-supabase
```

4. Configura las claves API en Supabase:
   - Accede al panel de administración desde el usuario admin
   - Ve a la sección "Claves API"
   - Añade las siguientes claves:
     - `OPENROUTER_API_KEY`: Tu clave de API de OpenRouter
     - `OPENROUTER_BASE_URL`: URL base de OpenRouter (https://openrouter.ai/api/v1)

4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

## 📁 Estructura del Proyecto

```
src/
├── components/     # Componentes reutilizables
│   ├── CodeCard   # Tarjeta de fragmento de código
│   ├── Navbar     # Barra de navegación
│   └── ...
├── context/       # Contextos de React
│   ├── AuthContext    # Gestión de autenticación
│   └── ThemeContext   # Gestión del tema
├── lib/           # Utilidades y configuraciones
│   ├── supabase.js    # Cliente y funciones de Supabase
│   └── api-keys.js    # Gestión de claves API seguras
├── pages/         # Páginas de la aplicación
└── types/         # Definiciones de tipos

supabase/
└── migrations/    # Migraciones de la base de datos

## 🔑 Gestión de Claves API

Las claves API se gestionan de forma segura a través de Supabase:

1. Las claves se almacenan en la tabla `api_keys`
2. Solo los administradores pueden gestionar las claves
3. Los usuarios autenticados pueden leer las claves
4. Implementa Row Level Security (RLS) para protección adicional

```

## 📜 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la versión de producción
- `npm run lint` - Ejecuta el linter

## 🤝 Contribuir

1. Haz un fork del repositorio
2. Crea tu rama de características (`git checkout -b feature/nueva-caracteristica`)
3. Haz commit de tus cambios (`git commit -m 'Añade nueva característica'`)
4. Haz push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Autores

- Manuel Jimena - [GitHub](https://github.com/ManuelJimena)