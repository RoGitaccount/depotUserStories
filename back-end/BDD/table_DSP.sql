-- users

CREATE TABLE IF NOT EXISTS users (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    mdp VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    last_activity DATETIME,
    secretkey VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- informations_facturation

CREATE TABLE IF NOT EXISTS informations_facturation (
    id_info INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT,
    nom_entreprise VARCHAR(255),
    numero_tva VARCHAR(50),
    adresse_ligne1 VARCHAR(255) NOT NULL,
    adresse_ligne2 VARCHAR(100),
    ville VARCHAR(100),
    region VARCHAR(100),
    code_postal VARCHAR(10),
    pays VARCHAR(100),
    telephone VARCHAR(15),
    FOREIGN KEY (id_user) REFERENCES users(id_user)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- produits

CREATE TABLE IF NOT EXISTS produits (
    id_produit INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    prix DECIMAL(10, 2) NOT NULL, -- prix actuel du produit
    image VARCHAR(255),
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_modification DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    image LONGBLOB
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- avis

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

-- categories

CREATE TABLE IF NOT EXISTS categories (
    id_categorie INT AUTO_INCREMENT PRIMARY KEY,
    nom_categorie VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- produit_categorie

CREATE TABLE IF NOT EXISTS produit_categorie (
  id_produit INT NOT NULL,
  id_categorie INT NOT NULL,
  PRIMARY KEY (id_produit, id_categorie),
  FOREIGN KEY (id_produit) REFERENCES produits(id_produit) ON DELETE CASCADE,
  FOREIGN KEY (id_categorie) REFERENCES categories(id_categorie) ON DELETE CASCADE
);

-- promotions

CREATE TABLE IF NOT EXISTS promotions (
    id_promotion INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    montant_reduction DECIMAL(10, 2),
    date_expiration DATETIME,
    est_actif BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- utilisations_promotions

CREATE TABLE IF NOT EXISTS utilisations_promotions (
    id_user INT,
    id_promotion INT,
    date_utilisation DATETIME DEFAULT NOW(),
    PRIMARY KEY (id_user, id_promotion),
    FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE,
    FOREIGN KEY (id_promotion) REFERENCES promotions(id_promotion) ON DELETE CASCADE
);

-- wishlist

CREATE TABLE IF NOT EXISTS wishlist (
    id_liste_souhait INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT,
    id_produit INT,
    date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id_user, id_produit),
    FOREIGN KEY (id_user) REFERENCES users(id_user),
    FOREIGN KEY (id_produit) REFERENCES produits(id_produit)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- panier

CREATE TABLE IF NOT EXISTS panier (
    id_panier INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    id_produit INT NOT NULL,
    date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id_user, id_produit),
    FOREIGN KEY (id_user) REFERENCES users(id_user),
    FOREIGN KEY (id_produit) REFERENCES produits(id_produit)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- commandes
CREATE TABLE IF NOT EXISTS commandes (
    id_commande INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    date_commande DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_modification DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    statut ENUM('en attente','payee','activee','annulee') NOT NULL DEFAULT 'en attente',
    montant_total DECIMAL(10, 2) NOT NULL,
    -- Si l'utilisateur a utilisé une promo
    id_promotion INT DEFAULT NULL,
    -- Montant de la réduction appliquée
    montant_reduction DECIMAL(10, 2) DEFAULT 0.00,
    FOREIGN KEY (id_user) REFERENCES users(id_user),
    FOREIGN KEY (id_promotion) REFERENCES promotions(id_promotion) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- détails de chaque article dans la commande.
CREATE TABLE IF NOT EXISTS details_commandes (
    id_detail_commande INT AUTO_INCREMENT PRIMARY KEY,
    id_commande INT NOT NULL,
    id_produit INT NOT NULL,
    -- prix du produit au moment de la commande
    prix_unitaire DECIMAL(10, 2) NOT NULL, 
    FOREIGN KEY (id_commande) REFERENCES commandes(id_commande),
    FOREIGN KEY (id_produit) REFERENCES produits(id_produit)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- paiement
CREATE TABLE IF NOT EXISTS paiements (
    id_paiement INT AUTO_INCREMENT PRIMARY KEY,
    id_commande INT NOT NULL,
    -- carte de crédit, PayPal, etc.
    methode_paiement VARCHAR(50),
    statut_paiement ENUM('en attente','reussi','echoue') DEFAULT 'en attente',    montant_transaction DECIMAL(10, 2) NOT NULL,
    date_transaction DATETIME DEFAULT CURRENT_TIMESTAMP,
    -- ID de session Stripe pour le paiement
    session_stripe_id VARCHAR(255), 
    -- ID de la transaction Stripe
    transaction_id VARCHAR(255), 

    UNIQUE (id_commande),
    FOREIGN KEY (id_commande) REFERENCES commandes(id_commande)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- pas encore implementé
CREATE TABLE IF NOT EXISTS logs (
    id_logs INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT,
    endpoint VARCHAR(255) NOT NULL,         -- ex: "/cart/remove"
    methode VARCHAR(10) NOT NULL,           -- GET, POST, PUT, DELETE
    statut INT DEFAULT 200,                 -- Code HTTP (utile pour les erreurs)
    activite TEXT,                          -- Description plus complète
    ip_address VARCHAR(45),                 -- Adresse IP du client
    user_agent TEXT,                        -- Navigateur ou appli
    date_activite DATETIME DEFAULT CURRENT_TIMESTAMP,
    occurences INT DEFAULT 1,
    FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- paniers temporaires pour paiement Stripe
CREATE TABLE IF NOT EXISTS paniers_temp (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    session_id VARCHAR(255) NOT NULL, -- ID de session Stripe
    cart_items JSON NOT NULL,         -- Contenu du panier (JSON)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES users(id_user)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;