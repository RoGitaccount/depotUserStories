-- Tables sans dépendances externes
CREATE TABLE IF NOT EXISTS users (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    mdp VARCHAR(255) NOT NULL, 
    role ENUM('admin', 'user') NOT NULL, 
    email VARCHAR(255) NOT NULL UNIQUE,
    telephone VARCHAR(15)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS categories (
    id_categorie INT AUTO_INCREMENT PRIMARY KEY,
    nom_categorie VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS promotions (
    id_promotion INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    montant_reduction DECIMAL(10, 2),
    date_expiration DATETIME,
    est_actif BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tables dépendant de users
CREATE TABLE IF NOT EXISTS adresses_livraison (
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

CREATE TABLE IF NOT EXISTS logs (
    id_logs INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT,
    activite VARCHAR(255),
    date_activite DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES users(id_user)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS commandes (
    id_commande INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT,
    montant_total DECIMAL(10, 2) NOT NULL,
    statut ENUM('en attente', 'en traitement', 'expédiée', 'livrée', 'annulée') NOT NULL DEFAULT 'en attente',
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_modification DATETIME ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES users(id_user)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tables dépendant de categories
CREATE TABLE IF NOT EXISTS produits (
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

-- Tables dépendant de commandes
CREATE TABLE IF NOT EXISTS paiements (
    id_paiement INT AUTO_INCREMENT PRIMARY KEY,
    id_commande INT,
    methode_paiement ENUM('carte_bancaire', 'paypal', 'virement_bancaire'),
    statut_paiement ENUM('en attente', 'completé', 'échoué') DEFAULT 'en attente',
    date_transaction DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_commande) REFERENCES commandes(id_commande)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tables avec dépendances multiples
CREATE TABLE IF NOT EXISTS details_commandes (
    id_detail_commande INT AUTO_INCREMENT PRIMARY KEY,
    id_commande INT,
    id_produit INT,
    quantite INT NOT NULL,
    prix DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (id_commande) REFERENCES commandes(id_commande),
    FOREIGN KEY (id_produit) REFERENCES produits(id_produit)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS avis (
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

CREATE TABLE IF NOT EXISTS wishlist (
    id_liste_souhait INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT,
    id_produit INT,
    date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES users(id_user),
    FOREIGN KEY (id_produit) REFERENCES produits(id_produit)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS produit_categorie (
  id_produit INT NOT NULL,
  id_categorie INT NOT NULL,
  PRIMARY KEY (id_produit, id_categorie),
  FOREIGN KEY (id_produit) REFERENCES produits(id_produit) ON DELETE CASCADE,
  FOREIGN KEY (id_categorie) REFERENCES categories(id_categorie) ON DELETE CASCADE
);
