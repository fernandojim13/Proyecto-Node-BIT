const multer = require('multer'); // Importa Multer
const path = require('path');     // Módulo 'path' para trabajar con rutas de archivos

// --- Configuración del almacenamiento en disco de Multer ---
const storage = multer.diskStorage({
    // `destination` es la carpeta donde se guardarán los archivos
    // `cb` es el callback: null para errores, la ruta de destino como segundo argumento
    destination: (req, file, cb) => {
        // Asegúrate de que la carpeta 'public/uploads' exista
        cb(null, 'public/uploads');
    },
    // `filename` es el nombre que tendrá el archivo guardado
    // Se recomienda usar un nombre único para evitar colisiones
    filename: (req, file, cb) => {
        // Genera un nombre de archivo único usando la fecha actual y el nombre original del archivo
        // path.extname(file.originalname) obtiene la extensión del archivo (ej. .jpg, .png)
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// --- Filtro de archivos ---
// Esta función se usa para permitir o denegar la subida de archivos específicos
const fileFilter = (req, file, cb) => {
    // Tipos de archivos permitidos (ej. imágenes)
    const filetypes = /jpeg|jpg|png|gif/;
    // Verifica la extensión del archivo
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Verifica el mimetype del archivo
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true); // Permite la subida
    } else {
        // Deniega la subida y envía un mensaje de error
        cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif)'), false);
    }
};

// --- Inicializa Multer con la configuración ---
const upload = multer({
    storage: storage, // Usa la configuración de almacenamiento definida arriba
    fileFilter: fileFilter, // Usa el filtro de archivos definido arriba
    limits: {
        fileSize: 1024 * 1024 * 5 // Limite de tamaño de archivo: 5MB (5 * 1024 * 1024 bytes)
    }
});

module.exports = upload; // Exporta la instancia de Multer configurada