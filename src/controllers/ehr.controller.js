import * as userService from "../services/user.service.js";
import __dirname from "../../helper.js";
import fs from "fs"
import {uploadFile} from "../utils/saveFile.js"

export const addEhr = async (req, res) => {
    try {
        const {user, length, platform} = req.body;
        const userObject = await userService.getUserById(JSON.parse(user)?._id);
        const relativePath = "/src/uploads/"+userObject?._id+"/ehr/"
        const uploadsDir = __dirname+relativePath;
        const documents = []
        if (platform === "web")
        {
            const files = req.files
            for (var i=0; i<Number(length);i++) {
            const fileUploadPath = uploadsDir+files[`file${i}`].name
            documents.push(relativePath+files[`file${i}`].name)
            const uploaded= uploadFile(files[`file${i}`], fileUploadPath, uploadsDir)
            }
        }
        else {
            if (!req.body.type) {
                const {base64} = req.body;
                if (!fs.existsSync(uploadsDir))
                    fs.mkdirSync(uploadsDir, {recursive:true})
                // for (let i=0; i<baseArray.length;i++) {
                    const fileUploadPath = uploadsDir+new Date().getTime()+"."+req.body.extension
                    documents.push(relativePath+new Date().getTime()+"."+req.body.extension)
                    fs.writeFileSync(fileUploadPath, base64, {encoding:"base64"})
                // }
            }
            else {
                const docs = req.body.documents
                const documentsArray = JSON.parse(docs)
                if (!fs.existsSync(uploadsDir))
                    fs.mkdirSync(uploadsDir, {recursive:true})
                for (let i=0;i<documentsArray?.length; i++) {
                    const fileUploadPath = uploadsDir+documentsArray[i].name
                    documents.push(relativePath+documentsArray[i].name)
                    fs.writeFileSync(fileUploadPath, documentsArray[i].base64, {encoding:"base64"})
                }
            }
        }
        userObject.ehr.push({
            details: "Personal Electronic Health record",
            lab: "",
            doctor: "",
            documents
        })
        userObject.save()
        return res.status(200).json({message: "Ehr uploaded successfully !"})
    }catch(error) {
        console.log(error)
        return res.json({message: error}).status(500)
    }
}