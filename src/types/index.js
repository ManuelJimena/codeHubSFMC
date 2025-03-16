/**
 * @typedef {Object} User - Usuario
 * @property {string} id
 * @property {string} email - Correo electrónico
 * @property {string} username - Nombre de usuario
 * @property {string} [avatar_url] - URL del avatar
 */

/**
 * @typedef {Object} CodeSnippet - Fragmento de código
 * @property {string} id
 * @property {string} title - Título
 * @property {string} description - Descripción
 * @property {string} code - Código
 * @property {'ssjs' | 'sql' | 'ampscript'} language - Lenguaje
 * @property {boolean} is_public - Es público
 * @property {string} created_at - Fecha de creación
 * @property {string} updated_at - Fecha de actualización
 * @property {string} user_id - ID del usuario
 * @property {Object} [user] - Usuario
 * @property {string} user.username - Nombre de usuario
 * @property {string} [user.avatar_url] - URL del avatar
 * @property {number} votes - Votos
 */

/**
 * @typedef {'ssjs' | 'sql' | 'ampscript' | 'all'} CodeLanguage - Lenguaje de código
 */

export {};