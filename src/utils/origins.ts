
const normalizeOrigin = (value: string) =>
    value.trim().replace(/\/+$/, "");

export const frontendOrigins: string[] = (
    process.env.FRONTEND_URL ?? ""
)
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean);

export const allowedOrigins: string[] = [
    "http://localhost:3000",
    "http://localhost:3001",
    ...frontendOrigins,
].filter((origin, index, list) => list.indexOf(origin) === index);
