import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Button,
  Modal,
  Pressable,
  Alert,
  TextInput,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import EventSource, { EventSourceListener } from "react-native-sse";
import Checkbox from "expo-checkbox";

interface Todo {
  completed: boolean;
  id: string;
  task: string;
}

const App = (): JSX.Element => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Get todos from rest api
  const getTodos = async () => {
    const response = await fetch("http://192.168.60.104:7878/todos");
    const json = await response.json();
    setTodos(json);
  };

  // Add new Todo
  const handleAddTodo = (newTodo: Todo) => {
    setTodos((prevState) => [...prevState, newTodo]);
  };

  // New Todo
  const newTodo = () => {
    fetch("http://192.168.60.104:7878/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `CREATE Todo SET task = "${inputValue}", completed = false;`,
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

  useEffect(() => {
    getTodos();

    // Event listener to SSE from rest api
    const url = "http://192.168.60.104:7878/todos/events";
    const es = new EventSource(url);
    const listener: EventSourceListener = (event) => {
      if (event.type === "message") {
        console.log(event.data);
        const newTodo: Todo[] = JSON.parse(event.data);
        handleAddTodo(newTodo[0]);
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
          Alert.alert("Modal has been closed.");
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
              <Checkbox style={styles.completed} value={item.completed} />
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
});

export default App;
