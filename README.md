# PC Mania Tienda

Tienda web para consultar el catálogo de productos tecnológicos de PC Mania.

## Tecnologías

- React 19
- TypeScript
- Vite
- AWS Amplify y Amazon Cognito

## Funcionalidades

- Inicio y cierre de sesión con Cognito.
- Solicitud del alcance OAuth `pcmania-api/read`.
- Consulta del catálogo mediante `GET /api/productos`.
- Visualización de nombre, marca, categoría, precio y stock.
- Envío del token de acceso en la cabecera `Authorization`.
- Estados para carga, errores y catálogo sin productos.

## Archivos principales

- `src/App.tsx`: sesión, carga y presentación del catálogo.
- `src/api.ts`: tipo `Producto` y petición para obtener productos.
- `src/config.ts`: lectura y validación de variables de entorno.
- `src/main.tsx`: configuración de Amplify e inicio de React.
- `src/App.css`: estilos de la tienda.

## Configuración

Copia `.env.example` como `.env` y completa los datos de Cognito y del backend:

```env
VITE_COGNITO_USER_POOL_ID=
VITE_COGNITO_CLIENT_ID=
VITE_COGNITO_DOMAIN=
VITE_REDIRECT_SIGN_IN=http://localhost:5173/
VITE_REDIRECT_SIGN_OUT=http://localhost:5173/
VITE_API_URL=http://localhost:8080
```

## Instalación y ejecución

```bash
npm install
npm run dev
```

La aplicación se ejecuta normalmente en `http://localhost:5173`.

Otros comandos:

```bash
npm run build
npm run lint
npm run preview
```

El backend debe estar ejecutándose en `http://localhost:8080` para consultar el catálogo.
