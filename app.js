// Importa las dependencias necesarias
const express = require('express'); // Importa el framework Express
const dotenv = require('dotenv');   // Importa dotenv para cargar variables de entorno
const mongoose = require('mongoose'); // Importa Mongoose para la conexión a MongoDB
const cors = require('cors');       // Importa CORS para habilitar el intercambio de recursos entre orígenes

// Carga las variables de entorno desde el archivo .env
dotenv.config();

// Inicializa la aplicación Express
const app = express();

// Middleware para parsear JSON en las solicitudes
app.use(express.json());

// Middleware para habilitar CORS
// Esto permite que tu frontend (ej. React, Angular, Vue) se comunique con este backend
app.use(cors());

// Define un puerto para el servidor
// Intenta usar el puerto definido en las variables de entorno (PORT) o usa 3000 por defecto
const PORT = process.env.PORT || 3000; // 3000

// --- Endpoint Inicial ---
// Define una ruta GET simple para verificar que el servidor está funcionando
app.get('/', (req, res) => {
    res.status(200).json({ message: '¡Servidor Express funcionando correctamente!' });
});

// --- Conexión a MongoDB ---
// Obtiene la URI de MongoDB desde las variables de entorno
const mongoURI = process.env.MONGO_URI;

// Verifica si la URI de MongoDB está definida
if (!mongoURI) {
    console.error('Error: La variable de entorno MONGO_URI no está definida en .env');
    process.exit(1); // Sale de la aplicación si no hay URI de MongoDB
}

// Función para conectar a MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI, {
            // Opciones recomendadas para evitar advertencias de deprecación
            // useNewUrlParser: true, // Ya no es necesario en Mongoose 6+
            // useUnifiedTopology: true, // Ya no es necesario en Mongoose 6+
        });
        console.log('MongoDB conectado exitosamente');
    } catch (error) {
        console.error('Error al conectar a MongoDB:', error.message);
        // Puedes agregar un manejo de errores más sofisticado aquí, como reintentos
        process.exit(1); // Sale de la aplicación si la conexión falla
    }
};

// Llama a la función para conectar a la base de datos
connectDB();

// Inicia el servidor Express
app.listen(PORT, () => {
    console.log(`Servidor Express escuchando en el puerto ${PORT}`);
    console.log(`Accede a http://localhost:${PORT} en tu navegador para verificar.`);
});