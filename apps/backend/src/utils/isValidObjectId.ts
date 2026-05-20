import mongoose from "mongoose";

/** Returns true only for 24-char hex strings that are valid MongoDB ObjectIds. */
export const isValidObjectId = (id: string): boolean =>
  mongoose.Types.ObjectId.isValid(id) &&
  new mongoose.Types.ObjectId(id).toString() === id;
