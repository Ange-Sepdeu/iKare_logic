import CommingEvents from '../models/CommingEvents.js'
import { cwd } from "process";
import path from 'path'
import fs from 'fs'



// Function to get all the up comming events
export const getAllEvents=(req ,res)=>{
    try{

        CommingEvents.find({})
        .then(events => {
            let tempEvents = events.filter(event => event.dateOfEvent > new Date().toISOString().split('T')[0])
        
            // console.log(tempEvents)
            return res.status(200).json({events:tempEvents})
        })
        .catch(e => {
            console.log(e)
        })

    }
    catch(e){
        console.log(e)
        return res.status(500).json({message:'Server error'})
    }
}



// Funtion to create an event
export const createEvent=async(req ,res)=>{
    try{
        let {file ,dateOfEvent ,en ,fr} = req.body

        // console.log(req.body)

        if(file && dateOfEvent && (en || fr)){

            let existingEvent = await CommingEvents.find({file:file ,dateOfEvent:dateOfEvent})
            console.log(existingEvent)
               if(existingEvent.length !== 0){
                return res.status(401).json({message:'Event already exist'})
               }

            let newEvent = new CommingEvents({
                file:file,
                dateOfEvent:dateOfEvent,
                en:en,
                fr:fr,
            })
            newEvent.save()
            .then(respond => {
                return res.status(200).json({message:'Event Created successfully',upload:true})

            })
            .catch(e => {
                console.log(e)
            })
        }
        else{
            return res.status(401).json({error:'please fill the entire form'})
        }

    }
    catch(e){
        console.log(e)
        return res.status(500).json({message:'Server error'})
    }
}

// Fuction to upload the image file of a given activity
export const uploadEventImage = async (req, res) => {
    try {
      let file = req.files.images; // Assuming 'images' is the fieldname for the files
    //   console.log(req.files.images);
      if (!file) {
        return res.status(400).send('No files were uploaded.');
      }
      const currentDir = process.cwd();
      const uploadDir = path.join(currentDir, 'EventsImages');
      fs.mkdirSync(uploadDir, { recursive: true });
      if (!file.mimetype.startsWith('image/')) {
        return res.status(400).send('Invalid file type. Only image files are allowed.');
      }
      // Move the original file
      const uploadPath = path.join(uploadDir, file.name);
      await file.mv(uploadPath)
        return res.status(200).json({message:"event image uploaded successfully"})
    //   console.log("Here")


    } catch (error) {
      console.log(error);
      return res.status(500).send({ error: 'An error occurred while processing images.' });
    }
  };



// Function to update an event
export const updateEvent=async(req ,res)=>{
    try{
        let {id ,file ,dateOfEvent ,en ,fr} = req.body
        let event = await CommingEvents.findById({_id:id})

        if(!event){
            return res.status(401).json({error:'Event not found'})
        }
            
        if(fr){event.fr = fr;}
        if(en){event.en = en;}
        if(dateOfEvent){event.dateOfEvent = dateOfEvent;}
        if(file){event.file = file;}

        event.save()
        .then(respond => {
            return res.status(200).json({updatedEvent:respond})
        })
        .catch(e => {
            console.log(e)
            return res.status(401).json({error:'Event update failed'})
        })

    }
    catch(e){
        console.log(e)
        return res.status(500).json({error:'server error'})
    }

}



// Function to delete a created event
export const deleteEvent=async(req ,res)=>{
    try{
        let {id} = req.body
       let response = await CommingEvents.findByIdAndDelete({_id:id} ,{new:true})
            if(response)
                return res.status(200).json({message:'Event Deleted Successfully'})
            else
                return res.status(401).json({error:'Event not found'})
    }
    catch(e){
        console.log(e)
        return res.status(500).json({error:'server error'})
    }
}