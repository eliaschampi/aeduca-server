import fileUpload from "express-fileupload";

export default fileUpload({
  limits: { fileSize: 60 * 1024 * 1024 }, // limit to 50mb
  createParentPath: true
});
