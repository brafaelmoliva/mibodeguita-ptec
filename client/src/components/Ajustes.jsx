import { useNavigate } from "react-router-dom";
import { useState } from "react";

const faqs = [
  {
    pregunta: "¿Cómo registro un nuevo proveedor?",
    respuesta:
      'Puedes registrar proveedores desde la sección "Proveedores" haciendo clic en "Agregar Proveedor".',
  },
  {
    pregunta: "¿Cómo registro una nueva categoría?",
    respuesta:
      'Puedes registrar categorías desde la sección "Categorías" haciendo clic en "Agregar Categoría".',
  },
  {
    pregunta: "¿Cómo registro un nuevo producto?",
    respuesta:
      'Puedes registrar productos desde la sección “Gestión” haciendo clic en “Agregar producto”. Recuerda que debes haber registrado una Categoría y un Proveedor antes.',
  },
  {
    pregunta: "¿Cómo registro una nueva entrada de producto?",
    respuesta:
      'Puedes registrar entradas desde la sección "Entradas" haciendo clic en “Nueva Entrada". Recuerda que debes haber registrado un producto antes y tambien el proveedor.',
  },
  {
    pregunta: "¿Cómo marco una deuda como pagada?",
    respuesta:
      'Dirígete a la sección “Deudas”, haz clic en el botón “Ver” y luego en “Sí, pagar”.',
  },
  {
    pregunta: "¿Puedo editar los datos de un proveedor?",
    respuesta:
      'Sí, ve a la sección “Proveedores”, selecciona uno y haz clic en “Editar”.',
  },
  {
    pregunta: "¿Qué pasa si olvido mi contraseña?",
    respuesta:
      'Por ahora, debes contactar al administrador del sistema para restablecerla.',
  },
   {
    pregunta: "¿Qué pasa si olvido mi contraseña?",
    respuesta:
      'Por ahora, debes contactar al soporte del sistema para restablecerla.',
  },
  {
    pregunta: "¿Como registro un nuevo empleado?",
    respuesta:
      'Puedes registrar a un nuevo empleado en la seccion de registrar empleado',
  },
   {
    pregunta: "¿Para que sirve la pestaña historial?",
    respuesta:
      'Ver las operaciones que se han hecho en el sistema',
  },
    {
    pregunta: "Ayuda, no veo el dashboard",
    respuesta:
      'Asegurate de estar en una cuenta con privilegios de administrador',
  },
];

const Ajustes = () => {
  const navigate = useNavigate();
  const [activa, setActiva] = useState(null);

  const toggle = (index) => {
    setActiva(index === activa ? null : index);
  };

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  return (
    <div className="p-8 w-full max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Ajustes</h1>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">Soporte</h2>
        <p>Si necesitas ayuda, puedes contactarnos:</p>
        <ul className="mt-2 list-disc list-inside text-gray-700">
          <li>Email: soporte@mibodeguita.com</li>
          <li>Teléfono: +51 987 654 321</li>
          <li>Horario: Lunes a Viernes, 9am - 6pm</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Preguntas Frecuentes</h2>

        <div className="space-y-3">
          {faqs.map((item, index) => (
            <div
              key={index}
              className="border border-gray-300 rounded shadow-sm"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 font-medium"
              >
                {item.pregunta}
              </button>
              {activa === index && (
                <div className="px-4 py-3 text-gray-700 bg-white">
                  {item.respuesta}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <button
          onClick={handleLogout}
          className="btn-danger px-5 py-2 rounded"
        >
          Cerrar sesión
        </button>
      </section>
    </div>
  );
};

export default Ajustes;
