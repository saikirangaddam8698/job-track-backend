import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import path from "path";
import { bucket } from "../config/googleCloud";

// 🟢 Use memory storage so files stay in RAM
const storage = multer.memoryStorage();

// ✅ Validate allowed file types
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

// ✅ Export Multer middleware
export const upload = multer({ storage, fileFilter });

// ✅ Upload helper (UBLA-compatible — no ACLs)
export const uploadFileToGCS = async (
  file: Express.Multer.File,
  folder: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file) return reject("No file uploaded");

    // Create unique filename
    const gcsFileName = `${folder}/${Date.now()}-${file.originalname}`;
    const blob = bucket.file(gcsFileName);

    // ⚠️ Removed predefinedAcl — UBLA does not allow ACLs
    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: file.mimetype,
    });

    blobStream.on("error", (err) => {
      console.error("❌ GCS Upload Error:", err);
      reject(err);
    });

    blobStream.on("finish", () => {
      // 🟢 Standard public URL — works since bucket-level access is public
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${gcsFileName}`;
      console.log("✅ File uploaded to GCS:", publicUrl);
      resolve(publicUrl);
    });

    // Write file data to Google Cloud Storage
    blobStream.end(file.buffer);
  });
};
