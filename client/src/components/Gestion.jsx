import React, { useEffect, useState } from "react";

const token = localStorage.getItem("token");
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const Gestion = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [error, setError] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 8; // Puedes cambiar el número si quieres más/menos por página
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);

  const [busqueda, setBusqueda] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [productoEdit, setProductoEdit] = useState(null);

  const [nuevoProducto, setNuevoProducto] = useState({
    id_proveedor: "",
    id_categoria: "",
    nombre_producto: "",
    descripcion_producto: "",
    stock: "",
    stock_min: "",
    unidad_medida: "unidad",
    costo_compra: "",
    precio_venta: "",
    precio: "",
    estado: 1,
  });

  useEffect(() => {
    fetch(`${API_URL}/api/categorias`)

      .then((res) => res.json())
      .then(setCategorias)
      .catch(() => setError("Error al cargar categorías"));

    fetch(`${API_URL}/api/proveedores`)

      .then((res) => res.json())
      .then(setProveedores)
      .catch(() => setError("Error al cargar proveedores"));

    fetchProductos();
  }, []);

  const fetchProductos = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    setError("No tienes token, inicia sesión");
    return;
  }

  fetch(`${API_URL}/api/productos`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Error al cargar productos");
      return res.json();
    })
    .then((data) => {
      // Convertir estado Buffer a número
      const productosNormalizados = data.map((p) => ({
        ...p,
        estado:
          typeof p.estado === "object" && p.estado.data
            ? p.estado.data[0]
            : p.estado,
      }));
      setProductos(productosNormalizados);
    })
    .catch(() => setError("Error al cargar productos"));
};

  const categoriasFiltro = [
    "Bebidas",
    "Abarrotes",
    "Lacteos",
    "Limpieza",
    "Snacks",
    "Panadería",
  ];

  const toggleCategoria = (categoria) => {
    setCategoriasSeleccionadas((prev) =>
      prev.includes(categoria)
        ? prev.filter((c) => c !== categoria)
        : [...prev, categoria]
    );
  };

const handleAgregar = () => {
  setError(null);

  const token = localStorage.getItem("token");
  if (!token) {
    setError("No tienes token, inicia sesión");
    return;
  }

  // Convertir los campos que deben ser números, si es necesario
  const productoParaEnviar = {
    ...nuevoProducto,
    id_proveedor: Number(nuevoProducto.id_proveedor),
    id_categoria: Number(nuevoProducto.id_categoria),
    stock: Number(nuevoProducto.stock),
    stock_min: Number(nuevoProducto.stock_min),
    costo_compra: Number(nuevoProducto.costo_compra),
    precio_venta: Number(nuevoProducto.precio_venta),
    precio: Number(nuevoProducto.precio),
  };

  fetch(`${API_URL}/api/productos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productoParaEnviar),
  })
    .then((res) => {
      if (!res.ok) throw new Error(`Error al agregar producto: ${res.status}`);
      return res.json();
    })
    .then(() => {
      fetchProductos();
      setShowAddModal(false);
      setNuevoProducto({
        id_proveedor: "",
        id_categoria: "",
        nombre_producto: "",
        descripcion_producto: "",
        stock: "",
        stock_min: "",
        unidad_medida: "unidad",
        costo_compra: "",
        precio_venta: "",
        precio: "",
        estado: 1,
      });
    })
    .catch((err) => setError(err.message));
};

  const productosFiltrados = productos.filter((prod) => {
    const texto = busqueda.toLowerCase();
    const coincideTexto =
      prod.nombre_producto?.toLowerCase().includes(texto) ||
      prod.descripcion_producto?.toLowerCase().includes(texto) ||
      prod.nombre_categoria?.toLowerCase().includes(texto) ||
      prod.nombre_proveedor?.toLowerCase().includes(texto) ||
      prod.unidad_medida?.toLowerCase().includes(texto) ||
      prod.stock?.toString().includes(texto) ||
      prod.stock_min?.toString().includes(texto) ||
      prod.precio?.toString().includes(texto) ||
      prod.costo_compra?.toString().includes(texto) ||
      prod.precio_venta?.toString().includes(texto);

    const coincideCategoria =
      categoriasSeleccionadas.length === 0 ||
      categoriasSeleccionadas.includes(prod.nombre_categoria);

    return coincideTexto && coincideCategoria;
  });

  const indexUltimoProducto = paginaActual * productosPorPagina;
  const indexPrimerProducto = indexUltimoProducto - productosPorPagina;
  const productosPaginados = productosFiltrados.slice(
    indexPrimerProducto,
    indexUltimoProducto
  );

  const totalPaginas = Math.ceil(
    productosFiltrados.length / productosPorPagina
  );

const handleActualizar = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    setError("No tienes token, inicia sesión");
    return;
  }

  fetch(`${API_URL}/api/productos/${productoEdit.id_producto}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productoEdit),  // <-- aquí el cambio
  })
    .then((res) => {
      if (!res.ok) throw new Error("Error al actualizar producto");
      return res.text();
    })
    .then(() => {
      fetchProductos();
      setShowEditModal(false);
      setProductoEdit(null);
    })
    .catch((err) => setError(err.message));
};


  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Gestión de Productos</h2>
      <button
        className="mb-4 px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800"
        onClick={() => setShowAddModal(true)}
      >
        Agregar Producto
      </button>

      <input
        type="text"
        placeholder="Buscar producto por nombre..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="mb-4 px-4 py-2 border rounded w-full"
      />
      <div className="mb-4">
        <p className="font-semibold mb-2">Filtrar por categoría:</p>
        <div className="flex flex-wrap gap-4">
          {categoriasFiltro.map((cat) => (
            <label key={cat} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={categoriasSeleccionadas.includes(cat)}
                onChange={() => toggleCategoria(cat)}
              />
              {cat}
            </label>
          ))}
        </div>
      </div>

      {error && <p className="text-red-500 mb-4">Error: {error}</p>}

      <table className="w-full border mt-4 text-left">
  <thead className="bg-green-100">
    <tr>
      <th className="p-2">Nombre</th>
      <th className="p-2">Descripción</th>
      <th className="p-2">Stock</th>
      <th className="p-2">Unidad de Medida</th>
      <th className="p-2">Costo Compra</th>
      <th className="p-2">Precio Venta</th>
      <th className="p-2">Categoría</th>
      <th className="p-2">Proveedor</th>
      <th className="p-2">Acción</th>
    </tr>
  </thead>
  <tbody>
    {productos.length === 0 ? (
      <tr>
        <td colSpan="10" className="text-center py-4 text-gray-500">
          No hay productos
        </td>
      </tr>
    ) : (
      productosPaginados.map((prod) => (
        <tr
          key={prod.id_producto}
          className={prod.estado === 0 ? "bg-red-500 text-white font-semibold" : ""}
        >
          <td className="p-2">{prod.nombre_producto}</td>
          <td className="p-2">{prod.descripcion_producto}</td>
          <td className="p-2">{prod.stock}</td>
          <td className="p-2">{prod.unidad_medida}</td>
          <td className="p-2">{prod.costo_compra}</td>
          <td className="p-2">{prod.precio_venta}</td>
          <td className="p-2">{prod.nombre_categoria}</td>
          <td className="p-2">{prod.nombre_proveedor}</td>
          <td className="p-2">
            <button
              className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
              onClick={() => {
                setProductoEdit(prod);
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



      <div className="flex justify-center items-center gap-2 mt-4">
        <button
          onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
          disabled={paginaActual === 1}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Anterior
        </button>

        {[...Array(totalPaginas)].map((_, i) => (
          <button
            key={i}
            onClick={() => setPaginaActual(i + 1)}
            className={`px-3 py-1 rounded ${
              paginaActual === i + 1
                ? "bg-green-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={() =>
            setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))
          }
          disabled={paginaActual === totalPaginas}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>

      {/* Modal Agregar */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h3 className="text-xl font-semibold mb-4">Agregar Producto</h3>

            <input
              type="text"
              placeholder="Nombre del Producto"
              value={nuevoProducto.nombre_producto}
              onChange={(e) =>
                setNuevoProducto({
                  ...nuevoProducto,
                  nombre_producto: e.target.value,
                })
              }
              className="w-full border mb-2 px-3 py-2 rounded"
            />

            <input
              type="text"
              placeholder="Descripción del Producto"
              value={nuevoProducto.descripcion_producto}
              onChange={(e) =>
                setNuevoProducto({
                  ...nuevoProducto,
                  descripcion_producto: e.target.value,
                })
              }
              className="w-full border mb-2 px-3 py-2 rounded"
            />

            <select
              className="w-full border mb-2 px-3 py-2 rounded"
              value={nuevoProducto.id_categoria}
              onChange={(e) =>
                setNuevoProducto({
                  ...nuevoProducto,
                  id_categoria: e.target.value,
                })
              }
            >
              <option value="">Seleccionar categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id_categoria} value={cat.id_categoria}>
                  {cat.nombre_categoria}
                </option>
              ))}
            </select>

            <select
              className="w-full border mb-2 px-3 py-2 rounded"
              value={nuevoProducto.id_proveedor}
              onChange={(e) =>
                setNuevoProducto({
                  ...nuevoProducto,
                  id_proveedor: e.target.value,
                })
              }
            >
              <option value="">Seleccionar proveedor</option>
              {proveedores.map((prov) => (
                <option key={prov.id_proveedor} value={prov.id_proveedor}>
                  {prov.nombre_razon_social}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Stock mínimo"
              value={nuevoProducto.stock_min}
              onChange={(e) =>
                setNuevoProducto({
                  ...nuevoProducto,
                  stock_min: e.target.value,
                })
              }
              className="w-full border mb-2 px-3 py-2 rounded"
            />

            <div className="mb-2">
              <span className="mr-4 font-semibold">Unidad de Medida:</span>
              {["unidad", "kg", "litro"].map((unidad) => (
                <label key={unidad} className="mr-4">
                  <input
                    type="radio"
                    name="unidad_medida_add"
                    value={unidad}
                    checked={nuevoProducto.unidad_medida === unidad}
                    onChange={() =>
                      setNuevoProducto({
                        ...nuevoProducto,
                        unidad_medida: unidad,
                      })
                    }
                  />
                  {unidad}
                </label>
              ))}
            </div>

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

      {/* Modal Editar */}
      {showEditModal && productoEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h3 className="text-xl font-semibold mb-4">Editar Producto</h3>
            <input
              type="text"
              placeholder="Nombre del Producto"
              value={productoEdit.nombre_producto}
              onChange={(e) =>
                setProductoEdit({
                  ...productoEdit,
                  nombre_producto: e.target.value,
                })
              }
              className="w-full border mb-2 px-3 py-2 rounded"
            />
            <input
              type="text"
              placeholder="Descripción del Producto"
              value={productoEdit.descripcion_producto}
              onChange={(e) =>
                setProductoEdit({
                  ...productoEdit,
                  descripcion_producto: e.target.value,
                })
              }
              className="w-full border mb-2 px-3 py-2 rounded"
            />
            <select
              className="w-full border mb-2 px-3 py-2 rounded"
              value={productoEdit.id_categoria}
              onChange={(e) =>
                setProductoEdit({
                  ...productoEdit,
                  id_categoria: e.target.value,
                })
              }
            >
              <option value="">Seleccionar categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id_categoria} value={cat.id_categoria}>
                  {cat.nombre_categoria}
                </option>
              ))}
            </select>
            <select
              className="w-full border mb-2 px-3 py-2 rounded"
              value={productoEdit.id_proveedor}
              onChange={(e) =>
                setProductoEdit({
                  ...productoEdit,
                  id_proveedor: e.target.value,
                })
              }
            >
              <option value="">Seleccionar proveedor</option>
              {proveedores.map((prov) => (
                <option key={prov.id_proveedor} value={prov.id_proveedor}>
                  {prov.nombre_razon_social}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Stock"
              value={productoEdit.stock}
              onChange={(e) =>
                setProductoEdit({ ...productoEdit, stock: e.target.value })
              }
              className="w-full border mb-2 px-3 py-2 rounded"
            />
            <input
              type="number"
              placeholder="Stock mínimo"
              value={productoEdit.stock_min}
              onChange={(e) =>
                setProductoEdit({ ...productoEdit, stock_min: e.target.value })
              }
              className="w-full border mb-2 px-3 py-2 rounded"
            />

            <div className="mb-2">
              <span className="mr-4 font-semibold">Unidad de Medida:</span>
              {["unidad", "kg", "litro"].map((unidad) => (
                <label key={unidad} className="mr-4">
                  <input
                    type="radio"
                    name="unidad_medida_edit"
                    value={unidad}
                    checked={productoEdit.unidad_medida === unidad}
                    onChange={() =>
                      setProductoEdit({
                        ...productoEdit,
                        unidad_medida: unidad,
                      })
                    }
                  />
                  {unidad}
                </label>
              ))}
            </div>
            <input
              type="number"
              placeholder="Costo Compra"
              value={productoEdit.costo_compra}
              onChange={(e) =>
                setProductoEdit({
                  ...productoEdit,
                  costo_compra: e.target.value,
                })
              }
              className="w-full border mb-2 px-3 py-2 rounded"
            />
            <input
              type="number"
              placeholder="Precio Venta"
              value={productoEdit.precio_venta}
              onChange={(e) =>
                setProductoEdit({
                  ...productoEdit,
                  precio_venta: e.target.value,
                })
              }
              className="w-full border mb-2 px-3 py-2 rounded"
            />

            <div className="mb-4">
              <span className="mr-4 font-semibold">Estado:</span>

              {(() => {
                const estadoNumerico =
                  typeof productoEdit.estado === "object"
                    ? productoEdit.estado.data?.[0] ?? 1
                    : Number(productoEdit.estado);

                return (
                  <>
                    <label className="mr-4">
                      <input
                        type="radio"
                        name="estado"
                        value="1"
                        checked={estadoNumerico === 1}
                        onChange={() =>
                          setProductoEdit({ ...productoEdit, estado: 1 })
                        }
                      />
                      Activo
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="estado"
                        value="0"
                        checked={estadoNumerico === 0}
                        onChange={() =>
                          setProductoEdit({ ...productoEdit, estado: 0 })
                        }
                      />
                      Inactivo
                    </label>
                  </>
                );
              })()}
            </div>

            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setProductoEdit(null);
                }}
              >
                Cancelar
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded"
                onClick={handleActualizar}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gestion;
