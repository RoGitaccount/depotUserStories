-- lancer sur le terminal sur le chemin "/back-end/BDD": 
-- mysql -u ("username") -p ("database") < maj_produits_categories.sql

-- -----------------------------------------------------
-- Étape 1 : Suppression des anciennes contraintes
-- -----------------------------------------------------

-- Supprimer la clé étrangère id_categorie dans produits
ALTER TABLE produits DROP FOREIGN KEY produits_ibfk_1;
ALTER TABLE produits DROP COLUMN id_categorie;

-- Supprimer les anciennes FKs sur wishlist
ALTER TABLE wishlist DROP FOREIGN KEY wishlist_ibfk_1;
ALTER TABLE wishlist DROP FOREIGN KEY wishlist_ibfk_2;

-- Supprimer les anciennes FKs sur avis
ALTER TABLE avis DROP FOREIGN KEY avis_ibfk_1;
ALTER TABLE avis DROP FOREIGN KEY avis_ibfk_2;

-- -----------------------------------------------------
-- Étape 2 : Recréation des contraintes
-- -----------------------------------------------------

-- wishlist : suppression en cascade si user ou produit supprimé
ALTER TABLE wishlist
  ADD CONSTRAINT wishlist_ibfk_1 FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE,
  ADD CONSTRAINT wishlist_ibfk_2 FOREIGN KEY (id_produit) REFERENCES produits(id_produit) ON DELETE CASCADE;

-- avis : conserver les avis même si user ou produit supprimé
ALTER TABLE avis
  ADD CONSTRAINT avis_ibfk_1 FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE SET NULL,
  ADD CONSTRAINT avis_ibfk_2 FOREIGN KEY (id_produit) REFERENCES produits(id_produit) ON DELETE SET NULL;

-- -----------------------------------------------------
-- Étape 3 : Création de la table produit_categorie
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS produit_categorie (
  id_produit INT NOT NULL,
  id_categorie INT NOT NULL,
  PRIMARY KEY (id_produit, id_categorie),
  FOREIGN KEY (id_produit) REFERENCES produits(id_produit) ON DELETE CASCADE,
  FOREIGN KEY (id_categorie) REFERENCES categories(id_categorie) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Étape 4 : Suppression des données existantes (test)
-- -----------------------------------------------------

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE produit_categorie;
TRUNCATE TABLE wishlist;
TRUNCATE TABLE avis;
TRUNCATE TABLE produits;
TRUNCATE TABLE categories;

SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------
-- Étape 5 : Insertion des catégories
-- -----------------------------------------------------

INSERT INTO categories (nom_categorie, description) VALUES
('Électronique', 'Produits électroniques comme téléphones, ordinateurs, etc.'),
('Maison', 'Articles pour la maison, cuisine et décoration.'),
('Vêtements', 'Habillement pour hommes, femmes et enfants.'),
('Livres', 'Livres de différents genres et auteurs.'),
('Sport', 'Articles pour le sport et les activités de plein air.');

-- -----------------------------------------------------
-- Étape 6 : Insertion des produits
-- -----------------------------------------------------

INSERT INTO produits (titre, description, prix, stock, image_url) VALUES
('Smartphone Galaxy X', 'Un smartphone haut de gamme avec écran AMOLED.', 799.99, 50, 'https://example.com/images/galaxyx.jpg'),
('Aspirateur Dyson V11', 'Aspirateur sans fil puissant.', 499.00, 20, 'https://example.com/images/dysonv11.jpg'),
('T-shirt noir', 'T-shirt basique en coton.', 19.99, 100, 'https://example.com/images/tshirt_noir.jpg'),
('Harry Potter à l\'école des sorciers', 'Premier tome de la saga Harry Potter.', 12.99, 200, 'https://example.com/images/harrypotter1.jpg'),
('Raquette de tennis Wilson', 'Raquette légère pour joueurs intermédiaires.', 149.95, 30, 'https://example.com/images/raquette_wilson.jpg');

-- -----------------------------------------------------
-- Étape 7 : Liaisons produits ↔ catégories
-- -----------------------------------------------------

INSERT INTO produit_categorie (id_produit, id_categorie) VALUES
(1, 1), -- Galaxy X → Électronique
(2, 2), -- Dyson → Maison
(3, 3), -- T-shirt → Vêtements
(4, 4), -- Harry Potter → Livres
(5, 5), -- Raquette → Sport
(1, 5), -- Galaxy X → aussi Sport
(3, 2); -- T-shirt → aussi Maison

-- -----------------------------------------------------
-- Étape 8 : Insertion des wishlists
-- -----------------------------------------------------

INSERT INTO wishlist (id_user, id_produit) VALUES
(1, 2), -- Alice aime le Dyson
(2, 1); -- Bob veut un Galaxy X

-- -----------------------------------------------------
-- Étape 9 : Insertion des avis
-- -----------------------------------------------------

INSERT INTO avis (id_user, id_produit, note, commentaire) VALUES
(1, 1, 5, 'Excellent smartphone !'), -- Alice sur Galaxy X
(2, 2, 4, 'Bonne qualité, confortable.'); -- Bob sur Dyson
