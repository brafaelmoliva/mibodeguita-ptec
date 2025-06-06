import { useEffect, useState } from "react";

const Proveedores = () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const idUsuario = usuario?.id_usuario;
  const token = localStorage.getItem("token");

  const [proveedores, setProveedores] = useState([]);
  const [nuevoProveedor, setNuevoProveedor] = useState({
    nombre_proveedor: "",
    telefono_proveedor: "",
    email_proveedor: "",
    direccion_proveedor: "",
  });
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState(null);

  const fetchProveedores = () => {
    fetch("http://localhost:3001/api/proveedores")
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener proveedores");
        return res.json();
      })
      .then((data) => {
        console.log("📦 Proveedores recibidos del backend:", data);
        setProveedores(data);
      })
      .catch((err) => {
        console.error("❌ Error al obtener proveedores:", err);
        setError(err.message);
      });
  };

  useEffect(() => {
    fetchProveedores();
  }, []);

  const handleAgregar = () => {
    if (nuevoProveedor.nombre_proveedor.trim().length < 3) {
      setError("El nombre debe tener al menos 3 caracteres");
      return;
    }
    setError(null);

    fetch("http://localhost:3001/api/proveedores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...nuevoProveedor, id_usuario: idUsuario }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al agregar proveedor");
        return res.text();
      })
      .then(() => {
        fetchProveedores();
        setShowAddModal(false);
        setNuevoProveedor({
          nombre_proveedor: "",
          telefono_proveedor: "",
          email_proveedor: "",
          direccion_proveedor: "",
        });
      })
      .catch((err) => setError(err.message));
  };

  const handleActualizar = () => {
    fetch(`http://localhost:3001/api/proveedores/${selectedProveedor.id_proveedor}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(selectedProveedor),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al actualizar proveedor");
        return res.text();
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

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <table className="w-full border mt-4 text-left">
        <thead className="bg-green-100">
          <tr>
            <th className="p-2">Nombre</th>
            <th className="p-2">Teléfono</th>
            <th className="p-2">Email</th>
            <th className="p-2">Dirección</th>
            <th className="p-2">Estado</th>
            <th className="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {proveedores.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center py-4 text-gray-500">
                No hay proveedores
              </td>
            </tr>
          ) : (
            proveedores.map((prov) => (
              <tr
                key={prov.id_proveedor}
                className={parseInt(prov.estado) === 0 ? "bg-red-200" : ""}
              >
                <td className="p-2">{prov.nombre_proveedor}</td>
                <td className="p-2">{prov.telefono_proveedor}</td>
                <td className="p-2">{prov.email_proveedor}</td>
                <td className="p-2">{prov.direccion_proveedor}</td>
                <td className="p-2">
                  {parseInt(prov.estado) === 1 ? "Activo" : "Inactivo"}
                </td>
                <td className="p-2">
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    onClick={() => {
                      setSelectedProveedor({ ...prov, estado: Number(prov.estado) });
                      setShowEditModal(true);
                    }}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))
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
              className="w-full border mb-2 px-3 py-2 rounded"
              value={nuevoProveedor.nombre_proveedor}
              onChange={(e) =>
                setNuevoProveedor({ ...nuevoProveedor, nombre_proveedor: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Teléfono"
              className="w-full border mb-2 px-3 py-2 rounded"
              value={nuevoProveedor.telefono_proveedor}
              onChange={(e) =>
                setNuevoProveedor({ ...nuevoProveedor, telefono_proveedor: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Email"
              className="w-full border mb-2 px-3 py-2 rounded"
              value={nuevoProveedor.email_proveedor}
              onChange={(e) =>
                setNuevoProveedor({ ...nuevoProveedor, email_proveedor: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Dirección"
              className="w-full border mb-4 px-3 py-2 rounded"
              value={nuevoProveedor.direccion_proveedor}
              onChange={(e) =>
                setNuevoProveedor({ ...nuevoProveedor, direccion_proveedor: e.target.value })
              }
            />

            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
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
      {showEditModal && selectedProveedor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h3 className="text-xl font-semibold mb-4">Editar Proveedor</h3>
            <input
              type="text"
              value={selectedProveedor.nombre_proveedor}
              className="w-full border mb-2 px-3 py-2 rounded"
              onChange={(e) =>
                setSelectedProveedor({ ...selectedProveedor, nombre_proveedor: e.target.value })
              }
            />
            <input
              type="text"
              value={selectedProveedor.telefono_proveedor}
              className="w-full border mb-2 px-3 py-2 rounded"
              onChange={(e) =>
                setSelectedProveedor({ ...selectedProveedor, telefono_proveedor: e.target.value })
              }
            />
            <input
              type="text"
              value={selectedProveedor.email_proveedor}
              className="w-full border mb-2 px-3 py-2 rounded"
              onChange={(e) =>
                setSelectedProveedor({ ...selectedProveedor, email_proveedor: e.target.value })
              }
            />
            <input
              type="text"
              value={selectedProveedor.direccion_proveedor}
              className="w-full border mb-4 px-3 py-2 rounded"
              onChange={(e) =>
                setSelectedProveedor({ ...selectedProveedor, direccion_proveedor: e.target.value })
              }
            />

            {/* Estado con radio buttons */}
            <div className="mb-4">
              <span className="mr-4 font-semibold">Estado:</span>
              <label className="mr-4">
                <input
                  type="radio"
                  name="estado"
                  value="1"
                  checked={parseInt(selectedProveedor.estado) === 1}
                  onChange={() => setSelectedProveedor({ ...selectedProveedor, estado: 1 })}
                />
                Activo
              </label>
              <label>
                <input
                  type="radio"
                  name="estado"
                  value="0"
                  checked={parseInt(selectedProveedor.estado) === 0}
                  onChange={() => setSelectedProveedor({ ...selectedProveedor, estado: 0 })}
                />
                Inactivo
              </label>
            </div>

            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
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
