const express = require("express"); 
const cors = require("cors"); 
const { MongoClient } = require("mongodb"); 

require("dotenv").config(); 
 
const auth = require("./routes/auth"); 
const attendance = require("./routes/attendance"); 
const leave = require("./routes/leave"); 
const hr = require("./routes/hr");
 
const app = express(); 
 
app.use(cors()); 
app.use(express.json()); 
 
app.use("/api/auth", auth.router); 
app.use("/api/attendance", attendance.router); 
app.use("/api/leave", leave.router); 
app.use("/api/hr", hr.router); 
const PORT = process.env.PORT || 5000; 
 
async function startServer() { 
    try { 
        const client = new MongoClient(process.env.MONGO_URI); 
 
        await client.connect(); 
 
        const db = client.db("EmployeeAttendance"); 
        await db.collection("attendance").createIndex( 
    { 
        employeeId: 1, 
        date: 1 
    }, 
    { 
        unique: true 
    } 
); 
 
        auth.setDatabase(db); 
        attendance.setDatabase(db); 
        leave.setDatabase(db); 
        hr.setDatabase(db); 
        console.log("MongoDB connected successfully!"); 
 
        app.get("/", (req, res) => { 
            res.send("Employee Attendance API is running"); 
        }); 
 
        app.listen(PORT, () => { 
            console.log( 
                `Server running on http://localhost:5000` 
            ); 
        }); 
 
    } catch (error) { 
        console.error( 
            "MongoDB connection failed:", 
            error 
        ); 
    } 
} 
 
startServer();