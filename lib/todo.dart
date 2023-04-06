class Todo {
  bool completed;
  final String id;
  final String task;

  Todo({
      required this.completed,
    required this.id,
    required this.task,
  });

  factory Todo.fromJson(Map<String, dynamic> json) {
    return Todo(
      completed: json['completed'],
      id: json['id'],
      task: json['task'],
    );
  }
}
