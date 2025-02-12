import express from "express";
import "dotenv/config";
import signupRouter from "./routes/signup.js";
import signinRouter from "./routes/signin.js";

const app = express();
const port = 8001;

// Middleware pour analyser les corps de requêtes en JSON
app.use(express.json());

// Monter le routeur sur une route spécifique
app.use("/api", signupRouter);

// Monter le routeur pour la connexion sur la route /api/login
app.use("/apibis", signinRouter);

app.get("/", (req, res) => res.send("Test"));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
