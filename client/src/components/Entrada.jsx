import React, { useState, useEffect } from "react";

const token = localStorage.getItem("token");

const Entrada = () => {
  const [entradas, setEntradas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // Nuevo estado
  const [error, setError] = useState(null);

  const [nuevaEntrada, setNuevaEntrada] = useState({
    id_producto: "",
    cantidad_total: "",
    tipo_entrada: "unidad",
    unidades_por_paquete: "",
    cantidad_paquetes: "",
    productos_por_paquete: "",
    precio_por_paquete: "",
    costo_unitario_calculado: "",
    precio_venta_sugerido: "",
    tipo_pago: "contado",
    monto_pagado: "",
    usuario_id: 1,
    observaciones: "",
    fecha_cancelacion: "",
  });

  const fetchProductos = () => {
    fetch("http://localhost:3001/api/productos")
      .then(res => res.json())
      .then(setProductos)
      .catch(() => setError("Error al obtener productos"));
  };

  const fetchEntradas = () => {
    fetch("http://localhost:3001/api/entrada-producto")
      .then(res => res.json())
      .then(setEntradas)
      .catch(() => setError("Error al obtener entradas"));
  };

  useEffect(() => {
    fetchProductos();
    fetchEntradas();
  }, []);

  useEffect(() => {
    const pCount = parseFloat(nuevaEntrada.cantidad_paquetes);
    const uPerPkg = parseFloat(nuevaEntrada.productos_por_paquete);
    const pricePkg = parseFloat(nuevaEntrada.precio_por_paquete);

    if (!isNaN(pCount) && !isNaN(uPerPkg)) {
      const cantidadTotal = pCount * uPerPkg;
      const costoUnitario = !isNaN(pricePkg) && uPerPkg ? pricePkg / uPerPkg : 0;
      const montoTotal = cantidadTotal * costoUnitario;

      setNuevaEntrada(prev => ({
        ...prev,
        cantidad_total: cantidadTotal.toFixed(2),
        costo_unitario_calculado: costoUnitario.toFixed(2),
        monto_pagado: prev.tipo_pago === "contado"
          ? montoTotal.toFixed(2)
          : prev.monto_pagado,
      }));
    }
  }, [
    nuevaEntrada.cantidad_paquetes,
    nuevaEntrada.productos_por_paquete,
    nuevaEntrada.precio_por_paquete,
    nuevaEntrada.tipo_pago
  ]);

  const handleRegistrarEntrada = () => {
    const monto_total = parseFloat(nuevaEntrada.cantidad_total) * parseFloat(nuevaEntrada.costo_unitario_calculado);

    if (nuevaEntrada.tipo_pago === "contado") {
      nuevaEntrada.monto_pagado = monto_total.toFixed(2);
      nuevaEntrada.fecha_cancelacion = null;
    }

    const datos = {
      ...nuevaEntrada,
      monto_total: monto_total.toFixed(2),
    };

    fetch("http://localhost:3001/api/entrada-producto", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(datos),
    })
      .then(res => {
        if (!res.ok) throw new Error("Error al registrar entrada");
        return res.json();
      })
      .then(() => {
        fetchEntradas();
        setShowAddModal(false);
        setShowConfirmModal(false);
        setNuevaEntrada({
          id_producto: "",
          cantidad_total: "",
          tipo_entrada: "unidad",
          unidades_por_paquete: "",
          cantidad_paquetes: "",
          productos_por_paquete: "",
          precio_por_paquete: "",
          costo_unitario_calculado: "",
          precio_venta_sugerido: "",
          tipo_pago: "contado",
          monto_pagado: "",
          usuario_id: 1,
          observaciones: "",
          fecha_cancelacion: "",
        });
      })
      .catch(err => setError(err.message));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Entradas de Productos</h2>

      <button
        className="mb-4 px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800"
        onClick={() => setShowAddModal(true)}
      >
        Ingresar Entrada
      </button>

      {error && <p className="text-red-500 mb-4">Error: {error}</p>}

      <table className="w-full border mt-4 text-left text-sm">
        <thead className="bg-green-100 text-xs uppercase">
          <tr>
            <th className="p-2">Producto</th>
            <th className="p-2">Cantidad</th>
            <th className="p-2">Total</th>
            <th className="p-2">Paquetes</th>
            <th className="p-2">Unid/Paquete</th>
            <th className="p-2">Precio x Paquete</th>
            <th className="p-2">Costo Unitario</th>
            <th className="p-2">Precio Venta</th>
            <th className="p-2">Pagado</th>
            <th className="p-2">Pendiente</th>
            <th className="p-2">Fecha Cancelación</th>
            <th className="p-2">Fecha Pago</th>
            <th className="p-2">Fecha Entrada</th>
            <th className="p-2">Obs.</th>
          </tr>
        </thead>
        <tbody>
          {entradas.length === 0 ? (
            <tr>
              <td colSpan="14" className="text-center py-4 text-gray-500">
                No hay registros de entradas
              </td>
            </tr>
          ) : (
            entradas.map(entrada => (
              <tr key={entrada.id_entrada} className="hover:bg-gray-50">
                <td className="p-2">{entrada.nombre_producto}</td>
                <td className="p-2">{entrada.cantidad_total}</td>
                <td className="p-2">S/ {entrada.monto_total}</td>
                <td className="p-2">{entrada.cantidad_paquetes || "-"}</td>
                <td className="p-2">{entrada.productos_por_paquete || "-"}</td>
                <td className="p-2">
                  {entrada.precio_por_paquete ? `S/ ${entrada.precio_por_paquete}` : "-"}
                </td>
                <td className="p-2">S/ {entrada.costo_unitario_calculado}</td>
                <td className="p-2">S/ {entrada.precio_venta_sugerido}</td>
                <td className="p-2">S/ {entrada.monto_pagado}</td>
                <td className="p-2">S/ {entrada.monto_pendiente}</td>
                <td className="p-2">{entrada.fecha_cancelacion ? entrada.fecha_cancelacion.split("T")[0] : "-"}</td>
                <td className="p-2">{entrada.fecha_pago ? entrada.fecha_pago.split("T")[0] : "-"}</td>
                <td className="p-2">{entrada.fecha_entrada ? entrada.fecha_entrada.split("T")[0] : "-"}</td>
                <td className="p-2">{entrada.observaciones ? <span title={entrada.observaciones}>🛈</span> : "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h3 className="text-xl font-semibold mb-4">Registrar Entrada</h3>

            <select
              className="w-full border mb-2 px-3 py-2 rounded"
              value={nuevaEntrada.id_producto}
              onChange={e => setNuevaEntrada({ ...nuevaEntrada, id_producto: e.target.value })}
            >
              <option value="">Seleccionar Producto</option>
              {productos.map(p => (
                <option key={p.id_producto} value={p.id_producto}>
                  {p.nombre_producto}
                </option>
              ))}
            </select>

            <input type="number" placeholder="Cantidad Total" className="w-full border mb-2 px-3 py-2 rounded" value={nuevaEntrada.cantidad_total} readOnly />

            <select className="w-full border mb-2 px-3 py-2 rounded" value={nuevaEntrada.tipo_entrada} onChange={e => setNuevaEntrada({ ...nuevaEntrada, tipo_entrada: e.target.value })}>
              <option value="unidad">Unidad</option>
              <option value="kg">Kilogramos</option>
              <option value="litro">Litros</option>
            </select>

            <input type="number" placeholder="Productos por Paquete" className="w-full border mb-2 px-3 py-2 rounded" value={nuevaEntrada.productos_por_paquete} onChange={e => setNuevaEntrada({ ...nuevaEntrada, productos_por_paquete: e.target.value })} />

            <input type="number" placeholder="Cantidad de Paquetes" className="w-full border mb-2 px-3 py-2 rounded" value={nuevaEntrada.cantidad_paquetes} onChange={e => setNuevaEntrada({ ...nuevaEntrada, cantidad_paquetes: e.target.value })} />

            <input type="number" step="0.01" placeholder="Precio por Paquete" className="w-full border mb-2 px-3 py-2 rounded" value={nuevaEntrada.precio_por_paquete} onChange={e => setNuevaEntrada({ ...nuevaEntrada, precio_por_paquete: e.target.value })} />

            <input type="number" placeholder="Costo Unitario" className="w-full border mb-2 px-3 py-2 rounded" value={nuevaEntrada.costo_unitario_calculado} readOnly />

            <input type="number" placeholder="Precio Venta" className="w-full border mb-2 px-3 py-2 rounded" value={nuevaEntrada.precio_venta_sugerido} onChange={e => setNuevaEntrada({ ...nuevaEntrada, precio_venta_sugerido: e.target.value })} />

            <div className="mb-4">
              <span className="mr-4 font-semibold">Tipo de Pago:</span>
              <label className="mr-4">
                <input type="radio" name="tipo_pago" value="contado" checked={nuevaEntrada.tipo_pago === "contado"} onChange={() => setNuevaEntrada({ ...nuevaEntrada, tipo_pago: "contado" })} /> Contado
              </label>
              <label>
                <input type="radio" name="tipo_pago" value="credito" checked={nuevaEntrada.tipo_pago === "credito"} onChange={() => setNuevaEntrada({ ...nuevaEntrada, tipo_pago: "credito" })} /> Crédito
              </label>
            </div>

            {nuevaEntrada.tipo_pago === "credito" && (
              <>
                <input type="number" placeholder="Monto Pagado" className="w-full border mb-2 px-3 py-2 rounded" value={nuevaEntrada.monto_pagado} onChange={e => setNuevaEntrada({ ...nuevaEntrada, monto_pagado: e.target.value })} />
                <input type="date" className="w-full border mb-2 px-3 py-2 rounded" value={nuevaEntrada.fecha_cancelacion} onChange={e => setNuevaEntrada({ ...nuevaEntrada, fecha_cancelacion: e.target.value })} />
              </>
            )}

            <textarea placeholder="Observaciones (opcional)" className="w-full border mb-4 px-3 py-2 rounded" value={nuevaEntrada.observaciones} onChange={e => setNuevaEntrada({ ...nuevaEntrada, observaciones: e.target.value })} />

            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 border rounded" onClick={() => setShowAddModal(false)}>Cancelar</button>
              <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => setShowConfirmModal(true)}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h3 className="text-lg font-bold mb-4 text-yellow-600">⚠️ Confirmar Registro</h3>
            <p className="mb-4 text-sm text-gray-700">
              ¿Estás seguro de registrar esta entrada de producto?<br />
              <strong>No se podrá modificar después.</strong>
            </p>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 border rounded" onClick={() => setShowConfirmModal(false)}>Cancelar</button>
              <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleRegistrarEntrada}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Entrada;
