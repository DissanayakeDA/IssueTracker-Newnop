import { Issue } from '../types/issue.types';

export function getIssueOwnerId(issue: Issue): string {
  const { createdBy } = issue;
  if (typeof createdBy === 'object' && createdBy !== null && '_id' in createdBy) {
    return String(createdBy._id);
  }
  return String(createdBy);
}

export function isIssueOwner(issue: Issue, userId: string | undefined): boolean {
  if (!userId) return false;
  return getIssueOwnerId(issue) === String(userId);
}
