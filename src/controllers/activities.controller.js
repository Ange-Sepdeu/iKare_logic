import Activities from "../models/Activities.js";
import crypto from 'crypto';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { cwd } from "process";
import Joi from "joi";
import jwt from "jsonwebtoken";



export const getActivities = async (req, res) => {
  try {
    const activities = await Activities.find();
    return res.status(200).json(activities);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
export const createActivity = async (req, res) => {
  let user = {}
  try {
    let token = req.body.token
    const decoded_user_payload = jwt.verify(token, process.env.JWT_TOKEN_KEY);
    user.name = decoded_user_payload.name
    user.id = decoded_user_payload.id
  } catch (err) {
    return res.status(410).json({ message: "Login To continue" });
  }
  try {
    const activitys = {
      en: req.body.en,
      fr: req.body.fr,
      dateOfevent: req.body.dateOfevent
    };
    const { en, fr, dateOfevent, } = req.body;
    const activityLanguageSchema = Joi.object({
      title: Joi.string().required(),
      article: Joi.string().required(),
      summary: Joi.string().required(),
    })
    console.log(user)
    const activitySchema = Joi.object({
      en: activityLanguageSchema.required(),
      fr: activityLanguageSchema.required(),
      dateOfevent: Joi.date().required(),
    })
    const { error } = activitySchema.validate(activitys);
    if (error) {
      return res.status(400).json({ message: "fill all activity" });
    }
    // Check if an activity with the same title exists
    const existingActivity = await Activities.findOne({
      '$and': [{
        'en.title': en.title,
      }, {
        'fr.title': fr.title,
      }],
    });

    if (existingActivity != null) {
      console.log('The activity already exists.');
      return res.status(400).json({ message: "An activity with this title already exists" });
    } else {
      console.log('The activity not  exists.');
    }

    let approved = []
    approved.push(user)
    const activity = new Activities({
      en,
      fr,
      dateOfevent,
      approved
    });
    console.log(approved);
    console.log(activity);
    await activity.save();
    return res.status(201).json({
      message: "New Activity Created",
      newActivity: activity
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const publishActivity=async(req ,res)=>{
  try{
    let {id ,publish} = req.body
    Activities.findByIdAndUpdate({_id:id} ,{publish:!publish} ,{new:true})
    .then(respond => {
      console.log(respond)
      return res.status(200).json({message:"activity published successfully"})
    })
    .catch(e => {
      console.log(e)
    })
  }
  catch(e){

  }
}

// export const getActivityById = async (req, res) => {
//     const { id } = req.params;

//     try {
//       const activity = await Activities.findById(id);
//       if (!activity) return res.status(404).json({ message: 'Activity not found' });
//       return res.status(200).json(activity);
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({ message: 'Server error' });
//     }
// };

export const updateActivity = async (req, res) => {

  // const { id } = req.params;
  try {
    let id = req.body.id
    console.log(id)
    // const activity = await Activities.findById(id);
    // if (!activity) return res.status(404).json({ message: 'Activity not found' });

    const update = req.body;
    delete update.id
    console.log("The body of the request", update)

    // if (update.title) {
    //   const existingActivity = await Activities.findOne({ title: update.title });
    //   if (existingActivity && existingActivity._id.toString() !== id) {
    //     return res.status(400).json({ message: "An activity with this title already exists" });
    //   }
    // }

    let actualUpdate = {}

    if (update.en) {
      if (update.en.title) {
        actualUpdate = { ...actualUpdate, 'en.title': update.en.title }
      }
      if (update.en.article) {
        actualUpdate = { ...actualUpdate, 'en.article': update.en.article }
      }
      if (update.en.summary) {
        actualUpdate = { ...actualUpdate, 'en.summary': update.en.summary }
      }
    }

    if (update.fr) {
      if (update.fr.title) {
        actualUpdate = { ...actualUpdate, 'fr.title': update.fr.title }
      }
      if (update.fr.article) {
        actualUpdate = { ...actualUpdate, 'fr.article': update.fr.article }
      }
      if (update.fr.summary) {
        actualUpdate = { ...actualUpdate, 'fr.summary': update.fr.summary }
      }
    }

    if (update.remove) {
      for (let i = 0; i < update.remove.length; i++) {
        await Activities.findByIdAndUpdate(id, { $pull: { images: update.remove[i] } }, { new: true })
          .then(respond => console.log(respond))
          .catch(err => console.log(err))

        //to delete the images
        let exist = fs.existsSync(path.join(cwd(), 'Activities', 'thumbnails', `${id}`, `${update.remove[i]}`))
        console.log(exist)
        if (exist) {
          await fs.unlinkSync(path.join(cwd(), 'Activities', 'thumbnails', `${id}`, `${update.remove[i]}`))
        } else {
          console.log("image alresdy deleted")
        }
        // console.log('File deleted successfully');
      }


    }

    console.log(actualUpdate)

    const updatedActivity = await Activities.findByIdAndUpdate(id, { $set: actualUpdate, $push: { approved: id } }, { new: true })
      .then(respond => console.log("Respond of the find and update", respond))
      .catch(err => console.log(err))
    return res.status(200).json(updatedActivity);


  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};


export const deleteActivity = async (req, res) => {
  const { id } = req.params;

  try {
    // const activity = await Activities.findById(id);
    // if (!activity) return res.status(404).json({ message: 'Activity not found' });

    await Activities.findByIdAndDelete(id);
    return res.status(200).json({ message: 'Activity deleted Successfuly' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const searchActivities = (req, res) => {
  const query = req.query.q;
  const filter = req.query.filter;
  console.log(query)
  Activities.find({
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { dateOfevent: filter }
    ]
  })
    .then(activities => res.json(activities))
    .catch(err => res.status(500).json(err));
};

export const listActivities = (req, res) => {
  const sortField = req.query.sort || 'dateOfevent';
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  Activities.find()
    .sort({ [sortField]: 1 })
    .limit(limit)
    .skip((page - 1) * limit)
    .then(activities => res.json(activities))
    .catch(err => res.status(500).json(err));
};

export const getActivityWithAssociations = (req, res) => {
  Activities.findById(req.params.id)
    .populate('organizers') // Example field
    .then(activity => res.json(activity))
    .catch(err => res.status(500).json(err));
};

export const getActivityAnalytics = (req, res) => {
  // Example: count activities by category
  Activities.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } }
  ])
    .then(report => res.json(report))
    .catch(err => res.status(500).json(err));
};

export const addCommentToActivity = (req, res) => {
  const activityId = req.params.id;
  const comment = req.body.comment;

  Activities.findByIdAndUpdate(activityId, { $push: { comments: comment } })
    .then(() => res.json({ message: 'Comment added' }))
    .catch(err => res.status(500).json(err));
};


export const uploadActivityImage = async (req, res) => {
  const activityId = req.params.id;
  let imageFiles = req.files.images; // Assuming 'images' is the fieldname for the files
  console.log(imageFiles);
  console.log(imageFiles);
  console.log(imageFiles);

  try {
    const activity = await Activities.findOne({ _id: activityId });
    console.log('Activity found:', activity);


    if (!imageFiles) {
      return res.status(400).send('No files were uploaded.');
    }

    const currentDir = process.cwd();
    const uploadDir = path.join(currentDir, 'Activities', 'images', `${activity._id}`);
    const thumbnailDir = path.join(currentDir, 'Activities', 'thumbnails', `${activity._id}`);
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
      activity.images.push(file.name);
    }

    // Update the activity in the database
    await activity.save();

    res.status(200).send({ message: 'Images uploaded, thumbnails created and image names saved to the DB successfully.' });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: 'An error occurred while processing images.' });
  }
};

export const canEditActivity = (req, res, next) => {
  const activityId = req.params.id;
  const userId = req.user.id; // Assuming user is authenticated

  Activities.findById(activityId)
    .then(activity => {
      if (activity.createdBy === userId) {
        next();
      } else {
        res.status(403).json({ message: 'Forbidden' });
      }
    })
    .catch(err => res.status(500).json(err));
};


export const translateActivity = (req, res, next) => {
  let activityId = req.body.id
  let translate = req.body.translate
  console.log(req.body)
  return
  Activities.findById({ _id: activityId })
    .then(activity => {
      activity.changeLanguage = translate
      activity.save()
        .then(res => console.log(res))
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))

  // return res.status(200).json({message:"activity translated"})
}