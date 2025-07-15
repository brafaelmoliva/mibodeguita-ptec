import { useNavigate } from "react-router-dom";

const Ajustes = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("usuario"); // Elimina al usuario guardado
    navigate("/login"); // Redirige a la página de login
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
