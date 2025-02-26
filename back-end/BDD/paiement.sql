--Gère les paiements des commandes.
CREATE TABLE paiements (
    id_paiement INT AUTO_INCREMENT PRIMARY KEY,
    id_commande INT,
    methode_paiement ENUM('carte_bancaire', 'paypal', 'virement_bancaire'),
    statut_paiement ENUM('en attente', 'completé', 'échoué') DEFAULT 'en attente',
    date_transaction DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_commande) REFERENCES commandes(id_commande)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
