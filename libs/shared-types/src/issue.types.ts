export type IssueStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
export type IssuePriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type IssueSeverity = 'Minor' | 'Major' | 'Critical';

export interface IssueCreator {
  _id: string;
  name: string;
  email: string;
}

export interface Issue {
  _id: string;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  severity: IssueSeverity;
  createdBy: string | IssueCreator;
  createdAt: string;
  updatedAt: string;
}

export type IssueListScope = 'all' | 'mine';

export interface CreateIssueData {
  title: string;
  description: string;
  priority: IssuePriority;
  severity: IssueSeverity;
}

export interface UpdateIssueData {
  title?: string;
  description?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  severity?: IssueSeverity;
}

export interface IssueFilters {
  search: string;
  status: string;
  priority: string;
}

export interface IssuePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IssueStats {
  Open: number;
  'In Progress': number;
  Resolved: number;
  Closed: number;
}
