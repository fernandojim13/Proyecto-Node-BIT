// Importa Express y el controlador de usuarios
const express = require('express');
const {
    registrarUsuario,
    iniciarSesion,
    subirFotoPerfil, // Importa la nueva función del controlador
    obtenerUsuarios,
    obtenerUsuarioPorId,
    actualizarUsuario,
    eliminarUsuario
} = require('../controllers/usuarioController');

// Importa los middlewares de autenticación y autorización
const { proteger, autorizar } = require('../middleware/authMiddleware');
// Importa el middleware de Multer
const upload = require('../middleware/uploadMiddleware');

// Crea un enrutador de Express
const router = express.Router();

// --- Rutas de Autenticación ---
router.post('/registrar', registrarUsuario);
router.post('/login', iniciarSesion);

// --- Ruta para Subir Foto de Perfil ---
// POST /api/usuarios/:id/upload-profile-picture
// `proteger` asegura que el usuario esté autenticado.
// `upload.single('profilePicture')` es el middleware de Multer.
// 'profilePicture' debe ser el nombre del campo en el formulario que contiene el archivo.
router.post('/:id/upload-profile-picture', proteger, upload.single('profilePicture'), subirFotoPerfil);

// --- Rutas CRUD para Usuarios (Protegidas y Autorizadas) ---
router.get('/', proteger, autorizar(['admin']), obtenerUsuarios);
router.get('/:id', proteger, obtenerUsuarioPorId);
router.put('/:id', proteger, actualizarUsuario);
router.delete('/:id', proteger, autorizar(['admin']), eliminarUsuario);

// Exporta el enrutador
module.exports = router;
