import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import LoginImage from "../../src/assets/login.jpg";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";


const Register = () => {
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== passwordRepeat) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (!nombreCompleto.trim()) {
      setError("El nombre completo es obligatorio");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre_completo: nombreCompleto,
          correo: email,
          contraseña: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error en el registro");
      } else {
        setSuccess("Usuario registrado correctamente");
        setNombreCompleto("");
        setEmail("");
        setPassword("");
        setPasswordRepeat("");
      }
    } catch (err) {
      setError("Error de conexión al servidor");
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <div className="hidden md:flex md:w-1/2 flex-col justify-center items-center bg-green-100 relative px-6">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-green-800 mb-2">¿Nuevo en Stokio?</h2>
          <p className="text-gray-700 text-lg">¿Listo para crear tu cuenta?</p>
        </div>
        <img
          src={LoginImage}
          alt="Login Illustration"
          className="w-3/4 max-w-md rounded-lg shadow-lg"
        />
      </div>

      <div className="w-full md:w-1/2 flex flex-col justify-center items-center relative px-8">
        <Link
          to="/"
          className="absolute top-6 left-6 text-black hover:text-green-600 text-xl"
          aria-label="Volver a inicio"
        >
          <FiArrowLeft />
        </Link>

        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Crear cuenta</h2>

          {error && <p className="text-red-600 mb-4">{error}</p>}
          {success && <p className="text-green-600 mb-4">{success}</p>}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Nombre completo"
              className="w-full px-4 py-2 border rounded-md"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Correo electrónico"
              className="w-full px-4 py-2 border rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              className="w-full px-4 py-2 border rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Repetir contraseña"
              className="w-full px-4 py-2 border rounded-md"
              value={passwordRepeat}
              onChange={(e) => setPasswordRepeat(e.target.value)}
              required
              minLength={6}
            />

            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              Mostrar contraseña
            </label>

            <button type="submit" className="btn-dark w-full">
              Crear
            </button>
          </form>

          <div className="mt-6">
            <button
              className="w-full flex items-center justify-center border border-gray-300 rounded-md py-2 hover:bg-gray-100 transition"
              disabled
            >
              <FcGoogle className="text-xl mr-2" />
              Iniciar sesión con Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
