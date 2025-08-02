const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');
const path = require('path'); // path para manejar rutas de archivos
const fs = require('fs');     // Importa fs para interactuar con el sistema de archivos


// --- Generar un Token JWT ---
const generarToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// --- Funciones del Controlador ---

// Registrar un nuevo usuario
// POST /api/usuarios/registrar
// Public
const registrarUsuario = async (req, res, next) => {
    try {
        const { nombre, correoElectronico, contrasena, rol } = req.body;

        if (!nombre || !correoElectronico || !contrasena) {
            const error = new Error('Por favor, ingresa todos los campos obligatorios: nombre, correo electrónico y contraseña.');
            error.statusCode = 400;
            return next(error);
        }

        const usuarioExistente = await Usuario.findOne({ correoElectronico });
        if (usuarioExistente) {
            const error = new Error('El correo electrónico ya está registrado. Por favor, usa otro.');
            error.statusCode = 409;
            return next(error);
        }

        const nuevoUsuario = await Usuario.create({
            nombre,
            correoElectronico,
            contrasena,
            rol
        });

        const token = generarToken(nuevoUsuario._id);

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            token,
            usuario: {
                _id: nuevoUsuario._id,
                nombre: nuevoUsuario.nombre,
                correoElectronico: nuevoUsuario.correoElectronico,
                rol: nuevoUsuario.rol,
                fotoPerfil: nuevoUsuario.fotoPerfil // Incluye la foto de perfil
            }
        });
    } catch (error) {
        next(error);
    }
};

// Iniciar sesión de usuario
// POST /api/usuarios/login
// acceso publico
const iniciarSesion = async (req, res, next) => {
    try {
        const { correoElectronico, contrasena } = req.body;

        if (!correoElectronico || !contrasena) {
            const error = new Error('Por favor, ingresa el correo electrónico y la contraseña.');
            error.statusCode = 400;
            return next(error);
        }

        const usuario = await Usuario.findOne({ correoElectronico }).select('+contrasena');

        if (!usuario || !(await usuario.compararContrasena(contrasena))) {
            const error = new Error('Credenciales inválidas. Correo electrónico o contraseña incorrectos.');
            error.statusCode = 401;
            return next(error);
        }

        const token = generarToken(usuario._id);

        res.status(200).json({
            success: true,
            message: 'Inicio de sesión exitoso',
            token,
            usuario: {
                _id: usuario._id,
                nombre: usuario.nombre,
                correoElectronico: usuario.correoElectronico,
                rol: usuario.rol,
                fotoPerfil: usuario.fotoPerfil // foto de perfil
            }
        });
    } catch (error) {
        next(error);
    }
};

// foto de perfil de un usuario
// POST /api/usuarios/:id/foto de perfil
// acceso privado
const subirFotoPerfil = async (req, res, next) => {
    try {
        const userId = req.params.id;

        // solo el propio usuario o un admin puede subir o actualizar la foto
        if (req.usuario.rol !== 'admin' && req.usuario._id.toString() !== userId.toString()) {
            const error = new Error('No autorizado para subir la foto de perfil de otro usuario.');
            error.statusCode = 403;
            return next(error);
        }

        // verificar si se subió un archivo
        if (!req.file) {
            const error = new Error('No se ha subido ningún archivo.');
            error.statusCode = 400;
            return next(error);
        }

        // buscar el usuario en la base de datos
        const usuario = await Usuario.findById(userId);

        if (!usuario) {
            const error = new Error(`Usuario con ID ${userId} no encontrado.`);
            error.statusCode = 404;
            return next(error);
        }

        // eliminar la foto de perfil antigua si no es la por defecto
        if (usuario.fotoPerfil && usuario.fotoPerfil !== '/uploads/default-profile.png') {
            const oldImagePath = path.join(__dirname, '..', 'public', usuario.fotoPerfil);
            fs.unlink(oldImagePath, (err) => {
                if (err) console.error('Error al eliminar la foto antigua:', err);
            });
        }

        // ruta de la foto de perfil del usuario
        // ruta se guarda relativa a la carpeta 'public'
        usuario.fotoPerfil = `/uploads/${req.file.filename}`;
        await usuario.save(); // Guarda los cambios en la base de datos

        res.status(200).json({
            success: true,
            message: 'Foto de perfil subida exitosamente',
            fotoPerfil: usuario.fotoPerfil // nueva ruta de la foto
        });

    } catch (error) {
        next(error);
    }
};


// obtener todos los usuarios
// GET /api/usuarios
// acceso privado de asministrador
const obtenerUsuarios = async (req, res, next) => {
    try {
        const usuarios = await Usuario.find().select('-contrasena');
        res.status(200).json({
            success: true,
            count: usuarios.length,
            usuarios
        });
    } catch (error) {
        next(error);
    }
};

// obtener un usuario por su ID
// GET /api/usuarios/:id
// accseo privado administrador 
const obtenerUsuarioPorId = async (req, res, next) => {
    try {
        const usuario = await Usuario.findById(req.params.id).select('-contrasena');

        if (!usuario) {
            const error = new Error(`Usuario con ID ${req.params.id} no encontrado.`);
            error.statusCode = 404;
            return next(error);
        }

        if (req.usuario.rol !== 'admin' && req.usuario._id.toString() !== usuario._id.toString()) {
            const error = new Error('No autorizado para ver este perfil de usuario.');
            error.statusCode = 403;
            return next(error);
        }

        res.status(200).json({
            success: true,
            usuario
        });
    } catch (error) {
        if (error.name === 'CastError') {
            const castError = new Error(`Formato de ID inválido: ${req.params.id}`);
            castError.statusCode = 400;
            return next(castError);
        }
        next(error);
    }
};

// actualizar un usuario por su ID
// PUT /api/usuarios/:id
// acceso privado de usuario o administrador
const actualizarUsuario = async (req, res, next) => {
    try {
        const { nombre, correoElectronico, rol } = req.body;
        const userId = req.params.id;

        if (req.usuario.rol !== 'admin' && rol && rol !== req.usuario.rol) {
            const error = new Error('No autorizado para cambiar el rol del usuario.');
            error.statusCode = 403;
            return next(error);
        }

        if (req.usuario.rol !== 'admin' && req.usuario._id.toString() !== userId.toString()) {
            const error = new Error('No autorizado para actualizar este perfil de usuario.');
            error.statusCode = 403;
            return next(error);
        }

        if (req.body.contrasena) {
            const error = new Error('La contraseña no puede ser actualizada a través de esta ruta. Por favor, usa una ruta específica para actualizar la contraseña.');
            error.statusCode = 400;
            return next(error);
        }

        const usuarioActualizado = await Usuario.findByIdAndUpdate(
            userId,
            { nombre, correoElectronico, rol },
            { new: true, runValidators: true }
        ).select('-contrasena');

        if (!usuarioActualizado) {
            const error = new Error(`Usuario con ID ${userId} no encontrado.`);
            error.statusCode = 404;
            return next(error);
        }

        res.status(200).json({
            success: true,
            message: 'Usuario actualizado exitosamente',
            usuario: usuarioActualizado
        });
    } catch (error) {
        if (error.name === 'CastError') {
            const castError = new Error(`Formato de ID inválido: ${req.params.id}`);
            castError.statusCode = 400;
            return next(castError);
        }
        if (error.code === 11000) {
            const duplicateError = new Error('El correo electrónico ya está en uso por otro usuario.');
            duplicateError.statusCode = 409;
            return next(duplicateError);
        }
        next(error);
    }
};

// eliminar un usuario por su ID
// DELETE /api/usuarios/:id
// acceso privado de administrador 
const eliminarUsuario = async (req, res, next) => {
    try {
        const userId = req.params.id;

        const usuarioEliminado = await Usuario.findByIdAndDelete(userId);

        if (!usuarioEliminado) {
            const error = new Error(`Usuario con ID ${userId} no encontrado.`);
            error.statusCode = 404;
            return next(error);
        }

        // eliminar la foto de perfil del sistema de archivos al eliminar el usuario
        if (usuarioEliminado.fotoPerfil && usuarioEliminado.fotoPerfil !== '/uploads/default-profile.png') {
            const imagePath = path.join(__dirname, '..', 'public', usuarioEliminado.fotoPerfil);
            fs.unlink(imagePath, (err) => {
                if (err) console.error('Error al eliminar la foto de perfil al borrar usuario:', err);
            });
        }

        res.status(200).json({
            success: true,
            message: 'Usuario eliminado exitosamente',
            usuario: usuarioEliminado
        });
    } catch (error) {
        if (error.name === 'CastError') {
            const castError = new Error(`Formato de ID inválido: ${req.params.id}`);
            castError.statusCode = 400;
            return next(castError);
        }
        next(error);
    }
};

module.exports = {
    registrarUsuario,
    iniciarSesion,
    subirFotoPerfil,
    obtenerUsuarios,
    obtenerUsuarioPorId,
    actualizarUsuario,
    eliminarUsuario
};


