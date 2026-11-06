
import React, { useEffect, useState } from "react";
import {
  Users, UserCheck, UserX, Percent,
  Plus, Trash2, Search, CalendarDays,
  GraduationCap, LogOut, Lock, User
} from "lucide-react";
import "./App.css";

const initialStudents = [
  { id: 1, name: "Pavani", roll: "101", branch: "CSE" },
  { id: 2, name: "Anjali", roll: "102", branch: "CSE" },
  { id: 3, name: "Rahul", roll: "103", branch: "CSE" },
  { id: 4, name: "Sneha", roll: "104", branch: "CSE" }
];

function App() {
  const [students, setStudents] = useState(() =>
    JSON.parse(localStorage.getItem("students")) || initialStudents
  );

  const [records, setRecords] = useState(() =>
    JSON.parse(localStorage.getItem("attendance")) || {}
  );

  const [page, setPage] = useState("login");
  const [loggedStudent, setLoggedStudent] = useState(null);

  const [loginRoll, setLoginRoll] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [date, setDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );

  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [branch, setBranch] = useState("CSE");
  const [search, setSearch] = useState("");

  useEffect(() => {
    localStorage.setItem("students", JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem("attendance", JSON.stringify(records));
  }, [records]);

  // Student login
  function studentLogin(e) {
    e.preventDefault();

    const student = students.find(
      s => s.roll === loginRoll.trim()
    );

    if (student && loginPassword === "student123") {
      setLoggedStudent(student);
      setLoginError("");
      setPage("student");
    } else {
      setLoginError("Invalid roll number or password!");
    }
  }

  function logout() {
    setLoggedStudent(null);
    setLoginRoll("");
    setLoginPassword("");
    setPage("login");
  }

  // Attendance calculations
  const todayRecords = records[date] || {};

  const present = students.filter(
    s => todayRecords[s.id] === "Present"
  ).length;

  const absent = students.filter(
    s => todayRecords[s.id] === "Absent"
  ).length;

  const total = students.length;

  const percentage = total
    ? Math.round((present / total) * 100)
    : 0;

  // Mark attendance
  function markAttendance(id, status) {
    setRecords(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        [id]: status
      }
    }));
  }

  // Add student
  function addStudent(e) {
    e.preventDefault();

    if (!name.trim() || !roll.trim()) {
      alert("Please enter student details");
      return;
    }

    if (students.some(s => s.roll === roll.trim())) {
      alert("Roll number already exists!");
      return;
    }

    setStudents(prev => [
      ...prev,
      {
        id: Date.now(),
        name: name.trim(),
        roll: roll.trim(),
        branch
      }
    ]);

    setName("");
    setRoll("");
  }

  // Delete student
  function deleteStudent(id) {
    if (!window.confirm("Delete this student?")) return;

    setStudents(prev => prev.filter(s => s.id !== id));

    setRecords(prev => {
      const updated = { ...prev };

      Object.keys(updated).forEach(d => {
        const day = { ...updated[d] };
        delete day[id];
        updated[d] = day;
      });

      return updated;
    });
  }

  const filteredStudents = students.filter(s =>
    (s.name + " " + s.roll + " " + s.branch)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Individual student attendance
  const studentHistory = loggedStudent
    ? Object.entries(records)
        .filter(([day, attendance]) =>
          attendance[loggedStudent.id]
        )
        .sort(([a], [b]) => b.localeCompare(a))
    : [];

  const studentPresent = studentHistory.filter(
    ([day, attendance]) =>
      attendance[loggedStudent?.id] === "Present"
  ).length;

  const studentAbsent = studentHistory.filter(
    ([day, attendance]) =>
      attendance[loggedStudent?.id] === "Absent"
  ).length;

  const studentPercentage = studentHistory.length
    ? Math.round(
        (studentPresent / studentHistory.length) * 100
      )
    : 0;

  // LOGIN PAGE
  if (page === "login") {
    return (
      <div className="login-page">
        <div className="login-card">

          <div className="login-logo">
            <GraduationCap size={38} />
          </div>

          <h1>Student Portal</h1>
          <p className="login-subtitle">
            Welcome back! Login to view your attendance.
          </p>

          <form onSubmit={studentLogin}>

            <label>Roll Number</label>
            <div className="login-input">
              <User size={18} />
              <input
                type="text"
                placeholder="Enter your roll number"
                value={loginRoll}
                onChange={e => setLoginRoll(e.target.value)}
                required
              />
            </div>

            <label>Password</label>
            <div className="login-input">
              <Lock size={18} />
              <input
                type="password"
                placeholder="Enter your password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                required
              />
            </div>

            {loginError && (
              <p className="login-error">{loginError}</p>
            )}

            <button className="login-btn" type="submit">
              Login to Student Portal
            </button>
          </form>

          <div className="demo-info">
            <strong>Demo Login</strong>
            <p>Roll Number: 101</p>
            <p>Password: student123</p>
          </div>

          <button
            className="admin-link"
            onClick={() => setPage("admin")}
          >
            Go to Admin Dashboard →
          </button>

        </div>
      </div>
    );
  }

  // STUDENT DASHBOARD
  if (page === "student" && loggedStudent) {
    return (
      <div className="app">

        <header className="navbar">
          <div className="brand">
            <div className="logo"><GraduationCap /></div>
            <div>
              <h2>AttendEase</h2>
              <p>Student Portal</p>
            </div>
          </div>

          <button className="logout-btn" onClick={logout}>
            <LogOut size={17} /> Logout
          </button>
        </header>

        <main className="container">

          <section className="welcome">
            <div>
              <h1>Welcome, {loggedStudent.name}!</h1>
              <p>
                Roll Number: {loggedStudent.roll} |
                Branch: {loggedStudent.branch}
              </p>
            </div>
          </section>

          <section className="stats">

            <div className="stat-card">
              <CalendarDays className="stat-icon blue" />
              <p>Total Marked Days</p>
              <h2>{studentHistory.length}</h2>
            </div>

            <div className="stat-card">
              <UserCheck className="stat-icon green" />
              <p>Present Days</p>
              <h2>{studentPresent}</h2>
            </div>

            <div className="stat-card">
              <UserX className="stat-icon red" />
              <p>Absent Days</p>
              <h2>{studentAbsent}</h2>
            </div>

            <div className="stat-card">
              <Percent className="stat-icon purple" />
              <p>Attendance Percentage</p>
              <h2>{studentPercentage}%</h2>
            </div>

          </section>

          <section className="content-card">
            <div className="section-heading">
              <h2>My Attendance History</h2>
              <p>Check your daily attendance records.</p>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Roll Number</th>
                    <th>Student Name</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {studentHistory.map(([day, attendance]) => (
                    <tr key={day}>
                      <td>{day}</td>
                      <td>{loggedStudent.roll}</td>
                      <td>{loggedStudent.name}</td>
                      <td>
                        <span className={
                          attendance[loggedStudent.id] === "Present"
                            ? "status-present"
                            : "status-absent"
                        }>
                          {attendance[loggedStudent.id]}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {studentHistory.length === 0 && (
                    <tr>
                      <td colSpan="4" className="empty">
                        No attendance records available yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <p className="attendance-message">
            {studentHistory.length === 0
              ? "Your attendance will appear here once it is marked."
              : studentPercentage < 75
                ? "Your attendance is below 75%. Please attend classes regularly."
                : "Great! Your attendance is at or above 75%."}
          </p>

        </main>
      </div>
    );
  }

  // ADMIN DASHBOARD
  return (
    <div className="app">

      <header className="navbar">
        <div className="brand">
          <div className="logo"><Users /></div>
          <div>
            <h2>AttendEase</h2>
            <p>Admin Dashboard</p>
          </div>
        </div>

        <button className="logout-btn" onClick={logout}>
          <LogOut size={17} /> Logout
        </button>
      </header>

      <main className="container">

        <section className="welcome">
          <div>
            <h1>Attendance Dashboard</h1>
            <p>Manage students and track daily attendance.</p>
          </div>

          <div className="date-box">
            <CalendarDays size={18} />
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>
        </section>

        <section className="stats">
          <div className="stat-card">
            <Users className="stat-icon blue" />
            <p>Total Students</p>
            <h2>{total}</h2>
          </div>

          <div className="stat-card">
            <UserCheck className="stat-icon green" />
            <p>Present</p>
            <h2>{present}</h2>
          </div>

          <div className="stat-card">
            <UserX className="stat-icon red" />
            <p>Absent</p>
            <h2>{absent}</h2>
          </div>

          <div className="stat-card">
            <Percent className="stat-icon purple" />
            <p>Attendance</p>
            <h2>{percentage}%</h2>
          </div>
        </section>

        <section className="content-card">

          <div className="section-heading">
            <h2>Student Records</h2>
            <p>Manage students and mark attendance.</p>
          </div>

          <form className="add-form" onSubmit={addStudent}>
            <input
              placeholder="Student name"
              value={name}
              onChange={e => setName(e.target.value)}
            />

            <input
              placeholder="Roll number"
              value={roll}
              onChange={e => setRoll(e.target.value)}
            />

            <select
              value={branch}
              onChange={e => setBranch(e.target.value)}
            >
              <option>CSE</option>
              <option>ECE</option>
              <option>EEE</option>
              <option>IT</option>
            </select>

            <button className="add-btn" type="submit">
              <Plus size={18} /> Add Student
            </button>
          </form>

          <div className="search-box">
            <Search size={18} />
            <input
              placeholder="Search students..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Roll No.</th>
                  <th>Student Name</th>
                  <th>Branch</th>
                  <th>Attendance</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map(student => (
                  <tr key={student.id}>
                    <td>{student.roll}</td>
                    <td>{student.name}</td>
                    <td>{student.branch}</td>
                    <td>
                      <div className="actions">
                        <button
                          className={
                            todayRecords[student.id] === "Present"
                              ? "present active" : "present"
                          }
                          onClick={() =>
                            markAttendance(student.id, "Present")
                          }
                        >
                          Present
                        </button>

                        <button
                          className={
                            todayRecords[student.id] === "Absent"
                              ? "absent active" : "absent"
                          }
                          onClick={() =>
                            markAttendance(student.id, "Absent")
                          }
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => deleteStudent(student.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan="5" className="empty">
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="footer-note">
            Attendance date: {date} | Marked: {present + absent}/{total}
          </p>

        </section>
      </main>
    </div>
  );
}

export default App;
