import "dotenv/config";
import app from "./app";

const port = Number(process.env.PORT) || 5050;

app.listen(port, () => {
  console.log(`API de Tijera Brava ejecutándose en http://localhost:${port}`);
});
