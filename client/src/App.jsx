import "./App.css";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import HRDashboard from "./pages/HRDashboard";

function EmployeeRoute() {
    const employee = JSON.parse(
        localStorage.getItem("employee")
    );

    if (!employee) {
        return <Navigate to="/login" replace />;
    }

    if (employee.role !== "employee") {
        return <Navigate to="/hr-dashboard" replace />;
    }

    return <Dashboard />;
}

function HRRoute() {
    const employee = JSON.parse(
        localStorage.getItem("employee")
    );

    if (!employee) {
        return <Navigate to="/login" replace />;
    }

    if (employee.role !== "hr") {
        return <Navigate to="/dashboard" replace />;
    }

    return <HRDashboard />;
}

function App() {
    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Navigate to="/login" replace />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/dashboard"
                    element={<EmployeeRoute />}
                />

                <Route
                    path="/hr-dashboard"
                    element={<HRRoute />}
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;