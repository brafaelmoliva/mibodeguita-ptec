import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";

const Historial = () => {
  const [historial, setHistorial] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/auditoria")
      .then((res) => setHistorial(res.data))
      .catch((err) => console.error("Error al obtener historial", err));
  }, []);

  const exportToExcel = () => {
    const dataToExport = historial.map(({ id, ...rest }) => rest);
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Historial");
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, "historial.xlsx");
  };

  // Paginación
  const totalPages = Math.ceil(historial.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleItems = historial.slice(startIndex, startIndex + itemsPerPage);

  const changePage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Historial</h1>
      <p className="text-gray-700 mb-4">
        Aquí se muestra el historial de acciones realizadas en el sistema.
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
              <th className="px-4 py-2 border">Fecha</th>
              <th className="px-4 py-2 border">Tabla</th>
              <th className="px-4 py-2 border">Código</th>
              <th className="px-4 py-2 border">Acción</th>
              <th className="px-4 py-2 border">Usuario</th>
              <th className="px-4 py-2 border">Descripción</th>
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((item) => (
              <tr key={item.id} className="hover:bg-green-100">
                <td className="px-4 py-2 border">
                  {new Date(item.fecha).toLocaleString()}
                </td>
                <td className="px-4 py-2 border">{item.tabla_afectada}</td>
                <td className="px-4 py-2 border">{item.codigo}</td>
                <td className="px-4 py-2 border">{item.accion}</td>
                <td className="px-4 py-2 border">{item.usuario}</td>
                <td className="px-4 py-2 border">{item.descripcion}</td>
              </tr>
            ))}
            {visibleItems.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">
                  No hay registros de auditoría.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Controles de paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() => changePage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
          >
            Anterior
          </button>

          <span className="text-sm text-gray-700">
            Página {currentPage} de {totalPages}
          </span>

          <button
            onClick={() => changePage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default Historial;
