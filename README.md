# Proyecto-Node-BIT

PROCESO PARA INICIAR EL SERVIDOR:

EN LA CARPETA BACKEND EJECUTAR EN LA TERMINAL:
node app.js
ESTA LIENA DE CODIGO INICIA EL SERVIDOR, DADO QUE YA ESTAN INSTALADAS LAS DEPENDENCIAS Y EL PUERTO DE TRABAJO;
Servidor Express escuchando en el puerto 3000
Accede a http://localhost:3000 en tu navegador para verificar.
MongoDB conectado exitosamente
TAMBIEN CONFIRMA LA CONEXION DE LA BASE DE DATOS EN MONGODB COMPASS

Paso a Paso de las Operaciones CRUD
1. Crear un Usuario (Operación POST)
Esta operación se utiliza para registrar un nuevo usuario en la base de datos.

Petición del Cliente:
Método: POST
URL: http://localhost:3000/api/usuarios/registrar
Cuerpo: Un objeto JSON con nombre, correoElectronico y contrasena.
Flujo del Servidor:
app.js dirige la petición a usuarioRoutes.js.

En usuarioRoutes.js, la ruta router.post('/registrar', registrarUsuario); coincide con la petición. Esta ruta es pública, por lo que no se ejecutan middlewares de autenticación.
Se llama a la función registrarUsuario en usuarioController.js.
El controlador:
Obtiene los datos del cuerpo de la petición (req.body).
Realiza validaciones (por ejemplo, verifica que no falten campos).
Utiliza el modelo Usuario para buscar si ya existe un usuario con el mismo correo electrónico.

Si no existe, utiliza Usuario.create() para guardar el nuevo usuario. Importante: El hook pre('save') del modelo se encarga de hashear la contraseña automáticamente antes de guardarla.
Llama a generarToken() para crear un JWT.
Envía una respuesta con el código de estado 201 Created y un JSON que contiene el nuevo usuario (sin la contraseña) y el token JWT.

2. Leer/Consultar Usuarios (Operación GET)
Esta operación permite obtener la lista de todos los usuarios o un usuario específico.
a) Obtener todos los usuarios:
Petición del Cliente:
Método: GET
URL: http://localhost:3000/api/usuarios
Header: Authorization: Bearer TU_TOKEN_DE_ADMIN
Flujo del Servidor:
app.js dirige la petición a usuarioRoutes.js.
En usuarioRoutes.js, la ruta router.get('/', proteger, autorizar(['admin']), obtenerUsuarios); coincide.
Primero, se ejecuta el middleware proteger, que verifica si el token JWT es válido.
Luego, se ejecuta el middleware autorizar, que verifica si el rol del usuario autenticado es admin.
Si ambas verificaciones son exitosas, se llama a la función obtenerUsuarios en usuarioController.js.
El controlador utiliza Usuario.find().select('-contrasena') para obtener todos los usuarios y excluye el campo de contraseña.
Envía una respuesta 200 OK con un JSON que contiene la lista de usuarios.

b) Obtener un usuario por su ID:
Petición del Cliente:
Método: GET
URL: http://localhost:3000/api/usuarios/ID_DEL_USUARIO
Header: Authorization: Bearer TU_TOKEN
Flujo del Servidor:
app.js y usuarioRoutes.js dirigen la petición, y el middleware proteger verifica el token.
Se llama a obtenerUsuarioPorId.

El controlador utiliza Usuario.findById(req.params.id).select('-contrasena') para buscar el usuario.
Realiza una verificación adicional de autorización dentro de la función: if (req.usuario.rol !== 'admin' && req.usuario._id.toString() !== usuario._id.toString()). Esto asegura que un usuario solo pueda ver su propio perfil, a menos que sea un administrador.
Si se encuentra el usuario y la autorización es correcta, envía una respuesta 200 OK con un JSON que contiene los datos del usuario.

3. Actualizar un Usuario (Operación PUT)
Esta operación se utiliza para modificar los datos de un usuario existente.

Petición del Cliente:
Método: PUT
URL: http://localhost:3000/api/usuarios/ID_DEL_USUARIO
Cuerpo: Un objeto JSON con los campos a actualizar (por ejemplo, nombre).
Header: Authorization: Bearer TU_TOKEN
Flujo del Servidor:
La ruta router.put('/:id', proteger, actualizarUsuario); coincide y el middleware proteger verifica el token.
Se llama a actualizarUsuario.
El controlador utiliza req.params.id para obtener el ID del usuario.
Realiza la verificación de autorización (solo el propio usuario o un admin pueden actualizar el perfil).

Utiliza Usuario.findByIdAndUpdate() con las opciones { new: true, runValidators: true } para encontrar y actualizar el documento en la base de datos.
Si la actualización es exitosa, envía una respuesta 200 OK con el objeto del usuario actualizado.

4. Eliminar un Usuario (Operación DELETE)
Esta operación elimina permanentemente un usuario de la base de datos.

Petición del Cliente:
Método: DELETE
URL: http://localhost:3000/api/usuarios/ID_DEL_USUARIO
Header: Authorization: Bearer TU_TOKEN_DE_ADMIN
Flujo del Servidor:
La ruta router.delete('/:id', proteger, autorizar(['admin']), eliminarUsuario); coincide.
Se ejecutan los middlewares proteger y autorizar para asegurar que solo un administrador autenticado pueda acceder a esta ruta.

Se llama a eliminarUsuario.
El controlador utiliza Usuario.findByIdAndDelete() para encontrar y eliminar el documento.
Si el usuario se elimina correctamente, se envía una respuesta 200 OK con un mensaje de éxito.

conexion a la base de datos:
crea una base de datos en mongodb compass que se llamara: segundo_proyecto, desde la carpeta backend puedes descargar su respectiva coleccion denominada segundo_proyecto, importala para que se realice la conexion a la base de datos de este proyecto
