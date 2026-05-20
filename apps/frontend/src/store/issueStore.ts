import { create } from 'zustand';
import {
  Issue,
  CreateIssueData,
  UpdateIssueData,
  IssueStatus,
  IssueFilters,
  IssuePagination,
  IssueStats,
  IssueListScope,
} from '../types/issue.types';
import { issueApi } from '../api/issueApi';

interface IssueState {
  issues: Issue[];
  recentIssues: Issue[];
  selectedIssue: Issue | null;
  stats: IssueStats;
  loading: boolean;
  recentLoading: boolean;
  error: string | null;
  filters: IssueFilters;
  listScope: IssueListScope;
  pagination: IssuePagination;
  fetchIssues: () => Promise<void>;
  fetchRecentIssues: () => Promise<void>;
  setListScope: (scope: IssueListScope) => void;
  fetchIssueById: (id: string) => Promise<void>;
  createIssue: (data: CreateIssueData) => Promise<Issue>;
  updateIssue: (id: string, data: UpdateIssueData) => Promise<void>;
  deleteIssue: (id: string) => Promise<void>;
  updateIssueStatus: (id: string, status: IssueStatus) => Promise<void>;
  fetchStats: () => Promise<void>;
  setFilters: (filters: Partial<IssueFilters>) => void;
  setPage: (page: number) => void;
  clearSelectedIssue: () => void;
  clearError: () => void;
}

export const useIssueStore = create<IssueState>((set, get) => ({
  issues: [],
  recentIssues: [],
  selectedIssue: null,
  stats: { Open: 0, 'In Progress': 0, Resolved: 0, Closed: 0 },
  loading: false,
  recentLoading: false,
  error: null,
  filters: { search: '', status: '', priority: '' },
  listScope: 'all',
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },

  setListScope: (scope) => {
    set({ listScope: scope, pagination: { ...get().pagination, page: 1 } });
  },

  fetchIssues: async () => {
    set({ loading: true, error: null });
    try {
      const { filters, pagination, listScope } = get();
      const params: Record<string, string | number | boolean> = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (listScope === 'mine') params.mine = true;
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;

      const response = await issueApi.fetchIssues(params);
      set({
        issues: response.data,
        pagination: response.pagination,
        loading: false,
      });
    } catch (err: unknown) {
      const error = err as { message?: string };
      set({ error: error.message || 'Failed to fetch issues', loading: false });
    }
  },

  fetchRecentIssues: async () => {
    set({ recentLoading: true });
    try {
      const response = await issueApi.fetchIssues({ page: 1, limit: 6 });
      set({ recentIssues: response.data, recentLoading: false });
    } catch {
      set({ recentLoading: false });
    }
  },

  fetchIssueById: async (id) => {
    set({ loading: true, error: null, selectedIssue: null });
    try {
      const issue = await issueApi.fetchIssueById(id);
      set({ selectedIssue: issue, loading: false });
    } catch (err: unknown) {
      const error = err as { message?: string; status?: number };
      const message =
        error.status === 404
          ? 'Issue not found'
          : error.message || 'Failed to fetch issue';
      set({ error: message, selectedIssue: null, loading: false });
    }
  },

  createIssue: async (data) => {
    set({ loading: true, error: null });
    try {
      const issue = await issueApi.createIssue(data);
      set({ loading: false });
      get().fetchStats();
      get().fetchRecentIssues();
      return issue;
    } catch (err: unknown) {
      const error = err as { message?: string };
      set({ error: error.message || 'Failed to create issue', loading: false });
      throw err;
    }
  },

  updateIssue: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const issue = await issueApi.updateIssue(id, data);
      set({ selectedIssue: issue, loading: false });
      get().fetchStats();
      get().fetchRecentIssues();
    } catch (err: unknown) {
      const error = err as { message?: string };
      set({ error: error.message || 'Failed to update issue', loading: false });
      throw err;
    }
  },

  deleteIssue: async (id) => {
    set({ loading: true, error: null });
    try {
      await issueApi.deleteIssue(id);
      set((state) => ({
        issues: state.issues.filter((i) => i._id !== id),
        loading: false,
      }));
      get().fetchStats();
      get().fetchRecentIssues();
    } catch (err: unknown) {
      const error = err as { message?: string };
      set({ error: error.message || 'Failed to delete issue', loading: false });
      throw err;
    }
  },

  updateIssueStatus: async (id, status) => {
    set({ error: null });
    try {
      const issue = await issueApi.updateStatus(id, status);
      set((state) => ({
        selectedIssue: issue,
        issues: state.issues.map((i) => (i._id === id ? issue : i)),
      }));
      get().fetchStats();
      get().fetchRecentIssues();
    } catch (err: unknown) {
      const error = err as { message?: string };
      set({ error: error.message || 'Failed to update status' });
      throw err;
    }
  },

  fetchStats: async () => {
    try {
      const stats = await issueApi.fetchStats();
      set({ stats });
    } catch {
      // Stats fetch failure is non-critical
    }
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
      pagination: { ...state.pagination, page: 1 },
    }));
  },

  setPage: (page) => {
    set((state) => ({
      pagination: { ...state.pagination, page },
    }));
  },

  clearSelectedIssue: () => set({ selectedIssue: null }),
  clearError: () => set({ error: null }),
}));
