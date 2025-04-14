import React, { useState } from "react";

// ===== Utility Functions =====
function parseDateStr(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function getDaysInCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  return days;
}

function getCalendarDates(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const dayOfWeek = firstOfMonth.getDay();
  const startDate = new Date(year, month, 1 - dayOfWeek);
  const dates = [];
  for (let i = 0; i < 42; i++) {
    dates.push(new Date(startDate));
    startDate.setDate(startDate.getDate() + 1);
  }
  return dates;
}

function categorizeTasksByDeadline(tasks) {
  const now = new Date();
  const categories = {
    dueToday: [],
    dueThisWeek: [],
    dueNextWeek: [],
    future: [],
  };
  tasks.forEach((task) => {
    if (!task.deadline) {
      categories.future.push(task);
      return;
    }
    const dl = parseDateStr(task.deadline);
    if (!dl) {
      categories.future.push(task);
      return;
    }
    const diffInDays = Math.floor((dl - now) / (1000 * 60 * 60 * 24));
    if (diffInDays < 1) categories.dueToday.push(task);
    else if (diffInDays < 7) categories.dueThisWeek.push(task);
    else if (diffInDays < 14) categories.dueNextWeek.push(task);
    else categories.future.push(task);
  });
  return categories;
}

function isDayWithinRange(day, startStr, endStr) {
  const start = parseDateStr(startStr);
  const end = parseDateStr(endStr);
  if (!start || !end) return false;
  return day >= start && day <= end;
}

// ==================== Main App Component ====================
function App() {
  // ------------------- Authentication & State -------------------
  const [token, setToken] = useState("");
  const [authMessage, setAuthMessage] = useState("");

  // Sign in fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Toggle for Sign in/up
  const [isSignUp, setIsSignUp] = useState(false);

  // Sign up fields
  const [signUpName, setSignUpName] = useState("");
  const [signUpPhone, setSignUpPhone] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");
  const [signUpError, setSignUpError] = useState("");

  // Task data
  const [tasks, setTasks] = useState([]);
  const [currentView, setCurrentView] = useState("list");
  const [viewAll, setViewAll] = useState(false);

  // Modal for adding a task
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");
  const [newTaskResponsible, setNewTaskResponsible] = useState("");
  const [newTaskStartDate, setNewTaskStartDate] = useState("");

  // ------------------- Styles -------------------
  const containerStyle = { fontFamily: "'Segoe UI', sans-serif" };

  // ---------- Authentication Page Styles (Split-Screen) ----------
  const authPageStyle = {
    display: "flex",
    width: "100%",
    minHeight: "100vh",
    backgroundColor: "#F0F2F5",
  };

  const authLeftStyle = {
    flex: 1,
    maxWidth: "600px",
    backgroundColor: "lightblue",
    padding: "40px 50px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  };

  const authRightStyle = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    padding: "20px",
  };

  const authRightImgStyle = {
    display: "block",
    maxWidth: "70%",
    maxHeight: "70%",
    objectFit: "contain",
    opacity: 0.8,
  };

  const authHeadingStyle = {
    fontSize: "24px",
    marginBottom: "10px",
    fontWeight: 600,
    color: "#333",
  };

  const authSubHeadingStyle = {
    fontSize: "14px",
    color: "#777",
    marginBottom: "20px",
  };

  const inputStyle = {
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    marginBottom: "10px",
    width: "100%",
  };

  const buttonStyle = {
    padding: "12px",
    border: "none",
    borderRadius: "4px",
    backgroundColor: "#5E60CE",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
    marginBottom: "10px",
    width: "100%",
  };

  // Main app container (after login)
  const mainContainerStyle = {
    maxWidth: "1200px",
    margin: "40px auto",
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  };

  const topNavStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  };

  const navButtonsStyle = {
    display: "flex",
    gap: "15px",
  };

  const subNavStyle = {
    display: "flex",
    gap: "20px",
    borderBottom: "1px solid #ccc",
    marginBottom: "20px",
    paddingBottom: "10px",
  };

  const subNavItemStyle = (active) => ({
    cursor: "pointer",
    borderBottom: active ? "3px solid #5E60CE" : "3px solid transparent",
    fontWeight: active ? "bold" : "normal",
    color: active ? "#5E60CE" : "#555",
    padding: "5px 0",
  });

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
  };

  const thStyle = {
    backgroundColor: "#5E60CE",
    color: "#fff",
    padding: "10px",
    border: "1px solid #ddd",
    textAlign: "left",
  };

  const tdStyle = {
    padding: "10px",
    border: "1px solid #ddd",
  };

  const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  };

  const modalContentStyle = {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "8px",
    width: "90%",
    maxWidth: "500px",
  };

  // ------------------- Auth Handlers -------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthMessage("");
    const formData = new URLSearchParams();
    formData.append("username", loginEmail);
    formData.append("password", loginPassword);
    try {
      // Use the correct absolute URL for login
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        console.error("HTTP error!", res.status);
        setAuthMessage(`Login failed: HTTP ${res.status}`);
        return;
      }
      const data = await res.json();
      console.log("Login response:", data);
      if (data.access_token) {
        setToken(data.access_token);
        setAuthMessage("Login Successful!");
        fetchTasks(data.access_token);
      } else {
        setAuthMessage(data.detail || "Login failed.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setAuthMessage("Login error. Check console.");
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setSignUpError("");
    setAuthMessage("");
    if (!signUpName || !signUpPhone || !signUpEmail || !signUpPassword) {
      setSignUpError("Please fill in all fields.");
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setSignUpError("Passwords do not match.");
      return;
    }
    const signupData = {
      username: signUpEmail,
      password: signUpPassword,
      name: signUpName,
      phone: signUpPhone,
    };
    try {
      const res = await fetch("http://localhost:8000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
      });
      const data = await res.json();
      console.log("Signup response:", data);
      if (data.detail) {
        setSignUpError(data.detail);
      } else if (data.access_token) {
        setToken(data.access_token);
        setAuthMessage("Signup Successful!");
        fetchTasks(data.access_token);
      }
    } catch (error) {
      console.error("Signup error:", error);
      setSignUpError("Signup error. Check console.");
    }
  };

  const handleLogout = () => {
    setToken("");
    setAuthMessage("You have been logged out.");
  };

  // ------------------- Task Handlers -------------------
  const fetchTasks = async (authToken = token) => {
    try {
      const url = viewAll
        ? "http://localhost:8000/tasks?all=true"
        : "http://localhost:8000/tasks";
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      console.log("Fetched tasks:", data);
      setTasks(data);
    } catch (error) {
      console.error("Fetch tasks error:", error);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    const newTaskObj = {
      description: newTaskName,
      deadline: newTaskDeadline,
      responsible_person: newTaskResponsible,
      start_date: newTaskStartDate,
    };
    try {
      await fetch("http://localhost:8000/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTaskObj),
      });
      setShowTaskModal(false);
      setNewTaskName("");
      setNewTaskDeadline("");
      setNewTaskResponsible("");
      setNewTaskStartDate("");
      fetchTasks();
    } catch (error) {
      console.error("Add task error:", error);
    }
  };

  const handleCompleteTask = async (id) => {
    try {
      await fetch(`http://localhost:8000/tasks/${id}/complete`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
    } catch (error) {
      console.error("Complete task error:", error);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await fetch(`http://localhost:8000/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
    } catch (error) {
      console.error("Delete task error:", error);
    }
  };

  // ------------------- Render Functions -------------------
  // Render the authentication page (split-screen).
  function renderAuthPage() {
    return (
      <div style={authPageStyle}>
        <div style={authLeftStyle}>
          <h2 style={authHeadingStyle}>Tasky</h2>
          <p style={authSubHeadingStyle}>
            {isSignUp
              ? "Create your account."
              : "Welcome back! Please sign in."}
          </p>
          {isSignUp ? renderSignupForm() : renderLoginForm()}
        </div>
        <div style={authRightStyle}>
          <img src="/login.jpeg" alt="Login" style={authRightImgStyle} />
        </div>
      </div>
    );
  }

  function renderLoginForm() {
    return (
      <form
        onSubmit={handleLogin}
        style={{ display: "flex", flexDirection: "column" }}
      >
        {authMessage && <p style={{ color: "green" }}>{authMessage}</p>}
        <label>Email</label>
        <input
          type="email"
          placeholder="Enter email"
          style={inputStyle}
          required
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
        />
        <label>Password</label>
        <input
          type="password"
          placeholder="Enter password"
          style={inputStyle}
          required
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
        />
        <button type="submit" style={buttonStyle}>
          Sign In
        </button>
        <div style={{ textAlign: "center", margin: "8px 0" }}>
          Or continue with
        </div>
        <button
          type="button"
          style={{ ...buttonStyle, backgroundColor: "#4285F4" }}
        >
          Log in with Google
        </button>
        <div style={{ textAlign: "center", marginTop: "10px" }}>
          Don't have an account?{" "}
          <span
            onClick={() => {
              setIsSignUp(true);
              setAuthMessage("");
            }}
            style={{ color: "#5E60CE", cursor: "pointer", fontWeight: "bold" }}
          >
            Sign Up
          </span>
        </div>
      </form>
    );
  }

  function renderSignupForm() {
    return (
      <form
        onSubmit={handleSignUp}
        style={{ display: "flex", flexDirection: "column" }}
      >
        {signUpError && <p style={{ color: "red" }}>{signUpError}</p>}
        {authMessage && <p style={{ color: "green" }}>{authMessage}</p>}
        <label>Full Name</label>
        <input
          type="text"
          placeholder="Enter full name"
          style={inputStyle}
          required
          value={signUpName}
          onChange={(e) => setSignUpName(e.target.value)}
        />
        <label>Phone Number</label>
        <input
          type="text"
          placeholder="Enter phone number"
          style={inputStyle}
          required
          value={signUpPhone}
          onChange={(e) => setSignUpPhone(e.target.value)}
        />
        <label>Email</label>
        <input
          type="email"
          placeholder="Enter email"
          style={inputStyle}
          required
          value={signUpEmail}
          onChange={(e) => setSignUpEmail(e.target.value)}
        />
        <label>Password</label>
        <input
          type="password"
          placeholder="Enter password"
          style={inputStyle}
          required
          value={signUpPassword}
          onChange={(e) => setSignUpPassword(e.target.value)}
        />
        <label>Confirm Password</label>
        <input
          type="password"
          placeholder="Confirm password"
          style={inputStyle}
          required
          value={signUpConfirmPassword}
          onChange={(e) => setSignUpConfirmPassword(e.target.value)}
        />
        <button type="submit" style={buttonStyle}>
          Sign Up
        </button>
        <div style={{ textAlign: "center", marginTop: "10px" }}>
          Already have an account?{" "}
          <span
            onClick={() => {
              setIsSignUp(false);
              setAuthMessage("");
            }}
            style={{ color: "#5E60CE", cursor: "pointer", fontWeight: "bold" }}
          >
            Sign In
          </span>
        </div>
      </form>
    );
  }

  // ------------------- Main App Render (after login) -------------------
  function renderTopNav() {
    return (
      <div style={topNavStyle}>
        <h2 style={{ margin: 0 }}>Tasky</h2>
        <div style={navButtonsStyle}>
          <button
            style={{ ...buttonStyle, width: "auto", padding: "10px 12px" }}
            onClick={() => setShowTaskModal(true)}
          >
            + Add Task
          </button>
          <button
            style={{
              ...buttonStyle,
              backgroundColor: "#EB5757",
              width: "auto",
              padding: "10px 12px",
            }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  function renderSubNav() {
    return (
      <div style={subNavStyle}>
        <div
          style={subNavItemStyle(currentView === "list")}
          onClick={() => setCurrentView("list")}
        >
          List
        </div>
        <div
          style={subNavItemStyle(currentView === "deadline")}
          onClick={() => setCurrentView("deadline")}
        >
          Deadline
        </div>
        <div
          style={subNavItemStyle(currentView === "calendar")}
          onClick={() => setCurrentView("calendar")}
        >
          Calendar
        </div>
        <div
          style={subNavItemStyle(currentView === "gantt")}
          onClick={() => setCurrentView("gantt")}
        >
          Gantt
        </div>
      </div>
    );
  }

  function renderListView() {
    return (
      <div>
        <div style={{ marginBottom: "10px" }}>
          <label>
            <input
              type="checkbox"
              checked={viewAll}
              onChange={(e) => {
                setViewAll(e.target.checked);
                fetchTasks(token);
              }}
              style={{ marginRight: "5px" }}
            />
            View All Tasks
          </label>
        </div>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Task</th>
              <th style={thStyle}>Completed?</th>
              <th style={thStyle}>Start Date</th>
              <th style={thStyle}>Deadline</th>
              <th style={thStyle}>Responsible</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id}>
                <td style={tdStyle}>{t.description}</td>
                <td style={tdStyle}>{t.completed ? "Yes" : "No"}</td>
                <td style={tdStyle}>{t.start_date || "—"}</td>
                <td style={tdStyle}>
                  {t.deadline ? new Date(t.deadline).toLocaleString() : "—"}
                </td>
                <td style={tdStyle}>{t.responsible_person || "—"}</td>
                <td style={tdStyle}>
                  {!t.completed && (
                    <button
                      style={{
                        ...buttonStyle,
                        width: "auto",
                        padding: "8px 10px",
                        marginRight: "5px",
                      }}
                      onClick={() => handleCompleteTask(t.id)}
                    >
                      Complete
                    </button>
                  )}
                  <button
                    style={{
                      ...buttonStyle,
                      backgroundColor: "#EB5757",
                      width: "auto",
                      padding: "8px 10px",
                    }}
                    onClick={() => handleDeleteTask(t.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderDeadlineView() {
    const { dueToday, dueThisWeek, dueNextWeek, future } =
      categorizeTasksByDeadline(tasks);
    return (
      <div>
        <h3>Deadline Overview</h3>
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginTop: "20px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: "200px" }}>
            <h4>Due Today</h4>
            {dueToday.length === 0 && <p>No tasks due today.</p>}
            {dueToday.map((t) => (
              <div key={t.id} style={{ marginBottom: "10px" }}>
                <strong>{t.description}</strong>
                <div>Start: {t.start_date || "Today"}</div>
                <div>
                  Deadline:{" "}
                  {t.deadline ? new Date(t.deadline).toLocaleString() : "—"}
                </div>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <h4>Due This Week</h4>
            {dueThisWeek.length === 0 && <p>No tasks due this week.</p>}
            {dueThisWeek.map((t) => (
              <div key={t.id} style={{ marginBottom: "10px" }}>
                <strong>{t.description}</strong>
                <div>Start: {t.start_date || "Today"}</div>
                <div>
                  Deadline:{" "}
                  {t.deadline ? new Date(t.deadline).toLocaleString() : "—"}
                </div>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <h4>Due Next Week</h4>
            {dueNextWeek.length === 0 && <p>No tasks due next week.</p>}
            {dueNextWeek.map((t) => (
              <div key={t.id} style={{ marginBottom: "10px" }}>
                <strong>{t.description}</strong>
                <div>Start: {t.start_date || "Today"}</div>
                <div>
                  Deadline:{" "}
                  {t.deadline ? new Date(t.deadline).toLocaleString() : "—"}
                </div>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <h4>Future Tasks</h4>
            {future.length === 0 && <p>No future tasks.</p>}
            {future.map((t) => (
              <div key={t.id} style={{ marginBottom: "10px" }}>
                <strong>{t.description}</strong>
                <div>Start: {t.start_date || "Today"}</div>
                <div>
                  Deadline:{" "}
                  {t.deadline ? new Date(t.deadline).toLocaleString() : "—"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderCalendarView() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    function getTasksForDate(date) {
      return tasks.filter((t) => {
        const dl = parseDateStr(t.deadline);
        return (
          dl &&
          dl.getFullYear() === date.getFullYear() &&
          dl.getMonth() === date.getMonth() &&
          dl.getDate() === date.getDate()
        );
      });
    }

    const allDates = getCalendarDates(year, month);
    const weeks = [];
    for (let i = 0; i < 6; i++) {
      weeks.push(allDates.slice(i * 7, i * 7 + 7));
    }
    const dayHeader = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <div>
        <h3>Calendar View</h3>
        <table style={tableStyle}>
          <thead>
            <tr>
              {dayHeader.map((d) => (
                <th key={d} style={thStyle}>
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, i) => (
              <tr key={i}>
                {week.map((day, j) => {
                  const tasksOnDay = getTasksForDate(day);
                  return (
                    <td style={tdStyle} key={j}>
                      <div style={{ fontWeight: "bold" }}>{day.getDate()}</div>
                      {tasksOnDay.map((t) => (
                        <div
                          key={t.id}
                          style={{
                            marginLeft: "10px",
                            background: "#f0f0f0",
                            borderRadius: "4px",
                            padding: "2px",
                            marginBottom: "2px",
                          }}
                        >
                          {t.description}
                        </div>
                      ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderGanttView() {
    const daysInMonth = getDaysInCurrentMonth();
    return (
      <div>
        <h3>Gantt Chart</h3>
        <p>Days between start_date and deadline are highlighted.</p>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Task</th>
              {daysInMonth.map((day) => (
                <th key={day.toISOString()} style={thStyle}>
                  {day.getDate()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id}>
                <td style={tdStyle}>{t.description}</td>
                {daysInMonth.map((day) => {
                  const highlight = isDayWithinRange(
                    day,
                    t.start_date,
                    t.deadline
                  );
                  return (
                    <td
                      key={day.toISOString()}
                      style={{
                        ...tdStyle,
                        backgroundColor: highlight ? "#5E60CE" : "transparent",
                        transition: "background-color 0.2s ease",
                      }}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderAddTaskModal() {
    return (
      <div style={modalOverlayStyle}>
        <div style={modalContentStyle}>
          <h3>Add New Task</h3>
          <form onSubmit={handleAddTask}>
            <label>Task Name</label>
            <input
              type="text"
              placeholder="Task description"
              style={inputStyle}
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              required
            />
            <label>Deadline</label>
            <input
              type="datetime-local"
              style={inputStyle}
              value={newTaskDeadline}
              onChange={(e) => setNewTaskDeadline(e.target.value)}
              required
            />
            <label>Responsible Person</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              style={inputStyle}
              value={newTaskResponsible}
              onChange={(e) => setNewTaskResponsible(e.target.value)}
            />
            <label>Start Date (optional)</label>
            <input
              type="date"
              style={inputStyle}
              value={newTaskStartDate}
              onChange={(e) => setNewTaskStartDate(e.target.value)}
            />
            <div style={{ textAlign: "right", marginTop: "10px" }}>
              <button type="submit" style={{ ...buttonStyle, width: "auto" }}>
                Add Task
              </button>{" "}
              <button
                type="button"
                style={{
                  ...buttonStyle,
                  backgroundColor: "#EB5757",
                  width: "auto",
                }}
                onClick={() => setShowTaskModal(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ------------------- Main Render -------------------
  if (!token) {
    return <div style={containerStyle}>{renderAuthPage()}</div>;
  }

  return (
    <div style={containerStyle}>
      <div style={mainContainerStyle}>
        {renderTopNav()}
        {renderSubNav()}
        {currentView === "list" && renderListView()}
        {currentView === "deadline" && renderDeadlineView()}
        {currentView === "calendar" && renderCalendarView()}
        {currentView === "gantt" && renderGanttView()}
      </div>
      {showTaskModal && renderAddTaskModal()}
    </div>
  );
}

export default App;
