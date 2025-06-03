import { useState } from "react";

const Gestion = () => {
  const [products, setProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [confirmText, setConfirmText] = useState("");

  // Placeholder para producto nuevo
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    quantity: "",
  });

  const handleAdd = () => {
    // Aquí luego va la llamada al backend
    const id = Date.now().toString();
    setProducts([...products, { id, ...newProduct }]);
    setShowAddModal(false);
    setNewProduct({ name: "", price: "", quantity: "" });
  };

  const handleEdit = () => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === selectedProduct.id ? selectedProduct : p
      )
    );
    setShowEditModal(false);
  };

  const handleDelete = () => {
    if (confirmText.toLowerCase() === "eliminar") {
      setProducts((prev) =>
        prev.filter((p) => p.id !== selectedProduct.id)
      );
      setShowDeleteModal(false);
      setConfirmText("");
    }
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

      {/* Tabla de productos */}
      <table className="w-full border mt-4 text-left">
        <thead className="bg-green-100">
          <tr>
            <th className="p-2">Nombre</th>
            <th className="p-2">Precio</th>
            <th className="p-2">Cantidad</th>
            <th className="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center py-4 text-gray-500">
                No hay productos
              </td>
            </tr>
          )}
          {products.map((product) => (
            <tr key={product.id} className="border-t">
              <td className="p-2">{product.name}</td>
              <td className="p-2">${product.price}</td>
              <td className="p-2">{product.quantity}</td>
              <td className="p-2 flex gap-2">
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => {
                    setSelectedProduct(product);
                    setShowEditModal(true);
                  }}
                >
                  Editar
                </button>
                <button
                  className="text-red-600 hover:underline"
                  onClick={() => {
                    setSelectedProduct(product);
                    setShowDeleteModal(true);
                  }}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal Agregar */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h3 className="text-xl font-semibold mb-4">Agregar Producto</h3>
            <input
              type="text"
              placeholder="Nombre"
              className="w-full border mb-2 px-3 py-2 rounded"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Precio"
              className="w-full border mb-2 px-3 py-2 rounded"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({ ...newProduct, price: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Cantidad"
              className="w-full border mb-4 px-3 py-2 rounded"
              value={newProduct.quantity}
              onChange={(e) =>
                setNewProduct({ ...newProduct, quantity: e.target.value })
              }
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddModal(false)}>Cancelar</button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded"
                onClick={handleAdd}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h3 className="text-xl font-semibold mb-4">Editar Producto</h3>
            <input
              type="text"
              placeholder="Nombre"
              className="w-full border mb-2 px-3 py-2 rounded"
              value={selectedProduct.name}
              onChange={(e) =>
                setSelectedProduct({
                  ...selectedProduct,
                  name: e.target.value,
                })
              }
            />
            <input
              type="number"
              placeholder="Precio"
              className="w-full border mb-2 px-3 py-2 rounded"
              value={selectedProduct.price}
              onChange={(e) =>
                setSelectedProduct({
                  ...selectedProduct,
                  price: e.target.value,
                })
              }
            />
            <input
              type="number"
              placeholder="Cantidad"
              className="w-full border mb-4 px-3 py-2 rounded"
              value={selectedProduct.quantity}
              onChange={(e) =>
                setSelectedProduct({
                  ...selectedProduct,
                  quantity: e.target.value,
                })
              }
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowEditModal(false)}>Cancelar</button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={handleEdit}
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h3 className="text-xl font-bold text-red-600 mb-2">
              ¿Estás seguro de que quieres eliminar?
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              Escribe <strong>eliminar</strong> para confirmar.
            </p>
            <input
              type="text"
              className="w-full border mb-4 px-3 py-2 rounded"
              placeholder="eliminar"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDeleteModal(false)}>Cancelar</button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
                disabled={confirmText.toLowerCase() !== "eliminar"}
                onClick={handleDelete}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gestion;
