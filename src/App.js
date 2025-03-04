import "./styles.css";
import { useEffect, useState } from "react";

// User ID for promises
const USERID = "VINA_VO";
// Sleep to show Load Message
const SLEEP = 500;
// API URL
const API = "https://sandbox.hurdlr.com/rest/v5/interview/todo";
const APIGET = `https://sandbox.hurdlr.com/rest/v5/interview/todos?userId=${USERID}&sleepDuration=${SLEEP}`;

export default function App() {
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [text, setText] = useState("");

  // Input changes for new task
  const onChangeText = (e) => {
    setText(e.target.value);
  };

  useEffect(() => {
    getTasks();
  }, []);

  const getTasks = () => {
    setLoading(true);
    const options = { method: "GET", headers: { accept: "application/json" } };
    fetch(APIGET, options)
      .then((res) => {
        // console.log("Response:", res);
        return res.json();
      })
      .then((data) => {
        console.log("Tasks Grabbed: ", data);
        setTasks(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("ERR GET TASK: ", err))
      .finally(() => setLoading(false));
  };

  // Adds a task
  const addTask = (e) => {
    e.preventDefault();
    if (text.trim().length <= 0) {
      console.warn("Can't add an empty task! Try again!");
      return;
    }

    setLoading(true);
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        userId: USERID,
        todo: { text },
        sleepDuration: SLEEP,
      }),
    };

    fetch(API, options)
      .then((res) => {
        // console.log("Response:", res);
        return res.json();
      })
      .then((data) => {
        if (data?.id) {
          const task = {
            id: data.id,
            userId: USERID,
            todo: { text },
          };
          console.log("Adding Task: ", task.todo.text, task.id);
          setTasks((prevTasks) => [...prevTasks, task]);
          setText("");
        } else {
          console.error("No valid task ID:", data);
        }
      })
      .catch((err) => console.error("ERR ADD TASK: ", err))
      .finally(() => setLoading(false));
  };

  // Delete task based off index
  const deleteTask = (index) => {
    const target = tasks[index];
    if (!target) {
      console.log("NO TARGET");
      return;
    }

    setLoading(true);
    const options = {
      method: "DELETE",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        id: target.id,
        userId: USERID,
        sleepDuration: SLEEP,
      }),
    };

    fetch(API, options)
      .then((res) => {
        // console.log("Response:", res);
        return res.json();
      })
      .then((data) => {
        console.log("Deleting Task: ", target.todo.text, target.id);
        setTasks((prevTasks) => prevTasks.filter((_, i) => i !== index));
      })
      .catch((err) => console.error("ERR DEL TASK: ", err))
      .finally(() => setLoading(false));
  };

  // Updates task based off index
  const editTask = (index, newText) => {
    const target = tasks[index];
    if (!target) {
      console.log("NO TARGET");
      return;
    }

    setLoading(true);
    const options = {
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
      }),
    };

    fetch(API, options)
      .then((res) => {
        // console.log("Response:", res);
        return res.json();
      })
      .then((data) => {
        console.log("Editing Task : ", target.todo.text, target.id);
        setTasks((prevTasks) =>
          prevTasks.map((task, i) =>
            i === index ? { ...task, todo: { text: newText } } : task
          )
        );
        console.log("EDITED Task : ", newText, target.id);
      })
      .catch((err) => console.error("ERR EDIT TASK: ", err))
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
            // Using Item component for rows
            <Item
              key={index}
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
          ></input>
        </form>
      </section>
    </main>
  );
}

// Refactor the row into its own component
function Item({ task, index, deleteTask, editTask }) {
  // Turn it into editable TextInput + DONE button (when tapped)
  // Use states to track if editable or edited/changed text
  const [editable, setEditable] = useState(false);
  const text = task.todo.text;
  const [edited, setEdited] = useState(text);

  // Enable edits when text is clicked
  const makeEdits = () => {
    // Updates task to new value and toggles edit mode
    setEdited(text);
    setEditable(true);
  };

  // Updates the changed input
  const handleInputChange = (e) => {
    setEdited(e.target.value);
  };

  const save = () => {
    if (edited.trim().length === 0) {
      console.warn("Can't edit to an empty task! Try again!");
      return;
    }
    editTask(index, edited);
    setEditable(false);
  };

  return (
    <li className="taskListItem">
      {editable ? (
        // Show editable input field and done button
        <>
          <input
            type="text"
            value={edited}
            onChange={handleInputChange}
            className="editItem"
          />
          <button type="button" className="doneButton" onClick={save}>
            DONE
          </button>
        </>
      ) : (
        // Non-editable state to be clickable and show task text
        <>
          <span className="taskText" onClick={makeEdits}>
            {text}
          </span>
          <button
            type="button"
            className="deleteButton"
            onClick={() => deleteTask(index)}
          >
            X
          </button>
        </>
      )}
    </li>
  );
}
