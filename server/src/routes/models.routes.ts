import { Router } from "express";
import ModelController from "../controllers/model";

const router = Router();

router.get("/", ModelController.getModels);

export default router;
