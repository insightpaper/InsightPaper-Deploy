import dotenv from 'dotenv';
dotenv.config();

const corsOptions = {
  origin: [
    process.env.CLIENT_SERVER_ROUTE,
    process.env.SERVER_ROUTE,
  ], 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
};

export default corsOptions;