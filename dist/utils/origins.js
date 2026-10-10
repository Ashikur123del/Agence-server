const normalizeOrigin = (value) => value.trim().replace(/\/+$/, "");
export const frontendOrigins = (process.env.FRONTEND_URL ?? "")
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean);
export const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    ...frontendOrigins,
].filter((origin, index, list) => list.indexOf(origin) === index);
//# sourceMappingURL=origins.js.map