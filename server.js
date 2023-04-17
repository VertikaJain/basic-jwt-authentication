import dotenv from "dotenv";
import express from "express";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";

dotenv.config();
const app = express();

app.use(express.json());

const users = [];
const weapons = [
  {
    username: "krishna",
    weapon: "sudarshanChakra",
  },
  {
    username: "balram",
    weapon: "halAndGada",
  },
];

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token === null) return res.sendStatus(401);
  jsonwebtoken.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Create new Access token if Refresh token is valid
app.post("/token", (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) res.sendStatus(401);
  jsonwebtoken.verify(
    req.body.refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    (err, user) => {
      if (err) return res.sendStatus(403);
      const accessToken = jsonwebtoken.sign(
        { name: user.name },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "20s" }
      );
      res.json({ accessToken: accessToken });
    }
  );
});

// GET all users
app.get("/users", (req, res) => {
  res.json(users);
});

// GET logged-in user/weapons
app.get("/weapons", authenticateToken, (req, res) => {
  res.json(weapons.find((weapon) => weapon.username === req.user.name));
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
    // bcrypt: Authentication
    const isUserAunthenticated = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (isUserAunthenticated) {
      // JWT: Authorization
      const accessToken = jsonwebtoken.sign(
        { name: req.body.username },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "20s" }
      );
      const refreshToken = jsonwebtoken.sign(
        { name: req.body.username },
        process.env.REFRESH_TOKEN_SECRET
      );
      res.json({ accessToken: accessToken, refreshToken: refreshToken });
    } else res.send("Unable to Login");
  } catch (error) {
    res.status(500).send();
  }
});

app.listen(3000);
