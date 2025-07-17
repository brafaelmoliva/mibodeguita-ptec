import { useState } from "react";

const EmployeeForm = () => {
  const [dni, setDni] = useState("");
  const [nombre_completo, setNombreCompleto] = useState("");
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [esAdmin, setEsAdmin] = useState(false);
  const [puedeEliminar, setPuedeEliminar] = useState(false);
  const [estado, setEstado] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // Buscar por DNI
  const handleBuscarDni = async () => {
    if (!dni) return;

    try {
      const response = await fetch(
        `http://localhost:3001/api/empleados/dni/${dni}`
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "No se encontró la persona.");
        return;
      }

      setNombreCompleto(data.nombre_completo);
      setError(null);
    } catch (err) {
      setError("Error al buscar el DNI.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!nombre_completo || !correo || !contraseña) {
      setError("Por favor, completa todos los campos obligatorios.");
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
      const response = await fetch("http://localhost:3001/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dni,
          nombre_completo,
          correo,
          contraseña,
          es_admin: esAdmin,
          puede_eliminar: puedeEliminar,
          estado: estado ? 1 : 0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al registrar empleado");
        setLoading(false);
        return;
      }

      setSuccess("Empleado registrado exitosamente!");
      setDni("");
      setNombreCompleto("");
      setCorreo("");
      setContraseña("");
      setEsAdmin(false);
      setPuedeEliminar(false);
      setEstado(true);
    } catch (err) {
      setError("Error de conexión con el servidor");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Registrar Nuevo Empleado</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="DNI"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <button
            type="button"
            onClick={handleBuscarDni}
            className="bg-blue-600 text-white px-4 rounded hover:bg-blue-500 transition"
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
          required
          readOnly={!!nombre_completo}
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
  );
};

export default EmployeeForm;
