// src/pages/Recover.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

const Recover = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 relative px-6">
      {/* Flecha para volver */}
      <Link
        to="/login"
        className="absolute top-6 left-6 text-black hover:text-green-600 text-xl"
        aria-label="Volver al login"
      >
        <FiArrowLeft />
      </Link>

      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Recuperar contraseña
        </h2>

        {submitted ? (
          <p className="text-green-600 text-center">
            Se ha enviado un correo de restablecimiento a <strong>{email}</strong>
          </p>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md"
            />
            <button type="submit" className="btn-dark w-full">
              Enviar
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Recover;
