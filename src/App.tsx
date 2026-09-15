import { useEffect, useState } from 'react';
import { fetchAuthSession, signInWithRedirect, signOut } from 'aws-amplify/auth';
import { obtenerCatalogo, type Producto } from './api';
import { configFaltante, isConfigOk } from './config';
import './App.css';

function App() {
  const [logueado, setLogueado] = useState(false);
  const [cargandoSesion, setCargandoSesion] = useState(isConfigOk);
  const [catalogo, setCatalogo] = useState<Producto[]>([]);
  const [cargandoCatalogo, setCargandoCatalogo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConfigOk) return;

    fetchAuthSession()
      .then((session) => setLogueado(!!session.tokens))
      .catch(() => setLogueado(false))
      .finally(() => setCargandoSesion(false));
  }, []);

  useEffect(() => {
    if (!logueado) return;

    async function cargarCatalogo() {
      setCargandoCatalogo(true);
      setError(null);
      try {
        setCatalogo(await obtenerCatalogo());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setCargandoCatalogo(false);
      }
    }

    void cargarCatalogo();
  }, [logueado]);

  if (!isConfigOk) {
    return (
      <div className="aviso-config">
        <p className="eyebrow">PC MANIA / CONFIGURACION</p>
        <h1>Conecta tu tienda</h1>
        <p>Completa estos valores en el archivo <code>.env</code> cuando configures Cognito:</p>
        <ul>
          {configFaltante().map((clave) => (
            <li key={clave}><code>{clave}</code></li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <p className="eyebrow">PC MANIA / COMPONENTES Y TECNOLOGIA</p>
          <h1>Tu proximo upgrade empieza aqui.</h1>
        </div>
        {!cargandoSesion && (logueado ? (
          <button onClick={() => signOut()}>Cerrar sesion</button>
        ) : (
          <button onClick={() => signInWithRedirect()}>Iniciar sesion</button>
        ))}
      </header>

      {cargandoSesion && <p className="mensaje">Verificando sesion...</p>}
      {!cargandoSesion && !logueado && <p className="mensaje">Inicia sesion como cliente para ver el catalogo.</p>}

      {logueado && (
        <main>
          <div className="catalogo-heading">
            <div>
              <p className="eyebrow">INVENTARIO EN LINEA</p>
              <h2>Componentes listos para armar</h2>
            </div>
            <span>{catalogo.length} productos</span>
          </div>
          {cargandoCatalogo && <p className="mensaje">Cargando catalogo...</p>}
          {error && <p className="error">Error al cargar el catalogo: {error}</p>}
          {!cargandoCatalogo && !error && catalogo.length === 0 && <p className="mensaje">No hay productos disponibles.</p>}
          <div className="grid-catalogo">
            {catalogo.map((producto) => (
              <article key={producto.id} className="tarjeta">
                <div className="producto-icono">{producto.categoria.slice(0, 3).toUpperCase()}</div>
                <p className="categoria">{producto.categoria}</p>
                <h3>{producto.nombre}</h3>
                <p className="marca">{producto.marca}</p>
                <div className="producto-footer">
                  <strong>${producto.precio.toLocaleString('es-CL')}</strong>
                  <span className={producto.stock > 0 ? 'stock-ok' : 'stock-agotado'}>
                    {producto.stock > 0 ? `${producto.stock} disponibles` : 'Agotado'}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </main>
      )}
    </div>
  );
}

export default App;
