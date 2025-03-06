# codeHubSFMC - Plataforma de Fragmentos de Código

Una plataforma moderna para compartir y gestionar fragmentos de código de Marketing Cloud, construida con React y Supabase.

## 🚀 Características

- 🔐 Autenticación de usuarios con email y contraseña
- 💾 Guardar y compartir fragmentos de código (SSJS, SQL, AMPscript)
- ❤️ Sistema de favoritos y votos
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
VITE_OPENROUTER_API_KEY=tu-clave-api-openrouter
VITE_OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

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
│   ├── supabase   # Cliente y funciones de Supabase
│   └── api-keys   # Gestión de claves API
├── pages/         # Páginas de la aplicación
└── types/         # Definiciones de tipos

supabase/
└── migrations/    # Migraciones de la base de datos
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