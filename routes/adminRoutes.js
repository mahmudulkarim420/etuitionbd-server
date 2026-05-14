const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();

/**
 * Admin Routes
 * Handles user management, tuition moderation, and system statistics
 */
module.exports = (usersCollection, tuitionsCollection, paymentsCollection, applicationsCollection) => {

  // GET /all-applications - Fetch all tutor applications for moderation
  router.get("/all-applications", async (req, res) => {
    try {
      const result = await applicationsCollection.find().sort({ appliedAt: -1 }).toArray();
      res.send(result);
    } catch (error) {
      console.error("Error fetching all applications:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  });

  // PATCH /application/status/:id - Update application status (Approve/Reject)
  router.patch("/application/status/:id", async (req, res) => {
    const id = req.params.id;
    const { status } = req.body;
    try {
      const filter = { _id: new ObjectId(id) };
      const updateDoc = { $set: { status: status } };
      const result = await applicationsCollection.updateOne(filter, updateDoc);
      res.send(result);
    } catch (error) {
      console.error("Error updating application status:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  });

  // GET /all-users - Fetch all users for management
  router.get("/all-users", async (req, res) => {
    try {
      const result = await usersCollection.find().toArray();
      res.send(result);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  });

  // PATCH /user/role/:id - Update a user's role
  router.patch("/user/role/:id", async (req, res) => {
    const id = req.params.id;
    const { role } = req.body;
    try {
      const filter = { _id: new ObjectId(id) };
      const updateDoc = { $set: { role: role } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  });

  // DELETE /user/:id - Remove a user account
  router.delete("/user/:id", async (req, res) => {
    const id = req.params.id;
    try {
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  });

  // GET /pending-tuitions - Fetch all tuition posts with 'Pending' status
  router.get("/pending-tuitions", async (req, res) => {
    try {
      const query = { status: "Pending" };
      const result = await tuitionsCollection.find(query).toArray();
      res.send(result);
    } catch (error) {
      console.error("Error fetching pending tuitions:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  });

  // GET /all-tuitions-admin - Fetch all tuitions for admin management
  router.get("/all-tuitions-admin", async (req, res) => {
    try {
      const result = await tuitionsCollection.find().sort({ createdAt: -1 }).toArray();
      res.send(result);
    } catch (error) {
      console.error("Error fetching all tuitions for admin:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  });

  // PATCH /tuition/approve/:id - Approve a tuition post
  router.patch("/tuition/approve/:id", async (req, res) => {
    const id = req.params.id;
    try {
      const filter = { _id: new ObjectId(id) };
      const updateDoc = { $set: { status: "Approved" } };
      const result = await tuitionsCollection.updateOne(filter, updateDoc);
      res.send(result);
    } catch (error) {
      console.error("Error approving tuition:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  });

  // PATCH /tuition/reject/:id - Reject a tuition post
  router.patch("/tuition/reject/:id", async (req, res) => {
    const id = req.params.id;
    try {
      const filter = { _id: new ObjectId(id) };
      const updateDoc = { $set: { status: "Rejected" } };
      const result = await tuitionsCollection.updateOne(filter, updateDoc);
      res.send(result);
    } catch (error) {
      console.error("Error rejecting tuition:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  });

  // DELETE /tuition/:id - Delete a tuition post
  router.delete("/tuition/:id", async (req, res) => {
    const id = req.params.id;
    try {
      const query = { _id: new ObjectId(id) };
      const result = await tuitionsCollection.deleteOne(query);
      res.send(result);
    } catch (error) {
      console.error("Error deleting tuition:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  });

  // GET /admin-stats - System overview and revenue tracking
  router.get("/admin-stats", async (req, res) => {
    try {
      // 1. Total Revenue calculation
      const payments = await paymentsCollection.find().toArray();
      const totalRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

      // 2. User and Tuition counts
      const studentsCount = await usersCollection.countDocuments({ role: "Student" });
      const tutorsCount = await usersCollection.countDocuments({ role: "Tutor" });
      const approvedTuitionsCount = await tuitionsCollection.countDocuments({ status: "Approved" });

      // 3. All Transactions for the reports page
      const transactions = payments;

      res.send({
        totalRevenue,
        counts: {
          students: studentsCount,
          tutors: tutorsCount,
          approvedTuitions: approvedTuitionsCount
        },
        transactions
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  });

  return router;
};
