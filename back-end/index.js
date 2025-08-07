import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";

// Router
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
import userRouteur from './routes/UserAdminManagement.js';
import logsRouter from "./routes/logs.js";
import userdashboardRouter from "./routes/UserDashboard.js"
import tokenRouteur from './routes/token.js';
import statsRoutes from "./routes/stats.js";
import contactRoutes from './routes/contact.js';



import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

const app = express();
const port = 8001;

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:8081',
  'http://127.0.0.1:8081'
];

// Middleware CORS avec cookies (credentials: true)
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // autorise Postman / mobile
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error(`Origine ${origin} non autorisée par CORS.`), false);
    }
    return callback(null, true);
  },
  credentials: true, // nécessaire pour envoyer les cookies
}));

// Middleware pour parser les cookies
app.use(cookieParser());


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
app.use("/api/user", userRouteur);
app.use("/api/logs", logsRouter);
app.use("/api/userdashboard", userdashboardRouter);
app.use("/api/token", tokenRouteur);
app.use("/api/stats", statsRoutes);
app.use('/api/contact', contactRoutes);

app.get("/", (req, res) => res.send('<a href="http://localhost:8001/api-docs/" target="_blank">lien pour tester les divers routes</a> '));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});