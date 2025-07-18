import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import LoginImage from "../../src/assets/login.jpg";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const Login = () => {
  const navigate = useNavigate();

  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contraseña }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error en el login");
        setLoading(false);
        return;
      }

      // ✅ Guardar token y usuario
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      navigate("/home");
    } catch (err) {
      setError("Error al conectar con el servidor");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Izquierda */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-center items-center bg-green-100 relative px-6">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-green-800 mb-2">¡Bienvenido de vuelta!</h2>
          <p className="text-gray-700 text-lg">Qué bueno verte de nuevo</p>
        </div>
        <img
          src={LoginImage}
          alt="Login Illustration"
          className="w-3/4 max-w-md rounded-lg shadow-lg"
        />
      </div>

      {/* Derecha */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center relative px-8">
        <Link to="/" className="absolute top-6 left-6 text-black hover:text-green-600 text-xl">
          <FiArrowLeft />
        </Link>

        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>

          <form className="space-y-4" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Correo electrónico"
              className="w-full px-4 py-2 border rounded-md"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              autoComplete="username"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                className="w-full px-4 py-2 border rounded-md"
                required
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-sm text-gray-600 hover:text-black"
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>

            {error && <p className="text-red-600 text-sm text-center">{error}</p>}

            <button type="submit" className="btn-dark w-full" disabled={loading}>
              {loading ? "Accediendo..." : "Acceder"}
            </button>
          </form>

          <div className="mt-6">
            <button className="w-full flex items-center justify-center border border-gray-300 rounded-md py-2 hover:bg-gray-100 transition">
              <FcGoogle className="text-xl mr-2" />
              Iniciar sesión con Google
            </button>
          </div>

          <div className="flex justify-between mt-6 text-sm text-gray-600">
            <Link to="/register" className="hover:text-green-600">
              ¿No tienes cuenta?
            </Link>
            <Link to="/recover" className="hover:text-green-600">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
