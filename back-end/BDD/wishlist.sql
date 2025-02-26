--Permet aux utilisateurs d'ajouter des produits à une liste de souhaits.
CREATE TABLE wishlist (
    id_liste_souhait INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT,
    id_produit INT,
    date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES users(id_user),
    FOREIGN KEY (id_produit) REFERENCES produits(id_produit)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
