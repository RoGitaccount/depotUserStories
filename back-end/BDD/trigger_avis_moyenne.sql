--AFTER INSERT trigger

DELIMITER //

CREATE TRIGGER update_average_after_insert
AFTER INSERT ON avis
FOR EACH ROW
BEGIN
  UPDATE produits
  SET note_moyenne = (
    SELECT ROUND(AVG(note), 1)
    FROM avis
    WHERE id_produit = NEW.id_produit AND note IS NOT NULL
  )
  WHERE id_produit = NEW.id_produit;
END;
//

DELIMITER ;

-- AFTER UPDATE trigger

DELIMITER //

CREATE TRIGGER update_average_after_update
AFTER UPDATE ON avis
FOR EACH ROW
BEGIN
  UPDATE produits
  SET note_moyenne = (
    SELECT ROUND(AVG(note), 1)
    FROM avis
    WHERE id_produit = NEW.id_produit AND note IS NOT NULL
  )
  WHERE id_produit = NEW.id_produit;
END;
//

DELIMITER ;

--AFTER DELETE trigger

DELIMITER //

CREATE TRIGGER update_average_after_delete
AFTER DELETE ON avis
FOR EACH ROW
BEGIN
  UPDATE produits
  SET note_moyenne = (
    SELECT ROUND(AVG(note), 1)
    FROM avis
    WHERE id_produit = OLD.id_produit AND note IS NOT NULL
  )
  WHERE id_produit = OLD.id_produit;
END;
//

DELIMITER ;


--ajouter/modifier/supprimer un avis pour que cela s'actualise