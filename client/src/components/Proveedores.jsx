import { useEffect, useState } from "react";

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState(null);

  const [nuevoProveedor, setNuevoProveedor] = useState({
    ruc: "",
    nombre_razon_social: "",
    direccion: "",
    direccion_completa: "",
    estado_sunat: "",
    condicion_sunat: "",
    departamento: "",
    provincia: "",
    distrito: "",
    ubigeo_sunat: ""
  });

  const [selectedProveedor, setSelectedProveedor] = useState(null);

  const fetchProveedores = () => {
    fetch("http://localhost:3001/api/proveedores")
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener proveedores");
        return res.json();
      })
      .then((data) => setProveedores(data))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    fetchProveedores();
  }, []);

  const handleAgregar = () => {
    if (nuevoProveedor.ruc.length !== 11) {
      setError("El RUC debe tener 11 dígitos.");
      return;
    }

    setError(null);

    fetch("http://localhost:3001/api/proveedores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`, // si usás JWT
      },
      body: JSON.stringify(nuevoProveedor),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al agregar proveedor");
        return res.text();
      })
      .then(() => {
        fetchProveedores();
        setNuevoProveedor({
          ruc: "",
          nombre_razon_social: "",
          direccion: "",
          direccion_completa: "",
          estado_sunat: "",
          condicion_sunat: "",
          departamento: "",
          provincia: "",
          distrito: "",
          ubigeo_sunat: ""
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(selectedProveedor),
      }
    )
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

  const handleConsultarRUC = (ruc) => {
    if (ruc.length !== 11) {
      setError("El RUC debe tener 11 dígitos.");
      return;
    }

    fetch(`http://localhost:3001/api/proveedores/ruc/${ruc}`)
      .then((res) => {
        if (!res.ok) throw new Error("RUC no encontrado");
        return res.json();
      })
      .then((data) => {
        setNuevoProveedor({ ...nuevoProveedor, ...data });
        setError(null);
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
            <th className="p-2">RUC</th>
            <th className="p-2">Razón Social</th>
            <th className="p-2">Dirección</th>
            <th className="p-2">Departamento</th>
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
                className={`border-t ${
                  prov.estado_negocio === 0 ? "bg-red-200" : ""
                }`}
              >
                <td className="p-2">{prov.ruc}</td>
                <td className="p-2">{prov.nombre_razon_social}</td>
                <td className="p-2">{prov.direccion_completa}</td>
                <td className="p-2">{prov.departamento}</td>
                <td className="p-2">
                  {prov.estado_negocio === 1 ? "Activo" : "Inactivo"}
                </td>
                <td className="p-2">
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    onClick={() => {
                      setSelectedProveedor(prov);
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

      {/* Modal para agregar */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h3 className="text-xl font-semibold mb-4">Agregar Proveedor</h3>
            <input
              type="text"
              placeholder="RUC"
              className="w-full border mb-2 px-3 py-2 rounded"
              value={nuevoProveedor.ruc}
              onChange={(e) =>
                setNuevoProveedor({ ...nuevoProveedor, ruc: e.target.value })
              }
            />
            <button
              onClick={() => handleConsultarRUC(nuevoProveedor.ruc)}
              className="mb-2 bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
            >
              Consultar RUC
            </button>

            <input
              type="text"
              placeholder="Razón Social"
              className="w-full border mb-2 px-3 py-2 rounded"
              value={nuevoProveedor.nombre_razon_social}
              readOnly
            />
            <input
              type="text"
              placeholder="Dirección"
              className="w-full border mb-2 px-3 py-2 rounded"
              value={nuevoProveedor.direccion_completa}
              readOnly
            />
            {/* Puedes añadir más campos si deseas editarlos manualmente */}

            {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
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

      {/* Modal para editar */}
      {showEditModal && selectedProveedor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h3 className="text-xl font-semibold mb-4">Editar Proveedor</h3>
            <input
              type="text"
              placeholder="Razón Social"
              className="w-full border mb-2 px-3 py-2 rounded"
              value={selectedProveedor.nombre_razon_social}
              onChange={(e) =>
                setSelectedProveedor({
                  ...selectedProveedor,
                  nombre_razon_social: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Dirección"
              className="w-full border mb-2 px-3 py-2 rounded"
              value={selectedProveedor.direccion_completa}
              onChange={(e) =>
                setSelectedProveedor({
                  ...selectedProveedor,
                  direccion_completa: e.target.value,
                })
              }
            />

            <div className="mb-4">
              <span className="mr-4 font-semibold">Estado:</span>
              <label className="mr-4">
                <input
                  type="radio"
                  name="estado"
                  value="1"
                  checked={selectedProveedor.estado_negocio === 1}
                  onChange={() =>
                    setSelectedProveedor({
                      ...selectedProveedor,
                      estado_negocio: 1,
                    })
                  }
                />
                Activo
              </label>
              <label>
                <input
                  type="radio"
                  name="estado"
                  value="0"
                  checked={selectedProveedor.estado_negocio === 0}
                  onChange={() =>
                    setSelectedProveedor({
                      ...selectedProveedor,
                      estado_negocio: 0,
                    })
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
