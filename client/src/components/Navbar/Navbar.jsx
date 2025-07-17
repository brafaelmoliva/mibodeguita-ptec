import React, { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import Logo from '../../assets/logo2.png';

const navbarLinks = [
  { id: 1, title: 'Inicio', link: '/' },
  { id: 2, title: 'Nosotros', link: '#about' },
  { id: 3, title: 'Contacto', link: '#contact' },
  { id: 4, title: 'Soporte', link: '#' },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className="fixed top-0 left-0 w-full bg-dark shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div>
          <img src={Logo} alt="Logo del sitio" className="w-[200px]" />
        </div>

        {/* Menú desktop */}
        <div className="hidden md:flex items-center space-x-8">
          {navbarLinks.map(item => (
            <a
              key={item.id}
              href={item.link}
              className="text-white hover:text-green-500 transition"
            >
              {item.title}
            </a>
          ))}
        </div>

        {/* Botones desktop */}
        <div className="hidden md:flex items-center space-x-4">
          <a
            href="/login"
            className="px-4 py-2 border border-white text-white rounded hover:bg-white hover:text-green-600 hover:border-green-600 transition"
          >
            Iniciar sesión
          </a>
          <a
            href="/register"
            className="px-4 py-2 border border-white text-white rounded hover:bg-white hover:text-green-600 hover:border-green-600 transition"
          >
            Registrarse
          </a>
        </div>

        {/* Botón hamburguesa (mobile) */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-2xl text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      {menuOpen && (
        <div className="md:hidden bg-black px-4 pt-4 pb-6 space-y-4">
          {navbarLinks.map(item => (
            <a
              key={item.id}
              href={item.link}
              className="block text-white hover:text-green-500 transition"
              onClick={() => setMenuOpen(false)}
            >
              {item.title}
            </a>
          ))}
          <div className="pt-4 border-t border-gray-700 space-y-2">
            <a
              href="/login"
              className="block w-full text-center px-4 py-2 border border-white text-white rounded hover:bg-white hover:text-green-600 hover:border-green-600 transition"
              onClick={() => setMenuOpen(false)}
            >
              Iniciar sesión
            </a>
            <a
              href="/register"
              className="block w-full text-center px-4 py-2 border border-white text-white rounded hover:bg-white hover:text-green-600 hover:border-green-600 transition"
              onClick={() => setMenuOpen(false)}
            >
              Registrarse
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
