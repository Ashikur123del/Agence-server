// FRONTEND_URL e ekadhik URL comma diye dewa jabe:
// FRONTEND_URL=https://my-app.vercel.app,https://www.mydomain.com
// Shesh e "/" thakleo problem nai.
export const frontendOrigins = (process.env.FRONTEND_URL ?? "")
    .split(",")
    .map((s) => s.trim().replace(/\/+$/, ""))
    .filter(Boolean);
export const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    ...frontendOrigins,
];
//# sourceMappingURL=origins.js.map