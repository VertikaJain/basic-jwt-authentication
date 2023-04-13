import express from "express";
import bcrypt from "bcrypt";

const app = express();

app.use(express.json());

const users = [];

// GET all users
app.get("/users", (req, res) => {
  res.json(users);
});

// Add a new user
app.post("/users", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    users.push({ username: req.body.username, password: hashedPassword });
    res.status(201).send();
  } catch (error) {
    res.status(500).send();
  }
});

app.listen(3000);
