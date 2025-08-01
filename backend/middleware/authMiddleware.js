const jwt = require('jsonwebtoken'); // Importa jsonwebtoken para manejar JWTs
const Usuario = require('../models/Usuario'); // Importa el modelo de Usuario

// --- Middleware para Proteger Rutas (Autenticación) ---
// Verifica si el usuario está autenticado mediante un token JWT válido.
const proteger = async (req, res, next) => {
    let token;

    // 1. Verificar si el token existe en los headers de autorización (Bearer Token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extraer el token del header (formato: "Bearer TOKEN")
            token = req.headers.authorization.split(' ')[1];

            // 2. Verificar el token
            // jwt.verify() decodifica el token usando la clave secreta
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Buscar el usuario en la base de datos usando el ID del token
            // .select('-contrasena') para no incluir la contraseña en el objeto de usuario
            req.usuario = await Usuario.findById(decoded.id).select('-contrasena');

            // Si el usuario no se encuentra, lanzar un error
            if (!req.usuario) {
                const error = new Error('No autorizado, usuario no encontrado');
                error.statusCode = 401; // Unauthorized
                return next(error);
            }

            next(); // Continuar con la siguiente función middleware o ruta
        } catch (error) {
            console.error('Error al verificar el token:', error.message);
            const authError = new Error('No autorizado, token fallido o expirado');
            authError.statusCode = 401; // Unauthorized
            next(authError);
        }
    }

    // Si no hay token en el header
    if (!token) {
        const noTokenError = new Error('No autorizado, no hay token');
        noTokenError.statusCode = 401; // Unauthorized
        next(noTokenError);
    }
};

// --- Middleware para Autorización Basada en Roles ---
// Verifica si el usuario autenticado tiene uno de los roles permitidos.
// roles: un array de strings, ej. ['admin', 'editor']
const autorizar = (roles = []) => {
    // Si roles no es un array, lo convierte en uno para consistencia
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        // 1. Verificar si el usuario está autenticado (req.usuario debe existir)
        if (!req.usuario) {
            const error = new Error('Acceso denegado, no autenticado. Por favor, inicia sesión.');
            error.statusCode = 401; // Unauthorized
            return next(error);
        }

        // 2. Verificar si el rol del usuario está incluido en los roles permitidos
        if (!roles.includes(req.usuario.rol)) {
            const error = new Error(`Acceso denegado, el rol '${req.usuario.rol}' no tiene permiso para acceder a esta ruta.`);
            error.statusCode = 403; // Forbidden
            return next(error);
        }

        next(); // Continuar si el usuario tiene el rol adecuado
    };
};

module.exports = { proteger, autorizar };
