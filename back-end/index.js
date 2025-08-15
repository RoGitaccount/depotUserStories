import app from "./app.js";

const port = process.env.PORT || 8001;

// Ne démarre le serveur que si ce n’est pas un test
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
