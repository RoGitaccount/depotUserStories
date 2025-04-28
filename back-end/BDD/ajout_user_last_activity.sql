--modification de la table user

ALTER TABLE users ADD COLUMN last_activity DATETIME;

UPDATE users
SET last_activity = NOW()
WHERE id_user = ?;


--procédure stockée
DELIMITER $$

CREATE EVENT purge_utilisateurs_inactifs
ON SCHEDULE EVERY 1 DAY
DO
BEGIN
  DELETE FROM users
  WHERE last_activity IS NOT NULL
    AND last_activity < NOW() - INTERVAL 3 YEAR;
END$$

DELIMITER ;

--chercher l'événement
SHOW VARIABLES LIKE 'event_scheduler';

--activer procedure
SET GLOBAL event_scheduler = ON;