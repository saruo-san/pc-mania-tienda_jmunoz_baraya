# Diagrama de flujo PC Mania

```mermaid
flowchart TD
    Inicio(("INICIO"))
    Config{"¿Configuración completa?"}
    ErrorConfig["Mostrar variables faltantes"]
    Completar["Completar .env con datos de Cognito y API"]
    Login["Iniciar sesión"]
    Cognito["Amazon Cognito valida al usuario"]
    Sesion{"¿Sesión válida?"}
    ErrorLogin["Mostrar error de autenticación"]
    TipoUsuario{"¿Qué aplicación utiliza?"}
    Tienda["PC Mania Tienda"]
    Consultar["Solicitar catálogo"]
    GetProductos["GET /api/productos"]
    MostrarCatalogo["Mostrar productos disponibles"]
    Admin["PC Mania Admin"]
    Formulario["Completar formulario de producto"]
    PostProducto["POST /api/productos"]
    MostrarConfirmacion["Mostrar producto agregado"]
    Token["Obtener token de acceso"]
    Backend["Backend Spring Boot"]
    CORS["Procesar solicitud CORS"]
    Validar{"¿Datos válidos?"}
    ErrorApi["Responder error 400 o 404"]
    MostrarError["Mostrar error del API"]
    Cerrar["Cerrar sesión"]
    Fin(("FIN"))
    Inicio --> Config
    Config -->|"No"| ErrorConfig
    ErrorConfig --> Completar
    Completar --> Config
    Config -->|"Sí"| Login
    Login --> Cognito
    Cognito --> Sesion
    Sesion -->|"No"| ErrorLogin
    ErrorLogin --> Login
    Sesion -->|"Sí"| TipoUsuario
    TipoUsuario -->|"Cliente"| Tienda
    Tienda --> Consultar
    Consultar --> Token
    Token --> GetProductos
    GetProductos --> Backend
    TipoUsuario -->|"Administrador"| Admin
    Admin --> Formulario
    Formulario --> Token
    Token --> PostProducto
    PostProducto --> Backend
    Backend --> CORS
    CORS --> Validar
    Validar -->|"Sí - consulta"| MostrarCatalogo
    Validar -->|"Sí - creación"| MostrarConfirmacion
    Validar -->|"No"| ErrorApi
    ErrorApi --> MostrarError
    MostrarCatalogo --> Cerrar
    MostrarConfirmacion --> Cerrar
    MostrarError --> Cerrar
    Cerrar --> Fin
    classDef start fill:#1b5e20,stroke:#0d3b12,stroke-width:2px,color:#fff
    classDef process fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#000
    classDef decision fill:#fff3cd,stroke:#e0a000,stroke-width:2px,color:#000
    classDef auth fill:#ede7f6,stroke:#512da8,stroke-width:2px,color:#000
    classDef backend fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#000
    classDef error fill:#ffebee,stroke:#c62828,stroke-width:2px,color:#000
    classDef result fill:#e0f2f1,stroke:#00796b,stroke-width:2px,color:#000
    class Inicio,Fin start
    class ErrorConfig,Completar,Login,TipoUsuario,Tienda,Consultar,GetProductos,Admin,Formulario,PostProducto,Token,Cerrar process
    class Config,Sesion,Validar decision
    class Cognito auth
    class Backend,CORS backend
    class ErrorLogin,ErrorApi,MostrarError error
    class MostrarCatalogo,MostrarConfirmacion result
```

## Flujo resumido

1. Se comprueba la configuración del frontend.
2. El usuario inicia sesión mediante Amazon Cognito.
3. La tienda consulta productos o el administrador completa el formulario.
4. Se envía la solicitud al backend con el token de acceso.
5. Spring Boot valida los datos y procesa la operación.
6. Se muestra el resultado o el mensaje de error.
7. El usuario cierra sesión.
