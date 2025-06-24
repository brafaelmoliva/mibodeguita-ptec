import { useNavigate } from "react-router-dom";

const Ajustes = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("usuario"); // Elimina al usuario guardado
    navigate("/login"); // Redirige a la página de login
  };

  return (
    <div className="p-8 w-full max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Ajustes</h1>

      <section className="mb-8 flex items-center gap-6">
        <img
          src="https://i.pravatar.cc/100"
          alt="Avatar"
          className="w-24 h-24 rounded-full object-cover border-2 border-green-800"
        />
        <div>
          <h2 className="text-xl font-semibold mb-3">Perfil</h2>
          <p>Nombre de usuario: Juan Pérez</p>
          <p>Email: juanperez@email.com</p>
          <button className="mt-2 btn-dark px-4 py-1 rounded">Cambiar Avatar</button>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Notificaciones</h2>
        <label className="flex items-center gap-3 mb-2">
          <input type="checkbox" defaultChecked />
          Recibir notificaciones por email
        </label>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Tema</h2>
        <button className="btn-dark px-5 py-2 rounded">Cambiar a modo oscuro</button>
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
