// Importa las dependencias necesarias
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');

// Importa las rutas de usuario
const usuarioRoutes = require('./routes/usuarioRoutes');

// Carga las variables de entorno desde el archivo .env
dotenv.config();

// Inicializa la aplicación Express
const app = express();

// Middleware para parsear JSON en las solicitudes
app.use(express.json());

// Middleware para habilitar CORS
app.use(cors());

// --- Configuración para servir archivos estáticos ---
// Esto hace que la carpeta 'public' sea accesible desde el navegador.
// Por ejemplo, si subes una imagen a 'public/uploads/mi_imagen.jpg',
// podrás acceder a ella en 'http://localhost:3000/uploads/mi_imagen.jpg'
app.use(express.static('public'));

// Define un puerto para el servidor
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

// Llama a la función para conectar a la base de datos
connectDB();

// --- Rutas de la API ---
app.use('/api/usuarios', usuarioRoutes);

// --- Endpoint Inicial (para verificar el funcionamiento) ---
app.get('/', (req, res) => {
    res.status(200).json({ message: '¡Servidor Express funcionando correctamente!' });
});

// --- Middleware de Manejo de Errores ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        message: err.message || 'Ha ocurrido un error en el servidor',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Inicia el servidor Express
app.listen(PORT, () => {
    console.log(`Servidor Express escuchando en el puerto ${PORT}`);
    console.log(`Accede a http://localhost:${PORT} en tu navegador para verificar.`);
});
