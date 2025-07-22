// Advanced Todo App with Enhanced Markdown Editor
class AdvancedTodoApp {
  constructor() {
    this.API_BASE_URL = window.ENV?.API_BASE_URL || "http://localhost:8000";
    this.todos = [];
    this.viewMode = 'card';
    this.filterMode = 'all';
    this.currentEditId = null;
    this.currentTheme = 'default';
    this.previewMode = 'side-by-side';
    
    // Editor instances
    this.mainEditor = null;
    this.editEditor = null;
    
    this.initializeApp();
  }

  async initializeApp() {
    this.setupEventListeners();
    this.initializeMarkdownEditors();
    this.setupMarkedOptions();
    await this.loadTodos();
    this.updateTodoCount();
    this.setupKeyboardShortcuts();
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

    // Filter toggles
    document.getElementById('filterAll').addEventListener('change', () => {
      this.filterMode = 'all';
      this.renderTodos();
    });

    document.getElementById('filterPending').addEventListener('change', () => {
      this.filterMode = 'pending';
      this.renderTodos();
    });

    document.getElementById('filterCompleted').addEventListener('change', () => {
      this.filterMode = 'completed';
      this.renderTodos();
    });

    // Edit form submission
    document.getElementById('editForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveEdit();
    });
  }

  setupMarkedOptions() {
    // Configure marked.js for better rendering
    marked.setOptions({
      highlight: function(code, lang) {
        if (hljs && lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(code, { language: lang }).value;
          } catch (err) {}
        }
        return code;
      },
      breaks: true,
      gfm: true
    });
  }

  initializeMarkdownEditors() {
    // Initialize main editor with CodeMirror
    const mainTextarea = document.getElementById('todoContent');
    this.mainEditor = CodeMirror.fromTextArea(mainTextarea, {
      mode: 'markdown',
      theme: 'default',
      lineNumbers: true,
      lineWrapping: true,
      styleActiveLine: true,
      scrollbarStyle: 'simple',
      extraKeys: {
        'Ctrl-Space': 'autocomplete',
        'Ctrl-/': 'toggleComment',
        'Ctrl-B': () => this.insertMarkdown('**', '**'),
        'Ctrl-I': () => this.insertMarkdown('*', '*'),
        'Ctrl-K': () => this.insertMarkdown('[', '](url)'),
      },
      placeholder: this.getEditorPlaceholder()
    });

    // Set up live preview for main editor
    this.mainEditor.on('change', () => {
      this.updatePreview();
      this.updateEditorStats();
    });

    // Initial preview update
    setTimeout(() => {
      this.updatePreview();
      this.updateEditorStats();
    }, 100);
  }

  getEditorPlaceholder() {
    return `# Welcome to Advanced Markdown Editor!

Start typing your markdown content here...

## Features Available:
- **Bold text** and *italic text*
- \`Code blocks\` and syntax highlighting
- [Links](https://example.com)
- > Blockquotes
- Lists and tables
- And much more!

## Live Preview
See your markdown rendered in real-time on the right panel!`;
  }

  updatePreview() {
    const content = this.mainEditor.getValue();
    const preview = document.getElementById('markdownPreview');
    
    if (content.trim()) {
      try {
        const rendered = marked.parse(content);
        preview.innerHTML = rendered;
        
        // Highlight code blocks
        if (window.hljs) {
          preview.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
          });
        }
      } catch (error) {
        preview.innerHTML = `<div class="alert alert-warning">
          <i class="fas fa-exclamation-triangle me-2"></i>
          Error rendering markdown: ${error.message}
        </div>`;
      }
    } else {
      preview.innerHTML = `
        <div class="text-center text-muted">
          <i class="fas fa-edit fa-2x mb-3"></i>
          <p>Start typing in the editor to see live preview here</p>
        </div>
      `;
    }
  }

  updateEditPreview() {
    if (!this.editEditor) return;
    
    const content = this.editEditor.getValue();
    const preview = document.getElementById('editMarkdownPreview');
    
    if (content.trim()) {
      try {
        const rendered = marked.parse(content);
        preview.innerHTML = rendered;
        
        // Highlight code blocks
        if (window.hljs) {
          preview.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
          });
        }
      } catch (error) {
        preview.innerHTML = `<div class="alert alert-warning">
          <i class="fas fa-exclamation-triangle me-2"></i>
          Error rendering markdown: ${error.message}
        </div>`;
      }
    } else {
      preview.innerHTML = `
        <div class="text-center text-muted">
          <i class="fas fa-edit fa-2x mb-3"></i>
          <p>Start editing to see preview</p>
        </div>
      `;
    }
  }

  updateEditorStats() {
    const content = this.mainEditor.getValue();
    const chars = content.length;
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const lines = this.mainEditor.lineCount();
    
    document.getElementById('editorStats').textContent = 
      `${chars} characters, ${words} words, ${lines} lines`;
  }

  insertMarkdown(start, end) {
    const editor = this.mainEditor;
    const selection = editor.getSelection();
    const replacement = start + (selection || 'text') + end;
    editor.replaceSelection(replacement);
    editor.focus();
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
    const content = this.mainEditor.getValue().trim();

    if (!title) {
      this.showToast('Please enter a todo title', 'warning');
      return;
    }

    try {
      this.showToast('Creating todo...', 'info');
      
      const newTodo = await this.apiCall('/todos', {
        method: 'POST',
        body: JSON.stringify({ 
          title: title,
          content: content || null
        }),
      });

      this.todos.unshift(newTodo);
      this.clearEditor();
      this.renderTodos();
      this.updateTodoCount();
      this.showToast('Todo created successfully!', 'success');
    } catch (error) {
      this.showToast('Failed to create todo', 'error');
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

    // Initialize edit editor if not already done
    if (!this.editEditor) {
      const editTextarea = document.getElementById('editTodoContent');
      this.editEditor = CodeMirror.fromTextArea(editTextarea, {
        mode: 'markdown',
        theme: 'default',
        lineNumbers: true,
        lineWrapping: true,
        styleActiveLine: true,
      });

      this.editEditor.on('change', () => {
        this.updateEditPreview();
      });
    }

    // Set content
    this.editEditor.setValue(todo.content || '');
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editModal'));
    modal.show();

    // Update preview after modal is shown
    setTimeout(() => {
      this.editEditor.refresh();
      this.updateEditPreview();
    }, 300);
  }

  async saveEdit() {
    const id = parseInt(document.getElementById('editTodoId').value);
    const title = document.getElementById('editTodoTitle').value.trim();
    const content = this.editEditor ? this.editEditor.getValue().trim() : '';

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
    
    let filteredTodos = this.todos;
    
    // Apply filter
    if (this.filterMode === 'pending') {
      filteredTodos = this.todos.filter(t => !t.completed);
    } else if (this.filterMode === 'completed') {
      filteredTodos = this.todos.filter(t => t.completed);
    }
    
    if (filteredTodos.length === 0) {
      this.showEmptyState();
      return;
    }

    const containerClass = this.viewMode === 'list' ? 'list-view' : 'card-view';
    
    container.innerHTML = `
      <div class="${containerClass}">
        ${filteredTodos.map(todo => this.renderTodoItem(todo)).join('')}
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
          <div class="todo-content markdown-preview">
            ${renderedContent}
          </div>
        ` : ''}
        
        <div class="todo-meta">
          <i class="fas fa-calendar-alt me-2"></i>
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
        <p class="mt-3 text-muted">Loading your amazing todos...</p>
      </div>
    `;
  }

  showEmptyState(message = null) {
    const defaultMessage = `
      <div class="empty-state">
        <i class="fas fa-clipboard-list"></i>
        <h4>No todos found</h4>
        <p>Create your first todo with the amazing markdown editor above!</p>
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

  clearEditor() {
    document.getElementById('todoTitle').value = '';
    if (this.mainEditor) {
      this.mainEditor.setValue('');
      this.mainEditor.focus();
    }
    this.updatePreview();
    this.updateEditorStats();
  }

  updateTodoCount() {
    const count = this.todos.length;
    const completedCount = this.todos.filter(t => t.completed).length;
    const pendingCount = count - completedCount;
    
    document.getElementById('todoCount').textContent = count;
    
    // Update page title
    document.title = `Advanced Todo (${count})${count > 0 ? ` - ${pendingCount} pending` : ''}`;
  }

  showToast(message, type = 'info') {
    const toastEl = document.getElementById('liveToast');
    const toastBody = document.getElementById('toastBody');
    const toastHeader = toastEl.querySelector('.toast-header');
    
    // Reset classes
    toastEl.className = 'toast';
    
    // Update styling based on type
    if (type === 'error') {
      toastEl.classList.add('bg-danger', 'text-white');
      toastHeader.classList.add('bg-danger', 'text-white');
    } else if (type === 'success') {
      toastEl.classList.add('bg-success', 'text-white');
      toastHeader.classList.add('bg-success', 'text-white');
    } else if (type === 'warning') {
      toastEl.classList.add('bg-warning');
    } else {
      toastEl.classList.add('bg-info', 'text-white');
      toastHeader.classList.add('bg-info', 'text-white');
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

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+N - New todo (focus title)
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        document.getElementById('todoTitle').focus();
      }
      
      // Ctrl+R - Refresh todos
      if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        this.loadTodos();
      }
    });
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

// Global functions for HTML onclick handlers
window.clearEditor = function() {
  todoApp.clearEditor();
};

window.toggleEditorTheme = function() {
  const themes = ['default', 'material', 'material-darker', 'dracula'];
  const currentIndex = themes.indexOf(todoApp.currentTheme);
  const nextIndex = (currentIndex + 1) % themes.length;
  const newTheme = themes[nextIndex];
  
  todoApp.currentTheme = newTheme;
  todoApp.mainEditor.setOption('theme', newTheme);
  
  if (todoApp.editEditor) {
    todoApp.editEditor.setOption('theme', newTheme);
  }
  
  todoApp.showToast(`Theme changed to ${newTheme}`, 'info');
};

window.togglePreviewMode = function() {
  const previewPanel = document.querySelector('.preview-panel');
  const editorPanel = document.querySelector('.editor-panel');
  
  if (todoApp.previewMode === 'side-by-side') {
    // Hide preview
    previewPanel.style.display = 'none';
    editorPanel.classList.remove('col-lg-6');
    editorPanel.classList.add('col-lg-12');
    todoApp.previewMode = 'editor-only';
    todoApp.showToast('Preview hidden', 'info');
  } else {
    // Show preview
    previewPanel.style.display = 'block';
    editorPanel.classList.remove('col-lg-12');
    editorPanel.classList.add('col-lg-6');
    todoApp.previewMode = 'side-by-side';
    todoApp.showToast('Preview shown', 'info');
  }
  
  // Refresh editor
  setTimeout(() => {
    todoApp.mainEditor.refresh();
  }, 100);
};

window.copyMarkdown = function() {
  const content = todoApp.mainEditor.getValue();
  if (content) {
    navigator.clipboard.writeText(content).then(() => {
      todoApp.showToast('Markdown copied to clipboard!', 'success');
    }).catch(() => {
      todoApp.showToast('Failed to copy to clipboard', 'error');
    });
  } else {
    todoApp.showToast('Nothing to copy', 'warning');
  }
};

window.insertTemplate = function() {
  const template = `# Project Task

## Description
Brief description of what needs to be done.

## Steps
1. [ ] First step
2. [ ] Second step
3. [ ] Final step

## Notes
- Important note 1
- Important note 2

## Code Example
\`\`\`javascript
// Your code here
console.log("Hello, World!");
\`\`\`

> **Tip:** You can edit this template to fit your needs!
`;

  todoApp.mainEditor.setValue(template);
  todoApp.mainEditor.focus();
  todoApp.showToast('Template inserted!', 'success');
};

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Wait for environment configuration to load
  setTimeout(() => {
    window.todoApp = new AdvancedTodoApp();
  }, 100);
});
