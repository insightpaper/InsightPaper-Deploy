// server/src/server.ts
import app from "./app";
import env from "./config/env";

const port = Number(process.env.PORT || env.port || 3000);

app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
});
