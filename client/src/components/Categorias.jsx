import { useEffect, useState } from "react";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const Categorias = () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const idUsuario = usuario?.id_usuario;
  const token = localStorage.getItem("token");

  const [categorias, setCategorias] = useState([]);
  const [nuevo, setNuevo] = useState({
    nombre_categoria: "",
    descripcion_categoria: "",
  });
  const [editar, setEditar] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategorias = () => {
    fetch(`${API_URL}/api/categorias`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar categorías");
        return res.json();
      })
      .then((data) => {
        console.log("📦 Categorías recibidas del backend:", data);
        setCategorias(data);
      })
      .catch((err) => {
        console.error("❌ Error al obtener categorías:", err);
        setError(err.message);
      });
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleAgregar = () => {
    if (nuevo.nombre_categoria.trim().length < 3) {
      setError("Nombre debe tener al menos 3 caracteres");
      return;
    }

    setError(null);

    fetch(`${API_URL}/api/categorias`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...nuevo, id_usuario: idUsuario }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al agregar categoría");
        return res.text();
      })
      .then(() => {
        fetchCategorias();
        setShowAddModal(false);
        setNuevo({ nombre_categoria: "", descripcion_categoria: "" });
      })
      .catch((err) => setError(err.message));
  };

  const handleActualizar = () => {
    fetch(`${API_URL}/api/categorias/${editar.id_categoria}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(editar),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al actualizar categoría");
        return res.text();
      })
      .then(() => {
        fetchCategorias();
        setShowEditModal(false);
        setEditar(null);
      })
      .catch((err) => setError(err.message));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Gestión de Categorías</h2>

      <button
        onClick={() => setShowAddModal(true)}
        className="mb-4 px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800"
      >
        Agregar Categoría
      </button>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <table className="w-full border mt-4 text-left">
        <thead className="bg-green-100">
          <tr>
            <th className="p-2">Nombre</th>
            <th className="p-2">Descripción</th>
            <th className="p-2">Estado</th>
            <th className="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categorias.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center py-4 text-gray-500">
                No hay categorías
              </td>
            </tr>
          ) : (
            categorias.map((cat) => (
              <tr
                key={cat.id_categoria}
                className={parseInt(cat.estado) === 0 ? "bg-red-200" : ""}
              >
                <td className="p-2">{cat.nombre_categoria}</td>
                <td className="p-2">{cat.descripcion_categoria}</td>
                <td className="p-2">
                  {parseInt(cat.estado) === 1 ? "Activo" : "Inactivo"}
                </td>
                <td className="p-2">
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    onClick={() => {
                      setEditar({ ...cat, estado: Number(cat.estado) });
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

      {/* Modal para agregar categoría */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h3 className="text-xl font-semibold mb-4">Agregar Categoría</h3>
            <input
              type="text"
              placeholder="Nombre"
              className="w-full border mb-2 px-3 py-2 rounded"
              value={nuevo.nombre_categoria}
              onChange={(e) =>
                setNuevo({ ...nuevo, nombre_categoria: e.target.value })
              }
            />
            <textarea
              placeholder="Descripción"
              className="w-full border mb-4 px-3 py-2 rounded"
              value={nuevo.descripcion_categoria}
              onChange={(e) =>
                setNuevo({ ...nuevo, descripcion_categoria: e.target.value })
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

      {/* Modal para editar categoría */}
      {showEditModal && editar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h3 className="text-xl font-semibold mb-4">Editar Categoría</h3>
            <input
              type="text"
              value={editar.nombre_categoria}
              className="w-full border mb-2 px-3 py-2 rounded"
              onChange={(e) =>
                setEditar({ ...editar, nombre_categoria: e.target.value })
              }
            />
            <textarea
              value={editar.descripcion_categoria}
              className="w-full border mb-4 px-3 py-2 rounded"
              onChange={(e) =>
                setEditar({ ...editar, descripcion_categoria: e.target.value })
              }
            />

            <div className="mb-4">
              <span className="mr-4 font-semibold">Estado:</span>
              <label className="mr-4">
                <input
                  type="radio"
                  name="estado"
                  value="1"
                  checked={parseInt(editar.estado) === 1}
                  onChange={() => setEditar({ ...editar, estado: 1 })}
                />
                Activo
              </label>
              <label>
                <input
                  type="radio"
                  name="estado"
                  value="0"
                  checked={parseInt(editar.estado) === 0}
                  onChange={() => setEditar({ ...editar, estado: 0 })}
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

export default Categorias;
