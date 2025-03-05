/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} username
 * @property {string} [avatar_url]
 */

/**
 * @typedef {Object} CodeSnippet
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} code
 * @property {'ssjs' | 'sql' | 'ampscript'} language
 * @property {boolean} is_public
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string} user_id
 * @property {Object} [user]
 * @property {string} user.username
 * @property {string} [user.avatar_url]
 * @property {number} votes
 */

/**
 * @typedef {'ssjs' | 'sql' | 'ampscript' | 'all'} CodeLanguage
 */

export {};