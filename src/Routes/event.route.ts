import express from "express";
import EventController from "../controller/event.controller";
import { authenticateUser, authorizePermission } from "../middlewares/auth";

const router = express.Router();

router.route("/stats").get(EventController.getEventOverview);

router
  .route("/")
  .post(
    authenticateUser,
    authorizePermission("مناسبه", "create"),
    EventController.createEvent
  );

router
  .route("/")
  .get(
    authenticateUser,
    authorizePermission("مناسبه", "view"),
    EventController.getAllEvents
  );

router.route("/:id").get(authenticateUser, EventController.getEventById);

router
  .route("/:id")
  .delete(
    authenticateUser,
    authorizePermission("مناسبه", "delete"),
    EventController.deleteEventById
  );

router
  .route("/:id")
  .patch(
    authenticateUser,
    authorizePermission("مناسبه", "update"),
    EventController.updateEventById
  );

export default router;
