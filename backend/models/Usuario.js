// Importa Mongoose
const mongoose = require('mongoose');

// Define el esquema del Usuario
const usuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'], // El nombre es de tipo String y es requerido
        trim: true // Elimina espacios en blanco al inicio y al final
    },
    correoElectronico: {
        type: String,
        required: [true, 'El correo electrónico es obligatorio'], // El correo electrónico es de tipo String y es requerido
        unique: true, // Asegura que cada correo electrónico sea único en la base de datos
        lowercase: true, // Convierte el correo electrónico a minúsculas antes de guardar
        match: [/.+@.+\..+/, 'Por favor, introduce un correo electrónico válido'] // Valida el formato del correo electrónico
    },
    contrasena: {
        type: String,
        required: [true, 'La contraseña es obligatoria'], // La contraseña es de tipo String y es requerida
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres'] // Longitud mínima de la contraseña
    },
    rol: {
        type: String,
        enum: ['admin', 'usuario'], // El rol solo puede ser 'admin' o 'usuario'
        default: 'usuario' // El rol por defecto es 'usuario'
    },
    fechaCreacion: {
        type: Date,
        default: Date.now // Establece la fecha de creación automáticamente al momento de crear el documento
    }
}, {
    timestamps: true // Añade automáticamente `createdAt` y `updatedAt`
});

// Crea y exporta el modelo de Usuario
const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario;
