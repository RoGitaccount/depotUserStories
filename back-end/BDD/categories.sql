-- Gère les catégories des produits.
CREATE TABLE categories (
    id_categorie INT AUTO_INCREMENT PRIMARY KEY,
    nom_categorie VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;