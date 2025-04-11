import multer from "multer";

// multer configurations
const storage = multer.memoryStorage();
export const upload = multer({ storage });
