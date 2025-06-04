import { useEffect, useState } from "react";

const Proveedores = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [proveedores, setProveedores] = useState([]);
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState(null);
  const [nuevoProveedor, setNuevoProveedor] = useState({
    nombre_proveedor: "",
    telefono_proveedor: "",
    email_proveedor: "",
    direccion_proveedor: "",
  });

  const fetchProveedores = () => {
    fetch("http://localhost:3001/api/proveedores")
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener los proveedores");
        return res.json();
      })
      .then((data) => setProveedores(data))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    fetchProveedores();
  }, []);

  const handleAgregar = () => {
    const nombre = nuevoProveedor.nombre_proveedor.trim();

    if (nombre.length < 3) {
      setError("El nombre debe tener al menos 3 caracteres.");
      return;
    }

    // Si pasa la validación, limpiar error y continuar
    setError(null);

    fetch("http://localhost:3001/api/proveedores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoProveedor),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al agregar proveedor");
        return res.text();
      })
      .then(() => {
        fetchProveedores();
        setNuevoProveedor({
          nombre_proveedor: "",
          telefono_proveedor: "",
          email_proveedor: "",
          direccion_proveedor: "",
        });
        setShowAddModal(false);
      })
      .catch((err) => setError(err.message));
  };

  const handleActualizar = () => {
    fetch(
      `http://localhost:3001/api/proveedores/${selectedProveedor.id_proveedor}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedProveedor),
      }
    )
      .then((res) => {
        if (!res.ok) throw new Error("Error al actualizar proveedor");
        return res.text(); // <- Aquí se corrige
      })
      .then(() => {
        fetchProveedores();
        setShowEditModal(false);
        setSelectedProveedor(null);
      })
      .catch((err) => setError(err.message));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Gestión de Proveedores</h2>
      <button
        className="mb-4 px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800"
        onClick={() => setShowAddModal(true)}
      >
        Agregar Proveedor
      </button>

      {error && <p className="text-red-500 mb-4">Error: {error}</p>}

      <table className="w-full border mt-4 text-left">
        <thead className="bg-green-100">
          <tr>
            <th className="p-2">Nombre</th>
            <th className="p-2">Teléfono</th>
            <th className="p-2">Email</th>
            <th className="p-2">Dirección</th>
            <th className="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(proveedores) && proveedores.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-4 text-gray-500">
                No hay proveedores
              </td>
            </tr>
          ) : (
            proveedores.map((proveedor) =>
              proveedor?.id_proveedor ? (
                <tr
                  key={proveedor.id_proveedor}
                  className={`border-t ${
                    proveedor.estado === 0 ? "bg-red-200" : ""
                  }`}
                >
                  <td className="p-2">{proveedor.nombre_proveedor}</td>
                  <td className="p-2">{proveedor.telefono_proveedor}</td>
                  <td className="p-2">{proveedor.email_proveedor}</td>
                  <td className="p-2">{proveedor.direccion_proveedor}</td>
                  <td className="p-2">
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                      onClick={() => {
                        setSelectedProveedor(proveedor);
                        setShowEditModal(true);
                      }}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ) : null
            )
          )}
        </tbody>
      </table>

      {/* Modal para agregar proveedor */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h3 className="text-xl font-semibold mb-4">Agregar Proveedor</h3>
            <input
              type="text"
              placeholder="Nombre"
              required
              minLength={3}
              className="w-full border mb-2 px-3 py-2 rounded"
              value={nuevoProveedor.nombre_proveedor}
              onChange={(e) =>
                setNuevoProveedor({
                  ...nuevoProveedor,
                  nombre_proveedor: e.target.value,
                })
              }
            />
            <input
              type="number"
              placeholder="Teléfono"
              required
              maxLength={9}
              className="w-full border mb-2 px-3 py-2 rounded"
              value={nuevoProveedor.telefono_proveedor}
              onChange={(e) =>
                setNuevoProveedor({
                  ...nuevoProveedor,
                  telefono_proveedor: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Email"
              className="w-full border mb-4 px-3 py-2 rounded"
              value={nuevoProveedor.email_proveedor}
              onChange={(e) =>
                setNuevoProveedor({
                  ...nuevoProveedor,
                  email_proveedor: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Dirección"
              className="w-full border mb-4 px-3 py-2 rounded"
              value={nuevoProveedor.direccion_proveedor}
              onChange={(e) =>
                setNuevoProveedor({
                  ...nuevoProveedor,
                  direccion_proveedor: e.target.value,
                })
              }
            />

            {/* Mensaje de error */}
            {error && <p className="text-red-600 text-sm mt-2 mb-4">{error}</p>}
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddModal(false)}>Cancelar</button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded"
                onClick={handleAgregar}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar proveedor */}
      {/* Modal para editar proveedor */}
      {showEditModal && selectedProveedor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h3 className="text-xl font-semibold mb-4">Editar Proveedor</h3>

            {/* Campos existentes */}
            <input
              type="text"
              placeholder="Nombre"
              className="w-full border mb-2 px-3 py-2 rounded"
              value={selectedProveedor.nombre_proveedor}
              onChange={(e) =>
                setSelectedProveedor({
                  ...selectedProveedor,
                  nombre_proveedor: e.target.value,
                })
              }
            />
            <input
              type="number"
              placeholder="Teléfono"
              className="w-full border mb-2 px-3 py-2 rounded"
              value={selectedProveedor.telefono_proveedor}
              onChange={(e) =>
                setSelectedProveedor({
                  ...selectedProveedor,
                  telefono_proveedor: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Email"
              className="w-full border mb-4 px-3 py-2 rounded"
              value={selectedProveedor.email_proveedor}
              onChange={(e) =>
                setSelectedProveedor({
                  ...selectedProveedor,
                  email_proveedor: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Dirección"
              className="w-full border mb-4 px-3 py-2 rounded"
              value={selectedProveedor.direccion_proveedor}
              onChange={(e) =>
                setSelectedProveedor({
                  ...selectedProveedor,
                  direccion_proveedor: e.target.value,
                })
              }
            />

            {/* NUEVO: Radiobuttons para estado */}
            <div className="mb-4">
              <span className="mr-4 font-semibold">Estado:</span>
              <label>
                <input
                  type="radio"
                  name="estado"
                  value="1"
                  checked={selectedProveedor.estado === 1}
                  onChange={() =>
                    setSelectedProveedor({ ...selectedProveedor, estado: 1 })
                  }
                />
                Activo
              </label>
              <label>
                <input
                  type="radio"
                  name="estado"
                  value="0"
                  checked={selectedProveedor.estado === 0}
                  onChange={() =>
                    setSelectedProveedor({ ...selectedProveedor, estado: 0 })
                  }
                />
                Inactivo
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowEditModal(false)}>Cancelar</button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={handleActualizar}
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Proveedores;
