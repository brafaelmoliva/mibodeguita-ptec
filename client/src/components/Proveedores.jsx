import React from "react";

const Proveedores = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Proveedores</h1>
      <p className="text-gray-700 mb-4">
        Aquí se muestra la lista y administración de proveedores.
      </p>

      {/* Botón exportar (deshabilitado, igual que antes) */}
      <button
        disabled
        className="mb-4 px-4 py-2 bg-green-400 text-white rounded cursor-not-allowed"
        title="Funcionalidad de exportar próximamente"
      >
        Exportar a Excel
      </button>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-green-800 text-white">
            <tr>
              <th className="px-4 py-2 border border-gray-300">ID</th>
              <th className="px-4 py-2 border border-gray-300">Nombre</th>
              <th className="px-4 py-2 border border-gray-300">Contacto</th>
              <th className="px-4 py-2 border border-gray-300">Teléfono</th>
              <th className="px-4 py-2 border border-gray-300">Correo</th>
            </tr>
          </thead>
          <tbody>
            {/* Aquí irán los datos reales que cargues o un mensaje vacío */}
            <tr>
              <td colSpan="5" className="text-center py-4 text-gray-500">
                No hay datos disponibles.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Proveedores;
