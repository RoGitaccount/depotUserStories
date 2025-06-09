import multer from "multer";

// Stockage en mémoire (buffer)
const storage = multer.memoryStorage();
export const upload = multer({ storage });

// Multer sert à gérer l'insertion des images (upload).