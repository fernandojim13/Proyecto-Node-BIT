const multer = require('multer'); // Importa Multer
const path = require('path');     // Módulo 'path' para trabajar con rutas de archivos

// --- Configuración del almacenamiento en disco de Multer ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// Esta función se usa para permitir o denegar la subida de archivos específicos
const fileFilter = (req, file, cb) => {
    // Tipos de archivos permitidos 
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

// --- Inicializa Multer  ---
const upload = multer({
    storage: storage, // Usa la configuración de almacenamiento definida
    fileFilter: fileFilter, // Usa el filtro de archivos definido 
    limits: {
        fileSize: 1024 * 1024 * 5 // Limite de tamaño de archivo
    }
});

module.exports = upload; 