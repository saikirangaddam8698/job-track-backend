"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFileToGCS = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const googleCloud_1 = require("../config/googleCloud");
// Use memory storage (files stay in RAM instead of local disk)
const storage = multer_1.default.memoryStorage();
// ✅ File type validation (same as before)
const fileFilter = (req, file, cb) => {
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    if (file.fieldname === "resume") {
        const allowedDocs = [".pdf", ".doc", ".docx"];
        allowedDocs.includes(ext)
            ? cb(null, true)
            : cb(new Error("Only .pdf, .doc, and .docx files allowed for resume!"));
    }
    else if (["picture", "profilePicture"].includes(file.fieldname)) {
        const allowedImages = [".jpg", ".jpeg", ".png"];
        allowedImages.includes(ext)
            ? cb(null, true)
            : cb(new Error("Only .jpg, .jpeg, .png files allowed for picture!"));
    }
    else {
        cb(new Error("Invalid file field"));
    }
};
// ✅ Export Multer middleware (same as before)
exports.upload = (0, multer_1.default)({ storage, fileFilter });
// ✅ Helper function to upload file to Google Cloud Storage
const uploadFileToGCS = async (file, folder) => {
    return new Promise((resolve, reject) => {
        if (!file)
            return reject("No file uploaded");
        // Unique file name for GCS
        const gcsFileName = `${folder}/${Date.now()}-${file.originalname}`;
        const blob = googleCloud_1.bucket.file(gcsFileName);
        const blobStream = blob.createWriteStream({
            resumable: false,
            contentType: file.mimetype,
            predefinedAcl: "publicRead", // make file publicly readable
        });
        blobStream.on("error", (err) => {
            console.error("❌ GCS Upload Error:", err);
            reject(err);
        });
        blobStream.on("finish", () => {
            const publicUrl = `https://storage.googleapis.com/${googleCloud_1.bucket.name}/${gcsFileName}`;
            console.log("✅ File uploaded to GCS:", publicUrl);
            resolve(publicUrl);
        });
        // Write file buffer to GCS
        blobStream.end(file.buffer);
    });
};
exports.uploadFileToGCS = uploadFileToGCS;
