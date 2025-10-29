import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "resume") {
      cb(null, path.join(__dirname, "../../uploads/resume"));
    } else if (file.fieldname === "picture") {
      cb(null, path.join(__dirname, "../../uploads/picture"));
    } else if (file.fieldname === "profilePicture") {
      cb(null, path.join(__dirname, "../../uploads/profilePicture"));
    } else {
      cb(new Error("Invalid file field"), "");
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + ext);
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
    allowedDocs.includes(ext)
      ? cb(null, true)
      : cb(new Error("Only .pdf, .doc, and .docx files allowed for resume!"));
  } else if (["picture", "profilePicture"].includes(file.fieldname)) {
    const allowedImages = [".jpg", ".jpeg", ".png"];
    allowedImages.includes(ext)
      ? cb(null, true)
      : cb(new Error("Only .jpg, .jpeg, .png files allowed for picture!"));
  } else {
    cb(new Error("Invalid file field"));
  }
};

export const upload = multer({ storage, fileFilter });
