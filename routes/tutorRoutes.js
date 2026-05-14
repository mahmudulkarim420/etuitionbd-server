const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();

/**
 * Tutor Routes
 * Handles tuition applications, ongoing tuitions, and revenue tracking
 */
module.exports = (tuitionsCollection, applicationsCollection, paymentsCollection) => {
  // GET /available-tuitions - Fetch all tuitions where status is 'Approved'
  router.get("/available-tuitions", async (req, res) => {
    try {
      const query = { status: "Approved" };
      const result = await tuitionsCollection.find(query).toArray();
      res.send(result);
    } catch (error) {
      console.error("Error fetching available tuitions:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  });

  // POST /apply - Submit a tuition application
  router.post("/apply", async (req, res) => {
    const application = req.body;
    try {
      const newApplication = {
        tuitionId: new ObjectId(application.tuitionId),
        tutorName: application.tutorName,
        tutorEmail: application.tutorEmail,
        qualifications: application.qualifications,
        experience: application.experience,
        expectedSalary: application.expectedSalary,
        status: "Pending", // Default status
        appliedAt: new Date(),
      };
      const result = await applicationsCollection.insertOne(newApplication);
      res.send(result);
    } catch (error) {
      console.error("Error submitting application:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  });

  // GET /my-applications/:email - Fetch all applications made by a specific tutor
  router.get("/my-applications/:email", async (req, res) => {
    const email = req.params.email;
    try {
      const query = { tutorEmail: email };
      const result = await applicationsCollection.find(query).toArray();
      res.send(result);
    } catch (error) {
      console.error("Error fetching my applications:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  });

  // GET /ongoing-tuitions/:email - Fetch applications where status is 'Accepted' (Paid)
  router.get("/ongoing-tuitions/:email", async (req, res) => {
    const email = req.params.email;
    try {
      const query = { tutorEmail: email, status: "Accepted" };
      const result = await applicationsCollection.find(query).toArray();
      res.send(result);
    } catch (error) {
      console.error("Error fetching ongoing tuitions:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  });

  // GET /revenue/:email - Fetch payment records to show earnings history
  router.get("/revenue/:email", async (req, res) => {
    const email = req.params.email;
    try {
      const query = { tutorEmail: email };
      const result = await paymentsCollection.find(query).toArray();
      res.send(result);
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  });

  return router;
};
