import React, { useState, useEffect } from "react";
const API_URL = import.meta.env.VITE_API_URL;

const token = localStorage.getItem("token");

const Entrada = () => {
  const [productos, setProductos] = useState([]);
  const [entradas, setEntradas] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState(null);
  const [detalleEntrada, setDetalleEntrada] = useState(null); // nuevo estado
  const [rucTipo, setRucTipo] = useState("");
  const [errorRuc, setErrorRuc] = useState("");
  const [proveedores, setProveedores] = useState([]);

  const verDetallesFactura = (id_entrada) => {
fetch(`${API_URL}/api/entrada-producto/${id_entrada}`)
      .then((res) => res.json())
      .then(setDetalleEntrada)
      .catch(() => setError("Error al obtener detalles de factura"));
  };

  const [productosEntrada, setProductosEntrada] = useState([
    {
      id_producto: "",
      tipo_entrada: "unidad",
      cantidad_paquetes: "",
      productos_por_paquete: "",
      precio_por_paquete: "",
      cantidad_total: "",
      costo_unitario_calculado: "",
      precio_venta_sugerido: "",
      observaciones: "",
    },
  ]);

  const [datosFactura, setDatosFactura] = useState({
    numero_factura: "",
    tipo_pago: "contado",
    monto_pagado: "",
    fecha_cancelacion: "",
    ruc_emisor: "",
    razon_social_emisor: "",
    usuario_id: null,
  });

  // Cargar usuario_id desde localStorage cuando el componente monta
  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (usuario && usuario.id) {
      setDatosFactura((prev) => ({ ...prev, usuario_id: usuario.id }));
    } else {
      setDatosFactura((prev) => ({ ...prev, usuario_id: 1 })); // fallback a 1 si no hay usuario
    }
  }, []);

  useEffect(() => {
fetch(`${API_URL}/api/proveedores`)
      .then((res) => res.json())
      .then(setProveedores)
      .catch(() => setError("Error al obtener proveedores"));
  }, []);

  useEffect(() => {
fetch(`${API_URL}/api/productos`)
      .then((res) => res.json())
      .then(setProductos)
      .catch(() => setError("Error al obtener productos"));

fetch(`${API_URL}/api/entrada-producto`)
      .then((res) => res.json())
      .then(setEntradas)
      .catch(() => setError("Error al obtener entradas"));
  }, []);

  const agregarProductoEntrada = () => {
    setProductosEntrada([
      ...productosEntrada,
      {
        id_producto: "",
        tipo_entrada: "unidad",
        cantidad_paquetes: "",
        productos_por_paquete: "",
        precio_por_paquete: "",
        cantidad_total: "",
        costo_unitario_calculado: "",
        precio_venta_sugerido: "",
        observaciones: "",
      },
    ]);
  };

  const actualizarProducto = (index, campo, valor) => {
    const actualizados = [...productosEntrada];
    actualizados[index][campo] = valor;

    const p = parseFloat(actualizados[index].productos_por_paquete);
    const c = parseFloat(actualizados[index].cantidad_paquetes);
    const precio = parseFloat(actualizados[index].precio_por_paquete);

    if (!isNaN(p) && !isNaN(c)) {
      const cantidad_total = p * c;
      actualizados[index].cantidad_total = cantidad_total.toFixed(2);
      actualizados[index].costo_unitario_calculado = !isNaN(precio)
        ? (precio / p).toFixed(2)
        : "0";
    } else {
      actualizados[index].cantidad_total = "";
      actualizados[index].costo_unitario_calculado = "";
    }

    setProductosEntrada(actualizados);
  };

  const handleRegistrarFactura = () => {
    const productosConMontos = productosEntrada.map((p) => {
      const cantidad = parseFloat(p.cantidad_total || 0);
      const costo = parseFloat(p.costo_unitario_calculado || 0);
      return {
        ...p,
        cantidad_total: cantidad,
        costo_unitario_calculado: costo,
        monto_total: (cantidad * costo).toFixed(2),
      };
    });

    let montoTotalFactura = productosConMontos.reduce(
      (acc, p) => acc + parseFloat(p.monto_total),
      0
    );

    const datos = {
      productos: productosConMontos,
      numero_factura: datosFactura.numero_factura,
      tipo_pago: datosFactura.tipo_pago,
      monto_pagado:
        datosFactura.tipo_pago === "contado"
          ? montoTotalFactura.toFixed(2)
          : datosFactura.monto_pagado,
      fecha_cancelacion:
        datosFactura.tipo_pago === "credito"
          ? datosFactura.fecha_cancelacion
          : null,
      usuario_id: datosFactura.usuario_id,
      ruc_emisor: datosFactura.ruc_emisor,
      razon_social_emisor: datosFactura.razon_social_emisor,
    };

    fetch(`${API_URL}/api/entrada-producto`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(datos),
})

      .then((res) => {
        if (!res.ok) throw new Error("Error al registrar entrada");
        return res.json();
      })
      .then(() => {
        setShowAddModal(false);
        setShowConfirmModal(false);
        setProductosEntrada([
          {
            id_producto: "",
            tipo_entrada: "unidad",
            cantidad_paquetes: "",
            productos_por_paquete: "",
            precio_por_paquete: "",
            cantidad_total: "",
            costo_unitario_calculado: "",
            precio_venta_sugerido: "",
            observaciones: "",
          },
        ]);
        setDatosFactura({
          numero_factura: "",
          tipo_pago: "contado",
          monto_pagado: "",
          fecha_cancelacion: "",
          usuario_id: datosFactura.usuario_id, // conservar usuario_id actual
        });
        // Refrescar entradas
fetch(`${API_URL}/api/entrada-producto`)
          .then((res) => res.json())
          .then(setEntradas)
          .catch(() => setError("Error al obtener entradas"));
      })
      .catch((err) => setError(err.message));
  };

  const formatoMoneda = (valor) => {
    if (valor === undefined || valor === null || isNaN(Number(valor)))
      return "-";
    return Number(valor).toFixed(2);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Entradas de Productos</h2>

      <button
        className="mb-4 px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800"
        onClick={() => setShowAddModal(true)}
      >
        Nueva Entrada (Factura)
      </button>

      {error && <p className="text-red-500 mb-4">Error: {error}</p>}
      {/* Tabla de facturas (resumen) */}
      <table className="w-full border mt-4 text-left text-sm">
        <thead className="bg-green-100 text-xs uppercase">
          <tr>
            <th className="p-2">Factura</th>
            <th className="p-2">Fecha</th>
            <th className="p-2">Pagado</th>
            <th className="p-2">Pendiente</th>
            <th className="p-2">Estado</th>
            <th className="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {entradas.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center py-4 text-gray-500">
                No hay registros de entradas
              </td>
            </tr>
          ) : (
            entradas.map((entrada) => (
              <tr key={entrada.id_entrada} className="hover:bg-gray-50">
                <td className="p-2">{entrada.numero_factura}</td>
                <td className="p-2">{entrada.fecha_entrada?.split("T")[0]}</td>
                <td className="p-2">
                  S/ {formatoMoneda(entrada.monto_pagado)}
                </td>
                <td className="p-2">
                  S/ {formatoMoneda(entrada.monto_pendiente)}
                </td>
                <td className="p-2">
                  {entrada.esta_cancelado ? "Cancelado" : "Pendiente"}
                </td>
                <td className="p-2">
                  <button
                    onClick={() => verDetallesFactura(entrada.id_entrada)}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Ver detalles
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {detalleEntrada && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h3 className="text-xl font-semibold mb-4">
            Detalles de Factura: {detalleEntrada.numero_factura}
          </h3>
          <p>
            <strong>Registrado por:</strong> {detalleEntrada.registrado_por}
          </p>
          <p>
            <strong>Fecha:</strong>{" "}
            {detalleEntrada.fecha_entrada?.split("T")[0]}
          </p>
          <p>
            <strong>Estado:</strong>{" "}
            {detalleEntrada.esta_cancelado ? "Cancelado" : "Pendiente"}
          </p>
          <p>
            <strong>Monto Pagado:</strong> S/{" "}
            {formatoMoneda(detalleEntrada.monto_pagado)}
          </p>
          <p>
            <strong>Monto Pendiente:</strong> S/{" "}
            {formatoMoneda(detalleEntrada.monto_pendiente)}
          </p>

          <h4 className="mt-4 font-semibold">Productos incluidos:</h4>
          <table className="w-full text-sm mt-2 border">
            <thead>
              <tr>
                <th className="p-2">Producto</th>
                <th className="p-2">Cantidad</th>
                <th className="p-2">Precio x Paquete</th>
                <th className="p-2">Costo Unitario</th>
                <th className="p-2">Precio Venta</th>
                <th className="p-2">Monto Total</th>
              </tr>
            </thead>
            <tbody>
              {detalleEntrada.productos.map((p, idx) => (
                <tr key={idx}>
                  <td className="p-2">{p.nombre_producto}</td>
                  <td className="p-2">{p.cantidad_total}</td>
                  <td className="p-2">
                    S/ {formatoMoneda(p.precio_por_paquete)}
                  </td>
                  <td className="p-2">
                    S/ {formatoMoneda(p.costo_unitario_calculado)}
                  </td>
                  <td className="p-2">
                    S/ {formatoMoneda(p.precio_venta_sugerido)}
                  </td>
                  <td className="p-2">S/ {formatoMoneda(p.monto_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={() => setDetalleEntrada(null)}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
          >
            Cerrar detalles
          </button>
        </div>
      )}

      {/* Modal para agregar factura */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-10 z-10 overflow-y-scroll">
          <div className="bg-white p-6 rounded shadow-md w-[40%] max-w-4xl mr-4">
            <h3 className="text-xl font-bold mb-4">
              Registrar Factura de Entrada
            </h3>

            {/* Input número factura */}
            <input
              type="text"
              placeholder="Número de Factura (ej: F001-00000000012)"
              className="border px-3 py-2 rounded mb-4 w-full"
              value={datosFactura.numero_factura}
              onChange={(e) => {
                // Solo permitir caracteres válidos: F, dígitos, guion
                let val = e.target.value.toUpperCase();

                // Permitir que el usuario escriba libremente, pero bloqueamos caracteres extraños
                val = val.replace(/[^F0-9-]/g, "");

                // Aseguramos que solo haya un guion
                const parts = val.split("-");
                if (parts.length > 2) {
                  val = parts[0] + "-" + parts.slice(1).join("");
                }

                setDatosFactura({ ...datosFactura, numero_factura: val });
              }}
              onBlur={() => {
                let val = datosFactura.numero_factura.toUpperCase();

                // Dividir en serie y correlativo
                let [serieRaw, correlativoRaw = ""] = val.split("-");

                // Limpiar y formatear serie: debe ser F + 3 números
                serieRaw = serieRaw.replace(/[^F0-9]/g, "");

                // Forzar que empiece con F
                if (!serieRaw.startsWith("F")) {
                  serieRaw = "F" + serieRaw.replace(/F/g, "");
                }

                let numerosSerie = serieRaw
                  .slice(1)
                  .replace(/\D/g, "")
                  .slice(0, 3);
                numerosSerie = numerosSerie.padStart(3, "0");

                const serieFinal = "F" + numerosSerie;

                // Limpiar y formatear correlativo: solo números, 11 dígitos
                correlativoRaw = correlativoRaw.replace(/\D/g, "").slice(0, 11);
                const correlativoFinal = correlativoRaw.padStart(11, "0");

                setDatosFactura({
                  ...datosFactura,
                  numero_factura: `${serieFinal}-${correlativoFinal}`,
                });
              }}
            />

            {/* Agregar Ruc del emisor */}

            <label className="block mt-4 font-semibold">
              Selecciona Proveedor
            </label>
            <select
              className="border px-3 py-2 rounded w-full mt-1"
              value={datosFactura.ruc_emisor}
              onChange={(e) => {
                const rucSeleccionado = e.target.value;
                setDatosFactura({
                  ...datosFactura,
                  ruc_emisor: rucSeleccionado, // guardas solo el RUC
                });
                setRucTipo(
                  rucSeleccionado.startsWith("10") ? "natural" : "empresa"
                );
                setErrorRuc("");
              }}
            >
              <option value="">-- Seleccione un proveedor --</option>
              {proveedores.map((prov) => (
                <option key={prov.ruc} value={prov.ruc}>
                  {prov.nombre_razon_social}{" "}
                  {/* Solo se muestra la razón social */}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="RUC del Emisor"
              className="border px-3 py-2 rounded w-full mt-2"
              value={datosFactura.ruc_emisor}
              onChange={(e) => {
                let val = e.target.value.replace(/\D/g, ""); // solo números

                // Forzar prefijo según tipo seleccionado
                if (rucTipo === "natural") {
                  if (!val.startsWith("10")) val = "10" + val.slice(2);
                } else if (rucTipo === "empresa") {
                  if (!val.startsWith("20")) val = "20" + val.slice(2);
                }

                if (val.length > 11) {
                  setErrorRuc("El RUC no puede tener más de 11 dígitos.");
                  val = val.slice(0, 11); // cortar a máximo 11 dígitos
                } else {
                  setErrorRuc("");
                }

                setDatosFactura({ ...datosFactura, ruc_emisor: val });
              }}
              maxLength={11}
            />
            {errorRuc && <p className="text-red-600 mt-1">{errorRuc}</p>}

            {productosEntrada.map((p, i) => (
              <div
                key={i}
                className="mb-4 p-4 border rounded bg-gray-50 space-y-2"
              >
                <select
                  className="w-full border px-3 py-2 rounded"
                  value={p.id_producto}
                  onChange={(e) =>
                    actualizarProducto(i, "id_producto", e.target.value)
                  }
                >
                  <option value="">Seleccionar producto</option>
                  {productos.map((prod) => (
                    <option key={prod.id_producto} value={prod.id_producto}>
                      {prod.nombre_producto}
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Productos por Paquete"
                    className="border px-3 py-2 rounded"
                    value={p.productos_por_paquete}
                    onChange={(e) =>
                      actualizarProducto(
                        i,
                        "productos_por_paquete",
                        e.target.value
                      )
                    }
                  />
                  <input
                    type="number"
                    placeholder="Cantidad de Paquetes"
                    className="border px-3 py-2 rounded"
                    value={p.cantidad_paquetes}
                    onChange={(e) =>
                      actualizarProducto(i, "cantidad_paquetes", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    placeholder="Precio por Paquete"
                    className="border px-3 py-2 rounded"
                    value={p.precio_por_paquete}
                    onChange={(e) =>
                      actualizarProducto(
                        i,
                        "precio_por_paquete",
                        e.target.value
                      )
                    }
                  />
                  <input
                    type="number"
                    placeholder="Precio Venta"
                    className="border px-3 py-2 rounded"
                    value={p.precio_venta_sugerido}
                    onChange={(e) =>
                      actualizarProducto(
                        i,
                        "precio_venta_sugerido",
                        e.target.value
                      )
                    }
                  />
                  <input
                    type="text"
                    placeholder="Observaciones"
                    className="col-span-2 border px-3 py-2 rounded"
                    value={p.observaciones}
                    onChange={(e) =>
                      actualizarProducto(i, "observaciones", e.target.value)
                    }
                  />
                </div>

                <p className="text-sm text-gray-600 mt-2">
                  Total: <strong>{p.cantidad_total || 0}</strong> unidades —
                  Costo unitario:{" "}
                  <strong>S/ {p.costo_unitario_calculado || 0}</strong>
                </p>
              </div>
            ))}

            <button
              onClick={agregarProductoEntrada}
              className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              + Agregar otro producto
            </button>

            <div className="border-t pt-4 mt-4">
              <h4 className="text-md font-semibold mb-2">
                Información de Factura
              </h4>
              <div className="flex flex-wrap gap-4 items-center">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="tipo_pago"
                    value="contado"
                    checked={datosFactura.tipo_pago === "contado"}
                    onChange={() =>
                      setDatosFactura({
                        ...datosFactura,
                        tipo_pago: "contado",
                        monto_pagado: "",
                        fecha_cancelacion: "",
                      })
                    }
                  />
                  <span>Contado</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="tipo_pago"
                    value="credito"
                    checked={datosFactura.tipo_pago === "credito"}
                    onChange={() =>
                      setDatosFactura({ ...datosFactura, tipo_pago: "credito" })
                    }
                  />
                  <span>Crédito</span>
                </label>

                {datosFactura.tipo_pago === "credito" && (
                  <>
                    <input
                      type="number"
                      placeholder="Monto Pagado"
                      className="border px-3 py-2 rounded"
                      value={datosFactura.monto_pagado}
                      onChange={(e) =>
                        setDatosFactura({
                          ...datosFactura,
                          monto_pagado: e.target.value,
                        })
                      }
                    />
                    <input
                      type="date"
                      className="border px-3 py-2 rounded"
                      value={datosFactura.fecha_cancelacion}
                      onChange={(e) =>
                        setDatosFactura({
                          ...datosFactura,
                          fecha_cancelacion: e.target.value,
                        })
                      }
                    />
                  </>
                )}
              </div>

              <button
                onClick={() => {
                  setShowConfirmModal(true);
                }}
                className="mt-4 px-6 py-2 bg-green-700 text-white rounded hover:bg-green-800"
              >
                Confirmar Factura
              </button>

              <button
                onClick={() => setShowAddModal(false)}
                className="ml-4 mt-4 px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20">
          <div className="bg-white p-6 rounded shadow-md max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Confirmar Registro</h3>
            <p>
              ¿Estás seguro que deseas registrar esta factura con los productos
              ingresados? RECUERDA QUE NO PODRAS MODIFICARLO MAS ADELANTE
            </p>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleRegistrarFactura}
                className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800"
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

export default Entrada;
