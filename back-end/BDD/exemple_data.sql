-- Pour chaque table, on vérifie que la donnée n'existe pas déjà avant d'insérer

-- Table users
INSERT INTO users (nom, prenom, mdp, role, email, telephone)
SELECT 'Doe', 'John', 'azertyuiop', 'admin', 'john.doe@example.com', '0612345678'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'john.doe@example.com'
);

INSERT INTO users (nom, prenom, mdp, role, email, telephone)
SELECT 'Smith', 'Jane', 'azertyuiop', 'user', 'jane.smith@example.com', '0698765432'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'jane.smith@example.com'
);

-- Table categories
INSERT INTO categories (nom_categorie, description)
SELECT 'Électronique', 'Produits électroniques variés'
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE nom_categorie = 'Électronique'
);

INSERT INTO categories (nom_categorie, description)
SELECT 'Vêtements', 'Articles de mode pour hommes et femmes'
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE nom_categorie = 'Vêtements'
);

-- Table promotions
INSERT INTO promotions (code, montant_reduction, date_expiration, est_actif)
SELECT 'PROMO10', 10.00, '2025-12-31 23:59:59', TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM promotions WHERE code = 'PROMO10'
);

INSERT INTO promotions (code, montant_reduction, date_expiration, est_actif)
SELECT 'PROMO20', 20.00, '2025-06-30 23:59:59', TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM promotions WHERE code = 'PROMO20'
);

-- Table adresses_livraison
INSERT INTO adresses_livraison (id_user, adresse_ligne1, ville, pays)
SELECT 1, '123 Rue de la Paix', 'Paris', 'France'
WHERE NOT EXISTS (
    SELECT 1 FROM adresses_livraison WHERE id_user = 1 AND adresse_ligne1 = '123 Rue de la Paix'
);

INSERT INTO adresses_livraison (id_user, adresse_ligne1, ville, pays)
SELECT 2, '456 Avenue du Centre', 'Lyon', 'France'
WHERE NOT EXISTS (
    SELECT 1 FROM adresses_livraison WHERE id_user = 2 AND adresse_ligne1 = '456 Avenue du Centre'
);

-- Table logs
INSERT INTO logs (id_user, activite)
SELECT 1, 'Connexion réussie'
WHERE NOT EXISTS (
    SELECT 1 FROM logs WHERE id_user = 1 AND activite = 'Connexion réussie'
);

INSERT INTO logs (id_user, activite)
SELECT 2, "Ajout d'un produit au panier"
WHERE NOT EXISTS (
    SELECT 1 FROM logs WHERE id_user = 2 AND activite = "Ajout d'un produit au panier"
);

-- Table produits
INSERT INTO produits (titre, description, prix, stock, id_categorie)
SELECT 'Smartphone XYZ', 'Un téléphone dernier cri', 699.99, 50, 1
WHERE NOT EXISTS (
    SELECT 1 FROM produits WHERE titre = 'Smartphone XYZ'
);

INSERT INTO produits (titre, description, prix, stock, id_categorie)
SELECT 'T-shirt coton', 'Un t-shirt 100% coton', 19.99, 100, 2
WHERE NOT EXISTS (
    SELECT 1 FROM produits WHERE titre = 'T-shirt coton'
);

-- Table commandes
INSERT INTO commandes (id_user, montant_total, statut)
SELECT 1, 719.98, 'en attente'
WHERE NOT EXISTS (
    SELECT 1 FROM commandes WHERE id_user = 1 AND statut = 'en attente'
);

INSERT INTO commandes (id_user, montant_total, statut)
SELECT 2, 39.98, 'en traitement'
WHERE NOT EXISTS (
    SELECT 1 FROM commandes WHERE id_user = 2 AND statut = 'en traitement'
);

-- Table paiements
INSERT INTO paiements (id_commande, methode_paiement, statut_paiement)
SELECT 1, 'carte_bancaire', 'completé'
WHERE NOT EXISTS (
    SELECT 1 FROM paiements WHERE id_commande = 1 AND methode_paiement = 'carte_bancaire'
);

INSERT INTO paiements (id_commande, methode_paiement, statut_paiement)
SELECT 2, 'paypal', 'en attente'
WHERE NOT EXISTS (
    SELECT 1 FROM paiements WHERE id_commande = 2 AND methode_paiement = 'paypal'
);

-- Table details_commandes
INSERT INTO details_commandes (id_commande, id_produit, quantite, prix)
SELECT 1, 1, 1, 699.99
WHERE NOT EXISTS (
    SELECT 1 FROM details_commandes WHERE id_commande = 1 AND id_produit = 1
);

INSERT INTO details_commandes (id_commande, id_produit, quantite, prix)
SELECT 2, 2, 2, 19.99
WHERE NOT EXISTS (
    SELECT 1 FROM details_commandes WHERE id_commande = 2 AND id_produit = 2
);

-- Table avis
INSERT INTO avis (id_user, id_produit, note, commentaire)
SELECT 1, 1, 5, 'Excellent smartphone !'
WHERE NOT EXISTS (
    SELECT 1 FROM avis WHERE id_user = 1 AND id_produit = 1
);

INSERT INTO avis (id_user, id_produit, note, commentaire)
SELECT 2, 2, 4, 'Bonne qualité, confortable.'
WHERE NOT EXISTS (
    SELECT 1 FROM avis WHERE id_user = 2 AND id_produit = 2
);

-- Table wishlist
INSERT INTO wishlist (id_user, id_produit)
SELECT 1, 2
WHERE NOT EXISTS (
    SELECT 1 FROM wishlist WHERE id_user = 1 AND id_produit = 2
);

INSERT INTO wishlist (id_user, id_produit)
SELECT 2, 1
WHERE NOT EXISTS (
    SELECT 1 FROM wishlist WHERE id_user = 2 AND id_produit = 1
);