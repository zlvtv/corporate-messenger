export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  created_by: string;
  created_at: string;
  assignees: string[];
  tags?: string[];
}

export interface CreateTaskData {
  project_id: string;
  title: string;
  description?: string;
  due_date?: string;
  source_message_id?: string;
  assignee_ids: string[];
  tags?: string[];
}

export type TaskTab = 'project' | 'organization' | 'user';