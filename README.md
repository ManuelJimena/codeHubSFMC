<div align="center">

# 🚀 codeHubSFMC

### *La plataforma definitiva para fragmentos de código de Salesforce Marketing Cloud*

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://code-hub-sfmc.vercel.app)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

[🌐 **Demo en Vivo**](https://code-hub-sfmc.vercel.app) • [📖 **Documentación**](#-características) • [🚀 **Empezar**](#-instalación)

---

*Guarda, organiza y comparte fragmentos de código que realmente funcionan. Deja de buscar cuando los necesites, ¡están todos aquí!*

</div>

## ✨ Características

<table>
<tr>
<td width="50%">

### 🔐 **Autenticación Robusta**
- ✅ Registro y login seguro
- ✅ Recuperación de contraseña
- ✅ Perfiles personalizables
- ✅ Sistema de roles (admin/usuario)

### 💾 **Gestión Inteligente**
- ✅ Soporte para SSJS, SQL y AMPscript
- ✅ Editor con resaltado de sintaxis
- ✅ Organización por lenguaje
- ✅ Visibilidad pública/privada

</td>
<td width="50%">

### 🎨 **Interfaz Moderna**
- ✅ Diseño responsive y elegante
- ✅ Modo claro/oscuro
- ✅ Animaciones suaves
- ✅ Feedback visual en tiempo real

### 🤖 **IA Integrada**
- ✅ Asistente especializado en SFMC
- ✅ Respuestas contextuales
- ✅ Ejemplos de código
- ✅ Streaming de respuestas

</td>
</tr>
</table>

## 🛠️ Stack Tecnológico

<div align="center">

| Frontend | Backend | Servicios | Herramientas |
|----------|---------|-----------|--------------|
| ![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black) | ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white) | ![OpenRouter](https://img.shields.io/badge/OpenRouter-AI-FF6B6B?style=flat) | ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white) |
| ![Tailwind](https://img.shields.io/badge/Tailwind-38B2AC?style=flat&logo=tailwind-css&logoColor=white) | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat&logo=postgresql&logoColor=white) | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white) | ![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=flat&logo=eslint&logoColor=white) |

</div>

## 🚀 Instalación

### Prerrequisitos

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- Cuenta de **Supabase**
- Clave API de **OpenRouter**

### Configuración Rápida

```bash
# 1. Clonar el repositorio
git clone https://github.com/ManuelJimena/codehubsfmc.git
cd codehubsfmc

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
```

### Variables de Entorno

```env
# Supabase Configuration
VITE_SUPABASE_URL=tu-url-de-supabase
VITE_SUPABASE_ANON_KEY=tu-clave-anonima-de-supabase

# OpenAI Configuration
VITE_OPENROUTER_API_KEY=tu-clave-api-openrouter
VITE_OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

### Ejecutar en Desarrollo

```bash
npm run dev
```

🎉 **¡Listo!** Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

## 📁 Estructura del Proyecto

```
src/
├── 📁 components/          # Componentes reutilizables
│   ├── 🎴 CodeCard/       # Tarjeta de fragmento
│   ├── 🧭 Navbar/         # Navegación
│   └── 🛡️ ErrorBoundary/  # Manejo de errores
├── 📁 context/            # Contextos de React
│   ├── 🔐 AuthContext     # Gestión de autenticación
│   └── 🌙 ThemeContext    # Gestión del tema
├── 📁 lib/                # Utilidades y configuraciones
│   ├── 🗄️ supabase.js     # Cliente de Supabase
│   └── 🔑 api-keys.js     # Gestión de claves API
├── 📁 pages/              # Páginas de la aplicación
└── 📁 types/              # Definiciones de tipos

supabase/
└── 📁 migrations/         # Migraciones de la base de datos
```

## 🎯 Casos de Uso

<div align="center">

| 👨‍💻 **Desarrolladores** | 👥 **Equipos** | 🎓 **Aprendizaje** |
|-------------------------|----------------|-------------------|
| Guardar snippets útiles | Compartir conocimiento | Explorar ejemplos |
| Organizar por proyecto | Colaborar en código | Aprender mejores prácticas |
| Acceso desde cualquier lugar | Mantener estándares | Consultar con IA |

</div>

## 🔧 Scripts Disponibles

```bash
npm run dev      # 🚀 Servidor de desarrollo
npm run build    # 📦 Build para producción
npm run preview  # 👀 Preview del build
npm run lint     # 🔍 Linter
npm run lint:fix # 🔧 Arreglar errores de lint
```

## 🌟 Características Destacadas

### 🎨 **Interfaz Intuitiva**
- Diseño inspirado en Pinterest para fragmentos de código
- Modo oscuro/claro automático
- Responsive design para todos los dispositivos

### 🔍 **Búsqueda Avanzada**
- Búsqueda en tiempo real
- Filtros por lenguaje y visibilidad
- Ordenamiento personalizado

### 🤖 **Asistente IA Especializado**
- Contexto específico de Salesforce Marketing Cloud
- Respuestas formateadas con sintaxis
- Streaming de respuestas en tiempo real

### 🛡️ **Seguridad Robusta**
- Row Level Security (RLS) en Supabase
- Gestión segura de claves API
- Políticas de acceso granulares

## 🚀 Despliegue

### Vercel (Recomendado)

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Desplegar
vercel

# 3. Configurar variables de entorno en Vercel Dashboard
```

### Otras Plataformas

- **Netlify**: Conecta tu repositorio y configura las variables
- **Railway**: Deploy directo desde GitHub
- **Render**: Build automático con cada push

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. 🍴 Haz fork del repositorio
2. 🌿 Crea tu rama de características (`git checkout -b feature/nueva-caracteristica`)
3. 💾 Commit tus cambios (`git commit -m 'Añade nueva característica'`)
4. 📤 Push a la rama (`git push origin feature/nueva-caracteristica`)
5. 🔄 Abre un Pull Request

### 📋 Guías de Contribución

- Sigue las convenciones de código existentes
- Añade tests para nuevas características
- Actualiza la documentación cuando sea necesario
- Usa commits descriptivos

## 📄 Licencia

Este proyecto está licenciado bajo la **Licencia MIT** - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

<div align="center">

**Manuel Jimena**

[![GitHub](https://img.shields.io/badge/GitHub-ManuelJimena-181717?style=for-the-badge&logo=github)](https://github.com/ManuelJimena)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/manueljimena)

</div>

## 🙏 Agradecimientos

- [**Supabase**](https://supabase.io/) - Por la infraestructura backend increíble
- [**OpenRouter**](https://openrouter.ai/) - Por el acceso a modelos de IA
- [**Vercel**](https://vercel.com/) - Por el hosting y deployment
- [**Tailwind CSS**](https://tailwindcss.com/) - Por el framework de estilos
- **La comunidad open source** - Por hacer esto posible

---

<div align="center">

**⭐ Si te gusta este proyecto, ¡dale una estrella en GitHub! ⭐**

[🌐 **Visitar codeHubSFMC**](https://code-hub-sfmc.vercel.app)

</div>