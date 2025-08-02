// controlador de usuarios
const express = require('express');
const {
    registrarUsuario,
    iniciarSesion,
    subirFotoPerfil, 
    obtenerUsuarios,
    obtenerUsuarioPorId,
    actualizarUsuario,
    eliminarUsuario
} = require('../controllers/usuarioController');

// autenticación y autorización
const { proteger, autorizar } = require('../middleware/authMiddleware');
// middleware de Multer
const upload = require('../middleware/uploadMiddleware');

// enrutador de Express
const router = express.Router();

// --- Autenticación ---
router.post('/registrar', registrarUsuario);
router.post('/login', iniciarSesion);

// --- Ruta para Subir Foto de Perfil ---
router.post('/:id/upload-profile-picture', proteger, upload.single('profilePicture'), subirFotoPerfil);

// --- Rutas CRUD para Usuarios ---
router.get('/', proteger, autorizar(['admin']), obtenerUsuarios);
router.get('/:id', proteger, obtenerUsuarioPorId);
router.put('/:id', proteger, actualizarUsuario);
router.delete('/:id', proteger, autorizar(['admin']), eliminarUsuario);

module.exports = router;
