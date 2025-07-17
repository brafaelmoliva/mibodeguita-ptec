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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const Dashboard = () => {
  const [productosHoy, setProductosHoy] = useState(0);
  const [valorTotal, setValorTotal] = useState(0);
  const [productosTotales, setProductosTotales] = useState(0);
  const [gastosFiltrados, setGastosFiltrados] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [periodo, setPeriodo] = useState("dia");

  const textosResumen = {
    dia: {
      tituloProductos: "Productos ingresados hoy",
      textoProductos: "Número de nuevos productos",
      tituloValor: "Valor total del inventario",
      textoValor: "Suma del valor de todos los productos",
      tituloTotales: "Productos totales",
      textoTotales: "Cantidad de productos en stock",
    },
    semana: {
      tituloProductos: "Productos ingresados esta semana",
      textoProductos: "Número de nuevos productos en la semana",
      tituloValor: "Valor total del inventario semanal",
      textoValor: "Suma del valor de todos los productos esta semana",
      tituloTotales: "Productos totales",
      textoTotales: "Cantidad de productos en stock",
    },
    mes: {
      tituloProductos: "Productos ingresados este mes",
      textoProductos: "Número de nuevos productos en el mes",
      tituloValor: "Valor total del inventario mensual",
      textoValor: "Suma del valor de todos los productos este mes",
      tituloTotales: "Productos totales",
      textoTotales: "Cantidad de productos en stock",
    },
    anio: {
      tituloProductos: "Productos ingresados este año",
      textoProductos: "Número de nuevos productos en el año",
      tituloValor: "Valor total del inventario anual",
      textoValor: "Suma del valor de todos los productos este año",
      tituloTotales: "Productos totales",
      textoTotales: "Cantidad de productos en stock",
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
       console.log("Periodo seleccionado:", periodo);

const requests = [
  axios.get(`${API_URL}/api/dashboard/productos-hoy`, { params: { periodo } }),
  axios.get(`${API_URL}/api/dashboard/valor-inventario`, { params: { periodo } }),
  axios.get(`${API_URL}/api/dashboard/total-stock`),
  axios.get(`${API_URL}/api/dashboard/gastos-filtrados`, { params: { periodo } }),
  axios.get(`${API_URL}/api/dashboard/top-categorias`),
];

const [resHoy, resValor, resTotales, resGastos, resCategorias] = await Promise.all(requests);

        setProductosHoy(resHoy.data.total);
        setValorTotal(resValor.data.total || resValor.data.valor);
        setProductosTotales(resTotales.data.total);

        // Convertir fechas a ISO para evitar problemas con new Date()
        setGastosFiltrados(
          resGastos.data.map((item) => ({
            fecha: new Date(item.fecha).toISOString(),
            gastos: item.total_pagado,
          }))
        );

        setCategorias(resCategorias.data);
      } catch (error) {
        console.error("Error al cargar datos del dashboard", error);
      }
    };

    fetchData();
  }, [periodo]);

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
          <p className="text-gray-600">Aquí verás un resumen de tu inventario.</p>
        </div>

        <select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          className="border rounded p-2"
        >
          <option value="dia">Día</option>
          <option value="semana">Semana</option>
          <option value="mes">Mes</option>
          <option value="anio">Año</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">
            {textosResumen[periodo].tituloProductos}
          </h2>
          <p className="text-3xl font-bold text-green-700">{productosHoy}</p>
          <p className="text-gray-500 text-sm mt-1">{textosResumen[periodo].textoProductos}</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">
            {textosResumen[periodo].tituloValor}
          </h2>
          <p className="text-3xl font-bold text-green-700">S/ {valorTotal}</p>
          <p className="text-gray-500 text-sm mt-1">{textosResumen[periodo].textoValor}</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">
            {textosResumen[periodo].tituloTotales}
          </h2>
          <p className="text-3xl font-bold text-green-700">{productosTotales}</p>
          <p className="text-gray-500 text-sm mt-1">{textosResumen[periodo].textoTotales}</p>
        </div>
      </div>

      {/* Gráfico de gastos */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Gastos por {periodo}</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={gastosFiltrados}>
              <XAxis
                dataKey="fecha"
                tickFormatter={(fechaStr) => {
                  const date = new Date(fechaStr);
                  if (periodo === "dia" || periodo === "semana") {
                    return date.toLocaleDateString("es-PE", {
                      day: "2-digit",
                      month: "short",
                    });
                  }
                  if (periodo === "mes") {
                    return date.toLocaleDateString("es-PE", {
                      month: "short",
                      year: "numeric",
                    });
                  }
                  if (periodo === "anio") {
                    return date.getFullYear();
                  }
                  return date.toLocaleDateString("es-PE");
                }}
              />
              <YAxis />
              <Tooltip
                formatter={(value) =>
                  typeof value === "number" ? `S/ ${value.toFixed(2)}` : value
                }
              />
              <Bar dataKey="gastos" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico circular categorías */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Categorías más comunes</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categorias}
                dataKey="total_productos"
                nameKey="nombre_categoria"
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
