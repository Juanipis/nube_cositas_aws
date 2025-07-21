// Enhanced Todo App with Markdown Support
class TodoApp {
  constructor() {
    this.API_BASE_URL = window.ENV?.API_BASE_URL || "http://localhost:8000";
    this.todos = [];
    this.viewMode = 'card'; // 'card' or 'list'
    this.currentEditId = null;
    this.simpleMDEEditor = null;
    this.editMDEEditor = null;
    
    this.initializeApp();
  }

  async initializeApp() {
    this.setupEventListeners();
    this.initializeMarkdownEditors();
    await this.loadTodos();
    this.updateTodoCount();
  }

  setupEventListeners() {
    // Form submission
    document.getElementById('todoForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.addTodo();
    });

    // View mode toggles
    document.getElementById('cardView').addEventListener('change', () => {
      this.viewMode = 'card';
      this.renderTodos();
    });

    document.getElementById('listView').addEventListener('change', () => {
      this.viewMode = 'list';
      this.renderTodos();
    });

    // Edit form submission
    document.getElementById('editForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveEdit();
    });
  }

  initializeMarkdownEditors() {
    // Initialize SimpleMDE for new todo content
    this.simpleMDEEditor = new SimpleMDE({
      element: document.getElementById('todoContent'),
      placeholder: 'Enter your markdown content here...\n\nYou can use:\n- **bold** and *italic* text\n- `code` blocks\n- # Headers\n- > Blockquotes\n- Lists and more!',
      spellChecker: false,
      autofocus: false,
      toolbar: [
        'bold', 'italic', 'heading', '|',
        'quote', 'unordered-list', 'ordered-list', '|',
        'link', 'image', '|',
        'code', 'table', '|',
        'preview', 'side-by-side', 'fullscreen', '|',
        'guide'
      ],
      renderingConfig: {
        singleLineBreaks: false,
        codeSyntaxHighlighting: true,
      }
    });

    // Initialize SimpleMDE for edit modal (will be done when modal opens)
  }

  // API Methods
  async apiCall(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      this.showToast(`API Error: ${error.message}`, 'error');
      throw error;
    }
  }

  async loadTodos() {
    try {
      this.showLoading();
      this.todos = await this.apiCall('/todos');
      this.renderTodos();
      this.updateTodoCount();
    } catch (error) {
      this.showEmptyState('Failed to load todos. Please check your connection.');
    }
  }

  async addTodo() {
    const title = document.getElementById('todoTitle').value.trim();
    const content = this.simpleMDEEditor.value().trim();

    if (!title) {
      this.showToast('Please enter a todo title', 'warning');
      return;
    }

    try {
      const newTodo = await this.apiCall('/todos', {
        method: 'POST',
        body: JSON.stringify({ 
          title: title,
          content: content || null
        }),
      });

      this.todos.unshift(newTodo);
      this.clearForm();
      this.renderTodos();
      this.updateTodoCount();
      this.showToast('Todo added successfully!', 'success');
    } catch (error) {
      this.showToast('Failed to add todo', 'error');
    }
  }

  async toggleTodo(id) {
    try {
      const todo = this.todos.find(t => t.id === id);
      if (!todo) return;

      const updatedTodo = await this.apiCall(`/todos/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ completed: !todo.completed }),
      });

      const index = this.todos.findIndex(t => t.id === id);
      if (index !== -1) {
        this.todos[index] = updatedTodo;
      }

      this.renderTodos();
      this.showToast(
        `Todo ${updatedTodo.completed ? 'completed' : 'marked as pending'}!`, 
        'success'
      );
    } catch (error) {
      this.showToast('Failed to update todo', 'error');
    }
  }

  async deleteTodo(id) {
    if (!confirm('Are you sure you want to delete this todo?')) {
      return;
    }

    try {
      await this.apiCall(`/todos/${id}`, {
        method: 'DELETE',
      });

      this.todos = this.todos.filter(t => t.id !== id);
      this.renderTodos();
      this.updateTodoCount();
      this.showToast('Todo deleted successfully!', 'success');
    } catch (error) {
      this.showToast('Failed to delete todo', 'error');
    }
  }

  openEditModal(id) {
    const todo = this.todos.find(t => t.id === id);
    if (!todo) return;

    this.currentEditId = id;
    document.getElementById('editTodoId').value = id;
    document.getElementById('editTodoTitle').value = todo.title;

    // Initialize or update edit markdown editor
    if (this.editMDEEditor) {
      this.editMDEEditor.value(todo.content || '');
    } else {
      // Initialize SimpleMDE for edit modal
      setTimeout(() => {
        this.editMDEEditor = new SimpleMDE({
          element: document.getElementById('editTodoContent'),
          initialValue: todo.content || '',
          spellChecker: false,
          toolbar: [
            'bold', 'italic', 'heading', '|',
            'quote', 'unordered-list', 'ordered-list', '|',
            'link', 'image', '|',
            'code', 'table', '|',
            'preview', 'side-by-side', 'fullscreen'
          ]
        });
      }, 100);
    }

    const modal = new bootstrap.Modal(document.getElementById('editModal'));
    modal.show();
  }

  async saveEdit() {
    const id = parseInt(document.getElementById('editTodoId').value);
    const title = document.getElementById('editTodoTitle').value.trim();
    const content = this.editMDEEditor ? this.editMDEEditor.value().trim() : '';

    if (!title) {
      this.showToast('Please enter a todo title', 'warning');
      return;
    }

    try {
      const updatedTodo = await this.apiCall(`/todos/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ 
          title: title,
          content: content || null
        }),
      });

      const index = this.todos.findIndex(t => t.id === id);
      if (index !== -1) {
        this.todos[index] = updatedTodo;
      }

      this.renderTodos();
      this.showToast('Todo updated successfully!', 'success');
      
      // Close modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
      modal.hide();
    } catch (error) {
      this.showToast('Failed to update todo', 'error');
    }
  }

  // UI Methods
  renderTodos() {
    const container = document.getElementById('todosContainer');
    
    if (this.todos.length === 0) {
      this.showEmptyState();
      return;
    }

    const containerClass = this.viewMode === 'list' ? 'list-view' : 'card-view';
    
    container.innerHTML = `
      <div class="${containerClass}">
        ${this.todos.map(todo => this.renderTodoItem(todo)).join('')}
      </div>
    `;
  }

  renderTodoItem(todo) {
    const formattedDate = new Date(todo.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const completedClass = todo.completed ? 'completed' : 'pending';
    const renderedContent = todo.content ? marked.parse(todo.content) : '';
    
    return `
      <div class="todo-item ${completedClass}" data-todo-id="${todo.id}">
        <div class="todo-title">${this.escapeHtml(todo.title)}</div>
        
        ${todo.content ? `
          <div class="todo-content">
            ${renderedContent}
          </div>
        ` : ''}
        
        <div class="todo-meta">
          <i class="fas fa-calendar-alt me-1"></i>
          Created: ${formattedDate}
          ${todo.completed ? '<span class="badge bg-success ms-2">Completed</span>' : '<span class="badge bg-primary ms-2">Pending</span>'}
        </div>
        
        <div class="todo-actions">
          <button class="btn btn-sm ${todo.completed ? 'btn-warning' : 'btn-success'}" 
                  onclick="todoApp.toggleTodo(${todo.id})">
            <i class="fas ${todo.completed ? 'fa-undo' : 'fa-check'} me-1"></i>
            ${todo.completed ? 'Undo' : 'Complete'}
          </button>
          <button class="btn btn-sm btn-outline-primary" 
                  onclick="todoApp.openEditModal(${todo.id})">
            <i class="fas fa-edit me-1"></i>
            Edit
          </button>
          <button class="btn btn-sm btn-danger" 
                  onclick="todoApp.deleteTodo(${todo.id})">
            <i class="fas fa-trash me-1"></i>
            Delete
          </button>
        </div>
      </div>
    `;
  }

  showLoading() {
    document.getElementById('todosContainer').innerHTML = `
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading your todos...</p>
      </div>
    `;
  }

  showEmptyState(message = null) {
    const defaultMessage = `
      <div class="empty-state">
        <i class="fas fa-clipboard-list"></i>
        <h4>No todos yet</h4>
        <p>Create your first todo above to get started!</p>
      </div>
    `;

    const errorMessage = `
      <div class="empty-state">
        <i class="fas fa-exclamation-triangle text-warning"></i>
        <h4>Something went wrong</h4>
        <p>${message}</p>
        <button class="btn btn-primary" onclick="todoApp.loadTodos()">
          <i class="fas fa-refresh me-2"></i>Try Again
        </button>
      </div>
    `;

    document.getElementById('todosContainer').innerHTML = message ? errorMessage : defaultMessage;
  }

  clearForm() {
    document.getElementById('todoTitle').value = '';
    if (this.simpleMDEEditor) {
      this.simpleMDEEditor.value('');
    }
  }

  updateTodoCount() {
    const count = this.todos.length;
    const completedCount = this.todos.filter(t => t.completed).length;
    document.getElementById('todoCount').textContent = count;
    
    // Update page title
    document.title = `Todo App (${count})${count > 0 ? ` - ${completedCount}/${count} completed` : ''}`;
  }

  showToast(message, type = 'info') {
    const toastEl = document.getElementById('liveToast');
    const toastBody = document.getElementById('toastBody');
    const toastHeader = toastEl.querySelector('.toast-header');
    
    // Update toast styling based on type
    toastEl.className = `toast ${type === 'error' ? 'bg-danger' : type === 'success' ? 'bg-success' : type === 'warning' ? 'bg-warning' : 'bg-info'}`;
    
    if (type === 'error' || type === 'success') {
      toastEl.classList.add('text-white');
      toastHeader.classList.add('text-white');
    }
    
    // Update icon based on type
    const icon = toastHeader.querySelector('i');
    icon.className = `fas ${type === 'error' ? 'fa-exclamation-circle' : type === 'success' ? 'fa-check-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'} me-2`;
    
    toastBody.textContent = message;
    
    const toast = new bootstrap.Toast(toastEl, {
      autohide: true,
      delay: type === 'error' ? 5000 : 3000
    });
    
    toast.show();
  }

  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

// Global functions for onclick handlers
window.clearForm = function() {
  todoApp.clearForm();
};

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Wait for environment configuration to load
  setTimeout(() => {
    window.todoApp = new TodoApp();
  }, 100);
});
