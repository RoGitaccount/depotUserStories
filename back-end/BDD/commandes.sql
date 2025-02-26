-- Stocke les commandes des utilisateurs.
CREATE TABLE commandes (
    id_commande INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT,
    montant_total DECIMAL(10, 2) NOT NULL,
    statut ENUM('en attente', 'en traitement', 'expédiée', 'livrée', 'annulée') NOT NULL DEFAULT 'en attente',
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_modification DATETIME ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES users(id_user)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

