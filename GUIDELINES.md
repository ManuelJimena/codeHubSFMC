# Guía de Desarrollo de codeHubSFMC

Esta guía proporciona información detallada sobre las prácticas, estándares y flujos de trabajo recomendados para el desarrollo de codeHubSFMC.

## 📋 Índice

1. [Estándares de Código](#estándares-de-código)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Base de Datos](#base-de-datos)
4. [Seguridad](#seguridad)
5. [Desarrollo Frontend](#desarrollo-frontend)
6. [Gestión de Estado](#gestión-de-estado)
7. [Testing](#testing)
8. [Despliegue](#despliegue)
9. [Integración con IA](#integración-con-ia)
10. [Gestión de API Keys](#gestión-de-api-keys)

## 🎯 Estándares de Código

### JavaScript/React
- Usar ES6+ y funciones de flecha
- Implementar componentes funcionales con hooks
- Mantener componentes pequeños y reutilizables
- Documentar funciones y componentes complejos
- Utilizar PropTypes o TypeScript para tipado
- Implementar manejo de errores consistente
- Usar async/await para operaciones asíncronas

### Estilos
- Utilizar Tailwind CSS para todos los estilos
- Seguir el sistema de diseño establecido
- Mantener consistencia en espaciado y colores
- Asegurar diseño responsive
- Implementar modo oscuro/claro

### Nombrado
- Componentes: PascalCase (ej: `CodeCard.jsx`)
- Funciones y variables: camelCase
- Constantes: UPPER_SNAKE_CASE
- Archivos de utilidades: camelCase
- Migraciones SQL: descriptivas y sin prefijo numérico

## 🏗️ Estructura del Proyecto

### Organización de Carpetas
```
src/
├── components/     # Componentes reutilizables
├── context/       # Contextos de React
├── lib/           # Utilidades y configuraciones
├── pages/         # Páginas de la aplicación
└── types/         # Definiciones de tipos

supabase/
└── migrations/    # Migraciones de la base de datos
```

### Convenciones de Archivos
- Un componente por archivo
- Nombrar archivos según su contenido principal
- Mantener una estructura clara de importaciones
- Agrupar archivos relacionados en carpetas
- Separar lógica de presentación

## 🗄️ Base de Datos

### Tablas Principales
- `profiles`: Información de usuarios
  - Gestión de roles (admin/usuario)
  - Información de perfil
  - Avatar personalizado
- `snippets`: Fragmentos de código
  - Soporte para múltiples lenguajes
  - Sistema de votos
  - Visibilidad pública/privada
- `favorites`: Sistema de favoritos
  - Relación usuario-snippet
  - Conteo de votos automático
- `api_keys`: Claves API
  - Gestión segura de claves
  - Acceso controlado

### Políticas de Seguridad
- RLS habilitado en todas las tablas
- Políticas específicas por rol
- Validación en frontend y backend
- Protección de datos sensibles

### Migraciones
- Una migración por cambio lógico
- Documentación detallada
- Migraciones idempotentes
- Rollback seguro

## 🔒 Seguridad

### Autenticación
- Supabase Auth para gestión de usuarios
- Protección de rutas
- Validación de tokens JWT
- Manejo seguro de sesiones
- Recuperación de contraseña

### Autorización
- Control de acceso basado en roles
- Validación de permisos por operación
- Protección de rutas sensibles
- Políticas RLS granulares

### Datos Sensibles
- Encriptación de datos sensibles
- Validación de entradas
- Rate limiting
- Auditoría de accesos

## 🎨 Desarrollo Frontend

### Componentes
- Diseño modular y reutilizable
- Lazy loading para optimización
- Manejo de estados locales
- Documentación de props
- Manejo de errores

### Optimización
- Code splitting
- Lazy loading de rutas
- Optimización de imágenes
- Minimización de re-renders
- Caching efectivo

### Accesibilidad
- Estándares WCAG
- Navegación por teclado
- Atributos ARIA
- Contraste adecuado
- Responsive design

## 📊 Gestión de Estado

### Contextos
- AuthContext para autenticación
- ThemeContext para tema claro/oscuro
- Estado global minimizado
- Estado local priorizado
- Persistencia de datos

### Buenas Prácticas
- Evitar prop drilling
- Usar reducers para lógica compleja
- Implementar caching
- Manejar estados de carga
- Gestión de errores consistente

## 🧪 Testing

### Tipos de Tests
- Tests unitarios
- Tests de integración
- Tests de componentes
- Tests end-to-end
- Tests de seguridad

### Buenas Prácticas
- Tests mantenibles
- Mocks apropiados
- Patrón AAA
- Cobertura de código
- Testing de casos límite

## 🚀 Despliegue

### Proceso
1. Validación de código
2. Tests automatizados
3. Build optimizado
4. Despliegue progresivo
5. Monitoreo post-despliegue

### Consideraciones
- Variables de entorno
- CI/CD automatizado
- Backups regulares
- Monitoreo de rendimiento
- Logs y métricas

## 🤖 Integración con IA

### OpenRouter API
- Configuración segura
- Manejo de claves API
- Rate limiting
- Fallbacks apropiados
- Caché de respuestas

### Asistente IA
- Contexto específico SFMC
- Respuestas formateadas
- Ejemplos de código
- Manejo de errores
- Límites de uso

## 🔑 Gestión de API Keys

### Almacenamiento
- Encriptación en base de datos
- Acceso controlado
- Rotación periódica
- Auditoría de uso
- Backups seguros

### Políticas
- Solo admins pueden gestionar
- Lectura para usuarios autenticados
- Validación de permisos
- Logging de accesos
- Monitoreo de uso

## 📝 Contribución

### Proceso de Pull Request
1. Crear rama desde `main`
2. Desarrollar cambios
3. Ejecutar tests
4. Documentar cambios
5. Review de código
6. Merge tras aprobación

### Commits
- Mensajes descriptivos
- Commits atómicos
- Referencias a issues
- Convención de commits
- Squash cuando sea necesario

## 📚 Recursos Adicionales

- [Documentación de React](https://reactjs.org/)
- [Documentación de Supabase](https://supabase.io/docs)
- [Guía de Tailwind CSS](https://tailwindcss.com/docs)
- [Marketing Cloud Developer Guide](https://developer.salesforce.com/docs/marketing/marketing-cloud/guide)
- [OpenRouter API Docs](https://openrouter.ai/docs)