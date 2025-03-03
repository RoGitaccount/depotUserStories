import express from "express";
import "dotenv/config";
import signupRouter from "./routes/signup.js";
import signinRouter from "./routes/signin.js";
import passwordResetRouter from "./routes/passwordReset.js";
import productsRouter from "./routes/products.js";
import reviewsRouter from "./routes/reviews.js";

const app = express();
const port = 8001;

import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

// Configurer swagger-jsdoc
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Projet Fil Rouge',
    version: '1.0.0',
    description: 'Une API d\'exemple pour tester nos routes',
  },
  servers: [
    {
      url: 'http://localhost:8001',
      description: 'Serveur local',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./list_routes.yaml'], // Emplacement des fichiers contenant la doc
};

const swaggerSpec = swaggerJSDoc(options);

// Configuration de Swagger UI pour afficher la documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware pour analyser les corps de requêtes en JSON
app.use(express.json());

// Monter le routeur sur une route spécifique
app.use("/api", signupRouter);
app.use("/api", signinRouter);
app.use("/api", passwordResetRouter);
app.use("/api/products", productsRouter);
app.use("/api/reviews", reviewsRouter);

app.get("/", (req, res) => res.send("Test"));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});