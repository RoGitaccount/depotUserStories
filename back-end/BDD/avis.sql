--Permet aux utilisateurs de laisser des avis sur les produits.
CREATE TABLE avis (
    id_avis INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT,
    id_produit INT,
    note INT CHECK (note BETWEEN 1 AND 5),
    commentaire TEXT,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_moderate BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_user) REFERENCES users(id_user),
    FOREIGN KEY (id_produit) REFERENCES produits(id_produit)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
