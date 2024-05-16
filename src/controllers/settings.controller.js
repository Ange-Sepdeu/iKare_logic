import mongoose from 'mongoose';
import Settings from '../models/Settings.js'
import path from 'path'
import fs from 'fs'
import sharp from 'sharp'
import { cwd } from "process";
import Joi from '@hapi/joi';
import moment from 'moment';

const mySettings = Settings
// Session
export const getAllSession = async (req, res) => {

  try {
    const setting = await Settings.findOne({});

    return res.status(200).json({
      session: setting.concourSession,
      message: 'List all Sessions'
    })
  } catch (error) {
    res.status(500).send({ message: 'Server error.' });
  }
};
export const getAllActiveSession = async (req, res) => {

  try {
    const setting = await Settings.findOne({});
    if (!setting || !setting.concourSession) {
      throw new Error("Settings or permissions not found");
    }
    // Filtering the permissions array to only return those permissions where status is true.
    const activeAllSessions = setting.concourSession.filter(concourSession => concourSession.status === true);
    const NoPublishedSession = activeAllSessions.filter(concourSession => concourSession.published === false);
    // const activeSessions= activeAllSessions.map(permission => permission.name);
    return res.status(200).json({
      session: NoPublishedSession,
      message: 'All active Sessions'
    })
  } catch (error) {
    res.status(500).send({ message: 'Server error.' });
  }
};

export const getSessionByDate = async (req, res) => {
  try {
    let dateOfConcour = req.body.dateOfConcour || req.params.dateOfConcour
    const setting = await Settings.findOne({});
    const sessionByDate = setting.concourSession.filter((option) => moment(option.dateOfConcour).format('D MMMM yyyy') === moment(dateOfConcour).format('D MMMM yyyy'))[0]
    return res.status(200).json({
      session: sessionByDate,
      message: 'Sessions By Date'
    })
  } catch (error) {
    res.status(500).send({ message: 'Server error.' });
  }
};
export const createSession = async (req, res) => {
  try {
    let session = req.body;
    const sessionSchema = Joi.object({
      dateOfConcour: Joi.date().required(),
      beginRegistration: Joi.date().required(),
      endRegistration: Joi.date().required(),
      field: Joi.array().required(),
      level: Joi.array().required(),
      subject: Joi.array().required(),
      totalAmount: Joi.number().required(),
      center: Joi.array().required(),
      concourRequirements: Joi.array().required(),
    });
    const { error } = sessionSchema.validate(session);
    if (error) {
      return res.status(409).send("Fill all the Values");
    }
    let newSession = {
      sessionName: moment(session.dateOfConcour).format('D MMMM'),
      field: session.field,
      level: session.level,
      dateOfConcour: new Date(session.dateOfConcour),
      writingDate: new Date(session.dateOfConcour),
      center: session.center,
      passed: false,
      totalAmount: session.totalAmount,
      beginRegistration: new Date(session.beginRegistration),
      endRegistration: new Date(session.endRegistration),
      concourRequirements: session.concourRequirements,
      status: true,
      passedMark: 10,
      subject: session.subject,
      published: false,
      submitted: false

    };
    Settings.findOne({})
      .then(result => {
        let concourExisting = result.concourSession.filter((option) => moment(option.dateOfConcour).format('D MMMM yyyy') === moment(newSession.dateOfConcour).format('D MMMM yyyy'))
        if (concourExisting.length > 0)
          return res.status(408).json("A Concour Session with this date already exists");

        result.concourSession.push(newSession);
        result.save()
          .then(result => {
            return res.status(200).json({ message: "Concour Session Created Successfully" });
          })
          .catch(err => {
            return res.status(404).send("An error occur while creating concour sesion please check you data connection an try later");
          });
      })
  } catch (err) {
    return res.status(405).send("An error occur while creating concour sesion please check you data connection an try later");
  }
};
export const deleteSession = async (req, res) => {
  try {
    let date = new Date(req.body.date)
    Settings.updateOne(
      { 'concourSession.dateOfConcour': date },
      { $pull: { 'concourSession': { dateOfConcour: date } } }
    )
      .then(result => {
        if (result.modifiedCount === 0)
          return res.status(409).send('No Concour Session on this date');
        else
          return res.status(200).json({ message: `Concour Session with ${moment(date).format('D MMMM YYYY')} Deleted Successfully` });
      })
      .catch(err => {
        return res.status(502).send('an error check you data connection and try later.');
      });
  } catch (error) {
    return res.status(500).send('an error check you data connection and try later.');
  }
}
export const updateSession = async (req, res) => {
  try {
    let date = new Date(req.body.dateOfConcour)
    const sessionSchema = Joi.object({
      sessionName: Joi.string().required(),
      field: Joi.array().required(),
      level: Joi.array().required(),
      dateOfConcour: Joi.date().required(),
      center: Joi.array().required(),
      passed: Joi.boolean().required(),
      totalAmount: Joi.required(),
      beginRegistration: Joi.date().required(),
      endRegistration: Joi.date().required(),
      concourRequirements: Joi.array().required(),
      status: Joi.boolean().required(),
      passedMark: Joi.number().required(),
      subject: Joi.array().required(),
      published: Joi.boolean().required(),
      submitted: Joi.boolean().required(),
    })
    const { error } = sessionSchema.validate(req.body)
    if (error)
      return res.status(409).send("Fill all the Values")
    Settings.updateOne(
      { 'concourSession.dateOfConcour': date },
      {
        $set: {
          'concourSession.$.sessionName': req.body.sessionName,
          'concourSession.$.field': req.body.field,
          'concourSession.$.level': req.body.level,
          'concourSession.$.dateOfConcour': req.body.dateOfConcour,
          'concourSession.$.center': req.body.center,
          'concourSession.$.passed': req.body.passed,
          'concourSession.$.totalAmount': req.body.totalAmount,
          'concourSession.$.beginRegistration': req.body.beginRegistration,
          'concourSession.$.endRegistration': req.body.endRegistration,
          'concourSession.$.concourRequirements': req.body.concourRequirements,
          'concourSession.$.status': req.body.status,
          'concourSession.$.passedMark': req.body.passedMark,
          'concourSession.$.subject': req.body.subject,
          'concourSession.$.published': req.body.published,
          'concourSession.$.submitted': req.body.submitted,

        }
      }
    )
      .then(result => {
        if (result.modifiedCount === 0 || result.acknowledged != true) {
          return res.status(200).json("Concour Session Up to Date");
        }
        return res.status(200).json("Concour Session Updated Successfully");
      })
      .catch(err => {
        return res.status(500).send({ message: 'Server error.' });
      });

  } catch (error) {
    return res.status(500).send({ message: 'Server error.' });
  }
}

//level
export const getAllLevel = async (req, res) => {
  try {
    await Settings.findOne()
      .then(setting => {
        return res.status(200).json(setting.level)
      })
      .catch(err => {
        return res.status(500).json({ error: "Server Error" })
      })
  } catch (error) {
    res.status(500).send({ message: 'Server error.' });
  }
}
export const createLevel = async (req, res) => {
  try {
    let name = req.body.name
    await Settings.findOne()
      .then(result => {
        if (result) {
          // Check if the Level already exists
          const levelExisting = result.level.filter(opt => opt.name.toLowerCase() === name.toLowerCase())
          if (levelExisting.length > 0)
            return res.status(400).json({ error: `Level already exists` });
          result.level.push({
            name: name,
          });
          result.save()
            .then(result => {
              return res.status(200).json({ message: `Level Created Succesfully` });
            })
            .catch(err => {
              return res.status(404).json({ error: "check you data connection and try later" });
            });
        } else {
          return res.status(404).json({ error: "check you data connection and try later" });
        }
      })
      .catch(err => {
        return res.status(404).json({ error: "check you data connection and try later" });
      });
  } catch (error) {
    res.status(500).send({ error: 'check you data connection and try later.' });
  }
}
export const deleteLevel = async (req, res) => {
  try {
    const name = req.body.name
    Settings.updateOne(
      { 'level.name': name },
      { $pull: { 'level': { name: name } } }
    )
      .then(result => {
        if (result.modifiedCount === 0)
          return res.status(500).send({ error: 'No Level with this name' });
        else
          return res.status(200).json({ message: "Level Deleted Successfully" });
      })
      .catch(err => {
        return res.status(500).send({ error: 'check you data connection and try later.' });
      });
  }
  catch (error) {
    res.status(500).send({ message: 'Server error.' });
  }
}

//centers
export const getAllCenter = async (req, res) => {
  try {
    await Settings.findOne()
      .then(setting => {
        return res.status(200).json(setting.center)
      })
      .catch(err => {
        return res.status(500).json({ error: "Server Error" })
      })
  } catch (error) {
    res.status(500).send({ message: 'Server error.' });
  }
}
export const createCenter = async (req, res) => {
  try {
    let tel = req.body.phone.split(',')
    let email = req.body.email.split(',')
    // console.log("center", req.body)
    let newCenter = {
      centerName: req.body.centerName,
      centerHead: req.body.centerHead,
      Desc: req.body.Desc,
      phone: tel,
      email: email,
      position: req.body.position,
    }
    const centerSchema = Joi.object({
      centerName: Joi.string().required(),
      centerHead: Joi.string().required(),
      Desc: Joi.string().required(),
      phone: Joi.array().required(),
      email: Joi.array().required(),
      position: Joi.object().required(),
    });
    // console.log("center2", newCenter)
    const { error } = centerSchema.validate(newCenter);
    if (error)
      return res.status(400).send({ error: "Please filled all value in the form" });
    Settings.findOne()
      .then(result => {
        const centerExisting = result.center.filter(opt => opt.centerName.toLowerCase() === newCenter.centerName.toLowerCase())
        if (centerExisting.length > 0)
          return res.status(400).json({ error: `Center already exists` });
        result.center.push(newCenter)
        result.save()
          .then(result => {
            let createdCenter = result.center.map(center => {
              if (center.centerHead == newCenter.centerHead && center.centerName == newCenter.centerName) {
                return center
              }
            })
            return res.status(200).json({ message: "New Center Created", newCenter: createdCenter[createdCenter.length - 1] })
          })
          .catch(err => {
            return res.status(404).json({ message: "Error Center not created" })
          })
      })
      .catch(err => {
        return res.status(404).json({ error: "Settings not found" })
      })
  } catch (error) {
    res.status(500).send({ message: 'Server error.' });
  }

}
export const deleteCenter = async (req, res) => {
  try {
    let id = new mongoose.Types.ObjectId(req.body.id);
    Settings.findOneAndUpdate(
      { 'center._id': id },
      { $pull: { 'center': { _id: id } } },
      { new: true }
    )
      .then(result => {
        // return
        if (result.modifiedCount === 0) {
          return res.status(500).send({ message: 'Invalid centerId Provided' });
        }

        return res.status(200).json({ message: "Center Deleted Successfully", centers: result.center });
      })
      .catch(err => {
        res.status(500).send({ message: 'Center Deleting failed' });
      });
  }
  catch (error) {
    res.status(500).send({ message: 'Server error.' });
  }
}
export const updateCenter = async (req, res) => {
  let id = req.body.id
  let update = req.body
  delete update.id
  update._id = new mongoose.Types.ObjectId(id)
  if (update.remove) {
    for (let i = 0; i < update.remove.length; i++) {
      //  await Settings.findByIdAndUpdate({'center._id':new mongoose.Types.ObjectId(id)}, {$pull:{'center':{centerImage:update.remove[i]}}}, { new: true })
      await Settings.findOne()
        .then(async (setting) => {
          let newCenters = setting.center.map(center => {
            if (center._id == id) {
              center.centerImage.pull(update.remove[i])
            }
            return center
          })
          setting.center = newCenters
          // return
          await setting.save()
            .then(respond => {
            })
            .catch(err => cosole.log(err))
        })

      //to delete the images
      let exist = fs.existsSync(path.join(cwd(), 'Center', 'thumbnails', `${id}`, `${update.remove[i]}`))
      if (exist) {
        await fs.unlinkSync(path.join(cwd(), 'Center', 'thumbnails', `${id}`, `${update.remove[i]}`))
      } else {
      }
    }
  }

  Settings.findOne()
    .then(setting => {
      let newCenters = []
      newCenters = setting.center.map(center => {
        if (center._id == id) {
          update.centerImage = center.centerImage
          center = update
        }
        return center
      })
      setting.center = newCenters
      setting.save()
        .then(respond => {
          return res.status(200).json({ message: "Update Successfull" })
        })
        .catch(err => {
          return res.status(500).json({ error: "Error Occurred while updating the center" })
        })

    })
    .catch(err => {
      return res.status(500).json({ error: "Server Error" })
    })
}
export const uploadCenterImage = async (req, res) => {
  const centerId = req.params.id;
  let imageFiles = req.files.images; // Assuming 'images' is the fieldname for the files

  try {
    const setting = await Settings.findOne();

    if (!imageFiles) {
      return res.status(400).send('No files were uploaded.');
    }

    const currentDir = process.cwd();
    const uploadDir = path.join(currentDir, 'Center', 'images', `${centerId}`);
    const thumbnailDir = path.join(currentDir, 'Center', 'thumbnails', `${centerId}`);
    fs.mkdirSync(uploadDir, { recursive: true });
    fs.mkdirSync(thumbnailDir, { recursive: true });

    // Ensure 'imageFiles' is always an array
    if (!Array.isArray(imageFiles)) {
      imageFiles = [imageFiles];
    }

    // Handle each uploaded file
    for (const file of imageFiles) {
      if (!file.mimetype.startsWith('image/')) {
        return res.status(400).send('Invalid file type. Only image files are allowed.');
      }

      // Move the original file
      const uploadPath = path.join(uploadDir, file.name);
      await file.mv(uploadPath);

      // Generate and save the thumbnail
      const thumbnailPath = path.join(thumbnailDir, file.name);
      await sharp(uploadPath)
        .resize(480) // You can set the desired size
        .toFile(thumbnailPath);

      // Save image name to DB
      setting.center.map(center => {
        if (center._id == centerId) {
          center.centerImage.push(file.name)
        }
      })
      // setting.center.push(file.name);
    }

    // Update the center in the database
    await setting.save()

    res.status(200).send({ message: 'Images uploaded, thumbnails created and image names saved to the DB successfully.' });
  } catch (error) {
    return res.status(500).send({ error: 'An error occurred while processing images.' });
  }
};

// field of study
export const getAllFieldOfStudy = async (req, res) => {
  try {
    await Settings.findOne()
      .then(setting => {
        return res.status(200).json(setting.fieldOfStudy)
      })
      .catch(err => {
        return res.status(500).json({ error: "Server Error" })
      })
  } catch (error) {
    res.status(500).send({ message: 'Server error.' });
  }
}
export const createFieldOfStudy = async (req, res) => {
  let name = req.body.name;
  try {
    await Settings.findOne()
      .then(result => {
        if (result) {
          // Check if the Level already exists
          const fieldExisting = result.fieldOfStudy.filter(opt => opt.name.toLowerCase() === name.toLowerCase())
          if (fieldExisting.length > 0)
            return res.status(400).json({ error: `field of Study already exists` });
          result.fieldOfStudy.push({
            name: name,
          });
          result.save()
            .then(result => {
              return res.status(200).json({ message: `field of Study Created Succesfully` });
            })
            .catch(err => {
              return res.status(404).json({ error: "check you data connection and try later" });
            });
        } else {
          return res.status(404).json({ error: "check you data connection and try later" });
        }
      })
      .catch(err => {
        return res.status(404).json({ error: "check you data connection and try later" });
      });
  } catch (error) {
    res.status(500).send({ message: 'Server error.' });
  }
};
export const deleteFieldOfStudy = async (req, res) => {
  try {
    let name = req.body.name
    Settings.updateOne(
      { 'fieldOfStudy.name': name },
      { $pull: { 'fieldOfStudy': { name: name } } }
    )
      .then(result => {
        if (result.modifiedCount === 0)
          return res.status(500).send({ error: 'No field of Study with this name' });
        else
          return res.status(200).json({ message: "field of Study Deleted Successfully" });
      })
      .catch(err => {
        return res.status(500).send({ error: 'check you data connection and try later.' });
      });
  }
  catch (error) {
    res.status(500).send({ error: 'check you data connection and try later.' });
  }
}

//concour requirement
export const getAllConcourRequirement = async (req, res) => {
  try {
    await Settings.findOne()
      .then(setting => {
        return res.status(200).json(setting.concourRequirements)
      })
      .catch(err => {
        return res.status(500).json({ error: "Server Error" })
      })
  } catch (error) {
    res.status(500).send({ message: 'Server error.' });
  }
}
export const createConcourRequirement = async (req, res) => {
  try {
    let requirement = req.body
    const status = requirement.status;
    const name = requirement.name;
    Settings.findOne()
      .then(result => {
        if (result) {
          // Check if the requirement already exists
          const concourExisting = result.concourRequirements.filter(opt => opt.name.toLowerCase() === name.toLowerCase())
          if (concourExisting.length > 0)
            return res.status(400).json({ error: `Requirement already exists` });
          result.concourRequirements.push({
            name: name,
            status: status
          });
          result.save()
            .then(result => {
              return res.status(200).json({ message: `Requirement Created Succesfully` });
            })
            .catch(err => {
              return res.status(404).json({ error: "check you data connection and try later" });
            });
        } else {
          return res.status(404).json({ error: "check you data connection and try later" });
        }
      })
      .catch(err => {
        return res.status(404).json({ error: "check you data connection and try later" });
      });
  } catch (error) {
    res.status(500).send({ error: 'check you data connection and try later.' });
  }
}
export const deleteConcourRequirement = async (req, res) => {
  try {
    let name = req.body.name || req.params.name
    await Settings.updateOne(
      { 'concourRequirements.name': name },
      { $pull: { 'concourRequirements': { name: name } } }
    )
      .then(result => {
        if (result.modifiedCount === 0)
          return res.status(500).send({ error: 'No Requirements with this name' });
        else
          return res.status(200).json({ message: "concour Requirements Deleted Successfully" });
      })
      .catch(err => {
        return res.status(500).send({ error: 'check you data connection and try later.' });
      });
  }
  catch (error) {
    return res.status(500).send({ error: 'check you data connection and try later.' });
  }
}

//Coucour subject
export const getAllConcourSubjects = async (req, res) => {
  try {
    await Settings.findOne()
      .then(setting => {
        return res.status(200).json(setting.concourSubjects)
      })
      .catch(err => {
        return res.status(500).json({ error: "Server Error" })
      })
  } catch (error) {
    res.status(500).send({ error: 'Server error.' });
  }
}
export const createConcourSubjects = async (req, res) => {
  try {
    // console.log(req.body)
    const moduleSchema = Joi.object({
      moduleName: Joi.string().required(),
      moduleCoeficient: Joi.number().required(),
      moduleTotalMark: Joi.number().required(),
    })
    const SubjectsSchema = Joi.array().items(Joi.object({
      subjectName: Joi.string().required(),
      subjectCoeficient: Joi.number().required(),
      subjectTotalMark: Joi.number().required(),
      subjectMark: Joi.object().required()
    }));
    if (SubjectsSchema.validate(req.body.subjects).error || moduleSchema.validate(req.body.data).error) {
      console.log(SubjectsSchema.validate(req.body.subjects).error);
      console.log(moduleSchema.validate(req.body.data).error);
      return res.status(400).send({ error: 'Fill all the infomation' })
    }
    const concourSubjects = {
      moduleName: req.body.data.moduleName,
      moduleCoeficient: req.body.data.moduleCoeficient,
      moduleTotalMark: req.body.data.moduleTotalMark,
      subjects: req.body.subjects
    }
    console.log(concourSubjects)
    await Settings.findOne()
      .then(setting => {
        const concourExisting = setting.concourSubjects.filter(opt => opt.moduleName.toLowerCase() === concourSubjects.moduleName.toLowerCase())
        if (concourExisting.length > 0)
          return res.status(400).send({ error: 'The already Exist a module with this name' })
        setting.concourSubjects.push(concourSubjects)
        setting.save()
          .then(result => {
            return res.status(200).json({ message: "Concour Subject Create succesfully" })
          })
          .catch(err => {
            console.log(err)
            return res.status(500).json({ error: "check you data connection and try later" })
          })
      })
      .catch(err => {
        console.log(err)
        return res.status(500).json({ error: "check you data connection and try later" })
      })
  } catch (error) {
    console.log(error)
    res.status(500).send({ error: 'check you data connection and try later.' });
  }
}
export const updateConcourSubjects = async (req, res) => {
  try {
    const moduleSchema = Joi.object({
      moduleName: Joi.string().required(),
      moduleCoeficient: Joi.number().required(),
      moduleTotalMark: Joi.number().required(),
      status: Joi.boolean().required(),
    })
    const SubjectsSchema = Joi.array().items(Joi.object({
      subjectName: Joi.string().required(),
      subjectCoeficient: Joi.number().required(),
      subjectTotalMark: Joi.number().required(),
      subjectStatus: Joi.boolean().allow(''),
      subjectMark: Joi.object().required(),
    }));
    if (SubjectsSchema.validate(req.body.subjects).error || moduleSchema.validate(req.body.data).error) {
      return res.status(400).send({ error: 'Fill all the infomation' })
    }
    const concourSubjects = {
      moduleName: req.body.data.moduleName,
      moduleCoeficient: req.body.data.moduleCoeficient,
      moduleTotalMark: req.body.data.moduleTotalMark,
      subjects: req.body.subjects,
      status: req.body.data.status
    }
    await Settings.updateOne(
      { 'concourSubjects.moduleName': concourSubjects.moduleName },
      {
        $set: {
          'concourSubjects.$.moduleName': concourSubjects.moduleName,
          'concourSubjects.$.moduleCoeficient': concourSubjects.moduleCoeficient,
          'concourSubjects.$.moduleTotalMark': concourSubjects.moduleTotalMark,
          'concourSubjects.$.status': concourSubjects.status,
          'concourSubjects.$.subjects': concourSubjects.subjects,
        }
      }
    )
      .then(result => {
        if (result.modifiedCount === 0 || result.acknowledged != true) {
          return res.status(200).json({ message: 'concour Subjects with name ' + concourSubjects.subjectName + ' up to date' });
        }
        return res.status(200).json({ message: "concour Subjects Updated Successfully" });
      })
      .catch(err => {
        console.log("err")
        console.log(err)
        return res.status(500).json({ error: "check you data connection and try later" })
      })
  } catch (error) {
    console.log("error")
    console.log(error)
    res.status(500).send({ error: 'check you data connection and try later.' });
  }
}
export const deleteConcourSubjects = async (req, res) => {
  let subjectName = req.body.subjectName || req.params.name
  try {
    await Settings.updateOne(
      { 'concourSubjects.moduleName': subjectName },
      { $pull: { 'concourSubjects': { moduleName: subjectName } } }
    )
      .then(result => {
        if (result.modifiedCount === 0) {
          return res.status(500).send({ message: 'No concour Module Created with name ' + subjectName });
        }
        return res.status(200).json({ message: "concour Module Deleted Successfully" });
      })
      .catch(err => {
        res.status(500).send({ message: 'check you data connection and try later.' });
      });
  }
  catch (error) {
    res.status(500).send({ message: 'check you data connection and try later.' });
  }
}

// Get all Permission
export const getAllPermission = async (req, res) => {

  try {
    const permission = await Settings.findOne({});

    // console.log(permission.permissions);

    return res.status(200).json({
      permissions: permission.permissions,
      message: 'List all permissions'
    })
  } catch (error) {
    res.status(500).send({ message: 'Server error.' });
  }
};
export const getActivePermission = async (req, res) => {

  try {
    const settings = await Settings.findOne();
    if (!settings || !settings.permissions) {
      throw new Error("Settings or permissions not found");
    }
    // Filtering the permissions array to only return those permissions where status is true.
    const activePermissions = settings.permissions.filter(permission => permission.status === true);
    const permissions = activePermissions.map(permission => permission.name);
    return res.status(200).json({
      permissions: permissions,
      message: 'List all active permissions'
    })
  } catch (error) {
    res.status(500).send({ message: 'Server error.' });
  }
};
export const createPermisssion = async (req, res) => {
  const status = req.body.status;
  const name = req.body.name;
  try {
    Settings.findOne()
      .then(result => {
        if (result) {
          // Check if the permission already exists
          if (result.permissions.some(existingPermission => existingPermission.name === name)) {
            return res.status(400).json({ message: "Permission already exists" });
          }

          result.permissions.push({
            name: name,
            status: status
          });
          result.save()
            .then(result => {
              // return res.status(200).json({ message: "Permissions Created" });
              console.log(result.permissions);
              return res.status(200).json({ message: "Permissions Created", permissions: result.permissions });
            })
            .catch(err => {
              return res.status(404).json({ message: "Error Permissions not created" });
            });
        } else {
          return res.status(404).json({ message: "Settings not found" });
        }
      })
      .catch(err => {
        return res.status(404).json({ error: "Setting not found" });
      });
  } catch (error) {
    res.status(500).send({ message: 'Server error.' });
  }
};
export const deletePermisssion = async (req, res) => {
  try {
    const name = req.body.name
    Settings.updateOne(
      { 'permissions.name': name },
      { $pull: { 'permissions': { name: name } } }
    )
      .then(result => {
        if (result.modifiedCount === 0) {
          return res.status(500).send({ message: 'Sorry Permisssion ' + name + ' Does Not Exist' });
        }
        return res.status(200).json({ message: " Permisssion Successfully deleted" });
      })
      .catch(err => {
        res.status(500).send({ message: 'Level Permisssion failed' });
      });
  }
  catch (error) {
    res.status(500).send({ message: 'Server error.' });
  }
}

//Role
export const getAllRoles = async (req, res) => {

  try {
    const role = await Settings.findOne({});


    return res.status(200).json({
      roles: role.roles,
      message: 'List all Role'
    })
  } catch (error) {
    res.status(500).send({ message: 'Server error.' });
  }
};
export const getActiveRoles = async (req, res) => {

  try {
    const settings = await Settings.findOne({});
    const activeRoles = settings.roles.filter(role => role.status);

    return res.status(200).json({
      roles: activeRoles,
      message: 'List All Active Role'
    })
  } catch (error) {
    res.status(500).send({ message: 'Server error.' });
  }
};
export const createRole = async (req, res) => {
  if (!req.body.name) {
    return res.status(500).send({ message: "Invalid Role Name" });
  }
  if (req.body.permissions === {}) {
    return res.status(500).send({ message: "Invalid Permissions" });
  }
  let role = {
    name: req.body.name,
    permissions: req.body.permissions,
    settings: req.body.settings,
    status: req.body.status
  };
  try {
    Settings.findOne()
      .then(result => {
        if (result) {
          // Check if the role already exists
          if (req.body.edit === true) {
            result.roles = result.roles.map(existingRole => {
              if (existingRole.name.toLowerCase() === role.name.toLowerCase()) {
                return role;
              }
              return existingRole;
            });
          } else {
            if (result.roles.some(existingRole => existingRole.name.toLowerCase() === role.name.toLowerCase())) {
              return res.status(500).send({ message: `Role ${role.name} already exists` });
            }
            result.roles.push(role);
          }
          result.save()
            .then(result => {
              return res.status(200).send({ message: "Role created" });
            })
            .catch(err => {
              return res.status(404).send({ message: "Error role not created" });
            });
        } else {
          return res.status(404).send({ message: "Settings not found" });
        }
      })
      .catch(err => {
        return res.status(404).send({ error: "Setting not found" });
      });
  } catch (error) {
    res.status(500).send({ message: 'Server error.' });
  }
};

//payment request type
export const getAllPaymentRequestType = async (req, res) => {
  try {
    const paymentRequestType = await Settings.findOne({});


    return res.status(200).json({
      paymentRequestType: paymentRequestType.paymentRequestType,
      message: 'List all paymentRequestType'
    })
  } catch (error) {
    res.status(500).send({ message: 'Server error.' });
  }
}
export const createPaymentRequestType = async (req, res) => {
  const paymentRequestTypeSchema = Joi.object({
    type: Joi.string().required(),
    kind: Joi.string().required(),
    year: Joi.string().required(),
    amount: Joi.number().required(),
    penality: Joi.number().required(),
    duration: Joi.number().required(),
    beginPenality: Joi.date().required(),
  });
  const paymentRequestType = {
    type: req.body.type,
    kind: req.body.kind,
    year: req.body.year,
    amount: req.body.amount,
    penality: req.body.penality,
    duration: req.body.duration,
    beginPenality: new Date(req.body.beginPenality)
  }

  const { error } = paymentRequestTypeSchema.validate(paymentRequestType);
  if (error)
    return res.status(500).send(error);
  try {
    const settings = await Settings.findOne({});
    const paymentRequestTypeExisting = settings.paymentRequestType.filter((option) => option.type === paymentRequestType.type);
    if (paymentRequestTypeExisting.length > 0)
      return res.status(400).send({ message: "payment Request Type already exist" });
    settings.paymentRequestType.push(paymentRequestType)
    settings.save()
      .then(() => {
        return res.status(200).json({
          // paymentRequestType: paymentRequestType,
          message: 'paymentRequestType created successfully'
        })
      })
      .catch((err) => {
        return res.send({ message: 'Server error.' })
      })

  } catch (error) {
    res.status(500).send({ message: 'Server error.' });
  }
}
export const updatePaymentRequestType = async (req, res) => {
  const paymentRequestTypeSchema = Joi.object({
    type: Joi.string().required(),
    kind: Joi.string().required(),
    year: Joi.string().required(),
    amount: Joi.number().required(),
    penality: Joi.number().required(),
    duration: Joi.number().required(),
    beginPenality: Joi.date().required(),
  });
  const paymentRequestType = {
    type: req.body.type,
    kind: req.body.kind,
    year: req.body.year,
    amount: req.body.amount,
    penality: req.body.penality,
    duration: req.body.duration,
    beginPenality: new Date(req.body.beginPenality)
  }

  const { error } = paymentRequestTypeSchema.validate(paymentRequestType);
  if (error)
    return res.status(500).send({});
  try {
    Settings.updateOne(
      { 'paymentRequestType.type': paymentRequestType.type },
      {
        $set: {
          'paymentRequestType.$.type': paymentRequestType.type,
          'paymentRequestType.$.kind': paymentRequestType.kind,
          'paymentRequestType.$.year': paymentRequestType.year,
          'paymentRequestType.$.amount': paymentRequestType.amount,
          'paymentRequestType.$.penality': paymentRequestType.penality,
          'paymentRequestType.$.duration': paymentRequestType.duration,
          'paymentRequestType.$.beginPenality': paymentRequestType.beginPenality,
        }
      }
    )
      .then(result => {
        if (result.modifiedCount === 0 || result.acknowledged != true) {
          return res.status(200).json({ message: ' payment Request Type with type ' + paymentRequestType.type + ' up to date' });
        }
        return res.status(200).json({ message: "paymentRequestType Updated Successfully" });
      })
      .catch(err => {
        return res.status(500).send({ message: 'Server error.' });
      });

  } catch (error) {
    res.status(500).send({ message: 'Server error.' });
  }
}
export const deletePaymentRequestType = async (req, res) => {
  let type = req.body.type || req.params.type

  try {
    Settings.updateOne(
      { 'paymentRequestType.type': type },
      { $pull: { 'paymentRequestType': { type: type } } }
    )
      .then(result => {
        if (result.modifiedCount === 0) {
          return res.status(500).send({ message: 'No payment Request Type Created with type ' + type });
        }
        return res.status(200).json({ message: "paymentRequestType Deleted Successfully" });
      })
      .catch(err => {
        res.status(500).send({ message: 'paymentRequestType Deleting failed' });
      });
  }
  catch (error) {
    res.status(500).send({ message: 'Server error.' });
  }
}
export const getAllCitation = async (req, res) => {
  try {
    const setting = await Settings.findOne({});
    return res.status(200).json({
      citation: setting.citations,
      message: 'List all citation'
    })
  } catch (error) {
    res.status(500).send({ message: 'Server error.' });
  }
}
export const createCitation = async (req, res) => {
  try {
    const citationTypeSchema = Joi.object({
      en: Joi.string().required(),
      fr: Joi.string().required(),
    });
    const citations = {
      en: req.body.citationEnglish,
      fr: req.body.citationFrench,
    }

    const { error } = citationTypeSchema.validate(citations);
    if (error)
      return res.status(405).send("fill both english and french");
    const settings = await Settings.findOne({});
    if (!settings.citations) {
      settings.citations = {
        RRCitations: []
      }
    }
    settings.citations.RRCitations.push(citations)
    settings.save()
      .then(() => {
        return res.status(200).json({
          message: 'citation created successfully'
        })
      })
      .catch((err) => {
        console.log(err)
        return res.send({ message: 'Server error.' })
      })

  } catch (error) {
    console.log(error)
    res.status(500).send({ message: 'Server error.' });
  }
}
export const uploadCitationImage = async (req, res) => {
  try {
    let file = req.files.images; // Assuming 'images' is the fieldname for the files
    console.log(file);
    if (!file) {
      return res.status(400).send('No files were uploaded.');
    }
    const currentDir = process.cwd();
    const uploadDir = path.join(currentDir, 'RRImage');
    fs.mkdirSync(uploadDir, { recursive: true });
    if (!file.mimetype.startsWith('image/')) {
      return res.status(400).send('Invalid file type. Only image files are allowed.');
    }
    // Move the original file
    const uploadPath = path.join(uploadDir, file.name);
    await file.mv(uploadPath);
    console.log("Here")
    const settings = await Settings.findOne({});
    if (!settings.citations) {
      settings.citations = {
        RRImages: []
      }
    }
    settings.citations.RRImages.push(file.name)
    console.log(file.name)
    settings.save()
      .then(() => {
        return res.status(200).send({ message: 'Images uploaded successfully.' });
      })
      .catch((err) => {
        console.log(err);
        return res.send({ message: 'Server error.' })
      })
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: 'An error occurred while processing images.' });
  }
};
export const deleteCitation = async (req, res) => {
  try {
    let citation = req.body.citations
    const settings = await Settings.findOne({});
    // settings.citations.RRCitations.push(citation)
    console.log(settings.citations.RRCitations)
    console.log(citation)
    let indexToDelete = -1
    settings.citations.RRCitations.map((item, index) => {
      if (item.en === citation.en && item.fr === citation.fr)
        indexToDelete = index
    })
    console.log(indexToDelete)
    if (indexToDelete !== -1) {
      settings.citations.RRCitations.splice(indexToDelete, 1);
      console.log('Element found and deleted');
    }
    settings.save()
      .then(() => {
        return res.status(200).json({
          message: 'citation deleted successfully'
        })
      })
      .catch((err) => {
        console.log(err)
        return res.send({ message: 'Server error.' })
      })
  }
  catch (error) {
    console.log(error)
    res.status(500).send({ message: 'Server error.' });
  }
}
export const deleteRRImage = async (req, res) => {
  try {
    let image = req.body.image
    const currentDir = process.cwd();
    const uploadDir = path.join(currentDir, 'RRImage', image);
    if (fs.existsSync(uploadDir)) {
      fs.unlinkSync(uploadDir);
      console.log('File deleted successfully');
    } else {
      console.log('File not found');
    }
    const settings = await Settings.findOne({});
    console.log(image)
    let index = settings.citations.RRImages.indexOf(image)
    console.log(index)

    if (index !== -1) {
      settings.citations.RRImages.splice(index, 1);
    }
    settings.save()
      .then(() => {
        return res.status(200).json({
          message: 'image deleted successfully'
        })
      })
      .catch((err) => {
        console.log(err)
        return res.send({ message: 'Server error.' })
      })
  }
  catch (error) {
    console.log(error)
    res.status(500).send({ message: 'Server error.' });
  }
}