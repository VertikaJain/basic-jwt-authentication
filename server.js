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

// Login for an existing user
app.post("/users/login", async (req, res) => {
  const user = users.find((user) => user.username === req.body.username);
  if (user === null) res.status(400).send("User not Found");
  try {
    const isUserAunthenticated = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (isUserAunthenticated) res.send("Able to Login");
    else res.send("Unable to Login");
  } catch (error) {
    res.status(500).send();
  }
});

app.listen(3000);
