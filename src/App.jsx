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

// Handle errors
const handleApi = (res) => {
  return res.json().then((data) => {
    // Throw an error if the response status is bad or if there's an explicit error message
    if (!res.ok || data?.error) {
      console.log("Raw API Response:", JSON.stringify(data, null, 2));
      throw new Error(
        `Message: ${
          data?.error || "Unknown error."
        } \n Request failed - STATUS: ${res.status}`
      );
    }

    // Return global error messages if the request failed
    if (data?.result === "FAILURE") {
      const globalErrorMessage =
        data.errors?.globalErrors?.map((err) => err.errorMessage).join(", ") ||
        "Unknown API error.";
      console.error("Global API Error:", globalErrorMessage);
      throw new Error(globalErrorMessage);
    }

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
        console.error("Error getting tasks-", err.message || err);
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
        // console.log("ADD Response:", JSON.stringify(data, null, 2));
        if (!data?.id) {
          console.error("Unexpected error: Task ID is missing.");
          // alert("Unexpected error: No task ID returned.");
          return;
        }
        const newTask = {
          userId: USERID,
          id: data.id,
          todo: { text },
        };
        console.log(`Adding Task: ${newTask.todo.text} (ID: ${newTask.id})`);
        setTasks((prevTasks) => [...prevTasks, newTask]);
        setText("");
      })
      .catch((err) => {
        console.error(
          `Error adding task- ${newTask.todo.text} (ID: ${newTask.id}) \n ${
            err.message || err
          }`
        );
        // alert(`Error adding task: ${err.message}`);
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
        throwError: THROW_ERROR,
      }),
    })
      .then(handleApi)
      .then((data) => {
        // console.log("DELETE Response:", JSON.stringify(data, null, 2));
        console.log(`Deleting Task: ${target.todo.text} (ID: ${target.id})`);
        setTasks((prevTasks) => prevTasks.filter((_, i) => i !== index));
      })
      .catch((err) => {
        console.error(
          `Error deleting task- ${target.todo.text} (ID: ${target.id}) \n ${
            err.message || err
          }`
        );
        // alert(`Error deleting task: ${err.message}`);
      })
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
        throwError: THROW_ERROR,
      }),
    })
      .then(handleApi)
      .then((data) => {
        // console.log("EDIT Response:", JSON.stringify(data, null, 2));
        console.log(`Editing Task: ${target.todo.text} (ID: ${target.id})`);
        setTasks((prevTasks) =>
          prevTasks.map((task, i) =>
            i === index ? { ...task, todo: { text: newText } } : task
          )
        );
        console.log(`EDITED TO: ${newText} (ID: ${target.id})`);
      })
      .catch((err) => {
        console.error(
          `Error editing task- ${target.todo.text} to ${newText} (ID: ${
            target.id
          }) \n ${err.message || err}`
          // alert(`Error editing task: ${err.message}`);
        );
      })
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
