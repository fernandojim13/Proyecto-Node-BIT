// Importa Express y el controlador de usuarios
const express = require('express');
const {
    registrarUsuario, // Cambiado de crearUsuario a registrarUsuario para mayor claridad
    iniciarSesion,    // Nueva función para el inicio de sesión
    obtenerUsuarios,
    obtenerUsuarioPorId,
    actualizarUsuario,
    eliminarUsuario
} = require('../controllers/usuarioController');

// Importa los middlewares de autenticación y autorización
const { proteger, autorizar } = require('../middleware/authMiddleware');

// Crea un enrutador de Express
const router = express.Router();

// --- Rutas de Autenticación ---
// Ruta para registrar un nuevo usuario (pública)
// POST /api/usuarios/registrar
router.post('/registrar', registrarUsuario);

// Ruta para iniciar sesión de un usuario (pública)
// POST /api/usuarios/login
router.post('/login', iniciarSesion);

// --- Rutas CRUD para Usuarios (Protegidas y Autorizadas) ---

// Ruta para obtener todos los usuarios
// GET /api/usuarios
// Solo accesible por administradores
router.get('/', proteger, autorizar(['admin']), obtenerUsuarios);

// Ruta para obtener un usuario específico por su ID
// GET /api/usuarios/:id
// Accesible por el propio usuario o por un administrador
router.get('/:id', proteger, obtenerUsuarioPorId); // La autorización específica se manejará en el controlador

// Ruta para actualizar un usuario específico por su ID
// PUT /api/usuarios/:id
// Accesible por el propio usuario o por un administrador
router.put('/:id', proteger, actualizarUsuario); // La autorización específica se manejará en el controlador

// Ruta para eliminar un usuario específico por su ID
// DELETE /api/usuarios/:id
// Solo accesible por administradores
router.delete('/:id', proteger, autorizar(['admin']), eliminarUsuario);

// Exporta el enrutador para que pueda ser usado en app.js
module.exports = router;