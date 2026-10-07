export const getUploadedPhotoPath = (file) => {
    if (!file)
        return undefined;
    const f = file;
    // Cloudinary / S3 hole pura URL ashe
    if (f.path && /^https?:\/\//.test(f.path))
        return f.path;
    // Local disk e save hole
    if (f.filename)
        return `uploads/${f.filename}`;
    return undefined;
};
//# sourceMappingURL=photoPath.js.map