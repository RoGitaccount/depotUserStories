--Journal des activités des utilisateurs.
CREATE TABLE logs (
    id_logs INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT,
    activite VARCHAR(255),
    date_activite DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES users(id_user)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
