import multer from "multer";
/**
 * Folder onujayi alada upload banay:
 *   uploadTo("hajjah")  -> Cloudinary te "hajjah" folder
 *   uploadTo("agents")  -> Cloudinary te "agents" folder
 */
export declare const uploadTo: (folder: string) => multer.Multer;
export declare const upload: multer.Multer;
