
CREATE TABLE users (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    mdp VARCHAR(255) NOT NULL, 
    role ENUM('admin', 'user') NOT NULL, 
    email VARCHAR(255) NOT NULL UNIQUE,
    telephone VARCHAR(15)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;