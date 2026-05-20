import { Request, Response } from "express";
import mongoose from "mongoose";
import Issue from "../models/Issue";
import logger from "../utils/logger";
import { isValidObjectId } from "../utils/isValidObjectId";

const getCreatedById = (createdBy: unknown): string => {
  if (createdBy instanceof mongoose.Types.ObjectId) {
    return createdBy.toString();
  }
  if (
    createdBy &&
    typeof createdBy === "object" &&
    "_id" in createdBy &&
    createdBy._id
  ) {
    return String(createdBy._id);
  }
  return String(createdBy);
};

const isIssueOwner = (
  issue: { createdBy: unknown },
  userId: mongoose.Types.ObjectId
): boolean => getCreatedById(issue.createdBy) === userId.toString();

const rejectInvalidIssueId = (id: string, res: Response): boolean => {
  if (!isValidObjectId(id)) {
    res.status(404).json({ message: "Issue not found" });
    return true;
  }
  return false;
};

// @desc    Create a new issue
// @route   POST /api/issues
export const createIssue = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { title, description, priority, severity } = req.body;

    if (!title || !description) {
      res
        .status(400)
        .json({ message: "Please provide title and description" });
      return;
    }

    const issue = await Issue.create({
      title,
      description,
      priority,
      severity,
      createdBy: req.user!._id,
    });

    res.status(201).json(issue);
  } catch (error) {
    logger.error("createIssue", error);
    res.status(500).json({ message: "Server error creating issue" });
  }
};

// @desc    Get all issues with search, filter, and pagination
// @route   GET /api/issues
export const getIssues = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      search,
      status,
      priority,
      mine,
      page = "1",
      limit = "10",
    } = req.query;

    const filter: Record<string, unknown> = {};

    if (mine === "true") {
      filter.createdBy = req.user!._id;
    }

    if (search) {
      filter.title = { $regex: search as string, $options: "i" };
    }

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const totalIssues = await Issue.countDocuments(filter);

    const issues = await Issue.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      issues,
      totalIssues,
      currentPage: pageNum,
      totalPages: Math.ceil(totalIssues / limitNum),
    });
  } catch (error) {
    logger.error("getIssues", error);
    res.status(500).json({ message: "Server error fetching issues" });
  }
};

// @desc    Get single issue by ID
// @route   GET /api/issues/:id
export const getIssueById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (rejectInvalidIssueId(req.params.id, res)) return;

    const issue = await Issue.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!issue) {
      res.status(404).json({ message: "Issue not found" });
      return;
    }

    res.status(200).json(issue);
  } catch (error) {
    logger.error("getIssueById", error);
    res.status(500).json({ message: "Server error fetching issue" });
  }
};

// @desc    Update an issue
// @route   PUT /api/issues/:id
export const updateIssue = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (rejectInvalidIssueId(req.params.id, res)) return;

    const { title, description, status, priority, severity } = req.body;

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      res.status(404).json({ message: "Issue not found" });
      return;
    }

    if (!isIssueOwner(issue, req.user!._id)) {
      res.status(403).json({ message: "Not authorized to update this issue" });
      return;
    }

    issue.title = title || issue.title;
    issue.description = description || issue.description;
    issue.status = status || issue.status;
    issue.priority = priority || issue.priority;
    issue.severity = severity || issue.severity;

    const updatedIssue = await issue.save();

    res.status(200).json(updatedIssue);
  } catch (error) {
    logger.error("updateIssue", error);
    res.status(500).json({ message: "Server error updating issue" });
  }
};

// @desc    Delete an issue
// @route   DELETE /api/issues/:id
export const deleteIssue = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (rejectInvalidIssueId(req.params.id, res)) return;

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      res.status(404).json({ message: "Issue not found" });
      return;
    }

    if (!isIssueOwner(issue, req.user!._id)) {
      res.status(403).json({ message: "Not authorized to delete this issue" });
      return;
    }

    await issue.deleteOne();

    res.status(200).json({ message: "Issue deleted successfully" });
  } catch (error) {
    logger.error("deleteIssue", error);
    res.status(500).json({ message: "Server error deleting issue" });
  }
};

// @desc    Update issue status only
// @route   PATCH /api/issues/:id/status
export const updateIssueStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (rejectInvalidIssueId(req.params.id, res)) return;

    const { status } = req.body;

    if (!status) {
      res.status(400).json({ message: "Please provide a status" });
      return;
    }

    const validStatuses = ["Open", "In Progress", "Resolved", "Closed"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
      return;
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      res.status(404).json({ message: "Issue not found" });
      return;
    }

    if (!isIssueOwner(issue, req.user!._id)) {
      res
        .status(403)
        .json({ message: "Not authorized to update this issue's status" });
      return;
    }

    issue.status = status;
    const updatedIssue = await issue.save();

    res.status(200).json(updatedIssue);
  } catch (error) {
    logger.error("updateIssueStatus", error);
    res.status(500).json({ message: "Server error updating issue status" });
  }
};

// @desc    Get issue status counts (for dashboard)
// @route   GET /api/issues/stats/counts
export const getIssueStatusCounts = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const counts = await Issue.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Build a structured response with all statuses
    const statusCounts: Record<string, number> = {
      Open: 0,
      "In Progress": 0,
      Resolved: 0,
      Closed: 0,
    };

    counts.forEach((item) => {
      statusCounts[item._id] = item.count;
    });

    res.status(200).json(statusCounts);
  } catch (error) {
    logger.error("getIssueStatusCounts", error);
    res.status(500).json({ message: "Server error fetching issue counts" });
  }
};
