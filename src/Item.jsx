import { useState } from "react";

// Component for a single task item in the list
export default function Item({ task, index, deleteTask, editTask }) {
  // State to track whether the task is in edit mode
  const [editable, setEditable] = useState(false);
  // Stores the current text of the task
  const text = task.todo.text;
  // State to store the edited text when modifying a task
  const [edited, setEdited] = useState(text);

  // Enable edits when text is clicked
  const makeEdits = () => {
    // Reset edited text to the original task text
    setEdited(text);
    setEditable(true);
  };

  // Updates the state with the new input text while editing
  const handleInputChange = (e) => {
    setEdited(e.target.value);
  };

  // Saves the edited task to edited if it's not empty
  const save = () => {
    if (edited.trim().length === 0) {
      console.warn("Can't edit to an empty task! Try again!");
      return;
    }
    // Update the task in the parent component
    editTask(index, edited);
    setEditable(false);
  };

  return (
    <li className="taskListItem">
      {editable ? (
        // Show editable input field and done button when in edit mode
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
