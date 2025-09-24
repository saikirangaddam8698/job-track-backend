import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "resume") {
      cb(null, path.join(__dirname, "../../uploads/resume"));
    } else if (file.fieldname === "picture") {
      cb(null, path.join(__dirname, "../../uploads/picture"));
    } else {
      cb(new Error("Invalid file field"), "");
    }
  },
  filename: (req, file, cb) => {
    // preserve extension
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + ext);

    const finalName = uniqueName + ext;

    console.log(`[Multer] Saving file:`, finalName);
    cb(null, finalName);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === "resume") {
    const allowedDocs = [".pdf", ".doc", ".docx"];
    if (allowedDocs.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only .pdf, .doc, and .docx files are allowed for resume!"));
    }
  } else if (file.fieldname === "picture") {
    const allowedImages = [".jpg", ".jpeg", ".png"];
    if (allowedImages.includes(ext)) {
      cb(null, true);
    } else {
      cb(
        new Error("Only .jpg, .jpeg, and .png files are allowed for picture!")
      );
    }
  } else {
    cb(new Error("Invalid file field"));
  }
};

export const upload = multer({ storage, fileFilter });
