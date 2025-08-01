// Importa el modelo de Usuario
const Usuario = require('../models/Usuario');

// --- Funciones del Controlador ---

// @desc    Crear un nuevo usuario
// @route   POST /api/usuarios
// @access  Public (por ahora, luego se protegerá)
const crearUsuario = async (req, res, next) => {
    try {
        // Extrae los datos del cuerpo de la solicitud (request body)
        const { nombre, correoElectronico, contrasena, rol } = req.body;

        // Validar que los campos obligatorios no estén vacíos
        if (!nombre || !correoElectronico || !contrasena) {
            // Lanza un error si faltan campos
            const error = new Error('Por favor, ingresa todos los campos obligatorios: nombre, correo electrónico y contraseña.');
            error.statusCode = 400; // Código de estado 400 Bad Request
            return next(error); // Pasa el error al middleware de manejo de errores
        }

        // Verificar si el correo electrónico ya está registrado
        const usuarioExistente = await Usuario.findOne({ correoElectronico });
        if (usuarioExistente) {
            const error = new Error('El correo electrónico ya está registrado. Por favor, usa otro.');
            error.statusCode = 409; // Código de estado 409 Conflict
            return next(error);
        }

        // Crear un nuevo usuario en la base de datos
        const nuevoUsuario = await Usuario.create({
            nombre,
            correoElectronico,
            contrasena, // ¡IMPORTANTE! La contraseña debe ser hasheada antes de guardarla en producción
            rol // Si se proporciona, de lo contrario usará el valor por defecto del modelo
        });

        // Responder con el usuario creado (excluyendo la contraseña por seguridad)
        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            usuario: {
                _id: nuevoUsuario._id,
                nombre: nuevoUsuario.nombre,
                correoElectronico: nuevoUsuario.correoElectronico,
                rol: nuevoUsuario.rol,
                fechaCreacion: nuevoUsuario.fechaCreacion
            }
        });
    } catch (error) {
        // Si ocurre algún error durante el proceso, pásalo al middleware de manejo de errores
        next(error);
    }
};

// @desc    Obtener todos los usuarios
// @route   GET /api/usuarios
// @access  Public (por ahora, luego se protegerá)
const obtenerUsuarios = async (req, res, next) => {
    try {
        // Buscar todos los usuarios en la base de datos
        // Excluir el campo 'contrasena' de los resultados por seguridad
        const usuarios = await Usuario.find().select('-contrasena');

        // Responder con la lista de usuarios
        res.status(200).json({
            success: true,
            count: usuarios.length, // Número total de usuarios
            usuarios // Array de usuarios
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obtener un usuario por su ID
// @route   GET /api/usuarios/:id
// @access  Public (por ahora, luego se protegerá)
const obtenerUsuarioPorId = async (req, res, next) => {
    try {
        // Buscar un usuario por su ID proporcionado en los parámetros de la URL
        // Excluir el campo 'contrasena'
        const usuario = await Usuario.findById(req.params.id).select('-contrasena');

        // Si el usuario no se encuentra, lanzar un error 404
        if (!usuario) {
            const error = new Error(`Usuario con ID ${req.params.id} no encontrado.`);
            error.statusCode = 404;
            return next(error);
        }

        // Responder con el usuario encontrado
        res.status(200).json({
            success: true,
            usuario
        });
    } catch (error) {
        // Si el ID no es un formato válido de MongoDB, Mongoose lanzará un error de tipo CastError
        if (error.name === 'CastError') {
            const castError = new Error(`Formato de ID inválido: ${req.params.id}`);
            castError.statusCode = 400; // Bad Request
            return next(castError);
        }
        next(error);
    }
};

// @desc    Actualizar un usuario por su ID
// @route   PUT /api/usuarios/:id
// @access  Public (por ahora, luego se protegerá)
const actualizarUsuario = async (req, res, next) => {
    try {
        const { nombre, correoElectronico, rol } = req.body; // No permitimos actualizar la contraseña directamente aquí
        const userId = req.params.id;

        // Buscar el usuario por ID y actualizarlo
        // { new: true } devuelve el documento actualizado en lugar del original
        // { runValidators: true } ejecuta las validaciones definidas en el esquema de Mongoose
        const usuarioActualizado = await Usuario.findByIdAndUpdate(
            userId,
            { nombre, correoElectronico, rol },
            { new: true, runValidators: true }
        ).select('-contrasena'); // Excluir contraseña

        // Si el usuario no se encuentra
        if (!usuarioActualizado) {
            const error = new Error(`Usuario con ID ${userId} no encontrado.`);
            error.statusCode = 404;
            return next(error);
        }

        // Responder con el usuario actualizado
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
        // Si el correo electrónico ya existe (debido a unique: true)
        if (error.code === 11000) { // Código de error de duplicado de MongoDB
            const duplicateError = new Error('El correo electrónico ya está en uso por otro usuario.');
            duplicateError.statusCode = 409;
            return next(duplicateError);
        }
        next(error);
    }
};

// @desc    Eliminar un usuario por su ID
// @route   DELETE /api/usuarios/:id
// @access  Public (por ahora, luego se protegerá)
const eliminarUsuario = async (req, res, next) => {
    try {
        const userId = req.params.id;

        // Buscar y eliminar el usuario
        const usuarioEliminado = await Usuario.findByIdAndDelete(userId);

        // Si el usuario no se encuentra
        if (!usuarioEliminado) {
            const error = new Error(`Usuario con ID ${userId} no encontrado.`);
            error.statusCode = 404;
            return next(error);
        }

        // Responder con un mensaje de éxito
        res.status(200).json({
            success: true,
            message: 'Usuario eliminado exitosamente',
            usuario: usuarioEliminado // Opcional: puedes devolver el usuario eliminado
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

// Exporta las funciones para que puedan ser usadas en las rutas
module.exports = {
    crearUsuario,
    obtenerUsuarios,
    obtenerUsuarioPorId,
    actualizarUsuario,
    eliminarUsuario
};
