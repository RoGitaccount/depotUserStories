-- Stocke les codes promotionnels.
CREATE TABLE promotions (
    id_promotion INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    montant_reduction DECIMAL(10, 2),
    date_expiration DATETIME,
    est_actif BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
