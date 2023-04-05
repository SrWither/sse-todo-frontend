export interface NewTodoEvent {
  action: string;
  todos: Todo[];
}

export interface UpdateTodoEvent {
  action: string;
  todoId: string;
}

export interface DeleteTodoEvent {
  action: string;
  todoId: string;
}

export type Todo = {
  id: string;
  task: string;
  completed: boolean;
};
