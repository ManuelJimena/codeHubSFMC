# codeHubSFMC - Plataforma de Fragmentos de Código

Una plataforma moderna para compartir y gestionar fragmentos de código de Marketing Cloud, construida con React y Supabase.

## 🚀 Características

- 🔐 Autenticación robusta
  - Registro y login con email/contraseña
  - Recuperación de contraseña segura
  - Perfiles de usuario personalizables
  - Roles de usuario (admin/regular)

- 💾 Gestión de Código
  - Soporte para SSJS, SQL y AMPscript
  - Editor con resaltado de sintaxis
  - Organización por lenguaje
  - Visibilidad pública/privada
  - Sistema de favoritos
  - Contador de votos

- 🎨 Interfaz Moderna
  - Diseño responsive
  - Modo claro/oscuro
  - Animaciones suaves
  - Feedback visual
  - Loading states

- 🔍 Búsqueda y Filtros
  - Búsqueda en tiempo real
  - Filtros por lenguaje
  - Filtros por visibilidad
  - Ordenamiento personalizado
  - Vista de favoritos

- 👤 Panel de Administración
  - Gestión de usuarios
  - Moderación de contenido
  - Estadísticas de uso
  - Gestión de API keys
  - Logs del sistema

- 🤖 Asistente IA para SFMC
  - Integración con OpenRouter
  - Contexto específico de SFMC
  - Ejemplos de código
  - Respuestas formateadas
  - Historial de chat

## 🛠️ Tecnologías

- **Frontend**
  - React 18
  - Vite
  - Tailwind CSS
  - React Router v6
  - React Syntax Highlighter
  - Lucide React (iconos)
  - React Hot Toast

- **Backend**
  - Supabase
  - PostgreSQL
  - Row Level Security
  - Storage para avatares
  - Políticas de seguridad

- **IA**
  - OpenRouter API
  - GPT-3.5 Turbo
  - Streaming de respuestas
  - Formato de código

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- npm o yarn
- Cuenta de Supabase
- Clave API de OpenRouter

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

3. Crea un archivo `.env` en el directorio raíz:
```env
# Supabase Configuration
VITE_SUPABASE_URL=tu-url-de-supabase
VITE_SUPABASE_ANON_KEY=tu-clave-anonima-de-supabase

# OpenAI Configuration
VITE_OPENROUTER_API_KEY=tu-clave-api-openrouter
VITE_OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

4. Configura las claves API en Supabase:
   - Accede al panel de administración
   - Ve a "Claves API"
   - Configura:
     - `OPENROUTER_API_KEY`
     - `OPENROUTER_BASE_URL`

5. Inicia el servidor de desarrollo:
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
│   └── api-keys.js    # Gestión de claves API
├── pages/         # Páginas de la aplicación
└── types/         # Definiciones de tipos

supabase/
└── migrations/    # Migraciones de la base de datos
```

## 🔑 Gestión de Claves API

Las claves API se gestionan de forma segura a través de Supabase:

1. Almacenamiento seguro en tabla `api_keys`
2. Acceso controlado por roles
3. Políticas RLS específicas
4. Auditoría de uso
5. Rotación periódica recomendada

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

## 🙏 Agradecimientos

- [Supabase](https://supabase.io/) por la infraestructura backend
- [OpenRouter](https://openrouter.ai/) por el acceso a la API de IA
- [Tailwind CSS](https://tailwindcss.com/) por el framework de estilos
- La comunidad de código abierto por sus contribuciones