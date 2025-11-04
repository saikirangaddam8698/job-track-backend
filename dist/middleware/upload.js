"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === "resume") {
            cb(null, path_1.default.join(__dirname, "../../uploads/resume"));
        }
        else if (file.fieldname === "picture") {
            cb(null, path_1.default.join(__dirname, "../../uploads/picture"));
        }
        else if (file.fieldname === "profilePicture") {
            cb(null, path_1.default.join(__dirname, "../../uploads/profilePicture"));
        }
        else {
            cb(new Error("Invalid file field"), "");
        }
    },
    filename: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueName + ext);
    },
});
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
exports.upload = (0, multer_1.default)({ storage, fileFilter });
