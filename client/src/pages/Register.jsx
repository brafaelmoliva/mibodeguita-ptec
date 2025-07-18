import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import LoginImage from "../../src/assets/login.jpg";
const API_URL = import.meta.env.VITE_API_URL;

const Register = () => {
  const [email, setEmail] = useState("");
  const [codigoIngresado, setCodigoIngresado] = useState("");
  const [codigoVerificado, setCodigoVerificado] = useState(false);

  const [nombreCompleto, setNombreCompleto] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const navigate = useNavigate();

  // Paso 1: Enviar código
  const handleEnviarCodigo = async () => {
    setError(null);
    setSuccess(null);
    if (!email) {
      return setError("Ingresa un correo válido.");
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/reenviar-codigo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al enviar el código.");
      } else {
        setSuccess("Código enviado al correo.");
      }
    } catch {
      setError("Error de conexión.");
    }
  };

  // Paso 2: Verificar código
  const handleVerificarCodigo = async () => {
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API_URL}/api/auth/verificar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: email, codigo: codigoIngresado }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.mensaje || "Código incorrecto.");
      } else {
        setCodigoVerificado(true);
        setSuccess("Correo verificado correctamente.");
      }
    } catch {
      setError("Error al verificar código.");
    }
  };

  // Paso 3: Crear cuenta
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!codigoVerificado) {
      return setError("Verifica tu correo antes de continuar.");
    }

    if (!nombreCompleto.trim()) {
      return setError("El nombre completo es obligatorio.");
    }

    if (password !== passwordRepeat) {
      return setError("Las contraseñas no coinciden.");
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/register`,  {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_completo: nombreCompleto,
          correo: email,
          contraseña: password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error en el registro.");
      } else {
        setSuccess("Cuenta creada correctamente.");
        setTimeout(() => navigate("/login"), 1000);
      }
    } catch {
      setError("Error de conexión al servidor.");
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <div className="hidden md:flex md:w-1/2 flex-col justify-center items-center bg-green-100 relative px-6">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-green-800 mb-2">¿Nuevo en Stokio?</h2>
          <p className="text-gray-700 text-lg">Crea tu cuenta y empieza a gestionar.</p>
        </div>
        <img src={LoginImage} alt="Login" className="w-3/4 max-w-md rounded-lg shadow-lg" />
      </div>

      <div className="w-full md:w-1/2 flex flex-col justify-center items-center relative px-8">
        <Link to="/" className="absolute top-6 left-6 text-black hover:text-green-600 text-xl">
          <FiArrowLeft />
        </Link>

        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Crear cuenta</h2>

          {error && <p className="text-red-600 mb-4">{error}</p>}
          {success && <p className="text-green-600 mb-4">{success}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Correo electrónico"
                className="flex-1 px-4 py-2 border rounded-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={handleEnviarCodigo}
                className="bg-blue-600 text-white px-3 rounded hover:bg-blue-700"
              >
                Enviar código
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Código recibido"
                className="flex-1 px-4 py-2 border rounded-md"
                value={codigoIngresado}
                onChange={(e) => setCodigoIngresado(e.target.value)}
              />
              <button
                type="button"
                onClick={handleVerificarCodigo}
                className="bg-green-600 text-white px-3 rounded hover:bg-green-700"
              >
                Verificar
              </button>
            </div>

            {codigoVerificado && (
              <>
                <input
                  type="text"
                  placeholder="Nombre completo"
                  className="w-full px-4 py-2 border rounded-md"
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
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
                  Crear cuenta
                </button>
              </>
            )}
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