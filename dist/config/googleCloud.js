"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bucket = exports.storage = void 0;
const storage_1 = require("@google-cloud/storage");
const storage = new storage_1.Storage({
    projectId: process.env.GOOGLE_PROJECT_ID,
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
});
exports.storage = storage;
const bucket = storage.bucket(process.env.GOOGLE_BUCKET_NAME);
exports.bucket = bucket;
