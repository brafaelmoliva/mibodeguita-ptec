import React, { useEffect, useState } from 'react';

const Deudas = () => {
  const [deudas, setDeudas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDeuda, setSelectedDeuda] = useState(null);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('todas'); // 'todas', 'pendientes', 'pagadas'

  const API_URL = 'http://localhost:3001/api/deudas';

  useEffect(() => {
    fetchDeudas();
  }, []);

  const fetchDeudas = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!res.ok) throw new Error('Error al obtener deudas');
      const data = await res.json();
      setDeudas(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (deuda) => {
    setSelectedDeuda(deuda);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setSelectedDeuda(null);
    setModalOpen(false);
  };

  const confirmarPago = async () => {
    if (!selectedDeuda) return;
    setError('');
    try {
      const res = await fetch(`${API_URL}/${selectedDeuda.id_entrada}/pagar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!res.ok) throw new Error('Error al marcar deuda como pagada');
      await res.json();
      cerrarModal();
      fetchDeudas();
    } catch (err) {
      setError(err.message);
    }
  };

  const deudasFiltradas = deudas.filter((d) => {
    const montoPendiente = Number(d.monto_pendiente);
    if (filtro === 'pendientes') return montoPendiente > 0;
    if (filtro === 'pagadas') return montoPendiente === 0;
    return true;
  });

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Deudas</h1>
      <p className="text-gray-700 mb-4">
        Aquí se muestra la información de las deudas registradas.
      </p>

      <div className="mb-4 flex items-center gap-4">
        <button
          disabled
          className="px-4 py-2 bg-green-400 text-white rounded cursor-not-allowed"
          title="Funcionalidad de exportar próximamente"
        >
          Exportar a Excel
        </button>

        <div>
          <label className="mr-2 font-semibold">Filtrar:</label>
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="todas">Todas</option>
            <option value="pendientes">Pendientes</option>
            <option value="pagadas">Pagadas</option>
          </select>
        </div>
      </div>

      {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}

      {loading ? (
        <div>Cargando deudas...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
           <thead className="bg-green-800 text-white">
  <tr>
    <th className="px-4 py-2 border border-gray-300">Fecha</th>
    <th className="px-4 py-2 border border-gray-300">Código</th>
    <th className="px-4 py-2 border border-gray-300">Número de factura</th> {/* Nueva columna */}
    <th className="px-4 py-2 border border-gray-300">Proveedor (RUC)</th>
    <th className="px-4 py-2 border border-gray-300">Monto</th>
    <th className="px-4 py-2 border border-gray-300">Estado</th>
    <th className="px-4 py-2 border border-gray-300">Acciones</th>
  </tr>
</thead>
<tbody>
  {deudasFiltradas.length === 0 ? (
    <tr>
      <td colSpan="7" className="text-center py-4 text-gray-500">
        No hay datos disponibles.
      </td>
    </tr>
  ) : (
    deudasFiltradas.map((deuda) => {
      const fecha = deuda.fecha_cancelacion
        ? new Date(deuda.fecha_cancelacion).toLocaleDateString()
        : '—';
      const montoPendiente = Number(deuda.monto_pendiente) || 0;

      return (
        <tr key={deuda.id_entrada}>
          <td className="border px-4 py-2">{fecha}</td>
          <td className="border px-4 py-2">{deuda.id_entrada}</td>
          <td className="border px-4 py-2">{deuda.numero_factura || '—'}</td> {/* Aquí */}
          <td className="border px-4 py-2">{deuda.ruc_proveedor}</td>
          <td className="border px-4 py-2">{montoPendiente.toFixed(2)}</td>
          <td className="border px-4 py-2">
            {montoPendiente > 0 ? 'Pendiente' : 'Pagada'}
          </td>
          <td className="border px-4 py-2">
            {montoPendiente > 0 ? (
              <button
                onClick={() => abrirModal(deuda)}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Ver
              </button>
            ) : (
              <span className="text-gray-400">—</span>
            )}
          </td>
        </tr>
      );
    })
  )}
</tbody>

          </table>
        </div>
      )}

      {modalOpen && selectedDeuda && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Confirmar pago</h2>
            <p className="mb-4">
              ¿Ya pagaste la deuda del código{' '}
              <strong>{selectedDeuda.id_entrada}</strong>?
            </p>

            <div className="flex justify-end space-x-4">
              <button
                onClick={cerrarModal}
                className="px-4 py-2 rounded border border-gray-400 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarPago}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Sí, pagar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deudas;
