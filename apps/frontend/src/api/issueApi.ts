import api from './axios';
import { Issue, CreateIssueData, UpdateIssueData, IssueStatus, IssueStats } from '../types/issue.types';
import { PaginatedResponse } from '../types/api.types';

interface FetchIssuesParams {
  search?: string;
  status?: string;
  priority?: string;
  mine?: boolean;
  page?: number;
  limit?: number;
}

export const issueApi = {
  fetchIssues: async (params: FetchIssuesParams): Promise<PaginatedResponse<Issue>> => {
    const { data } = await api.get('/issues', { params });
    return {
      data: data.issues,
      pagination: {
        page: data.currentPage,
        limit: params.limit ?? 10,
        total: data.totalIssues,
        totalPages: data.totalPages,
      },
    };
  },

  fetchIssueById: async (id: string): Promise<Issue> => {
    const { data } = await api.get<Issue>(`/issues/${id}`);
    return data;
  },

  createIssue: async (issueData: CreateIssueData): Promise<Issue> => {
    const { data } = await api.post<Issue>('/issues', issueData);
    return data;
  },

  updateIssue: async (id: string, issueData: UpdateIssueData): Promise<Issue> => {
    const { data } = await api.put<Issue>(`/issues/${id}`, issueData);
    return data;
  },

  deleteIssue: async (id: string): Promise<void> => {
    await api.delete(`/issues/${id}`);
  },

  updateStatus: async (id: string, status: IssueStatus): Promise<Issue> => {
    const { data } = await api.patch<Issue>(`/issues/${id}/status`, { status });
    return data;
  },

  fetchStats: async (): Promise<IssueStats> => {
    const { data } = await api.get<IssueStats>('/issues/stats/counts');
    return data;
  },

  /** Fetches all issues matching filters (ignores pagination) for export. */
  fetchAllFilteredIssues: async (
    params: Omit<FetchIssuesParams, 'page' | 'limit'>
  ): Promise<Issue[]> => {
    const probe = await issueApi.fetchIssues({ ...params, page: 1, limit: 1 });
    if (probe.pagination.total === 0) return [];

    const { data } = await api.get('/issues', {
      params: { ...params, page: 1, limit: probe.pagination.total },
    });
    return data.issues;
  },
};
