import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();

        try {
            const response = await fetch(
                "http://127.0.0.1:5000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Login failed");
                return;
            }

            
            console.log("ROLE:", data.employee.role);
console.log("EMPLOYEE:", data.employee);

            // Save logged-in employee
            localStorage.setItem(
                "employee",
                JSON.stringify(data.employee)
            );

            localStorage.setItem("token", data.token);

            alert("Login successful!");

            // Go to dashboard based on role
            if (data.employee.role === "hr") {
                navigate("/hr-dashboard");
            } else {
                navigate("/dashboard");
            }

        } catch (error) {
            console.error("Login error:", error);
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

                <h2>Welcome Back 👋</h2>

                <p className="login-description">
                    Login to continue to your account
                </p>

                <form onSubmit={handleLogin}>

                    <div className="form-group">
                        <label>Email</label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>

                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit">
                        Login
                    </button>

                </form>

                <p className="register-text">
                    Don't have an account?{" "}
                    <Link to="/register">Register</Link>
                </p>

            </div>

        </div>
    );
}

export default Login;