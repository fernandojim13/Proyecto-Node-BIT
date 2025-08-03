// dependencias necesarias
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');

// rutas de usuario
const usuarioRoutes = require('./routes/usuarioRoutes');

// variables de entorno desde el archivo .env
dotenv.config();

// aplicación Express
const app = express();

// Middleware para parsear JSON en las solicitudes
app.use(express.json());

// Middleware para habilitar CORS
app.use(cors());

// --- Configuración para servir archivos estáticos ---
app.use(express.static('public'));

// puerto para el servidor
const PORT = process.env.PORT || 3000;

// --- Conexión a MongoDB ---
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error('Error: La variable de entorno MONGO_URI no está definida en .env');
    process.exit(1);
}

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log('MongoDB conectado exitosamente');
    } catch (error) {
        console.error('Error al conectar a MongoDB:', error.message);
        process.exit(1);
    }
};

// función para conectar a la base de datos
connectDB();

// --- Rutas de la API ---
app.use('/api/usuarios', usuarioRoutes);

// --- Endpoint Inicial ---
app.get('/', (req, res) => {
    res.status(200).json({ message: '¡Servidor Express funcionando correctamente!' });
});

// --- Manejo de Errores ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        message: err.message || 'Ha ocurrido un error en el servidor',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// servidor Express
app.listen(PORT, () => {
    console.log(`Servidor Express escuchando en el puerto ${PORT}`);
    console.log(`Accede a http://localhost:${PORT} en tu navegador para verificar.`);
});
