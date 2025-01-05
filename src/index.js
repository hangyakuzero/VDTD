import "dotenv/config"; // Load environment variables
import express from "express"; // Express for the backend
import cors from "cors";
import { drizzle } from "drizzle-orm/libsql"; // Drizzle ORM
import { createClient } from "@libsql/client"; // Turso client
import { usersTable } from "./db/schema.ts"; // Database schema
import { eq } from "drizzle-orm";
// Initialize Express App
const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies
app.use(cors());
// Configure Drizzle with Turso
const connection = createClient({
  url: process.env.TURSO_DATABASE_URL,
});
const db = drizzle(connection);

// API to fetch distinct user names
app.get("/users/distinct", async (req, res) => {
  try {
    const users = await db.selectDistinct().from(usersTable);

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching distinct users:", error);
    res.status(500).json({ error: "Failed to fetch distinct users." });
  }
});

// API to add a new user
app.post("/users", async (req, res) => {
  const { name, age, email } = req.body;
  const newUser = { name, age, email };

  try {
    await db.insert(usersTable).values(newUser);
    res.status(201).json({ message: "New user added successfully!" });
    console.log("user added", newUser.name);
  } catch (error) {
    console.error("Error adding new user:", error);
    res.status(500).json({ error: "Failed to add user." });
  }
});

// API to update user info
app.put("/users", async (req, res) => {
  const { email, newAge } = req.body;

  try {
    await db
      .update(usersTable)
      .set({ age: newAge })
      .where(eq(usersTable.email, email));

    res.status(200).json({ message: "User updated successfully!" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user." });
  }
});

// API to delete a user
app.post("/users/remove", async (req, res) => {
  const { email } = req.body;

  try {
    await db.delete(usersTable).where(eq(usersTable.email, email));
    res.status(200).json({ message: "User deleted successfully!" });
    console.log("user deleted :", email);
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user." });
  }
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
