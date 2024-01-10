import multer from "multer";
import path from "path";

const tempDir = path.resolve("temp");

const multerConfig = multer.diskStorage({
  destination: tempDir,
  filename: (req, file, cb) => {
    // const uniquePrefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    // const fileName = `${uniquePrefix}_${file.originalname}`;
    cb(null, file.originalname);
  },
});

// const limits = {
//   fileSize: 1024 * 1024 * 5;
// }

// const fileFilter = (req, res, cb) => {
//   const extension = req.originalname.split(".").pop();
//   if (extension = "exe") {
//     cb(HttpError(400, ".exe not valid extension"))
//   }
// }

const upload = multer({
  storage: multerConfig,
  // limits,
  // fileFilter,
});

export default upload;
