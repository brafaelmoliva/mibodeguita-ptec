const Dashboard = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Aquí verás un resumen de tu inventario.</p>
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
          Exportar a PDF
        </button>
      </div>
      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Productos ingresados hoy</h2>
          <p className="text-3xl font-bold text-green-700">--</p>
          <p className="text-gray-500 text-sm mt-1">Número de nuevos productos</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Valor total del inventario</h2>
          <p className="text-3xl font-bold text-green-700">$--</p>
          <p className="text-gray-500 text-sm mt-1">Suma del valor de todos los productos</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Productos totales</h2>
          <p className="text-3xl font-bold text-green-700">--</p>
          <p className="text-gray-500 text-sm mt-1">Cantidad de productos en stock</p>
        </div>
      </div>

      {/* Gráfico de barras (placeholder) */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Productos ingresados por día</h2>
        <div className="h-64 flex items-center justify-center text-gray-400">
          {/* Aquí irá el gráfico de barras */}
          <span>Gráfico de barras aquí</span>
        </div>
      </div>

      {/* Gráfico circular o de torta (placeholder) */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Categorías más comunes</h2>
        <div className="h-64 flex items-center justify-center text-gray-400">
          {/* Aquí irá el gráfico circular */}
          <span>Gráfico circular aquí</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
