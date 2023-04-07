import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Button,
  Modal,
  Pressable,
  TextInput,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import EventSource, { EventSourceListener } from "react-native-sse";
import Checkbox from "expo-checkbox";
import { Todo } from "./utils/models";
import { parseDeleteTodoEvent, parseNewTodoEvent, parseUpdateTodoEvent } from "./utils/parse";

const App = (): JSX.Element => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Get todos from rest api
  const getTodos = async () => {
    const response = await fetch("http://192.168.60.181:7878/todos");
    const json = await response.json();
    setTodos(json);
  };

  // Add new Todo
  const handleAddTodo = (newTodo: Todo) => {
    setTodos((prevState) => [...prevState, newTodo]);
  };

  const handleDeleteTodo = (todoId: string) => {
    setTodos((prevItems) => prevItems.filter((item) => item.id !== todoId));
  };

  const handleUpdateTodo = (todoId: string) => {
    setTodos((prevArray) =>
      prevArray.map((item) =>
        item.id === todoId ? { ...item, completed: !item.completed } : item
      )
    );
  };
  // New Todo
  const newTodo = () => {
    fetch("http://192.168.60.181:7878/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task: `${inputValue}`,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        console.log("POST exitoso");
      })
      .catch((error) => {
        console.error("Error en el POST:", error);
      });

    setInputValue("");
  };

  // Update Todo
  const updateTodo = (todoId: string) => {
    fetch("http://192.168.60.181:7878/todos", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: `${todoId}`,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        console.log("PATCH exitoso");
      })
      .catch((error) => {
        console.error("Error en el PATCH:", error);
      });
  };

  // Delete Todo
  const deleteTodo = (todoId: string) => {
    fetch("http://192.168.60.181:7878/todos", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: `${todoId}`,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        console.log("DELETE exitoso");
      })
      .catch((error) => {
        console.error("Error en el DELETE:", error);
      });
  };

  useEffect(() => {
    getTodos();

    // Event listener to SSE from rest api
    const url = "http://192.168.60.181:7878/todos/events";
    const es = new EventSource(url);
    const listener: EventSourceListener = (event) => {
      if (event.type === "message") {
        // If new Todo Event
        const newTodoEvent = parseNewTodoEvent(event.data);
        const updateTodoEvent = parseUpdateTodoEvent(event.data);
        const deleteTodoEvent = parseDeleteTodoEvent(event.data);
        if (newTodoEvent) {
          console.log("NewTodo:", newTodoEvent);
          handleAddTodo(newTodoEvent.todos[0]);
        }
        // If update Todo Event
        else if (updateTodoEvent) {
          console.log("UpdateTodo:", updateTodoEvent.todoId);
          handleUpdateTodo(updateTodoEvent.todoId);
        }
        // If delete Todo Event
        else if (deleteTodoEvent) {
          console.log("DeleteTodo:", deleteTodoEvent);
          handleDeleteTodo(deleteTodoEvent.todoId);
        }
      }
    };

    es.addEventListener("open", listener);
    es.addEventListener("message", listener);
    es.addEventListener("error", listener);
  }, []);

  return (
    <View style={styles.default}>
      {/*Modal for new Task*/}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>New Task</Text>
            <TextInput
              style={styles.input}
              placeholder="Description"
              placeholderTextColor="#999"
              value={inputValue}
              onChangeText={setInputValue}
            />
            <View style={styles.actionButtons}>
              <Pressable
                style={[styles.button, styles.buttonAccept]}
                onPress={() => {
                  newTodo();
                  setModalVisible(!modalVisible);
                }}
              >
                <Text style={styles.textStyle}>Aceptar</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.buttonCancel]}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <Text style={styles.textStyle}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      {/*Render Tasks*/}
      <FlatList
        data={todos}
        renderItem={({ item }) => {
          return (
            <View style={styles.todos}>
              <Text style={styles.task}>{item.task}</Text>
              <Checkbox
                style={styles.completed}
                value={item.completed}
                onValueChange={() => updateTodo(item.id)}
              />
              <Pressable
                style={[styles.deleteButton]}
                onPress={() => deleteTodo(item.id)}
              >
                <Text>Delete</Text>
              </Pressable>
            </View>
          );
        }}
        keyExtractor={(item) => item.id}
      />
      <Button title="New Task" onPress={() => setModalVisible(true)} />
      <StatusBar style="light" />
    </View>
  );
};

const styles = StyleSheet.create({
  default: {
    backgroundColor: "#333333",
    paddingTop: 25,
    flex: 1,
  },

  task: {
    color: "#ffffff",
    paddingRight: 10,
  },

  completed: {
    marginLeft: "auto",
  },

  todos: {
    flexDirection: "row",
    padding: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "#666666",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonAccept: {
    backgroundColor: "#2196F3",
    marginRight: 10,
  },
  buttonCancel: {
    backgroundColor: "#ff1744",
  },

  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    color: "#ffffff",
  },
  actionButtons: {
    flexDirection: "row",
    padding: 10,
  },
  input: {
    height: 40,
    margin: 12,
    color: "#ffffff",
    borderColor: "#2196f3",
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
  },
  deleteButton: {
    marginLeft: 10,
    backgroundColor: "#ff1744",
    borderRadius: 20,
    padding: 2,
  },
});

export default App;
