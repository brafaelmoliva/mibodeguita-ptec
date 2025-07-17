import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const [productosHoy, setProductosHoy] = useState(0);
  const [valorTotal, setValorTotal] = useState(0);
  const [productosTotales, setProductosTotales] = useState(0);
  const [ingresosDiarios, setIngresosDiarios] = useState([]);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resHoy, resValor, resTotales, resIngresos, resCategorias] =
          await Promise.all([
            axios.get("http://localhost:3001/api/dashboard/productos-hoy"),
            axios.get("http://localhost:3001/api/dashboard/valor-inventario"),
            axios.get("http://localhost:3001/api/dashboard/total-stock"),
            axios.get("http://localhost:3001/api/dashboard/entradas-dia"),
            axios.get("http://localhost:3001/api/dashboard/top-categorias"),
          ]);

        setProductosHoy(resHoy.data.total);
        setValorTotal(resValor.data.valor);
        setProductosTotales(resTotales.data.total);
        setIngresosDiarios(resIngresos.data);
        setCategorias(resCategorias.data);
      } catch (error) {
        console.error("Error al cargar datos del dashboard", error);
      }
    };

    fetchData();
  }, []);

  const colores = [
    "#82ca9d",
    "#8884d8",
    "#ffc658",
    "#ff8042",
    "#00C49F",
    "#FFBB28",
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">
            Aquí verás un resumen de tu inventario.
          </p>
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
          Exportar a PDF
        </button>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">
            Productos ingresados hoy
          </h2>
          <p className="text-3xl font-bold text-green-700">{productosHoy}</p>
          <p className="text-gray-500 text-sm mt-1">
            Número de nuevos productos
          </p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">
            Valor total del inventario
          </h2>
          <p className="text-3xl font-bold text-green-700">
            S/ {productosTotales}
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Suma del valor de todos los productos
          </p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Productos totales</h2>
          <p className="text-3xl font-bold text-green-700">{}</p>
          <p className="text-gray-500 text-sm mt-1">
            Cantidad de productos en stock
          </p>
        </div>
      </div>

      {/* Gráfico de barras */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">
          Productos ingresados por día
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ingresosDiarios}>
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="cantidad" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico circular */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Categorías más comunes</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categorias}
                dataKey="cantidad"
                nameKey="categoria"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {categorias.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colores[index % colores.length]}
                  />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
