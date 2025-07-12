// Comprobante.jsx - Igual estilo que Entrada.jsx
import React, { useState, useEffect } from "react";

const token = localStorage.getItem("token");

const Comprobante = () => {
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [comprobantes, setComprobantes] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [detalleProductos, setDetalleProductos] = useState([]);
  const [error, setError] = useState(null);

  const [comprobante, setComprobante] = useState({
    tipo: "FACTURA",
    numero_comprobante: "",
    fecha_emision: "",
    fecha_vencimiento: "",
    forma_pago: "CONTADO",
    id_proveedor: "",
    observaciones: "",
    productos: [
      {
        id_producto: "",
        cantidad: 1,
        unidad: "unidad",
        costo_unitario: 0,
        precio_venta_sugerido: 0,
      },
    ],
  });

  useEffect(() => {
    fetch("http://localhost:3001/api/proveedores", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setProveedores)
      .catch(() => setError("Error al obtener proveedores"));

    fetch("http://localhost:3001/api/productos", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setProductos)
      .catch(() => setError("Error al obtener productos"));

    fetch("http://localhost:3001/api/comprobantes", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setComprobantes)
      .catch(() => setError("Error al obtener comprobantes"));
  }, []);

  const verDetalle = (id_comprobante) => {
    fetch(`http://localhost:3001/api/detallecomprobante/${id_comprobante}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setDetalleProductos(data);
        setShowDetalleModal(true);
      })
      .catch(() => setError("Error al obtener detalle de comprobante"));
  };

  const handleAgregarProducto = () => {
    setComprobante((prev) => ({
      ...prev,
      productos: [
        ...prev.productos,
        {
          id_producto: "",
          cantidad: 1,
          unidad: "unidad",
          costo_unitario: 0,
          precio_venta_sugerido: 0,
        },
      ],
    }));
  };

  const handleActualizarProducto = (index, field, value) => {
    const nuevos = [...comprobante.productos];
    nuevos[index][field] =
      field === "cantidad" ||
      field === "costo_unitario" ||
      field === "precio_venta_sugerido"
        ? parseFloat(value) || 0
        : value;
    setComprobante((prev) => ({ ...prev, productos: nuevos }));
  };

  const calcularTotal = () => {
    return comprobante.productos
      .reduce((acc, p) => acc + p.cantidad * p.costo_unitario, 0)
      .toFixed(2);
  };

  const handleRegistrar = () => {
    const total = parseFloat(calcularTotal());
    const payload = { ...comprobante, total };

    fetch("http://localhost:3001/api/comprobantes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al registrar comprobante");
        return res.json();
      })
      .then(() => {
        setShowAddModal(false);
        setShowConfirmModal(false);
        setComprobante({
          tipo: "FACTURA",
          numero_comprobante: "",
          fecha_emision: "",
          fecha_vencimiento: "",
          forma_pago: "CONTADO",
          id_proveedor: "",
          observaciones: "",
          productos: [
            {
              id_producto: "",
              cantidad: 1,
              unidad: "unidad",
              costo_unitario: 0,
              precio_venta_sugerido: 0,
            },
          ],
        });
        fetch("http://localhost:3001/api/comprobantes", {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then(setComprobantes);
      })
      .catch((err) => setError(err.message));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Registro de Comprobante</h2>
      <button
        className="mb-4 px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800"
        onClick={() => setShowAddModal(true)}
      >
        Registrar Comprobante
      </button>

      {error && <p className="text-red-500 mb-4">Error: {error}</p>}

      {/* Listado de comprobantes */}
      <table className="w-full border mt-4 text-left text-sm">
        <thead className="bg-green-100 text-xs uppercase">
          <tr>
            <th className="p-2">Tipo</th>
            <th className="p-2">N° Comprobante</th>
            <th className="p-2">Fecha Emisión</th>
            <th className="p-2">Proveedor</th>
            <th className="p-2">Forma de Pago</th>
            <th className="p-2">Total</th>
            <th className="p-2">Observaciones</th>
            <th className="p-2">Detalle</th>
          </tr>
        </thead>
        <tbody>
          {comprobantes.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center py-4 text-gray-500">
                No hay comprobantes registrados
              </td>
            </tr>
          ) : (
            comprobantes.map((c) => (
              <tr key={c.id_comprobante} className="hover:bg-gray-50">
                <td className="p-2">{c.tipo}</td>
                <td className="p-2">{c.numero_comprobante}</td>
                <td className="p-2">{c.fecha_emision?.split("T")[0]}</td>
                <td className="p-2">{c.nombre_proveedor || "-"}</td>
                <td className="p-2">{c.forma_pago}</td>
                <td className="p-2">S/ {parseFloat(c.total).toFixed(2)}</td>
                <td className="p-2">{c.observaciones || "-"}</td>
                <td className="p-2">
                  <button
                    onClick={() => verDetalle(c.id_comprobante)}
                    className="text-blue-600 hover:underline"
                  >
                    Ver Detalle
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 flex items-center justify-center">
          <div className="bg-white w-full max-w-3xl p-6 rounded shadow-lg relative">
            <h3 className="text-xl font-bold mb-4 text-green-800">
              Nuevo Comprobante
            </h3>

            <input
              className="w-full border mb-2 px-3 py-2 rounded"
              placeholder="Número Comprobante"
              value={comprobante.numero_comprobante}
              onChange={(e) =>
                setComprobante({
                  ...comprobante,
                  numero_comprobante: e.target.value,
                })
              }
            />

            <select
              className="w-full border mb-2 px-3 py-2 rounded"
              value={comprobante.tipo}
              onChange={(e) =>
                setComprobante({ ...comprobante, tipo: e.target.value })
              }
            >
              <option value="FACTURA">Factura</option>
              <option value="BOLETA">Boleta</option>
              <option value="GUIA_REMISION">Guía de Remisión</option>
            </select>

            <input
              type="date"
              className="w-full border mb-2 px-3 py-2 rounded"
              value={comprobante.fecha_emision}
              onChange={(e) =>
                setComprobante({
                  ...comprobante,
                  fecha_emision: e.target.value,
                })
              }
            />

            <select
              className="w-full border mb-2 px-3 py-2 rounded"
              value={comprobante.forma_pago}
              onChange={(e) =>
                setComprobante({ ...comprobante, forma_pago: e.target.value })
              }
            >
              <option value="CONTADO">Contado</option>
              <option value="CREDITO">Crédito</option>
            </select>

            <select
              className="w-full border mb-2 px-3 py-2 rounded"
              value={comprobante.id_proveedor}
              onChange={(e) =>
                setComprobante({ ...comprobante, id_proveedor: e.target.value })
              }
            >
              <option value="">Seleccionar Proveedor</option>
              {proveedores.map((p) => (
                <option key={p.id_proveedor} value={p.id_proveedor}>
                  {p.nombre_razon_social}
                </option>
              ))}
            </select>

            <textarea
              className="w-full border mb-4 px-3 py-2 rounded"
              placeholder="Observaciones"
              value={comprobante.observaciones}
              onChange={(e) =>
                setComprobante({
                  ...comprobante,
                  observaciones: e.target.value,
                })
              }
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                onClick={() => setShowAddModal(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                onClick={() => setShowConfirmModal(true)}
              >
                Ingresar Comprobante
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalle */}
      {showDetalleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20">
          <div className="bg-white p-6 rounded shadow-md w-[600px] max-h-[80vh] overflow-auto">
            <h3 className="text-lg font-bold mb-4 text-green-700">
              🧾 Detalle del Comprobante
            </h3>
            <table className="w-full text-sm border mb-4">
              <thead className="bg-green-100">
                <tr>
                  <th className="p-2">Producto</th>
                  <th className="p-2">Cantidad</th>
                  <th className="p-2">Unidad</th>
                  <th className="p-2">Costo Unit.</th>
                  <th className="p-2">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {detalleProductos.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-2">{item.nombre_producto}</td>
                    <td className="p-2">{item.cantidad}</td>
                    <td className="p-2">{item.unidad}</td>
                    <td className="p-2">
                      S/ {parseFloat(item.costo_unitario).toFixed(2)}
                    </td>
                    <td className="p-2">
                      S/ {parseFloat(item.subtotal).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-right">
              <button
                onClick={() => setShowDetalleModal(false)}
                className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h3 className="text-lg font-bold mb-4 text-yellow-600">
              ⚠️ Confirmar Registro
            </h3>
            <p className="mb-4 text-sm text-gray-700">
              ¿Estás seguro de registrar este comprobante?
              <br />
              <strong>No se podrá modificar después.</strong>
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 border rounded"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancelar
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={handleRegistrar} // ✅ AQUÍ es donde se llama la función que guarda
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Comprobante;
