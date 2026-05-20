import { Router } from "express";
import {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  updateIssueStatus,
  getIssueStatusCounts,
} from "../controllers/issueController";
import protect from "../middleware/authMiddleware";

const router = Router();

// All issue routes are protected
router.use(protect);

// Stats route must come before /:id to avoid "stats" being treated as an ID
router.get("/stats/counts", getIssueStatusCounts);

router.route("/").get(getIssues).post(createIssue);
router.route("/:id").get(getIssueById).put(updateIssue).delete(deleteIssue);
router.patch("/:id/status", updateIssueStatus);

export default router;
