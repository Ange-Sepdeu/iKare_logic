import fs from "fs"

export const uploadFile = (file_to_upload,path_to_file,uploadDir) =>{
    var size = 5*1024*1024;
    var uploaded = true;
if (file_to_upload.mimetype.includes("video"))
    size = 10*1024*1024;
if (!fs.existsSync(uploadDir))
fs.mkdirSync(uploadDir)
if (file_to_upload.size > size)
 uploaded = false;
else
file_to_upload.mv(path_to_file)
return uploaded
}