import { Router } from "express";
import {
  getMessagesByRoom,
  getMessagesByUser,
  createMessage,
} from "../controllers/messageController";

const router = Router();

router.get("/room/:roomId", getMessagesByRoom);
router.get("/user/:userId", getMessagesByUser);
router.post("/create", createMessage);

export default router;
