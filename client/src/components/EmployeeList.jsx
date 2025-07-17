import { useEffect, useState } from "react";

const EmployeeList = () => {
  const [empleados, setEmpleados] = useState([]);
  const [editEmpleadoId, setEditEmpleadoId] = useState(null);
  const [formData, setFormData] = useState({});

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchEmpleados();
  }, []);

  const fetchEmpleados = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/employees", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setEmpleados(data);
    } catch (error) {
      console.error("Error al obtener empleados:", error);
    }
  };

  const handleEditClick = (empleado) => {
    setEditEmpleadoId(empleado.id_usuario);
    setFormData({ ...empleado });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/employees/${editEmpleadoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        throw new Error("Error al actualizar empleado");
      }
      setEditEmpleadoId(null);
      fetchEmpleados();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Lista de Empleados</h2>
      <table className="w-full border-collapse border">
        <thead>
          <tr>
            <th className="border px-2 py-1">Nombre</th>
            <th className="border px-2 py-1">Correo</th>
            <th className="border px-2 py-1">DNI</th>
            <th className="border px-2 py-1">Admin</th>
            <th className="border px-2 py-1">Puede eliminar</th>
            <th className="border px-2 py-1">Estado</th>
            <th className="border px-2 py-1">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {empleados.map((emp) =>
            editEmpleadoId === emp.id_usuario ? (
              <tr key={emp.id_usuario}>
                <td className="border px-2 py-1">
                  <input
                    type="text"
                    name="nombre_completo"
                    value={formData.nombre_completo}
                    onChange={handleInputChange}
                    className="border rounded px-2 py-1 w-full max-w-[160px]"
                  />
                </td>
                <td className="border px-2 py-1">
                  <input
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleInputChange}
                    className="border rounded px-2 py-1 w-full max-w-[160px]"
                  />
                </td>
                <td className="border px-2 py-1">
                  <input
                    type="text"
                    name="dni"
                    value={formData.dni || ""}
                    onChange={handleInputChange}
                    className="border rounded px-2 py-1 w-full max-w-[120px]"
                  />
                </td>
                <td className="border px-2 py-1 text-center">
                  <input
                    type="checkbox"
                    name="es_admin"
                    checked={formData.es_admin}
                    onChange={handleInputChange}
                  />
                </td>
                <td className="border px-2 py-1 text-center">
                  <input
                    type="checkbox"
                    name="puede_eliminar"
                    checked={formData.puede_eliminar}
                    onChange={handleInputChange}
                  />
                </td>
                <td className="border px-2 py-1 text-center">
                  <input
                    type="checkbox"
                    name="estado"
                    checked={formData.estado === 1 || formData.estado === true}
                    onChange={handleInputChange}
                  />
                </td>
                <td className="border px-2 py-1">
                  <button
                    onClick={handleSave}
                    className="bg-green-600 text-white px-2 py-1 rounded mr-1"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditEmpleadoId(null)}
                    className="bg-gray-500 text-white px-2 py-1 rounded"
                  >
                    Cancelar
                  </button>
                </td>
              </tr>
            ) : (
              <tr key={emp.id_usuario}>
                <td className="border px-2 py-1">{emp.nombre_completo}</td>
                <td className="border px-2 py-1">{emp.correo}</td>
                <td className="border px-2 py-1">{emp.dni}</td>
                <td className="border px-2 py-1 text-center">
                  {emp.es_admin ? "✔️" : ""}
                </td>
                <td className="border px-2 py-1 text-center">
                  {emp.puede_eliminar ? "✔️" : ""}
                </td>
                <td className="border px-2 py-1 text-center">
                  {emp.estado ? "Activo" : "Inactivo"}
                </td>
                <td className="border px-2 py-1">
                  <button
                    onClick={() => handleEditClick(emp)}
                    className="bg-blue-600 text-white px-2 py-1 rounded"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeList;
