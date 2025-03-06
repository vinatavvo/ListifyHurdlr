import "./styles.css";
import { useEffect, useState } from "react";
import Item from "./Item";

// API Constants
const USERID = "VINA_VO";
const SLEEP = 500;
const THROW_ERROR = true;
const API_BASE = "https://sandbox.hurdlr.com/rest/v5/interview";
const API = `${API_BASE}/todo`;
const API_GET = `${API_BASE}/todos?userId=${USERID}&sleepDuration=${SLEEP}`;
// const API_GET = `${API_BASE}/todos?userId=${USERID}&sleepDuration=${SLEEP}&throwError=${THROW_ERROR}`;

const handleApi = (res) => {
  return res.json().then((data) => {
    if (!res.ok) {
      console.log("API Response:", JSON.stringify(data, null, 2));
      throw new Error(
        `Request failed - STATUS: ${res.status}, Message: ${
          data?.error || processError(data?.errors)
        }`
      );
    }

    if (data?.error) {
      throw new Error(`API Error: ${data.error}`);
    }

    // if (data?.result === "FAILURE") {
    //   throw new Error(processError(data.errors));
    // }

    return data;
  });
};

export default function App() {
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    getTasks();
  }, []);

  // Fetch all tasks for the current user
  const getTasks = () => {
    setLoading(true);
    fetch(API_GET, { method: "GET", headers: { accept: "application/json" } })
      .then(handleApi)
      .then((data) => {
        console.log("Getting Tasks:", JSON.stringify(data, null, 2));
        setTasks(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Error fetching tasks-", err.message || err);
      })
      .finally(() => setLoading(false));
  };

  // Handles input changes for adding a new task
  const onChangeText = (e) => {
    setText(e.target.value);
  };

  // Add a new task for the user
  const addTask = (e) => {
    e.preventDefault();
    if (text.trim().length === 0) {
      console.warn("Cannot add an empty task.");
      return;
    }

    setLoading(true);
    fetch(API, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        userId: USERID,
        todo: { text },
        sleepDuration: SLEEP,
        // throwError: THROW_ERROR,
      }),
    })
      .then(handleApi)
      .then((data) => {
        console.log("ADD Response:", JSON.stringify(data, null, 2));
        if (data?.id) {
          const newTask = {
            userId: USERID,
            id: data.id,
            todo: { text },
          };
          console.log(`Adding Task: ${newTask.todo.text} (ID: ${newTask.id})`);
          setTasks((prevTasks) => [...prevTasks, newTask]);
          setText("");
        } else {
          console.error("Data ID doesn't exist");
        }
      })
      .catch((err) => {
        if (err.response) {
          console.error(
            "API Error Response:",
            JSON.stringify(errorData, null, 2)
          );
        }
        console.error("Error adding task:", err.message || err);
      })
      .finally(() => setLoading(false));
  };

  // Delete a task by index
  const deleteTask = (index) => {
    const target = tasks[index];
    if (!target) {
      console.warn("Task not found for deletion.");
      return;
    }

    setLoading(true);
    fetch(API, {
      method: "DELETE",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        id: target.id,
        userId: USERID,
        sleepDuration: SLEEP,
        // throwError: THROW_ERROR,
      }),
    })
      .then(handleApi)
      .then((data) => {
        console.log("DELETE Response:", JSON.stringify(data, null, 2));
        console.log(`Deleting Task: ${target.todo.text} (ID: ${target.id})`);
        setTasks((prevTasks) => prevTasks.filter((_, i) => i !== index));
      })
      .catch((err) => console.error("Error deleting task:", err))
      .finally(() => setLoading(false));
  };

  // Edit an existing task
  const editTask = (index, newText) => {
    const target = tasks[index];
    if (!target) {
      console.warn("Task not found for editing.");
      return;
    }

    setLoading(true);
    fetch(API, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        userId: USERID,
        id: target.id,
        todo: { text: newText },
        sleepDuration: SLEEP,
        // throwError: THROW_ERROR,
      }),
    })
      .then(handleApi)
      .then((data) => {
        console.log("EDIT Response:", JSON.stringify(data, null, 2));
        console.log(`Editing Task: ${target.todo.text} (ID: ${target.id})`);
        setTasks((prevTasks) =>
          prevTasks.map((task, i) =>
            i === index ? { ...task, todo: { text: newText } } : task
          )
        );
        console.log(`EDITED TO: ${newText} (ID: ${target.id})`);
      })
      .catch((err) => console.error("Error editing task:", err))
      .finally(() => setLoading(false));
  };

  return (
    <main className="App">
      {loading && (
        <div className="loadingContainer">
          <img src="load.gif" alt="Loading..." className="loadingSpinner" />
        </div>
      )}
      <section className="container">
        <ul className="taskList">
          {tasks.map((task, index) => (
            <Item
              key={task.id}
              task={task}
              index={index}
              deleteTask={deleteTask}
              editTask={editTask}
            />
          ))}
        </ul>
        <form className="inputForm" onSubmit={addTask}>
          <input
            className="taskInput"
            type="text"
            value={text}
            onChange={onChangeText}
            placeholder="Add tasks"
          />
        </form>
      </section>
    </main>
  );
}
