import Logo from "../../src/assets/stokio.png";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    
    <div className="min-h-screen flex flex-col font-sans bg-gray-50 text-gray-800">
      {/* Hero Section */}
<section className="flex flex-col md:flex-row items-center max-w-7xl mx-auto px-6 py-20 mt-16 gap-12">
        <div className="flex-1 flex flex-col justify-center items-start text-left">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-black">
            Gestiona tu inventario con facilidad
          </h2>
          <p className="text-gray-600 mb-8 max-w-lg">
            Simplifica el control de tus productos, reduce pérdidas y mantén
            todo bajo control desde cualquier dispositivo.
          </p>
          <Link to="/register" className="btn-dark">
            Regístrate ahora!
          </Link>
        </div>
        <div className="flex-1">
          <img
            src={Logo}
            alt="Logo del sitio"
            className="w-full rounded-lg shadow-lg"
          />
        </div>
      </section>

      <section
        id="features"
        className="bg-white py-16 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center"
      >
        {[
          {
            title: "Control en tiempo real",
            text: "Actualiza y consulta tu inventario al instante, sin complicaciones.",
          },
          {
            title: "Alertas y reportes",
            text: "Recibe notificaciones para reposiciones y genera reportes detallados.",
          },
          {
            title: "Fácil integración",
            text: "Compatible con múltiples dispositivos y adaptable a tu negocio.",
          },
        ].map((card, idx) => (
          <div
            key={idx}
            data-aos="fade-up"
            className="border border-black rounded-lg p-6 transition duration-300 hover:bg-black group"
          >
            <h3 className="text-xl font-bold mb-3 text-black group-hover:text-white">
              {card.title}
            </h3>
            <p className="text-gray-600 group-hover:text-white">{card.text}</p>
          </div>
        ))}
      </section>

      {/* About Section (full width) */}
      <section
        id="about"
        className="bg-gray-100 py-16 px-6 w-full text-center"
        data-aos="fade-up"
      >
        <h3 className="text-2xl font-semibold mb-4 text-black">Sobre Nosotros</h3>
        <p className="text-gray-700 max-w-3xl mx-auto">
          En Stokio nos dedicamos a ofrecer soluciones simples y efectivas
          para la gestión de inventarios en pequeñas y medianas empresas.
          Nuestro objetivo es ayudarte a ahorrar tiempo y recursos mientras
          haces crecer tu negocio.
        </p>
      </section>

      {/* Contact Section (full width) */}
      <section
        id="contact"
        className="bg-white py-16 px-6 w-full text-center"
        data-aos="fade-up"
      >
        <h3 className="text-2xl font-semibold mb-4 text-black">Contacto</h3>
        <p className="text-gray-700 max-w-3xl mx-auto mb-6">
          ¿Tienes dudas o quieres una demo? Escríbenos y te responderemos
          pronto.
        </p>
        <a href="mailto:contacto@mibodeguita.com" className="btn-dark">
          Contactar
        </a>
      </section>

      {/* Footer */}
      <footer className="bg-gray-200 py-6 text-center text-gray-600">
        © 2025 Stokio. Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default Landing;
