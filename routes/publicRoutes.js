const express = require("express");
const router = express.Router();

/**
 * Public Routes
 * Handles user registration and role fetching
 */
module.exports = (usersCollection, tuitionsCollection) => {
  
  // GET /all-tuitions - Advanced search, filtering, sorting, and pagination
  router.get("/all-tuitions", async (req, res) => {
    try {
      const { search, class: filterClass, subject, sortSalary, sortDate, page = 1, limit = 6 } = req.query;
      
      // 1. Build Query (Filtering & Search)
      let query = { status: "Approved" };

      if (search) {
        query.$or = [
          { subject: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } }
        ];
      }

      if (filterClass) {
        query.class = filterClass;
      }

      if (subject) {
        query.subject = subject;
      }

      // 2. Build Sort
      let sort = {};
      if (sortSalary) {
        sort.salary = sortSalary === "asc" ? 1 : -1;
      } else if (sortDate === "newest") {
        sort.createdAt = -1;
      } else {
        sort.createdAt = -1; // Default: newest first
      }

      // 3. Pagination Logic
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const limitCount = parseInt(limit);

      // 4. Execute Queries
      const totalCount = await tuitionsCollection.countDocuments(query);
      const tuitions = await tuitionsCollection
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitCount)
        .toArray();

      res.send({
        totalCount,
        tuitions
      });
    } catch (error) {
      console.error("Error fetching tuitions:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  });

  // POST /users - Register a new user
  router.post("/users", async (req, res) => {
    const user = req.body;
    const query = { email: user.email };
    
    try {
      const existingUser = await usersCollection.findOne(query);

      if (existingUser) {
        return res.send({ message: "User already exists", insertedId: null });
      }

      const newUser = {
        name: user.name,
        email: user.email,
        photoUrl: user.photoUrl,
        role: user.role || "Student",
        phone: "",
        createdAt: new Date(),
      };

      const result = await usersCollection.insertOne(newUser);
      res.send(result);
    } catch (error) {
      console.error("Error inserting user:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  });

  // GET /user/role/:email - Fetch user role by email
  router.get("/user/role/:email", async (req, res) => {
    const email = req.params.email;
    const query = { email: email };
    
    try {
      const user = await usersCollection.findOne(query, {
        projection: { role: 1, _id: 0 },
      });
      
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }
      
      res.send(user);
    } catch (error) {
      console.error("Error fetching user role:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  });

  // GET /tutors - Fetch all tutors
  router.get("/tutors", async (req, res) => {
    try {
      // Find users with role 'Tutor' (case-insensitive)
      const tutors = await usersCollection.find({ 
        role: { $regex: /^tutor$/i } 
      }).toArray();
      res.send(tutors);
    } catch (error) {
      console.error("Error fetching tutors:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  });

  return router;
};
