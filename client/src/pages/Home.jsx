import { useEffect, useState } from "react";
import Dashboard from "../components/Dashboard";
import Gestion from "../components/Gestion";
import Historial from "../components/Historial";
import Ajustes from "../components/Ajustes";
import EmployeeForm from "../components/EmployeeForm";
import Deudas from "../components/Deudas"; 
import Proveedores from "../components/Proveedores"; 
import Categorias from "../components/Categorias";
import Entrada from "../components/Entrada";

const Home = () => {
  const [activePage, setActivePage] = useState("entrada"); // Default para no admin
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));
    setUsuario(usuarioGuardado);

    if (usuarioGuardado && usuarioGuardado.es_admin) {
      setActivePage("dashboard"); // admin empieza en dashboard
    } else {
      setActivePage("entrada"); // no admin empieza en entrada (página accesible)
    }
  }, []);

  const renderContent = () => {
    if (
      (activePage === "dashboard" ||
       activePage === "deudas" ||
       activePage === "employeeForm" ||
       activePage === "historial") &&
      usuario &&
      !usuario.es_admin
    ) {
      return (
        <div className="text-red-600 font-semibold text-lg">
          No tienes permiso para ver esta pestaña.
        </div>
      );
    }

    switch (activePage) {
      case "dashboard":
        return <Dashboard />;
      case "entrada":
        return <Entrada />;
      case "gestion":
        return <Gestion />;
      case "historial":
        return <Historial />;
      case "ajustes":
        return <Ajustes />;
      case "employeeForm":
        return <EmployeeForm />;
      case "deudas":
        return <Deudas />;
      case "proveedores":
        return <Proveedores />;
      case "categorias":
        return <Categorias />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden relative">
      <button
        className="md:hidden fixed top-4 left-4 z-30 p-2 bg-green-800 text-white rounded"
        onClick={() => setSidebarOpen(true)}
        aria-label="Abrir menú"
      >
        ☰
      </button>

      <aside
        className={`fixed inset-y-0 left-0 bg-green-800 text-white p-6 flex flex-col gap-4 w-64
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:flex-shrink-0
          z-40
        `}
      >
        <h2 className="text-2xl font-bold mb-6">Menú</h2>
        <nav className="flex flex-col gap-4">
          {/* Mostrar Dashboard solo si es admin */}
          {usuario?.es_admin && (
            <button
              onClick={() => {
                setActivePage("dashboard");
                setSidebarOpen(false);
              }}
              className={`text-left px-3 py-2 rounded w-full ${
                activePage === "dashboard" ? "bg-green-700" : "hover:bg-green-700"
              }`}
            >
              Dashboard
            </button>
          )}

          <button
            onClick={() => {
              setActivePage("entrada");
              setSidebarOpen(false);
            }}
            className={`text-left px-3 py-2 rounded w-full ${
              activePage === "entrada" ? "bg-green-700" : "hover:bg-green-700"
            }`}
          >
            Entradas
          </button>

          <button
            onClick={() => {
              setActivePage("gestion");
              setSidebarOpen(false);
            }}
            className={`text-left px-3 py-2 rounded w-full ${
              activePage === "gestion" ? "bg-green-700" : "hover:bg-green-700"
            }`}
          >
            Gestión
          </button>

          {/* Mostrar Historial solo si es admin */}
          {usuario?.es_admin && (
            <button
              onClick={() => {
                setActivePage("historial");
                setSidebarOpen(false);
              }}
              className={`text-left px-3 py-2 rounded w-full ${
                activePage === "historial" ? "bg-green-700" : "hover:bg-green-700"
              }`}
            >
              Historial
            </button>
          )}

          {/* Mostrar Deudas solo si es admin */}
          {usuario?.es_admin && (
            <button
              onClick={() => {
                setActivePage("deudas");
                setSidebarOpen(false);
              }}
              className={`text-left px-3 py-2 rounded w-full ${
                activePage === "deudas" ? "bg-green-700" : "hover:bg-green-700"
              }`}
            >
              Deudas
            </button>
          )}

          {/* Proveedores siempre visible */}
          <button
            onClick={() => {
              setActivePage("proveedores");
              setSidebarOpen(false);
            }}
            className={`text-left px-3 py-2 rounded w-full ${
              activePage === "proveedores" ? "bg-green-700" : "hover:bg-green-700"
            }`}
          >
            Proveedores
          </button>

          <button
            onClick={() => {
              setActivePage("categorias");
              setSidebarOpen(false);
            }}
            className={`text-left px-3 py-2 rounded w-full ${
              activePage === "categorias" ? "bg-green-700" : "hover:bg-green-700"
            }`}
          >
            Categorías
          </button>

          {/* Mostrar Registrar Empleado solo si es admin */}
          {usuario?.es_admin && (
            <button
              onClick={() => {
                setActivePage("employeeForm");
                setSidebarOpen(false);
              }}
              className={`text-left px-3 py-2 rounded w-full ${
                activePage === "employeeForm" ? "bg-green-700" : "hover:bg-green-700"
              }`}
            >
              Registrar Empleado
            </button>
          )}

          <button
            onClick={() => {
              setActivePage("ajustes");
              setSidebarOpen(false);
            }}
            className={`text-left px-3 py-2 rounded w-full ${
              activePage === "ajustes" ? "bg-green-700" : "hover:bg-green-700"
            }`}
          >
            Ajustes, soporte y Preguntas Frecuentes
          </button>
        </nav>

        <button
          className="md:hidden mt-auto text-sm text-gray-300 hover:text-white"
          onClick={() => setSidebarOpen(false)}
          aria-label="Cerrar menú"
        >
          Cerrar ×
        </button>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main
        className="flex-1 p-6 md:p-10 overflow-auto"
        style={{ marginTop: "3rem" }}
      >
        {renderContent()}
      </main>
    </div>
  );
};

export default Home;
