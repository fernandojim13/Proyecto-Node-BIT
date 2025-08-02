const mongoose = require('mongoose');

const rolSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    descripcion: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

const Rol = mongoose.model('Rol', rolSchema);

module.exports = Rol;