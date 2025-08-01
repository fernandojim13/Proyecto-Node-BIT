const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define el esquema del Usuario
const usuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true
    },
    correoElectronico: {
        type: String,
        required: [true, 'El correo electrónico es obligatorio'],
        unique: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Por favor, introduce un correo electrónico válido']
    },
    contrasena: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
        select: false
    },
    rol: {
        type: String,
        enum: ['admin', 'usuario'],
        default: 'usuario'
    },
    // --- Nuevo campo para la foto de perfil ---
    fotoPerfil: {
        type: String,
        default: '/uploads/default-profile.png' // Ruta por defecto si no hay foto
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Middleware de Mongoose (Pre-save Hook) para hashear la contraseña
usuarioSchema.pre('save', async function(next) {
    if (!this.isModified('contrasena')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.contrasena = await bcrypt.hash(this.contrasena, salt);
    next();
});

// Método de Instancia para Comparar Contraseñas
usuarioSchema.methods.compararContrasena = async function(contrasenaCandidata) {
    return await bcrypt.compare(contrasenaCandidata, this.contrasena);
};

const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario;

