import { useEffect, useState } from "react";

const Gestion = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [selectedProductos, setSelectedProductos] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState(null);
  const [nuevoProducto, setNuevoProducto] = useState({
    id_proveedor: "",
    id_categoria: "",
    nombre_producto: "",
    descripcion_producto: "",
    stock: "",
    stock_min: "",
    precio: "",
    created_by: "",
    updated_by: "",
    unidad_medida: "",
    costo_compra: "",
    precio_venta: "",
  });

  const fetchCategorias = () => {
    fetch("http://localhost:3001/api/categorias")
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener categorías");
        return res.json();
      })
      .then((data) => setCategorias(data))
      .catch((err) => setError(err.message));
  };
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
    fetchProducto();
    fetchCategorias(); // <--- cargar categorías cuando se monte
  }, []);

  useEffect(() => {
    fetchProducto();
    fetchProveedores(); // <--- cargar categorías cuando se monte
  }, []);
  const fetchProducto = () => {
    fetch("http://localhost:3001/api/productos")
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener los productos");
        return res.json();
      })
      .then((data) => setProductos(data))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    fetchProducto();
  }, []);

  const handleAgregar = () => {
    const nombre = nuevoProducto.nombre_producto?.trim() || "";

    if (nombre.length < 3) {
      setError("El nombre debe tener al menos 3 caracteres.");
      return;
    }

    setError(null);

    // Solo los campos que espera el backend
    const productoParaEnviar = {
      id_proveedor: nuevoProducto.id_proveedor,
      id_categoria: nuevoProducto.id_categoria,
      nombre_producto: nuevoProducto.nombre_producto,
      descripcion_producto: nuevoProducto.descripcion_producto,
      unidad_medida: nuevoProducto.unidad_medida,
      stock: nuevoProducto.stock,
      stock_min: nuevoProducto.stock_min,
      costo_compra: nuevoProducto.costo_compra,
      precio_venta: nuevoProducto.precio_venta,
    };

    fetch("http://localhost:3001/api/productos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productoParaEnviar),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al agregar producto");
        return res.json();
      })
      .then(() => {
        fetchProducto();
        setNuevoProducto({
          id_proveedor: "",
          id_categoria: "",
          nombre_producto: "",
          descripcion_producto: "",
          stock: "",
          stock_min: "",
          unidad_medida: "",
          costo_compra: "",
          precio_venta: "",
        });
        setShowAddModal(false);
      })
      .catch((err) => setError(err.message));
  };

  const handleActualizar = () => {
    fetch(
      `http://localhost:3001/api/productos/${selectedProductos.id_producto}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedProductos),
      }
    )
      .then((res) => {
        if (!res.ok) throw new Error("Error al actualizar producto");
        return res.text(); // <- Aquí se corrige
      })
      .then(() => {
        fetchProducto();
        setShowEditModal(false);
        setSelectedProductos(null);
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

      {error && <p className="text-red-500 mb-4">Error: {error}</p>}

      <table className="w-full border mt-4 text-left">
        <thead className="bg-green-100">
          <tr>
            <th className="p-2">Nombre</th>
            <th className="p-2">Descripción</th>
            <th className="p-2">Stock</th>
            <th className="p-2">Precio</th>
            <th className="p-2">Unidad de Medida</th>
            <th className="p-2">Costo Compra</th>
            <th className="p-2">Precio Venta</th>
            <th className="p-2">Categoria</th>
            <th className="p-2">Proveedor</th>
            <th className="p-2">Acción</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(productos) && productos.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-4 text-gray-500">
                No hay proveedores
              </td>
            </tr>
          ) : (
            productos.map((producto) =>
              producto?.id_producto ? (
                <tr
                  key={producto.id_producto}
                  className={`border-t ${
                    producto.estado === 0 ? "bg-red-200" : ""
                  }`}
                >
                  <td className="p-2">{producto.nombre_producto}</td>
                  <td className="p-2">{producto.descripcion_producto}</td>
                  <td className="p-2">{producto.stock}</td>
                  <td className="p-2">{producto.precio}</td>
                  <td className="p-2">{producto.unidad_medida}</td>
                  <td className="p-2">{producto.costo_compra}</td>
                  <td className="p-2">{producto.precio_venta}</td>
                  <td className="p-2">{producto.nombre_categoria}</td>
                  <td className="p-2">{producto.nombre_proveedor}</td>

                  <td className="p-2">
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                      onClick={() => {
                        setSelectedProductos(producto);
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

      {/* Modal para agregar Producto */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h3 className="text-xl font-semibold mb-4">Agregar Producto</h3>
            <input
              type="text"
              placeholder="Nombre del Producto"
              required
              minLength={3}
              className="w-full border mb-2 px-3 py-2 rounded"
              value={nuevoProducto.nombre_producto}
              onChange={(e) =>
                setNuevoProducto({
                  ...nuevoProducto,
                  nombre_producto: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Descripción del Producto"
              required
              minLength={3}
              className="w-full border mb-2 px-3 py-2 rounded"
              value={nuevoProducto.descripcion_producto}
              onChange={(e) =>
                setNuevoProducto({
                  ...nuevoProducto,
                  descripcion_producto: e.target.value,
                })
              }
            />
            <select
              className="w-full border mb-2 px-3 py-2 rounded"
              value={nuevoProducto.id_categoria} // <-- aquí el id, no el nombre
              onChange={(e) =>
                setNuevoProducto({
                  ...nuevoProducto,
                  id_categoria: e.target.value,
                })
              }
              required
            >
              <option value="">Seleccionar categoría</option>
              {categorias.map((categoria) => (
                <option
                  key={categoria.id_categoria}
                  value={categoria.id_categoria} // <-- id como value
                >
                  {categoria.nombre_categoria} {/* nombre para mostrar */}
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
              required
            >
              <option value="">Seleccionar proveedor</option>
              {proveedores.map((proveedor) => (
                <option
                  key={proveedor.id_proveedor}
                  value={proveedor.id_proveedor}
                >
                  {proveedor.nombre_proveedor}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Stock"
              className="w-full border mb-4 px-3 py-2 rounded"
              value={nuevoProducto.stock}
              onChange={(e) =>
                setNuevoProducto({
                  ...nuevoProducto,
                  stock: e.target.value,
                })
              }
            />
            <input
              type="number"
              placeholder="Stock minimo"
              className="w-full border mb-4 px-3 py-2 rounded"
              value={nuevoProducto.stock_min}
              onChange={(e) =>
                setNuevoProducto({
                  ...nuevoProducto,
                  stock_min: e.target.value,
                })
              }
            />
            <input
              type="number"
              placeholder="Precio"
              className="w-full border mb-4 px-3 py-2 rounded"
              value={nuevoProducto.precio}
              onChange={(e) =>
                setNuevoProducto({
                  ...nuevoProducto,
                  precio: e.target.value,
                })
              }
            />
            <div className="mb-4">
              <span className="mr-4 font-semibold">Unidad de Medida:</span>
              {["unidad", "kg", "litro"].map((unidad) => (
                <label key={unidad} className="mr-4">
                  <input
                    type="radio"
                    name="unidad_medida"
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

            <input
              type="number"
              placeholder="Costo Compra"
              className="w-full border mb-4 px-3 py-2 rounded"
              value={nuevoProducto.costo_compra}
              onChange={(e) =>
                setNuevoProducto({
                  ...nuevoProducto,
                  costo_compra: e.target.value,
                })
              }
            />
            <input
              type="number"
              placeholder="Precio Venta"
              className="w-full border mb-4 px-3 py-2 rounded"
              value={nuevoProducto.precio_venta}
              onChange={(e) =>
                setNuevoProducto({
                  ...nuevoProducto,
                  precio_venta: e.target.value,
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
      {showEditModal && selectedProductos && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h3 className="text-xl font-semibold mb-4">Editar Producto</h3>

            {/* Campos existentes */}
            <input
              type="text"
              placeholder="Nombre del Producto"
              required
              minLength={3}
              className="w-full border mb-2 px-3 py-2 rounded"
              value={selectedProductos.nombre_producto}
              onChange={(e) =>
                setSelectedProductos({
                  ...selectedProductos,
                  nombre_producto: e.target.value,
                })
              }
            />
            <select
              className="w-full border mb-2 px-3 py-2 rounded"
              value={selectedProductos.id_categoria} // <-- aquí el id, no el nombre
              onChange={(e) =>
                setSelectedProductos({
                  ...selectedProductos,
                  id_categoria: e.target.value,
                })
              }
              required
            >
              <option value="">Seleccionar categoría</option>
              {categorias.map((categoria) => (
                <option
                  key={categoria.id_categoria}
                  value={categoria.id_categoria} // <-- id como value
                >
                  {categoria.nombre_categoria} {/* nombre para mostrar */}
                </option>
              ))}
            </select>

            <select
              className="w-full border mb-2 px-3 py-2 rounded"
              value={selectedProductos.id_proveedor}
              onChange={(e) =>
                setSelectedProductos({
                  ...selectedProductos,
                  id_proveedor: e.target.value,
                })
              }
              required
            >
              <option value="">Seleccionar proveedor</option>
              {proveedores.map((proveedor) => (
                <option
                  key={proveedor.id_proveedor}
                  value={proveedor.id_proveedor}
                >
                  {proveedor.nombre_proveedor}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Descripcion"
              className="w-full border mb-4 px-3 py-2 rounded"
              value={selectedProductos.descripcion_producto}
              onChange={(e) =>
                setSelectedProductos({
                  ...selectedProductos,
                  descripcion_producto: e.target.value,
                })
              }
            />
            <input
              type="number"
              placeholder="Stock"
              className="w-full border mb-4 px-3 py-2 rounded"
              value={selectedProductos.stock}
              onChange={(e) =>
                setSelectedProductos({
                  ...selectedProductos,
                  stock: e.target.value,
                })
              }
            />
            <input
              type="number"
              placeholder="Stock"
              className="w-full border mb-4 px-3 py-2 rounded"
              value={selectedProductos.stock}
              onChange={(e) =>
                setSelectedProductos({
                  ...selectedProductos,
                  stock: e.target.value,
                })
              }
            />
            <input
              type="number"
              placeholder="Stock minimo"
              className="w-full border mb-4 px-3 py-2 rounded"
              value={selectedProductos.stock_min}
              onChange={(e) =>
                setSelectedProductos({
                  ...selectedProductos,
                  stock_min: e.target.value,
                })
              }
            />
            <input
              type="number"
              placeholder="Precio"
              className="w-full border mb-4 px-3 py-2 rounded"
              value={selectedProductos.precio}
              onChange={(e) =>
                setSelectedProductos({
                  ...selectedProductos,
                  precio: e.target.value,
                })
              }
            />
            <div className="mb-4">
              <span className="mr-4 font-semibold">Unidad de Medida:</span>
              {["unidad", "kg", "litro"].map((unidad) => (
                <label key={unidad} className="mr-4">
                  <input
                    type="radio"
                    name="unidad_medida"
                    value={unidad}
                    checked={selectedProductos.unidad_medida === unidad}
                    onChange={() =>
                      setSelectedProductos({
                        ...selectedProductos,
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
              className="w-full border mb-4 px-3 py-2 rounded"
              value={selectedProductos.costo_compra}
              onChange={(e) =>
                setSelectedProductos({
                  ...selectedProductos,
                  costo_compra: e.target.value,
                })
              }
            />
            <input
              type="number"
              placeholder="Precio Venta"
              className="w-full border mb-4 px-3 py-2 rounded"
              value={selectedProductos.precio_venta}
              onChange={(e) =>
                setSelectedProductos({
                  ...selectedProductos,
                  precio_venta: e.target.value,
                })
              }
            />

            {/* NUEVO: Radiobuttons para estado */}
            <div className="mb-4">
              <span className="mr-4 font-semibold">Estado:</span>

              <label className="mr-4">
                <input
                  type="radio"
                  name="estado"
                  value={1}
                  checked={selectedProductos.estado === 1}
                  onChange={() =>
                    setSelectedProductos({
                      ...selectedProductos,
                      estado: 1,
                    })
                  }
                />
                Activo
              </label>

              <label>
                <input
                  type="radio"
                  name="estado"
                  value={0}
                  checked={selectedProductos.estado === 0}
                  onChange={() =>
                    setSelectedProductos({
                      ...selectedProductos,
                      estado: 0,
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

export default Gestion;
