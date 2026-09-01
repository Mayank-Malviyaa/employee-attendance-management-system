import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
    const navigate = useNavigate();

    const [employee, setEmployee] = useState(null);
    const [checkIn, setCheckIn] = useState(null);
    const [checkOut, setCheckOut] = useState(null);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [history, setHistory] = useState([]);
    const [historyFilter, setHistoryFilter] = useState("all");

    const [leaves, setLeaves] = useState([]);
    const [leaveType, setLeaveType] = useState("Casual Leave");
    const [leaveStartDate, setLeaveStartDate] = useState("");
    const [leaveEndDate, setLeaveEndDate] = useState("");
    const [leaveReason, setLeaveReason] = useState("");
    const [leaveLoading, setLeaveLoading] = useState(false);

    function getAuthHeaders() {
    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    };
}

    useEffect(() => {
        const storedEmployee = localStorage.getItem("employee");

        if (!storedEmployee) {
            navigate("/login");
            return;
        }

        const parsedEmployee = JSON.parse(storedEmployee);
        setEmployee(parsedEmployee);

        fetchTodayAttendance(parsedEmployee.id);
        fetchAttendanceHistory(parsedEmployee.id);
        fetchLeaves();
    }, [navigate]);

    async function fetchTodayAttendance(employeeId) {
        try {
            const response = await fetch(
                `http://localhost:5000/api/attendance/today/${employeeId}`,
                {
                    headers: getAuthHeaders()
                }
            );

            const data = await response.json();

            if (data.attendance) {
                setCheckIn(data.attendance.checkIn);
                setCheckOut(data.attendance.checkOut);
            }
        } catch (error) {
            console.error("Error fetching today's attendance:", error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchAttendanceHistory(employeeId) {
        try {
            const response = await fetch(
                `http://localhost:5000/api/attendance/history/${employeeId}`,
                {
                    headers: getAuthHeaders()
                }
            );

            const data = await response.json();

            setHistory(data.attendance || []);
        } catch (error) {
            console.error("Error fetching attendance history:", error);
        }
    }

    async function handleCheckIn() {
        if (!employee) return;

        setActionLoading(true);
        setMessage("");
        setError("");

        try {
            const response = await fetch(
                "http://localhost:5000/api/attendance/checkin",
                {
                    method: "POST",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        employeeId: employee.id
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Check-in failed");
                return;
            }

            setCheckIn(data.attendance.checkIn);
            setCheckOut(data.attendance.checkOut);

            setMessage("Check-in successful");

            fetchAttendanceHistory(employee.id);

        } catch (error) {
            console.error("Check-in error:", error);
            setError("Unable to connect to server");
        } finally {
            setActionLoading(false);
        }
    }

    async function handleCheckOut() {
        if (!employee) return;

        setActionLoading(true);
        setMessage("");
        setError("");

        try {
            const response = await fetch(
                "http://localhost:5000/api/attendance/checkout",
                {
                    method: "PUT",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        employeeId: employee.id
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Check-out failed");
                return;
            }

            setCheckOut(data.attendance.checkOut);

            setMessage("Check-out successful");

            fetchAttendanceHistory(employee.id);

        } catch (error) {
            console.error("Check-out error:", error);
            setError("Unable to connect to server");
        } finally {
            setActionLoading(false);
        }
    }

    async function fetchLeaves() {
        try {
            const response = await fetch(
                "http://localhost:5000/api/leave/my",
                {
                    headers: getAuthHeaders()
                }
            );

            const data = await response.json();

            if (response.ok) {
                setLeaves(data.leaves || []);
            }
        } catch (error) {
            console.error("Error fetching leaves:", error);
        }
    }

    async function handleApplyLeave(e) {
        e.preventDefault();

        if (!leaveStartDate || !leaveEndDate || !leaveReason.trim()) {
            setError("Please fill all leave details");
            setMessage("");
            return;
        }

        setLeaveLoading(true);
        setMessage("");
        setError("");

        try {
            const response = await fetch(
                "http://localhost:5000/api/leave/apply",
                {
                    method: "POST",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        leaveType: leaveType,
                        startDate: leaveStartDate,
                        endDate: leaveEndDate,
                        reason: leaveReason.trim()
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Unable to apply for leave");
                return;
            }

            setMessage("Leave application submitted successfully");

            setLeaveStartDate("");
            setLeaveEndDate("");
            setLeaveReason("");

            fetchLeaves();

        } catch (error) {
            console.error("Apply leave error:", error);
            setError("Unable to connect to server");
        } finally {
            setLeaveLoading(false);
        }
    }

    async function handleCancelLeave(leaveId) {
        if (!window.confirm("Are you sure you want to cancel this leave?")) {
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5000/api/leave/${leaveId}`,
                {
                    method: "DELETE",
                    headers: getAuthHeaders()
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Unable to cancel leave");
                setMessage("");
                return;
            }

            setMessage("Leave cancelled successfully");
            setError("");
            fetchLeaves();

        } catch (error) {
            console.error("Cancel leave error:", error);
            setError("Unable to connect to server");
        }
    }

    function handleLogout() {
        localStorage.removeItem("employee");
        navigate("/login");
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

    function calculateWorkingHours(checkInTime, checkOutTime) {
        if (!checkInTime || !checkOutTime) {
            return "--";
        }

        const start = new Date(checkInTime);
        const end = new Date(checkOutTime);

        const difference = end - start;

        if (difference < 0) {
            return "--";
        }

        const totalMinutes = Math.floor(
            difference / (1000 * 60)
        );

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        return `${hours}h ${minutes}m`;
    }

    const isCheckedIn = Boolean(checkIn);
    const isCheckedOut = Boolean(checkOut);

    const totalRecords = history.length;

    const presentDays = history.filter(
        (record) => record.status === "Present"
    ).length;

    const completedDays = history.filter(
        (record) => record.checkOut
    ).length;

    const filteredHistory = history.filter((record) => {
        if (historyFilter === "all") {
            return true;
        }

        const recordDate = new Date(record.date);
        const now = new Date();

        if (historyFilter === "thisMonth") {
            return (
                recordDate.getMonth() === now.getMonth() &&
                recordDate.getFullYear() === now.getFullYear()
            );
        }

        if (historyFilter === "lastMonth") {
            const lastMonth = new Date(
                now.getFullYear(),
                now.getMonth() - 1,
                1
            );

            return (
                recordDate.getMonth() === lastMonth.getMonth() &&
                recordDate.getFullYear() === lastMonth.getFullYear()
            );
        }

        return true;
    });

    if (loading) {
        return (
            <div className="dashboard-page">
                <div className="dashboard-loading">
                    Loading dashboard...
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">

            {/* HEADER */}
            <header className="dashboard-header">

                <div className="brand-section">
                    <h1>Employee Attendance</h1>
                    <p>Attendance Management System</p>
                </div>

                <div className="header-right">

                    <div className="employee-info">
                        <strong>
                            {employee?.name}
                        </strong>

                        <span>
                            {employee?.email}
                        </span>
                    </div>

                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </header>


            {/* MAIN CONTENT */}
            <main className="dashboard-container">

                {/* WELCOME */}
                <section className="welcome-section">

                    <div>
                        <h2>
                            Welcome back, {employee?.name}
                        </h2>

                        <p>
                            Manage your attendance and keep track
                            of your daily activity.
                        </p>
                    </div>

                </section>


                {/* SUMMARY */}
                <section className="summary-grid">

                    <div className="summary-card">

                        <div className="summary-icon blue">
                            ◷
                        </div>

                        <div>
                            <p>Total Records</p>

                            <h3>
                                {totalRecords}
                            </h3>

                            <span>
                                Attendance entries
                            </span>
                        </div>

                    </div>


                    <div className="summary-card">

                        <div className="summary-icon green">
                            ✓
                        </div>

                        <div>
                            <p>Present Days</p>

                            <h3>
                                {presentDays}
                            </h3>

                            <span>
                                Days checked in
                            </span>
                        </div>

                    </div>


                    <div className="summary-card">

                        <div className="summary-icon purple">
                            ✓
                        </div>

                        <div>
                            <p>Completed Days</p>

                            <h3>
                                {completedDays}
                            </h3>

                            <span>
                                Checked in & out
                            </span>
                        </div>

                    </div>

                </section>


                {/* TODAY'S ATTENDANCE */}
                <section className="attendance-card">

                    <div className="section-heading">

                        <div>
                            <h2>Today's Attendance</h2>

                            <p>
                                Manage your attendance for today
                            </p>
                        </div>

                        <div className="today-badge">
                            Today
                        </div>

                    </div>


                    <div className="time-grid">

                        {/* CHECK IN */}
                        <div className="time-box">

                            <div className="time-icon">
                                ↗
                            </div>

                            <div>
                                <p>Check In</p>

                                <h3>
                                    {formatTime(checkIn)}
                                </h3>

                                <span>
                                    {isCheckedIn
                                        ? "Checked in today"
                                        : "Not checked in"}
                                </span>
                            </div>

                        </div>


                        {/* CHECK OUT */}
                        <div className="time-box">

                            <div className="time-icon checkout-icon">
                                ↙
                            </div>

                            <div>
                                <p>Check Out</p>

                                <h3>
                                    {formatTime(checkOut)}
                                </h3>

                                <span>
                                    {isCheckedOut
                                        ? "Checked out today"
                                        : "Not checked out"}
                                </span>
                            </div>

                        </div>


                        {/* WORKING HOURS */}
                        <div className="time-box">

                            <div className="time-icon working-icon">
                                ⏱
                            </div>

                            <div>
                                <p>Working Hours</p>

                                <h3>
                                    {calculateWorkingHours(
                                        checkIn,
                                        checkOut
                                    )}
                                </h3>

                                <span>
                                    {isCheckedOut
                                        ? "Total time worked today"
                                        : "Available after check out"}
                                </span>
                            </div>

                        </div>

                    </div>


                    {/* ACTION BUTTONS */}
                    <div className="attendance-actions">

                        <button
                            className="checkin-btn"
                            onClick={handleCheckIn}
                            disabled={
                                isCheckedIn ||
                                actionLoading
                            }
                        >
                            {actionLoading && !isCheckedIn
                                ? "Processing..."
                                : isCheckedIn
                                    ? "Checked In"
                                    : "Check In"}
                        </button>


                        <button
                            className="checkout-btn"
                            onClick={handleCheckOut}
                            disabled={
                                !isCheckedIn ||
                                isCheckedOut ||
                                actionLoading
                            }
                        >
                            {actionLoading && isCheckedIn
                                ? "Processing..."
                                : isCheckedOut
                                    ? "Checked Out"
                                    : "Check Out"}
                        </button>

                    </div>


                    {/* MESSAGES */}
                    {message && (
                        <div className="success-message">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                </section>


                {/* HISTORY */}
                <section className="history-card">

                    <div className="history-header">

                        <div>
                            <h2>Attendance History</h2>

                            <p>
                                Your previous attendance records
                            </p>
                        </div>


                        <div className="history-controls">

                            <select
                                className="history-filter"
                                value={historyFilter}
                                onChange={(e) =>
                                    setHistoryFilter(
                                        e.target.value
                                    )
                                }
                            >
                                <option value="all">
                                    All Records
                                </option>

                                <option value="thisMonth">
                                    This Month
                                </option>

                                <option value="lastMonth">
                                    Last Month
                                </option>
                            </select>


                            <div className="record-count">

                                {filteredHistory.length}{" "}

                                {filteredHistory.length === 1
                                    ? "Record"
                                    : "Records"}

                            </div>

                        </div>

                    </div>


                    {filteredHistory.length === 0 ? (

                        <div className="empty-history">
                            <p>
                                No attendance records found.
                            </p>
                        </div>

                    ) : (

                        <div className="history-table-wrapper">

                            <table className="history-table">

                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Check In</th>
                                        <th>Check Out</th>
                                        <th>Working Hours</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>


                                <tbody>

                                    {filteredHistory.map(
                                        (record) => {

                                            const completed =
                                                Boolean(
                                                    record.checkOut
                                                );

                                            return (
                                                <tr
                                                    key={
                                                        record._id ||
                                                        record.date
                                                    }
                                                >

                                                    <td>
                                                        {formatDate(
                                                            record.date
                                                        )}
                                                    </td>

                                                    <td>
                                                        {formatTime(
                                                            record.checkIn
                                                        )}
                                                    </td>

                                                    <td>
                                                        {formatTime(
                                                            record.checkOut
                                                        )}
                                                    </td>

                                                    <td>
                                                        {calculateWorkingHours(
                                                            record.checkIn,
                                                            record.checkOut
                                                        )}
                                                    </td>

                                                    <td>

                                                        <span
                                                            className={
                                                                completed
                                                                    ? "status-badge completed"
                                                                    : "status-badge present"
                                                            }
                                                        >
                                                            {completed
                                                                ? "Completed"
                                                                : "Present"}
                                                        </span>

                                                    </td>

                                                </tr>
                                            );
                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

                    {/* LEAVE MANAGEMENT */}
                    <section className="leave-card">
                        <div className="section-heading">
                            <div>
                                <h2>Leave Management</h2>
                                <p>Apply for leave and track your requests</p>
                            </div>
                        </div>

                        <form className="leave-form" onSubmit={handleApplyLeave}>
                            <div className="leave-form-grid">
                                <div className="form-group">
                                    <label>Leave Type</label>
                                    <select
                                        value={leaveType}
                                        onChange={(e) => setLeaveType(e.target.value)}
                                    >
                                        <option value="Casual Leave">Casual Leave</option>
                                        <option value="Sick Leave">Sick Leave</option>
                                        <option value="Earned Leave">Earned Leave</option>
                                        <option value="Unpaid Leave">Unpaid Leave</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Start Date</label>
                                    <input
                                        type="date"
                                        value={leaveStartDate}
                                        onChange={(e) => setLeaveStartDate(e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>End Date</label>
                                    <input
                                        type="date"
                                        value={leaveEndDate}
                                        min={leaveStartDate || undefined}
                                        onChange={(e) => setLeaveEndDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Reason</label>
                                <textarea
                                    value={leaveReason}
                                    onChange={(e) => setLeaveReason(e.target.value)}
                                    placeholder="Enter reason for leave"
                                    rows="3"
                                />
                            </div>

                            <button
                                type="submit"
                                className="apply-leave-btn"
                                disabled={leaveLoading}
                            >
                                {leaveLoading ? "Submitting..." : "Apply for Leave"}
                            </button>
                        </form>

                        <div className="leave-history">
                            <div className="leave-history-header">
                                <div>
                                    <h3>My Leave Requests</h3>
                                    <p>Track the status of your applications</p>
                                </div>

                                <span className="record-count">
                                    {leaves.length} {leaves.length === 1 ? "Request" : "Requests"}
                                </span>
                            </div>

                            {leaves.length === 0 ? (
                                <div className="empty-history">
                                    <p>No leave requests found.</p>
                                </div>
                            ) : (
                                <div className="leave-table-wrapper">
                                    <table className="history-table">
                                        <thead>
                                            <tr>
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
                                            {leaves.map((leave) => (
                                                <tr key={leave._id}>
                                                    <td>{leave.leaveType}</td>
                                                    <td>{formatDate(leave.startDate)}</td>
                                                    <td>{formatDate(leave.endDate)}</td>
                                                    <td>{leave.days}</td>
                                                    <td>{leave.reason}</td>
                                                    <td>
                                                        <span
                                                            className={`status-badge leave-${leave.status.toLowerCase()}`}
                                                        >
                                                            {leave.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {leave.status === "Pending" ? (
                                                            <button
                                                                type="button"
                                                                className="cancel-leave-btn"
                                                                onClick={() =>
                                                                    handleCancelLeave(leave._id)
                                                                }
                                                            >
                                                                Cancel
                                                            </button>
                                                        ) : (
                                                            <span>--</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="profile-card">

    <div className="profile-header">
        <div>
            <h2>Employee Profile</h2>
            <p>Your account information</p>
        </div>
    </div>

    <div className="profile-content">

        <div className="profile-avatar">
            {employee?.name
                ? employee.name.charAt(0).toUpperCase()
                : "E"}
        </div>

        <div className="profile-details">

            <div className="profile-main">
                <h3>{employee?.name}</h3>
                <span>{employee?.email}</span>
            </div>

            <div className="profile-info-grid">

                <div className="profile-info-item">
                    <label>Employee ID</label>
                    <p>{employee?.id}</p>
                </div>

                <div className="profile-info-item">
                    <label>Email Address</label>
                    <p>{employee?.email}</p>
                </div>

            </div>

        </div>

    </div>

</section>
            </main>

        </div>
    );
}

export default Dashboard;