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

## 🎯 Estándares de Código

### JavaScript/React
- Usar ES6+ y funciones de flecha
- Implementar componentes funcionales con hooks
- Mantener componentes pequeños y reutilizables
- Documentar funciones y componentes complejos
- Utilizar PropTypes o TypeScript para tipado

### Estilos
- Utilizar Tailwind CSS para todos los estilos
- Seguir el sistema de diseño establecido
- Mantener consistencia en espaciado y colores
- Asegurar diseño responsive

### Nombrado
- Componentes: PascalCase (ej: `CodeCard.jsx`)
- Funciones y variables: camelCase
- Constantes: UPPER_SNAKE_CASE
- Archivos de utilidades: camelCase

## 🏗️ Estructura del Proyecto

### Organización de Carpetas
```
src/
├── components/     # Componentes reutilizables
├── context/       # Contextos de React
├── lib/           # Utilidades y configuraciones
├── pages/         # Páginas de la aplicación
└── types/         # Definiciones de tipos
```

### Convenciones de Archivos
- Un componente por archivo
- Nombrar archivos según su contenido principal
- Mantener una estructura clara de importaciones
- Agrupar archivos relacionados en carpetas

## 🗄️ Base de Datos

### Tablas Principales
- `profiles`: Información de usuarios
- `snippets`: Fragmentos de código
- `favorites`: Sistema de favoritos
- `api_keys`: Claves API

### Políticas de Seguridad
- Habilitar RLS en todas las tablas
- Implementar políticas específicas por rol
- Validar permisos en el frontend y backend

### Migraciones
- Crear una migración por cambio lógico
- Documentar cambios en el esquema
- Mantener migraciones idempotentes

## 🔒 Seguridad

### Autenticación
- Usar Supabase Auth para gestión de usuarios
- Implementar protección de rutas
- Validar tokens JWT
- Manejar sesiones de forma segura

### Autorización
- Implementar control de acceso basado en roles
- Validar permisos en cada operación
- Proteger rutas sensibles

### Datos Sensibles
- No exponer información sensible en el cliente
- Encriptar datos sensibles
- Implementar rate limiting
- Validar entradas de usuario

## 🎨 Desarrollo Frontend

### Componentes
- Mantener componentes stateless cuando sea posible
- Implementar lazy loading para optimización
- Usar composición sobre herencia
- Documentar props y comportamientos

### Optimización
- Implementar code splitting
- Optimizar imágenes y assets
- Minimizar re-renders innecesarios
- Usar memo y useMemo apropiadamente

### Accesibilidad
- Seguir estándares WCAG
- Implementar navegación por teclado
- Usar atributos ARIA cuando sea necesario
- Mantener contraste adecuado

## 📊 Gestión de Estado

### Contextos
- AuthContext para autenticación
- ThemeContext para tema claro/oscuro
- Usar contextos para estado global
- Mantener estado local cuando sea posible

### Buenas Prácticas
- Evitar prop drilling
- Mantener estado lo más local posible
- Usar reducers para lógica compleja
- Implementar caching cuando sea necesario

## 🧪 Testing

### Tipos de Tests
- Tests unitarios para utilidades
- Tests de integración para flujos principales
- Tests de componentes
- Tests end-to-end para flujos críticos

### Buenas Prácticas
- Escribir tests mantenibles
- Usar mocks apropiadamente
- Seguir el patrón AAA (Arrange-Act-Assert)
- Mantener cobertura de código

## 🚀 Despliegue

### Proceso
1. Ejecutar tests
2. Construir la aplicación
3. Validar en staging
4. Desplegar a producción

### Consideraciones
- Usar variables de entorno
- Implementar CI/CD
- Mantener documentación actualizada
- Realizar backups regulares

## 📝 Contribución

### Proceso de Pull Request
1. Crear rama desde `main`
2. Desarrollar cambios
3. Ejecutar tests
4. Crear PR con descripción detallada
5. Esperar review
6. Mergear después de aprobación

### Commits
- Usar mensajes descriptivos
- Seguir convención de commits
- Mantener commits atómicos
- Referenciar issues cuando aplique

## 📚 Recursos Adicionales

- [Documentación de React](https://reactjs.org/)
- [Documentación de Supabase](https://supabase.io/docs)
- [Guía de Tailwind CSS](https://tailwindcss.com/docs)
- [Marketing Cloud Developer Guide](https://developer.salesforce.com/docs/marketing/marketing-cloud/guide)