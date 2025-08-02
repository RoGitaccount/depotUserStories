import multer from "multer";

// Stockage en mémoire (buffer)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Autorise uniquement les images jpeg, png, gif, webp
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Type de fichier non autorisé. Seules les images sont acceptées."), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo max
  fileFilter
});
