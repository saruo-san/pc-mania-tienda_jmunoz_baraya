import { useEffect, useRef, useState } from 'react';
import { fetchAuthSession, signInWithRedirect, signOut } from 'aws-amplify/auth';
import { obtenerCatalogo, type Producto } from './api';
import { configFaltante, isConfigOk } from './config';
import './App.css';

type ThemeMode = 'light' | 'dark';
type OrdenProductos = 'nombre' | 'precio-asc' | 'precio-desc' | 'stock-desc';
const THEME_KEY = 'pcmania-tienda-theme';

function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem(THEME_KEY);
  return stored === 'light' || stored === 'dark' ? stored : 'dark';
}

const matrixCharacters = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポ';

function MatrixBackground() {
  return (
    <div className="jp-matrix" aria-hidden="true">
      {Array.from({ length: 1200 }, (_, index) => (
        <span key={index}>{matrixCharacters[index % matrixCharacters.length]}</span>
      ))}
    </div>
  );
}

type FiltroSelectProps = {
  value: string;
  placeholder: string;
  options: string[];
  ariaLabel: string;
  onChange: (value: string) => void;
};

function etiquetaFiltro(valor: string) {
  return {
    nombre: 'Nombre',
    'precio-asc': 'Precio: menor a mayor',
    'precio-desc': 'Precio: mayor a menor',
    'stock-desc': 'Mayor stock',
  }[valor] ?? valor;
}

function FiltroSelect({ value, placeholder, options, ariaLabel, onChange }: FiltroSelectProps) {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function cerrarAlHacerClickFuera(event: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(event.target as Node)) {
        setAbierto(false);
      }
    }

    document.addEventListener('mousedown', cerrarAlHacerClickFuera);
    return () => document.removeEventListener('mousedown', cerrarAlHacerClickFuera);
  }, []);

  return (
    <div className={`filtro-select ${abierto ? 'abierto' : ''}`} ref={contenedorRef}>
      <button
        type="button"
        className="filtro-select-trigger"
        aria-label={ariaLabel}
        aria-expanded={abierto}
        aria-haspopup="listbox"
        onClick={() => setAbierto((actual) => !actual)}
      >
        {value ? etiquetaFiltro(value) : placeholder}
      </button>
      {abierto && (
        <div className="filtro-select-menu" role="listbox" aria-label={ariaLabel}>
          <button type="button" role="option" aria-selected={!value} className={!value ? 'seleccionado' : ''} onClick={() => { onChange(''); setAbierto(false); }}>
            {placeholder}
          </button>
          {options.map((option) => (
            <button key={option} type="button" role="option" aria-selected={value === option} className={value === option ? 'seleccionado' : ''} onClick={() => { onChange(option); setAbierto(false); }}>
              {etiquetaFiltro(option)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  const [logueado, setLogueado] = useState(false);
  const [cargandoSesion, setCargandoSesion] = useState(isConfigOk);
  const [catalogo, setCatalogo] = useState<Producto[]>([]);
  const [cargandoCatalogo, setCargandoCatalogo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeMode>(getStoredTheme);
  const [settingsState, setSettingsState] = useState<'closed' | 'open' | 'closing'>('closed');
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [marcaSeleccionada, setMarcaSeleccionada] = useState('');
  const [orden, setOrden] = useState<OrdenProductos>('nombre');
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    document.body.dataset.theme = theme;
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (settingsState !== 'closing') return;

    const timer = window.setTimeout(() => {
      setSettingsState('closed');
    }, 220);

    return () => window.clearTimeout(timer);
  }, [settingsState]);

  useEffect(() => {
    if (!isConfigOk) return;

    fetchAuthSession()
      .then((session) => setLogueado(!!session.tokens))
      .catch(() => setLogueado(false))
      .finally(() => setCargandoSesion(false));
  }, []);

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

  useEffect(() => {
    if (!logueado) return;

    void cargarCatalogo();
  }, [logueado]);

  useEffect(() => {
    setPagina(1);
  }, [busqueda, categoriaSeleccionada, marcaSeleccionada, orden]);

  const categorias = [...new Set(catalogo.map((producto) => producto.categoria))].sort();
  const marcas = [...new Set(catalogo.map((producto) => producto.marca))].sort();
  const catalogoFiltrado = catalogo.filter((producto) => {
    const texto = busqueda.trim().toLowerCase();
    const coincideBusqueda = !texto || [producto.nombre, producto.marca, producto.categoria]
      .some((valor) => valor.toLowerCase().includes(texto));
    const coincideCategoria = !categoriaSeleccionada || producto.categoria === categoriaSeleccionada;
    const coincideMarca = !marcaSeleccionada || producto.marca === marcaSeleccionada;
    return coincideBusqueda && coincideCategoria && coincideMarca;
  }).sort((a, b) => {
    if (orden === 'nombre') return a.nombre.localeCompare(b.nombre);
    if (orden === 'precio-asc') return a.precio - b.precio;
    if (orden === 'precio-desc') return b.precio - a.precio;
    return b.stock - a.stock;
  });
  const productosPorPagina = 6;
  const totalPaginas = Math.max(1, Math.ceil(catalogoFiltrado.length / productosPorPagina));
  const paginaActual = Math.min(pagina, totalPaginas);
  const productosVisibles = catalogoFiltrado.slice((paginaActual - 1) * productosPorPagina, paginaActual * productosPorPagina);

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
    <div className="app-shell">
      <MatrixBackground />
      <div className="app">
        <header className="app-header">
          <div className="brand-block">
            <div className="brand-lockup" aria-label="PC MANIA logo">
              <span className="brand-mark">PC</span>
              <span className="brand-name">MANIA</span>
            </div>
            <p className="eyebrow">PC MANIA / COMPONENTES Y TECNOLOGIA</p>
            <h1>Tu próximo upgrade empieza aquí.</h1>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="ghost-button"
              onClick={() => {
                if (settingsState === 'open') {
                  setSettingsState('closing');
                  return;
                }

                if (settingsState === 'closing') {
                  return;
                }

                setSettingsState('open');
              }}
            >
              Preferencias
            </button>
            {!cargandoSesion && (logueado ? (
              <button type="button" onClick={() => signOut()}>Cerrar sesión</button>
            ) : (
              <button type="button" onClick={() => signInWithRedirect()}>Iniciar sesión</button>
            ))}
          </div>
        </header>

        {settingsState !== 'closed' && (
          <aside className={`settings-panel ${settingsState}`}>
            <div className="settings-header">
              <span>Preferencias</span>
              <button
                type="button"
                className="ghost-button small"
                onClick={() => {
                  setSettingsState('closing');
                }}
              >
                Cerrar
              </button>
            </div>
            <div className="setting-row">
              <div>
                <strong>Tema</strong>
                <small>{theme === 'dark' ? 'Oscuro' : 'Claro'}</small>
              </div>
              <button
                type="button"
                className="toggle-button"
                onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
              >
                {theme === 'dark' ? 'Claro' : 'Oscuro'}
              </button>
            </div>
          </aside>
        )}

        {cargandoSesion && <p className="mensaje">Verificando sesión...</p>}
        {!cargandoSesion && !logueado && <p className="mensaje">Inicia sesión como cliente para ver el catálogo.</p>}

        {logueado && (
          <main>
            <div className="catalogo-heading">
              <div>
                <p className="eyebrow">INVENTARIO EN LÍNEA</p>
                <h2>Componentes listos para armar</h2>
              </div>
              <div className="catalogo-heading-actions">
                <span>{catalogoFiltrado.length} de {catalogo.length} productos</span>
                <button type="button" className="refresh-button" disabled={cargandoCatalogo} onClick={() => void cargarCatalogo()} aria-label="Refrescar inventario">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z" />
                    <path fillRule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z" />
                  </svg>
                  {cargandoCatalogo ? 'Refrescando...' : 'Refrescar'}
                </button>
              </div>
            </div>
            {catalogo.length > 0 && (
              <div className="filtros-catalogo" aria-label="Filtros del catálogo">
                <input
                  type="search"
                  placeholder="Buscar por nombre, marca o categoría"
                  value={busqueda}
                  onChange={(event) => setBusqueda(event.target.value)}
                  aria-label="Buscar productos"
                />
                <FiltroSelect value={categoriaSeleccionada} placeholder="Todas las categorías" options={categorias} ariaLabel="Filtrar por categoría" onChange={setCategoriaSeleccionada} />
                <FiltroSelect value={marcaSeleccionada} placeholder="Todas las marcas" options={marcas} ariaLabel="Filtrar por marca" onChange={setMarcaSeleccionada} />
                <FiltroSelect value={orden} placeholder="Ordenar productos" options={['nombre', 'precio-asc', 'precio-desc', 'stock-desc']} ariaLabel="Ordenar productos" onChange={(value) => setOrden(value as OrdenProductos)} />
              </div>
            )}
            {cargandoCatalogo && <div className="estado-panel cargando-panel"><span className="spinner" />Cargando catálogo...</div>}
            {error && <div className="estado-panel error-panel"><strong>No pudimos cargar el catálogo</strong><span>{error}</span></div>}
            {!cargandoCatalogo && !error && catalogo.length === 0 && <div className="estado-panel vacio-panel"><strong>El catálogo está esperando productos</strong><span>Cuando haya productos disponibles aparecerán aquí.</span></div>}
            {!cargandoCatalogo && !error && catalogo.length > 0 && catalogoFiltrado.length === 0 && <div className="estado-panel vacio-panel"><strong>No encontramos coincidencias</strong><span>Prueba con otra búsqueda o limpia los filtros.</span></div>}
            <div className="grid-catalogo">
              {productosVisibles.map((producto) => (
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
            {!cargandoCatalogo && !error && totalPaginas > 1 && (
              <div className="paginacion" aria-label="Paginación del catálogo">
                <button type="button" className="ghost-button small" disabled={paginaActual === 1} onClick={() => setPagina((actual) => Math.max(1, actual - 1))}>Anterior</button>
                <span>Página {paginaActual} de {totalPaginas}</span>
                <button type="button" className="ghost-button small" disabled={paginaActual === totalPaginas} onClick={() => setPagina((actual) => Math.min(totalPaginas, actual + 1))}>Siguiente</button>
              </div>
            )}
          </main>
        )}
      </div>
    </div>
  );
}

export default App;
