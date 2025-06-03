import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const historialMock = [
  {
    id: 1,
    fecha: "2025-05-20 10:30",
    codigo: "PROD001",
    proveedor: "Proveedor A",
    accion: "Agregado",
    cantidad: 50,
  },
  {
    id: 2,
    fecha: "2025-05-21 14:15",
    codigo: "PROD002",
    proveedor: "Proveedor B",
    accion: "Eliminado",
    cantidad: 20,
  },
  {
    id: 3,
    fecha: "2025-05-22 09:00",
    codigo: "PROD003",
    proveedor: "Proveedor C",
    accion: "Editado",
    cantidad: 10,
  },
];

const Historial = () => {
  const exportToExcel = () => {
    // Formatear datos para exportar (sin id)
    const dataToExport = historialMock.map(({ id, ...rest }) => rest);

    // Crear worksheet y libro de trabajo
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Historial");

    // Generar archivo Excel en formato binario
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

    // Guardar archivo usando file-saver
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, "historial.xlsx");
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Historial</h1>
      <p className="text-gray-700 mb-4">
        Aquí se muestra el historial de acciones realizadas sobre el inventario.
      </p>

      <button
        onClick={exportToExcel}
        className="mb-4 px-4 py-2 bg-green-700 text-white rounded hover:bg-green-600 transition"
      >
        Exportar a Excel
      </button>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-green-800 text-white">
            <tr>
              <th className="px-4 py-2 border border-gray-300">Fecha</th>
              <th className="px-4 py-2 border border-gray-300">Código</th>
              <th className="px-4 py-2 border border-gray-300">Proveedor</th>
              <th className="px-4 py-2 border border-gray-300">Acción</th>
              <th className="px-4 py-2 border border-gray-300">Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {historialMock.map((item) => (
              <tr key={item.id} className="hover:bg-green-100">
                <td className="px-4 py-2 border border-gray-300">{item.fecha}</td>
                <td className="px-4 py-2 border border-gray-300">{item.codigo}</td>
                <td className="px-4 py-2 border border-gray-300">{item.proveedor}</td>
                <td className="px-4 py-2 border border-gray-300">{item.accion}</td>
                <td className="px-4 py-2 border border-gray-300">{item.cantidad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Historial;
