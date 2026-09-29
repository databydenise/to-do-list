import { useState, useEffect } from 'react';

function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('minimal-tasks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [inputValue, setInputValue] = useState('');
  const [selectedTag, setSelectedTag] = useState('None');
  const [statusFilter, setStatusFilter] = useState('All');
  const [tagFilter, setTagFilter] = useState('All');

  // Persist tasks on change
  useEffect(() => {
    localStorage.setItem('minimal-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!inputValue.trim()) return;

    const newTask = {
      id: crypto.randomUUID(),
      title: inputValue.trim(),
      completed: false,
      tag: selectedTag === 'None' ? null : selectedTag
    };

    setTasks([...tasks, newTask]);
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') addTask();
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const filteredTasks = tasks.filter(task => {
    const matchesStatus =
      statusFilter === 'All' ? true :
      statusFilter === 'Active' ? !task.completed :
      task.completed;

    const matchesTag =
      tagFilter === 'All' ? true :
      tagFilter === 'None' ? !task.tag :
      task.tag === tagFilter;

    return matchesStatus && matchesTag;
  });

  const activeCount = tasks.filter(t => !t.completed).length;

  return (
    <div className="app-container">
      <header className="header">
        <h1>Tasks</h1>
      </header>

      <div className="input-section">
        <input
          type="text"
          placeholder="What needs to be done?"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          className="tag-select"
        >
          <option value="None">No Tag</option>
          <option value="Urgent">Urgent</option>
          <option value="Not Urgent">Not Urgent</option>
          <option value="Long Term">Long Term</option>
        </select>
        <button onClick={addTask} disabled={!inputValue.trim()}>Add</button>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <span className="filter-label">Status:</span>
          {['All', 'Active', 'Completed'].map(f => (
            <button
              key={f}
              className={`filter-btn ${statusFilter === f ? 'active' : ''}`}
              onClick={() => setStatusFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="filter-group">
          <span className="filter-label">Tag:</span>
          {['All', 'Urgent', 'Not Urgent', 'Long Term'].map(f => (
            <button
              key={f}
              className={`filter-btn ${tagFilter === f ? 'active' : ''}`}
              onClick={() => setTagFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <ul className="task-list">
        {filteredTasks.length === 0 ? (
          <li className="empty-state">No tasks found.</li>
        ) : (
          filteredTasks.map(task => (
            <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
              <div className="task-main">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                />
                <span className="task-title">{task.title}</span>
              </div>
              <div className="task-meta">
                {task.tag && (
                  <span className={`task-tag tag-${task.tag.toLowerCase().replace(' ', '-')}`}>
                    {task.tag}
                  </span>
                )}
                <button className="delete-btn" onClick={() => deleteTask(task.id)}>Delete</button>
              </div>
            </li>
          ))
        )}
      </ul>

      <footer className="footer">
        <span>{activeCount} {activeCount === 1 ? 'task' : 'tasks'} remaining</span>
        <span>{tasks.length} total</span>
      </footer>
    </div>
  );
}

export default App;
