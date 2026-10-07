import app from "./app.js";

const PORT = Number(process.env.PORT) || 5000;

// Vercel e (NODE_ENV=production) listen kora jabe na, shudhu app export korte hoy.
// Local e (npm run dev) normal server cholbe.
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;