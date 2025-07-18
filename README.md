# 🧾 Mibodeguita PTEC

**Mibodeguita PTEC** es una aplicación web full-stack para la gestión de bodegas o tiendas. Permite administrar productos y usuarios de manera eficiente mediante una interfaz moderna, segura y responsiva.

---

##  Tecnologías Utilizadas

### Backend (`/backend`)
- Node.js + Express.js
- MySQL2
- JWT (autenticación)
- Bcryptjs (cifrado)
- Dotenv (variables de entorno)
- CORS

### Frontend (`/client`)
- React + Vite
- Tailwind CSS
- React Router DOM
- Bootstrap Icons
- AOS (animaciones)

---

## Instalación del Proyecto

### 1. Clona el repositorio
```bash
git clone https://github.com/brafaelmoliva/mibodeguita-ptec.git
cd mibodeguita-ptec


## Configurar backend y frontend

cd backend
npm install

cd client
npm install


## CREAR ARCHIVO .env para el backend :

PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sasa
DB_NAME=mibodeguita
JWT_SECRET=sasa
APIPERU_API_KEY=e930c870bfcb7a64c3858769f2365f6d6eb1e1d50372e9459a79faf9dbd352b3
EMAIL_USER=mibodeguitaptec@gmail.com
EMAIL_PASS=kcpgkgnxletxulvl
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
FRONTEND_URL=http://localhost:5173



## CREAR ARCHIVO .env para el frontend (client)


VITE_API_URL=http://localhost:3001


## CORRER BACKEND Y FRONTEND CON ESTE COMANDO:

cd client
npm run dev

cd backend
npm run dev




