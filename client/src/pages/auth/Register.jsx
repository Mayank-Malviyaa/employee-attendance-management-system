import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [department, setDepartment] = useState("");

    const navigate = useNavigate();

    async function handleRegister(e) {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {

            const response = await fetch(
                "http://127.0.0.1:5000/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password,
                        department: department,
                        role: "employee"
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Registration failed");
                return;
            }

            console.log("Registration response:", data);

            alert("Employee registered successfully!");

            navigate("/login");

        } catch (error) {

            console.error("Registration error:", error);

            alert("Unable to connect to server");
        }
    }

    return (
        <div className="login-page">

            <div className="login-card">

                <h1>Employee Attendance</h1>

                <p className="login-subtitle">
                    Management System
                </p>

                <h2>Create Account</h2>

                <p className="login-description">
                    Register as an employee
                </p>

                <form onSubmit={handleRegister}>

                    <div className="form-group">
                        <label>Full Name</label>

                        <input
                            type="text"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>

                        <input
                            type="password"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>

                        <input
                            type="password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Department</label>

                        <select
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                        >
                            <option value="">Select department</option>
                            <option value="IT">IT</option>
                            <option value="HR">HR</option>
                            <option value="Finance">Finance</option>
                            <option value="Marketing">Marketing</option>
                        </select>
                    </div>

                    <button type="submit">
                        Create Account
                    </button>

                </form>

                <p className="register-text">
                    Already have an account?{" "}
                    <Link to="/login">Login</Link>
                </p>

            </div>

        </div>
    );
}

export default Register;