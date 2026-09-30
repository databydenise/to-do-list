import { useEffect, useState } from 'react';

const STORAGE_KEY = 'minimal-tasks';

function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [inputValue, setInputValue] = useState('');
  const [selectedTag, setSelectedTag] = useState('None');
  const [statusFilter, setStatusFilter] = useState('All');
  const [tagFilter, setTagFilter] = useState('All');

  const [editingDescription, setEditingDescription] = useState(null);
  const [descriptionValue, setDescriptionValue] = useState('');
  const [dateValue, setDateValue] = useState('');

  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!inputValue.trim()) return;

    const newTask = {
      id: crypto.randomUUID(),
      title: inputValue.trim(),
      description: '',
      dueDate: '',
      completed: false,
      tag: selectedTag === 'None' ? null : selectedTag,
    };

    setTasks((currentTasks) => [...currentTasks, newTask]);
    setInputValue('');
    setSelectedTag('None');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') addTask();
  };

  const toggleTask = (id) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== id)
    );

    if (editingDescription === id) {
      setEditingDescription(null);
    }
  };

  const openDescriptionEditor = (task) => {
    setEditingDescription(task.id);
    setDescriptionValue(task.description || '');
    setDateValue(task.dueDate || '');
  };

  const saveTaskDetails = (id) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              description: descriptionValue.trim(),
              dueDate: dateValue,
            }
          : task
      )
    );

    setEditingDescription(null);
    setDescriptionValue('');
    setDateValue('');
  };

  const cancelTaskDetails = () => {
    setEditingDescription(null);
    setDescriptionValue('');
    setDateValue('');
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      statusFilter === 'All'
        ? true
        : statusFilter === 'Active'
        ? !task.completed
        : task.completed;

    const matchesTag =
      tagFilter === 'All'
        ? true
        : tagFilter === 'None'
        ? !task.tag
        : task.tag === tagFilter;

    return matchesStatus && matchesTag;
  });

  const activeCount = tasks.filter((task) => !task.completed).length;

  const formatDate = (date) => {
    if (!date) return '';

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="app-shell">
      <main className="app-container">
        <header className="header">
          <div>
            <p className="eyebrow">MY DAY</p>
            <h1>Tasks</h1>
            <p className="header-subtitle">
              Keep track of what needs to get done.
            </p>
          </div>

          <button
            className="panel-button"
            onClick={() => setShowPanel(true)}
            type="button"
          >
            <span>☷</span>
            Task Panel
          </button>
        </header>

        <section className="input-section">
          <input
            type="text"
            placeholder="What needs to be done?"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            aria-label="New task"
          />

          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="tag-select"
            aria-label="Task tag"
          >
            <option value="None">No Tag</option>
            <option value="Urgent">Urgent</option>
            <option value="Not Urgent">Not Urgent</option>
            <option value="Long Term">Long Term</option>
          </select>

          <button
            className="add-button"
            onClick={addTask}
            disabled={!inputValue.trim()}
            type="button"
          >
            Add task
          </button>
        </section>

        <section className="filters-section">
          <div className="filter-group">
            <span className="filter-label">Status</span>

            {['All', 'Active', 'Completed'].map((filter) => (
              <button
                key={filter}
                className={`filter-btn ${
                  statusFilter === filter ? 'active' : ''
                }`}
                onClick={() => setStatusFilter(filter)}
                type="button"
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="filter-group">
            <span className="filter-label">Tag</span>

            {['All', 'Urgent', 'Not Urgent', 'Long Term'].map((filter) => (
              <button
                key={filter}
                className={`filter-btn ${
                  tagFilter === filter ? 'active' : ''
                }`}
                onClick={() => setTagFilter(filter)}
                type="button"
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        <section className="task-section">
          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✓</div>
              <h2>No tasks found</h2>
              <p>Add a task above to get started.</p>
            </div>
          ) : (
            <ul className="task-list">
              {filteredTasks.map((task) => (
                <li
                  key={task.id}
                  className={`task-item ${
                    task.completed ? 'completed' : ''
                  }`}
                >
                  <div className="task-content">
                    <div className="task-main">
                      <input
                        className="task-checkbox"
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        aria-label={`Mark ${task.title} as ${
                          task.completed ? 'active' : 'completed'
                        }`}
                      />

                      <div className="task-title-area">
                        <span className="task-title">{task.title}</span>

                        {task.dueDate && (
                          <span className="due-date">
                            📅 {formatDate(task.dueDate)}
                          </span>
                        )}

                        <button
                          className="description-button"
                          onClick={() => openDescriptionEditor(task)}
                          type="button"
                        >
                          <span className="pencil-icon">✎</span>
                          {task.description
                            ? 'Edit description'
                            : 'Add description'}
                        </button>
                      </div>
                    </div>

                    <div className="task-meta">
                      {task.tag && (
                        <span
                          className={`task-tag tag-${task.tag
                            .toLowerCase()
                            .replace(' ', '-')}`}
                        >
                          {task.tag}
                        </span>
                      )}

                      <button
                        className="delete-btn"
                        onClick={() => deleteTask(task.id)}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {editingDescription === task.id && (
                    <div className="details-editor">
                      <label htmlFor={`description-${task.id}`}>
                        Task description
                      </label>

                      <textarea
                        id={`description-${task.id}`}
                        placeholder="Add more details about this task..."
                        value={descriptionValue}
                        onChange={(e) =>
                          setDescriptionValue(e.target.value)
                        }
                        rows="3"
                      />

                      <label htmlFor={`date-${task.id}`}>
                        Due date
                      </label>

                      <input
                        id={`date-${task.id}`}
                        className="date-input"
                        type="date"
                        value={dateValue}
                        onChange={(e) => setDateValue(e.target.value)}
                      />

                      <div className="editor-actions">
                        <button
                          className="save-button"
                          onClick={() => saveTaskDetails(task.id)}
                          type="button"
                        >
                          Save details
                        </button>

                        <button
                          className="cancel-button"
                          onClick={cancelTaskDetails}
                          type="button"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="footer">
          <span>
            <strong>{activeCount}</strong>{' '}
            {activeCount === 1 ? 'task' : 'tasks'} remaining
          </span>

          <span>{tasks.length} total</span>
        </footer>
      </main>

      {showPanel && (
        <div
          className="panel-overlay"
          onClick={() => setShowPanel(false)}
        >
          <aside
            className="task-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="panel-header">
              <div>
                <p className="eyebrow">OVERVIEW</p>
                <h2>Task Panel</h2>
              </div>

              <button
                className="close-panel"
                onClick={() => setShowPanel(false)}
                type="button"
                aria-label="Close task panel"
              >
                ×
              </button>
            </div>

            {tasks.length === 0 ? (
              <div className="panel-empty">
                <p>You don't have any tasks yet.</p>
              </div>
            ) : (
              <div className="panel-task-list">
                {tasks.map((task) => (
                  <article
                    key={task.id}
                    className={`panel-task ${
                      task.completed ? 'panel-completed' : ''
                    }`}
                  >
                    <div className="panel-task-top">
                      <h3>{task.title}</h3>

                      {task.completed && (
                        <span className="completed-badge">
                          Completed
                        </span>
                      )}
                    </div>

                    {task.description ? (
                      <p className="panel-description">
                        {task.description}
                      </p>
                    ) : (
                      <p className="no-description">
                        No description added.
                      </p>
                    )}

                    <div className="panel-task-meta">
                      {task.dueDate && (
                        <span>📅 {formatDate(task.dueDate)}</span>
                      )}

                      {task.tag && <span>{task.tag}</span>}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

export default App;
