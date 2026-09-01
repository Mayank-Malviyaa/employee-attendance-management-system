import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, Clock } from "lucide-react";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/login",
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

            // Save logged-in employee & token
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

                {/* SUBTLE BLUE/INDIGO GRADIENT HEADER PANEL */}
                <div className="auth-card-banner">
                    <div className="brand-badge-row" style={{ background: "rgba(255, 255, 255, 0.15)", borderColor: "rgba(255, 255, 255, 0.3)", color: "#FFFFFF" }}>
                        <div className="brand-icon-pill">
                            <Clock size={16} />
                        </div>
                        <span className="brand-badge-title">EMP Attendance Hub</span>
                    </div>

                    <h2 className="auth-banner-title">Welcome Back 👋</h2>
                    <p className="auth-banner-subtitle">
                        Log in to continue to your account dashboard
                    </p>
                </div>

                {/* CLEAN FORM BODY */}
                <div className="auth-card-body">
                    <form className="auth-form" onSubmit={handleLogin}>

                        <div className="form-group">
                            <label>Email Address</label>
                            <div className="input-wrapper">
                                <input
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <Mail className="input-icon" size={18} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <div className="input-wrapper">
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <Lock className="input-icon" size={18} />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary">
                            <LogIn size={18} />
                            <span>Sign In</span>
                        </button>

                    </form>

                    <p className="register-text">
                        Don't have an account?{" "}
                        <Link to="/register">Register here</Link>
                    </p>
                </div>

            </div>

        </div>
    );
}

export default Login;