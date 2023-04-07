/* import 'dart:developer' as developer; */

import 'package:flutter_frontend/todo.dart';
import 'dart:convert';

List<String> parseEvent(String event) {
  int idx = event.indexOf(":");
  List<String> parsed = [event.substring(0,idx).trim(), event.substring(idx+1).trim()];
  /* parsed.forEach((element) => { */
    /* developer.log(element) */
  /* }); */
  return parsed;
}

List<Todo> parseTodo(String event) {
  final parsed = json.decode(event).cast<Map<String, dynamic>>();
  return parsed.map<Todo>((json) => Todo.fromJson(json)).toList();
}
