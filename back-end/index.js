import express from "express";
import "dotenv/config";
import cors from "cors";
import signupRouter from "./routes/signup.js";
import signinRouter from "./routes/signin.js";
import passwordResetRouter from "./routes/passwordReset.js";
import productsRouter from "./routes/products.js";
import reviewsRouter from "./routes/reviews.js";
import offerRouter from "./routes/offer.js";
import categoryRouter from "./routes/category.js"
import productCategoryRouter from "./routes/productCategory.js";
import rgpdRouter from "./routes/rgpd.js"

import stripeRouter from './routes/stripe.js';
import cartRouter from './routes/cart.js';
import orderRouter from './routes/order.js';
import wishlistRouter from './routes/wishlist.js';

import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

const app = express();
const port = 8001;

// Configuration CORS : autorise seulement le front local
app.use(cors({
  origin: "http://localhost:5173"
}));

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

// Configuration de Swagger UI pour afficher la documentation
const swaggerSpec = swaggerJSDoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware pour analyser les corps de requêtes en JSON
app.use(express.json());

// Monter le routeur sur une route spécifique
app.use("/api", signupRouter);
app.use("/api", signinRouter);
app.use("/api", passwordResetRouter);
app.use("/api/products", productsRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/offers", offerRouter);
app.use("/api/category", categoryRouter);
app.use("/api/rgpd", rgpdRouter);
app.use("/api/productCategory", productCategoryRouter);

app.use('/api/stripe', stripeRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/wishlist", wishlistRouter);

app.get("/", (req, res) => res.send('<a href="http://localhost:8001/api-docs/" target="_blank">lien pour tester les divers routes</a> '));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});