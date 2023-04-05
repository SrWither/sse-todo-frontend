import { NewTodoEvent, DeleteTodoEvent, UpdateTodoEvent } from "./models";

export function parseNewTodoEvent(data: string): NewTodoEvent | null {
  try {
    const [type, todo] = data.split(": ");
    if (type === "NewTodo") {
      const todos = JSON.parse(todo);
      if (!Array.isArray(todos)) {
        throw new Error("Data is not an array");
      }
      return {
        action: type,
        todos,
      };
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}

export function parseUpdateTodoEvent(data: string): UpdateTodoEvent | null {
  try {
    const [type, todoId] = data.split(": ");
    if (type === "UpdateTodo") {
      return {
        action: type,
        todoId,
      };
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}

export function parseDeleteTodoEvent(data: string): DeleteTodoEvent | null {
  try {
    const [type, todoId] = data.split(": ");
    if (type === "DeleteTodo") {
      return {
        action: type,
        todoId,
      };
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}
