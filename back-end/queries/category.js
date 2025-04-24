
export function Insert_category(client, { nom_categorie, description }, callback) {
  const query = 'INSERT INTO categories (nom_categorie, description) VALUES (?, ?)';
  client.query(query, [nom_categorie, description], (err, results) => {
   if (err){
     return callback(err, null);
   }
   callback(null, results);
  });
}

export function Get_all_categories(client, callback) {
 const query = 'SELECT id_categorie, nom_categorie, description FROM categories';
 client.query(query, (err, results) => {
   if (err){
     return callback(err, null);
   }
    callback(null, results);
   });
}

export function Get_one_category(client, id_categorie, callback) {
 const query = 'SELECT id_categorie, nom_categorie, description FROM categories WHERE id_categorie = ? LIMIT 1';
 client.query(query, [id_categorie], (err, results) => {
   if (err) {
     return callback(err, null);
   }
   if (results.length === 0){ //vérifie si la categorie
     return callback(null, null)
   };
   callback(null, results[0]); //retourne un objet {}
 });
}

export function Update_category(client, { id_categorie, nom_categorie, description }, callback) {
 const query = 'UPDATE categories SET nom_categorie = ?, description = ? WHERE id_categorie = ?';
 client.query(query, [nom_categorie, description, id_categorie], (err, results) => {
   if (err){
     return callback(err, null);
   };
    callback(null, results);
 });
}

export function Delete_category(client, id_categorie, callback) {
 const query = 'DELETE FROM categories WHERE id_categorie = ?';
 client.query(query, [id_categorie], (err,results)=>{
   if (err){
     return callback(err,null);
   }
   callback(null,results)
 });
}
