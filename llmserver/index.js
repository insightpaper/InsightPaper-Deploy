import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './src/routes/apiRoutes.js';
import corsOptions from './src/config/cors.js';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Rutas
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('Servidor funcionando'); 
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
