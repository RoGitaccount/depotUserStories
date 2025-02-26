import express from "express";
import "dotenv/config";
import signupRouter from "./routes/signup.js";
import signinRouter from "./routes/signin.js";
import passwordResetRouter from "./routes/passwordReset.js";
import productsRouter from "./routes/products.js";
import reviewsRouter from "./routes/reviews.js";

const app = express();
const port = 8001;

// Middleware pour analyser les corps de requêtes en JSON
app.use(express.json());

// Monter le routeur sur une route spécifique
app.use("/api", signupRouter);
app.use("/apibis", signinRouter);
app.use("/api", passwordResetRouter);
app.use("/api/products", productsRouter);
app.use("/api/reviews", reviewsRouter);

app.get("/", (req, res) => res.send("Test"));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});