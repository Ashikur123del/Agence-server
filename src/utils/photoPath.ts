export const getUploadedPhotoPath = (
    file?: Express.Multer.File
): string | undefined => {
    if (!file) return undefined;
    const f = file as Express.Multer.File & { path?: string };

    // Cloudinary / S3 hole pura URL ashe
    if (f.path && /^https?:\/\//.test(f.path)) return f.path;

    // Local disk e save hole
    if (f.filename) return `uploads/${f.filename}`;

    return undefined;
};