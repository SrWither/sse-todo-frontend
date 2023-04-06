import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;

import 'dart:convert';

import 'themes.dart';
import 'todo.dart';

MyTheme currentTheme = MyTheme();
MyColors currentColor = MyColors();

void main() {
  currentTheme.init();
  runApp(const MyApp());
}

Future<List<Todo>> fetchData() async {
  final response =
      await http.get(Uri.parse("http://192.168.60.181:7878/todos"));

  if (response.statusCode == 200) {
    final parsed = json.decode(response.body).cast<Map<String, dynamic>>();
    return parsed.map<Todo>((json) => Todo.fromJson(json)).toList();
  } else {
    throw Exception('Failed to load post');
  }
}

class TodoListTile extends StatefulWidget {
  @override
  _TodoListTileState createState() => _TodoListTileState();
}

class _TodoListTileState extends State<TodoListTile> {
  late Future<List<Todo>> _futureData;
  final TextEditingController _controller = TextEditingController();

  void _handleAddTodo(String task) async {
    Todo newTodo = Todo(id: "1", completed: false, task: task);
    List<Todo> lista = await _futureData;
    lista.add(newTodo);
    _futureData = Future.value(lista);
    _controller.clear();
    setState(() {});
  }

  void _showDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text("New Task"),
          content: TextField(
              controller: _controller,
              decoration: const InputDecoration(hintText: "Description")),
          actions: [
            TextButton(
              onPressed: () => {
                if (_controller.text.isEmpty)
                  {
                    showDialog<String>(
                      context: context,
                      builder: (BuildContext context) => AlertDialog(
                        title: const Text('Error'),
                        content:
                            const Text('Verifica que los campos estén llenos'),
                        actions: <Widget>[
                          TextButton(
                            onPressed: () => Navigator.pop(context, 'OK'),
                            child: const Text('OK'),
                          ),
                        ],
                      ),
                    ),
                  }
                else
                  {_handleAddTodo(_controller.text), Navigator.pop(context)}
              },
              child: const Text("Aceptar"),
            ),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text("Cerrar"),
            ),
          ],
        );
      },
    );
  }

  @override
  void initState() {
    super.initState();
    _futureData = fetchData();
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
        builder: (BuildContext context, BoxConstraints constraints) {
      if (constraints.maxWidth > 600) {
        return Scaffold(
          body: Row(
            children: [
              const SizedBox(
                width: 300,
                child: ThemeDrawer(),
              ),
              Expanded(
                child: Column(
                  children: [
                    AppBar(title: const Text('Todo SSE')),
                    Expanded(
                      child: FutureBuilder<List<Todo>>(
                        future: _futureData,
                        builder: (context, snapshot) {
                          if (snapshot.hasData) {
                            return ListView.builder(
                              itemCount: snapshot.data!.length,
                              itemBuilder: (context, index) {
                                return CheckboxListTile(
                                  title: Text(snapshot.data![index].task),
                                  value: snapshot.data![index].completed,
                                  onChanged: (bool? value) {
                                    setState(() {
                                      snapshot.data![index].completed =
                                          value ?? false;
                                    });
                                  },
                                );
                              },
                            );
                          } else if (snapshot.hasError) {
                            return Text('${snapshot.error}');
                          }
                          return const CircularProgressIndicator();
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          floatingActionButton: FloatingActionButton(
              onPressed: () {
                /* _handleAddTodo(); */
                _showDialog();
              },
              child: const Icon(Icons.add)),
        );
      } else {
        return Scaffold(
          appBar: AppBar(title: const Text("ToDo SSE")),
          body: FutureBuilder<List<Todo>>(
            future: _futureData,
            builder: (context, snapshot) {
              if (snapshot.hasData) {
                return ListView.builder(
                  itemCount: snapshot.data!.length,
                  itemBuilder: (context, index) {
                    return CheckboxListTile(
                        title: Text(snapshot.data![index].task),
                        value: snapshot.data![index].completed,
                        onChanged: (bool? value) {
                          setState(() {
                            snapshot.data![index].completed = value ?? false;
                          });
                        });
                  },
                );
              } else if (snapshot.hasError) {
                return Text("${snapshot.error}");
              }
              return const CircularProgressIndicator();
            },
          ),
          floatingActionButton: FloatingActionButton(
              onPressed: () {
                /* _handleAddTodo(); */
                _showDialog();
              },
              child: const Icon(Icons.add)),
          drawer: const ThemeDrawer(),
        );
      }
    });
  }
}

class MyApp extends StatefulWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  @override
  void initState() {
    super.initState();
    currentTheme.addListener(() {
      setState(() {});
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
          colorSchemeSeed: currentColor.currentColor(),
          brightness: Brightness.light,
          useMaterial3: currentTheme.getMaterial()),
      darkTheme: ThemeData(
          colorSchemeSeed: currentColor.currentColor(),
          brightness: Brightness.dark,
          useMaterial3: currentTheme.getMaterial()),
      themeMode: currentTheme.currentTheme(),
      home: TodoListTile(),
    );
  }
}

class ThemeDrawer extends StatelessWidget {
  const ThemeDrawer({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: <Widget>[
          const DrawerHeader(
            child: null,
            decoration: BoxDecoration(
              image: DecorationImage(
                image: NetworkImage(
                    "https://wallpaperaccess.com/full/3881775.jpg"),
                fit: BoxFit.cover,
              ),
            ),
          ),
          ListTile(
            title: const Text('Switch Theme'),
            leading: const Icon(Icons.sunny),
            onTap: () async {
              final prefs = await SharedPreferences.getInstance();

              currentTheme.switchTheme();

              await prefs.setBool('darkTheme', currentTheme.getTheme());
              /* final value = prefs.getBool('darkTheme'); */
            },
          ),
          ListTile(
            title: const Text("Change Material Version"),
            leading: const Icon(Icons.replay_outlined),
            onTap: () {
              currentTheme.switchMaterial();
              currentTheme.refreshTheme();
            },
          ),
          ListTile(
            title: const Text("Red Theme"),
            leading: const Icon(Icons.palette),
            onTap: () {
              currentColor.changeColor(Colors.red);
              currentTheme.refreshTheme();
            },
          ),
          ListTile(
            title: const Text("Green Theme"),
            leading: const Icon(Icons.palette),
            onTap: () {
              currentColor.changeColor(Colors.green);
              currentTheme.refreshTheme();
            },
          ),
          ListTile(
            title: const Text("Blue Theme"),
            leading: const Icon(Icons.palette),
            onTap: () {
              currentColor.changeColor(Colors.blue);
              currentTheme.refreshTheme();
            },
          ),
          ListTile(
            title: const Text("Orange Theme"),
            leading: const Icon(Icons.palette),
            onTap: () {
              currentColor.changeColor(Colors.orange);
              currentTheme.refreshTheme();
            },
          ),
          ListTile(
            title: const Text("Pink theme"),
            leading: const Icon(Icons.palette),
            onTap: () {
              currentColor.changeColor(Colors.pink);
              currentTheme.refreshTheme();
            },
          ),
          ListTile(
            title: const Text("Purple theme"),
            leading: const Icon(Icons.palette),
            onTap: () {
              currentColor.changeColor(Colors.purple);
              currentTheme.refreshTheme();
            },
          ),
          ListTile(
            title: const Text("Yellow theme"),
            leading: const Icon(Icons.palette),
            onTap: () {
              currentColor.changeColor(Colors.yellow);
              currentTheme.refreshTheme();
            },
          ),
        ],
      ),
    );
  }
}
