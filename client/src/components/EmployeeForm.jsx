import { useState } from "react";
import EmployeeList from "./EmployeeList";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const EmployeeForm = () => {
  const [nombre_completo, setNombreCompleto] = useState("");
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [dni, setDni] = useState("");
  const [esAdmin, setEsAdmin] = useState(false);
  const [puedeEliminar, setPuedeEliminar] = useState(false);
  const [estado, setEstado] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleBuscarDNI = async () => {
    setError(null);
    setSuccess(null);

    if (!/^\d{8}$/.test(dni)) {
      setError("El DNI debe tener exactamente 8 dígitos.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/employees/dni/${dni}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "DNI no encontrado.");
        return;
      }

      const { nombre_completo: nombre } = data;
      setNombreCompleto(nombre);
      setSuccess("DNI consultado correctamente.");
    } catch (err) {
      setError("Error al consultar el DNI.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!correo || !contraseña) {
      setError("Por favor, completa los campos obligatorios.");
      setLoading(false);
      return;
    }

    if (dni && !/^\d{8}$/.test(dni)) {
      setError("El DNI debe tener 8 dígitos.");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError(
        "No tienes permiso para registrar empleados. Inicia sesión como administrador."
      );
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre_completo,
          correo,
          contraseña,
          es_admin: esAdmin,
          puede_eliminar: puedeEliminar,
          estado: estado ? 1 : 0,
          dni,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al registrar empleado");
        setLoading(false);
        return;
      }

      setSuccess("Empleado registrado exitosamente!");
      setNombreCompleto("");
      setCorreo("");
      setContraseña("");
      setDni("");
      setEsAdmin(false);
      setPuedeEliminar(false);
      setEstado(true);
    } catch (err) {
      setError("Error de conexión con el servidor");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow space-y-10">
      {/* Formulario */}
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Registrar Nuevo Empleado
        </h2>

        {error && <p className="text-red-600 mb-4">{error}</p>}
        {success && <p className="text-green-600 mb-4">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* DNI + botón buscar */}
          <div className="flex space-x-2 items-center">
            <input
              type="text"
              placeholder="DNI (8 dígitos)"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              className="flex-1 border px-3 py-2 rounded"
            />
            <button
              type="button"
              onClick={handleBuscarDNI}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
            >
              Buscar
            </button>
          </div>

          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre_completo}
            onChange={(e) => setNombreCompleto(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />

          <input
            type="email"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={esAdmin}
              onChange={(e) => setEsAdmin(e.target.checked)}
              className="form-checkbox"
            />
            <span>Tiene privilegios administrador?</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={puedeEliminar}
              onChange={(e) => setPuedeEliminar(e.target.checked)}
              className="form-checkbox"
            />
            <span>Puede eliminar registros?</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={estado}
              onChange={(e) => setEstado(e.target.checked)}
              className="form-checkbox"
            />
            <span>Usuario habilitado</span>
          </label>

          <button
            type="submit"
            className="w-full bg-green-800 text-white py-2 rounded hover:bg-green-700 transition"
            disabled={loading}
          >
            {loading ? "Registrando..." : "Registrar Empleado"}
          </button>
        </form>
      </div>

      {/* Lista de empleados */}
      <div className="max-w-4xl mx-auto mt-12">
        <EmployeeList />
      </div>
    </div>
  );
};

export default EmployeeForm;
