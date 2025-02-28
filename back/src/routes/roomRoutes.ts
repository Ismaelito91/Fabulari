import { Router } from "express";
import {
  getAllRooms,
  getRoomById,
  createRoom,
} from "../controllers/roomController";

const router = Router();

router.get("/", getAllRooms);
router.get("/:roomId", getRoomById);
router.post("/create", createRoom);

export default router;
