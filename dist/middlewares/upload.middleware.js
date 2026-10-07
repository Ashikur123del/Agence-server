import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const ALLOWED_FORMATS = ["jpg", "jpeg", "png", "webp", "avif"];
// File er nam theke shudhu safe character rakhe (space / bangla / special char bad)
const safeName = (originalname) => originalname
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 40) || "file";
const makeStorage = (folder) => new CloudinaryStorage({
    cloudinary,
    params: async (_req, file) => ({
        folder,
        allowed_formats: ALLOWED_FORMATS,
        public_id: `${Date.now()}-${safeName(file.originalname)}`,
    }),
});
/**
 * Folder onujayi alada upload banay:
 *   uploadTo("hajjah")  -> Cloudinary te "hajjah" folder
 *   uploadTo("agents")  -> Cloudinary te "agents" folder
 */
export const uploadTo = (folder) => multer({
    storage: makeStorage(folder),
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith("image/"))
            cb(null, true);
        else
            cb(new Error("Only image files are allowed"));
    },
});
// Slider / news / gallery route gulo ager moto "upload" e-i kaj korbe
export const upload = uploadTo("hero-sliders");
//# sourceMappingURL=upload.middleware.js.map