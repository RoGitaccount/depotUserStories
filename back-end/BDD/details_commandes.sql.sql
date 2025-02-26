-- Contient les produits associés à chaque commande.
CREATE TABLE details_commandes (
    id_detail_commande INT AUTO_INCREMENT PRIMARY KEY,
    id_commande INT,
    id_produit INT,
    quantite INT NOT NULL,
    prix DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (id_commande) REFERENCES commandes(id_commande),
    FOREIGN KEY (id_produit) REFERENCES produits(id_produit)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

