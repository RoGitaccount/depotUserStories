-- avis
ALTER TABLE avis DROP FOREIGN KEY avis_ibfk_1;
ALTER TABLE avis
ADD CONSTRAINT avis_ibfk_1
FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE;

-- informations_facturation
ALTER TABLE informations_facturation DROP FOREIGN KEY informations_facturation_ibfk_1;
ALTER TABLE informations_facturation
ADD CONSTRAINT informations_facturation_ibfk_1
FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE;

-- wishlist
ALTER TABLE wishlist DROP FOREIGN KEY wishlist_ibfk_1;
ALTER TABLE wishlist
ADD CONSTRAINT wishlist_ibfk_1
FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE;

-- panier
ALTER TABLE panier DROP FOREIGN KEY panier_ibfk_1;
ALTER TABLE panier
ADD CONSTRAINT panier_ibfk_1
FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE;

-- utilisations_promotions
ALTER TABLE utilisations_promotions DROP FOREIGN KEY utilisations_promotions_ibfk_1;
ALTER TABLE utilisations_promotions
ADD CONSTRAINT utilisations_promotions_ibfk_1
FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE;

-- paniers_temp
ALTER TABLE paniers_temp DROP FOREIGN KEY paniers_temp_ibfk_1;
ALTER TABLE paniers_temp
ADD CONSTRAINT paniers_temp_ibfk_1
FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE;

-- commandes (SET NULL)
ALTER TABLE commandes MODIFY id_user INT NULL;
ALTER TABLE commandes DROP FOREIGN KEY commandes_ibfk_1;
ALTER TABLE commandes
ADD CONSTRAINT commandes_ibfk_1
FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE SET NULL;

-- logs (SET NULL)
ALTER TABLE logs MODIFY id_user INT NULL;
ALTER TABLE logs DROP FOREIGN KEY logs_ibfk_1;
ALTER TABLE logs
ADD CONSTRAINT logs_ibfk_1
FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE SET NULL;


//---ajout-----//
ALTER TABLE commandes
ADD COLUMN email_snapshot VARCHAR(255),
ADD COLUMN nom_snapshot VARCHAR(255);
ADD COLUMN facture_token VARCHAR(255) DEFAULT NULL;

//-------------//




//------unicité de la table information facturation -----//

// compte le nb de doublon 

SELECT id_user, COUNT(*) as total
FROM informations_facturation
GROUP BY id_user
HAVING total > 1;


// supp tt les lignes et garde les plus ancienne 

DELETE FROM informations_facturation
WHERE id_info NOT IN (
  SELECT * FROM (
    SELECT MIN(id_info)
    FROM informations_facturation
    GROUP BY id_user
  ) AS temp
);

// ajouter la contrainte unique 

ALTER TABLE informations_facturation
ADD UNIQUE (id_user);


-- recuperer l'historique des commandes d'un utilisateur avec filtre de date

SELECT 
    c.id_commande,
    c.date_commande,
    c.statut,
    c.montant_total,
    p.id_produit,
    p.titre,
    p.description,
    pay.date_transaction
FROM commandes c
JOIN details_commandes dc ON c.id_commande = dc.id_commande
JOIN produits p ON dc.id_produit = p.id_produit
LEFT JOIN paiements pay ON c.id_commande = pay.id_commande
WHERE c.id_user = ?
  AND (
    :filter_date = 'all'
    OR (filter_date = '7days' AND c.date_commande >= DATE_SUB(CURDATE(), INTERVAL 7 DAY))
    OR (:filter_date = '1month' AND c.date_commande >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
    OR (:filter_date = '6months' AND c.date_commande >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH))
    OR (:filter_date = 'year' AND YEAR(c.date_commande) = :annee_val)
  )
ORDER BY c.date_commande DESC;
