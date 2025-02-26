--Stocke les adresses de livraison des utilisateurs.
CREATE TABLE adresses_livraison (
    id_adresse INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT,
    adresse_ligne1 VARCHAR(255) NOT NULL,
    adresse_ligne2 VARCHAR(255),
    ville VARCHAR(100) NOT NULL,
    region VARCHAR(100),
    code_postal VARCHAR(20),
    pays VARCHAR(100) NOT NULL,
    FOREIGN KEY (id_user) REFERENCES users(id_user)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
