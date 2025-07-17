// Environment configuration
const API_BASE_URL = window.ENV?.API_BASE_URL || "http://localhost:8000";

// DOM elements
const todoInput = document.getElementById("todoInput");
const todosList = document.getElementById("todosList");

// State
let todos = [];

// Initialize the app
document.addEventListener("DOMContentLoaded", function () {
  loadTodos();
});

// API functions
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API call failed:", error);
    showError(`API call failed: ${error.message}`);
    throw error;
  }
}

// Load todos from backend
async function loadTodos() {
  try {
    showLoading();
    todos = await apiCall("/todos");
    renderTodos();
  } catch (error) {
    showError("Failed to load todos");
  }
}

// Add new todo
async function addTodo() {
  const title = todoInput.value.trim();
  if (!title) {
    showError("Please enter a todo title");
    return;
  }

  try {
    const newTodo = await apiCall("/todos", {
      method: "POST",
      body: JSON.stringify({ title: title }),
    });

    todos.push(newTodo);
    todoInput.value = "";
    renderTodos();
  } catch (error) {
    showError("Failed to add todo");
  }
}

// Toggle todo completion
async function toggleTodo(id) {
  try {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const updatedTodo = await apiCall(`/todos/${id}`, {
      method: "PUT",
      body: JSON.stringify({ completed: !todo.completed }),
    });

    const index = todos.findIndex((t) => t.id === id);
    if (index !== -1) {
      todos[index] = updatedTodo;
    }

    renderTodos();
  } catch (error) {
    showError("Failed to update todo");
  }
}

// Delete todo
async function deleteTodo(id) {
  try {
    await apiCall(`/todos/${id}`, {
      method: "DELETE",
    });

    todos = todos.filter((t) => t.id !== id);
    renderTodos();
  } catch (error) {
    showError("Failed to delete todo");
  }
}

// Render todos to DOM
function renderTodos() {
  if (todos.length === 0) {
    todosList.innerHTML = '<p class="loading">No todos yet. Add one above!</p>';
    return;
  }

  todosList.innerHTML = todos
    .map(
      (todo) => `
        <div class="todo-item ${todo.completed ? "todo-completed" : ""}">
            <div class="todo-content">
                <div class="todo-title">${escapeHtml(todo.title)}</div>
            </div>
            <div class="todo-actions">
                <button class="btn-complete" onclick="toggleTodo(${todo.id})">
                    ${todo.completed ? "Undo" : "Complete"}
                </button>
                <button class="btn-delete" onclick="deleteTodo(${todo.id})">
                    Delete
                </button>
            </div>
        </div>
    `
    )
    .join("");
}

// Utility functions
function showLoading() {
  todosList.innerHTML = '<p class="loading">Loading todos...</p>';
}

function showError(message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "error";
  errorDiv.textContent = message;

  // Remove existing error messages
  const existingError = document.querySelector(".error");
  if (existingError) {
    existingError.remove();
  }

  // Insert error message at the top of the container
  const container = document.querySelector(".container");
  container.insertBefore(errorDiv, container.firstChild);

  // Auto-remove error after 5 seconds
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Allow adding todos with Enter key
todoInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    addTodo();
  }
});
