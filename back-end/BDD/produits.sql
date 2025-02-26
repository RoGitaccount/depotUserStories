-- Stocke les informations sur les produits.
CREATE TABLE produits (
    id_produit INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    prix DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL,
    image_url VARCHAR(255),
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_modification DATETIME ON UPDATE CURRENT_TIMESTAMP,
    id_categorie INT,
    FOREIGN KEY (id_categorie) REFERENCES categories(id_categorie)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
