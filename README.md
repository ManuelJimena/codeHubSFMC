# Plataforma de Fragmentos de Código

Una aplicación web moderna para compartir y gestionar fragmentos de código, construida con React y Supabase.

## Características

- 🔐 Autenticación de usuarios
- 💾 Guardar y compartir fragmentos de código
- ❤️ Sistema de favoritos
- 🌓 Modo claro/oscuro
- 🔍 Búsqueda de fragmentos
- 📱 Diseño responsive
- 👤 Panel de administración
- 🔒 Control de visibilidad (público/privado)

## Tecnologías

- React
- Vite
- Tailwind CSS
- Supabase (base de datos y autenticación)
- React Router
- React Syntax Highlighter
- Lucide React (iconos)

## Requisitos Previos

- Node.js (v14 o superior)
- npm o yarn
- Cuenta de Supabase

## Instalación

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd code-snippets-platform
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea un archivo `.env` en el directorio raíz y añade tus credenciales de Supabase:
```env
VITE_SUPABASE_URL=tu-url-de-supabase
VITE_SUPABASE_ANON_KEY=tu-clave-anonima-de-supabase
```

4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

## Estructura del Proyecto

```
src/
├── components/     # Componentes reutilizables
├── context/       # Contextos de React (auth, tema)
├── lib/           # Utilidades y configuraciones
├── pages/         # Páginas de la aplicación
└── types/         # Definiciones de tipos
```

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la versión de producción
- `npm run lint` - Ejecuta el linter

## Contribuir

1. Haz un fork del repositorio
2. Crea tu rama de características (`git checkout -b feature/nueva-caracteristica`)
3. Haz commit de tus cambios (`git commit -m 'Añade nueva característica'`)
4. Haz push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.