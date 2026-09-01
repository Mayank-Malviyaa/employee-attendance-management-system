import React, { useEffect, useState } from "react";
import "./HRDashboard.css";

function HRDashboard() {
    const [summary, setSummary] = useState({
        totalEmployees: 0,
        presentToday: 0,
        pendingLeaves: 0
    });

    const [employees, setEmployees] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // ATTENDANCE FILTERS
    const [attendanceSearch, setAttendanceSearch] = useState("");
    const [attendanceDate, setAttendanceDate] = useState("");

    useEffect(() => {
        loadHRData();
    }, []);

    async function loadHRData() {
        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            const requestOptions = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            const [
                summaryResponse,
                employeesResponse,
                attendanceResponse,
                leavesResponse
            ] = await Promise.all([
                fetch(
                    "http://localhost:5000/api/hr/summary",
                    requestOptions
                ),
                fetch(
                    "http://localhost:5000/api/hr/employees",
                    requestOptions
                ),
                fetch(
                    "http://localhost:5000/api/hr/attendance",
                    requestOptions
                ),
                fetch(
                    "http://localhost:5000/api/hr/leaves",
                    requestOptions
                )
            ]);

            const summaryData = await summaryResponse.json();
            const employeesData = await employeesResponse.json();
            const attendanceData = await attendanceResponse.json();
            const leavesData = await leavesResponse.json();

            if (summaryResponse.ok) {
                setSummary(summaryData);
            }

            if (employeesResponse.ok) {
                setEmployees(employeesData.employees || []);
            }

            if (attendanceResponse.ok) {
                setAttendance(attendanceData.attendance || []);
            }

            if (leavesResponse.ok) {
                setLeaves(leavesData.leaves || []);
            }

        } catch (error) {
            console.error("HR dashboard error:", error);
            setError("Unable to load HR dashboard");
        } finally {
            setLoading(false);
        }
    }

    function formatDate(date) {
        if (!date) {
            return "--";
        }

        return new Date(date).toLocaleDateString([], {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    function formatTime(time) {
        if (!time) {
            return "--:--";
        }

        return new Date(time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function getEmployeeName(employeeId) {
        const employee = employees.find(
            (item) => String(item._id) === String(employeeId)
        );

        return employee ? employee.name : "Unknown Employee";
    }

    function getEmployeeEmail(employeeId) {
        const employee = employees.find(
            (item) => String(item._id) === String(employeeId)
        );

        return employee ? employee.email : "";
    }

    // FILTER ATTENDANCE
    const filteredAttendance = attendance.filter((record) => {
        const employeeName = getEmployeeName(record.employeeId).toLowerCase();
        const employeeEmail = getEmployeeEmail(record.employeeId).toLowerCase();

        const searchValue = attendanceSearch.toLowerCase().trim();

        const matchesSearch =
            employeeName.includes(searchValue) ||
            employeeEmail.includes(searchValue);

        const matchesDate =
            !attendanceDate ||
            record.date === attendanceDate;

        return matchesSearch && matchesDate;
    });

    async function updateLeave(leaveId, action) {
        try {
            setActionLoading(true);
            setMessage("");
            setError("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/hr/leaves/${leaveId}/${action}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Unable to update leave");
                return;
            }

            setMessage(
                action === "approve"
                    ? "Leave approved successfully"
                    : "Leave rejected successfully"
            );

            await loadHRData();

        } catch (error) {
            console.error("Leave update error:", error);
            setError("Unable to connect to server");
        } finally {
            setActionLoading(false);
        }
    }

    function handleLogout() {
        localStorage.removeItem("employee");
        localStorage.removeItem("token");
        window.location.href = "/login";
    }

    if (loading) {
        return (
            <div className="hr-dashboard-page">
                <div className="hr-loading">
                    Loading HR Dashboard...
                </div>
            </div>
        );
    }

    return (
        <div className="hr-dashboard-page">

            {/* HEADER */}
            <header className="hr-header">
                <div>
                    <h1>HR Dashboard</h1>
                    <p>Employee Attendance Management</p>
                </div>

                <button
                    className="hr-logout-btn"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </header>

            <main className="hr-main">

                {/* MESSAGES */}
                {message && (
                    <div className="hr-success-message">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="hr-error-message">
                        {error}
                    </div>
                )}

                {/* SUMMARY CARDS */}
                <section className="hr-summary-grid">

                    <div className="hr-summary-card">
                        <span>Total Employees</span>
                        <strong>{summary.totalEmployees}</strong>
                        <small>Registered employees</small>
                    </div>

                    <div className="hr-summary-card">
                        <span>Present Today</span>
                        <strong>{summary.presentToday}</strong>
                        <small>Employees checked in</small>
                    </div>

                    <div className="hr-summary-card">
                        <span>Pending Leaves</span>
                        <strong>{summary.pendingLeaves}</strong>
                        <small>Requests awaiting action</small>
                    </div>

                </section>

                {/* EMPLOYEES */}
                <section className="hr-section-card">
                    <div className="hr-section-header">
                        <div>
                            <h2>Employees</h2>
                            <p>Registered employees in the system</p>
                        </div>

                        <span className="hr-count">
                            {employees.length}
                        </span>
                    </div>

                    <div className="hr-table-wrapper">
                        <table className="hr-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Joined</th>
                                </tr>
                            </thead>

                            <tbody>
                                {employees.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="hr-empty">
                                            No employees found
                                        </td>
                                    </tr>
                                ) : (
                                    employees.map((employee) => (
                                        <tr key={employee._id}>
                                            <td>{employee.name}</td>
                                            <td>{employee.email}</td>
                                            <td>
                                                {formatDate(employee.createdAt)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* ATTENDANCE */}
                <section className="hr-section-card">

                    <div className="hr-section-header">
                        <div>
                            <h2>Attendance Overview</h2>
                            <p>Employee attendance records</p>
                        </div>

                        <span className="hr-count">
                            {filteredAttendance.length}
                        </span>
                    </div>

                    {/* ATTENDANCE FILTERS */}
                    <div className="attendance-filters">

                        <div className="attendance-search-box">
                            <label>Search Employee</label>

                            <input
                                type="text"
                                placeholder="Search by name or email"
                                value={attendanceSearch}
                                onChange={(e) =>
                                    setAttendanceSearch(e.target.value)
                                }
                            />
                        </div>

                        <div className="attendance-date-box">
                            <label>Filter by Date</label>

                            <input
                                type="date"
                                value={attendanceDate}
                                onChange={(e) =>
                                    setAttendanceDate(e.target.value)
                                }
                            />
                        </div>

                        <button
                            className="clear-filter-btn"
                            onClick={() => {
                                setAttendanceSearch("");
                                setAttendanceDate("");
                            }}
                        >
                            Clear
                        </button>

                    </div>

                    <div className="hr-table-wrapper">
                        <table className="hr-table">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Date</th>
                                    <th>Check In</th>
                                    <th>Check Out</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredAttendance.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="hr-empty">
                                            No attendance records found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAttendance.map((record) => (
                                        <tr key={record._id}>
                                            <td>
                                                {getEmployeeName(record.employeeId)}
                                            </td>

                                            <td>
                                                {formatDate(record.date)}
                                            </td>

                                            <td>
                                                {formatTime(record.checkIn)}
                                            </td>

                                            <td>
                                                {formatTime(record.checkOut)}
                                            </td>

                                            <td>
                                                <span className="hr-status present">
                                                    {record.status || "Present"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                </section>

                {/* LEAVE REQUESTS */}
                <section className="hr-section-card">
                    <div className="hr-section-header">
                        <div>
                            <h2>Leave Requests</h2>
                            <p>Review and manage employee leave applications</p>
                        </div>

                        <span className="hr-count">
                            {leaves.length}
                        </span>
                    </div>

                    <div className="hr-table-wrapper">
                        <table className="hr-table">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Type</th>
                                    <th>From</th>
                                    <th>To</th>
                                    <th>Days</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {leaves.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="hr-empty">
                                            No leave requests found
                                        </td>
                                    </tr>
                                ) : (
                                    leaves.map((leave) => (
                                        <tr key={leave._id}>
                                            <td>
                                                {getEmployeeName(leave.employeeId)}
                                            </td>

                                            <td>{leave.leaveType}</td>

                                            <td>
                                                {formatDate(leave.startDate)}
                                            </td>

                                            <td>
                                                {formatDate(leave.endDate)}
                                            </td>

                                            <td>{leave.days}</td>

                                            <td>{leave.reason}</td>

                                            <td>
                                                <span
                                                    className={`hr-status ${leave.status.toLowerCase()}`}
                                                >
                                                    {leave.status}
                                                </span>
                                            </td>

                                            <td>
                                                {leave.status === "Pending" ? (
                                                    <div className="hr-action-buttons">

                                                        <button
                                                            className="approve-btn"
                                                            disabled={actionLoading}
                                                            onClick={() =>
                                                                updateLeave(
                                                                    leave._id,
                                                                    "approve"
                                                                )
                                                            }
                                                        >
                                                            Approve
                                                        </button>

                                                        <button
                                                            className="reject-btn"
                                                            disabled={actionLoading}
                                                            onClick={() =>
                                                                updateLeave(
                                                                    leave._id,
                                                                    "reject"
                                                                )
                                                            }
                                                        >
                                                            Reject
                                                        </button>

                                                    </div>
                                                ) : (
                                                    <span className="hr-no-action">
                                                        Completed
                                                    </span>
                                                )}
                                            </td>

                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

            </main>
        </div>
    );
}

export default HRDashboard;