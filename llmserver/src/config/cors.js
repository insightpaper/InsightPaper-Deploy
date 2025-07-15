const corsOptions = {
  origin: '*', // <- público
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: false // <- importante: no se puede usar 'credentials: true' con 'origin: *'
};