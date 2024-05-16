import {
  createCertificates,
  getCertificates
  } from '../controllers/fccertificates.controller.js';
  import express from "express";
  
  const router = express.Router();
  
  /* Activity routes */
  router.route("/")
      .post(createCertificates) // Create a new activity
      .get(getCertificates); // Get all activities
  
  // router.route("/:id")
  //     .get(getActivityById)    // Get a specific activity by ID
  //     // .put(canEditActivity, updateActivity)  // Update a specific activity by ID
  //     .put(updateActivity)
  //   //   .delete(canEditActivity, deleteActivity); // Delete a specific activity by ID
  //     .delete( deleteActivity); // Delete a specific activity by ID

  
  // // Search and Filtering
  // router.route("/search").get(searchActivities);
  
  // // Associations and Relationships
  // router.route("/:id/associations").get(getActivityWithAssociations);
  
  // // Analytics and Reporting
  // router.route("/analytics").get(getActivityAnalytics);
  
  // // Image and Media Handling
  // router.route("/:id/upload").post(uploadActivityImage);
  
  // // Comments and Reviews
  // router.route("/:id/comments").post(addCommentToActivity);

  // //To translate the language of an already existing activity
  // router.route('/:id/translate').post(translateActivity)
  
 export default router;
  