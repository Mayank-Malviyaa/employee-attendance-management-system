const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const verifyHR = require("../middleware/hrMiddleware");
const router = express.Router();

let db;

function setDatabase(database) {
    db = database;
}

// HR DASHBOARD SUMMARY
router.get("/summary", verifyToken, verifyHR, async (req, res) => {
    try {
        const today = new Date();
        const date = today.toISOString().split("T")[0];

        const totalEmployees = await db
            .collection("employees")
            .countDocuments();

        const presentToday = await db
            .collection("attendance")
            .countDocuments({
                date: date,
                status: "Present"
            });

        const pendingLeaves = await db
            .collection("leaves")
            .countDocuments({
                status: "Pending"
            });

        res.json({
            totalEmployees: totalEmployees,
            presentToday: presentToday,
            pendingLeaves: pendingLeaves
        });

    } catch (error) {
        console.error("HR summary error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


// GET ALL EMPLOYEES
router.get("/employees", verifyToken, verifyHR, async (req, res) => {
    try {
        const employees = await db
            .collection("employees")
            .find(
                {},
                {
                    projection: {
                        password: 0
                    }
                }
            )
            .sort({
                createdAt: -1
            })
            .toArray();

        res.json({
            employees: employees
        });

    } catch (error) {
        console.error("Get employees error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


// GET ALL ATTENDANCE
router.get("/attendance", async (req, res) => {
    try {
        const attendance = await db
            .collection("attendance")
            .find({})
            .sort({
                date: -1
            })
            .toArray();

        res.json({
            attendance: attendance
        });

    } catch (error) {
        console.error("Get HR attendance error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


// GET ALL LEAVES
router.get("/leaves", async (req, res) => {
    try {
        const leaves = await db
            .collection("leaves")
            .find({})
            .sort({
                createdAt: -1
            })
            .toArray();

        res.json({
            leaves: leaves
        });

    } catch (error) {
        console.error("Get HR leaves error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


// APPROVE LEAVE
router.put("/leaves/:id/approve", async (req, res) => {
    try {
        const { ObjectId } = require("mongodb");

        const result = await db
            .collection("leaves")
            .updateOne(
                {
                    _id: new ObjectId(req.params.id),
                    status: "Pending"
                },
                {
                    $set: {
                        status: "Approved",
                        updatedAt: new Date()
                    }
                }
            );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: "Pending leave not found"
            });
        }

        res.json({
            message: "Leave approved successfully"
        });

    } catch (error) {
        console.error("Approve leave error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


// REJECT LEAVE
router.put("/leaves/:id/reject", async (req, res) => {
    try {
        const { ObjectId } = require("mongodb");

        const result = await db
            .collection("leaves")
            .updateOne(
                {
                    _id: new ObjectId(req.params.id),
                    status: "Pending"
                },
                {
                    $set: {
                        status: "Rejected",
                        updatedAt: new Date()
                    }
                }
            );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: "Pending leave not found"
            });
        }

        res.json({
            message: "Leave rejected successfully"
        });

    } catch (error) {
        console.error("Reject leave error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


module.exports = {
    router,
    setDatabase
};