import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const CataloguePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    fetchCategories();
    fetchAllProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:8001/api/category");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Erreur chargement catégories :", error);
    }
  };

  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8001/api/products");
      const data = await res.json();
  
      const productsWithBlobImages = await Promise.all(
        data.map(async (product) => {
          if (product.image) {
            const blobRes = await fetch(`http://localhost:8001/api/products/${product.id_produit}/image`);
            const blob = await blobRes.blob();
            const imageUrl = URL.createObjectURL(blob);
            return { ...product, image_url: imageUrl }; // on remplace image_url par le blob transformé
          }
          return product;
        })
      );
  
      setProducts(productsWithBlobImages);
    } catch (error) {
      console.error("Erreur chargement produits :", error);
    } finally {
      setLoading(false);
    }
  };
  

  const fetchProductsByCategory = async (categoryId) => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8001/api/productCategory/categorie/${categoryId}`);
      const data = await res.json();
  
      const productsWithBlobImages = await Promise.all(
        data.map(async (product) => {
          if (product.image) {
            const blobRes = await fetch(`http://localhost:8001/api/products/${product.id_produit}/image`);
            const blob = await blobRes.blob();
            const imageUrl = URL.createObjectURL(blob);
            return { ...product, image_url: imageUrl };
          }
          return product;
        })
      );
  
      setProducts(productsWithBlobImages);
    } catch (error) {
      console.error("Erreur produits par catégorie :", error);
    } finally {
      setLoading(false);
    }
  };
  
  

  const handleCategoryClick = (categoryId) => {
    setSelectedCategoryId(categoryId);
    if (categoryId === null) {
      fetchAllProducts();
    } else {
      fetchProductsByCategory(categoryId);
    }
  };

 return (
    // <div className="flex min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
    <div className="flex min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 bg-gradient-to-b from-blue-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Menu latéral */}
      <aside className="w-1/4 bg-gray-100 dark:bg-gray-800 p-4 border-r dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Catégories</h2>
        <ul className="space-y-2">
          <li>
            <button
              className={`w-full text-left px-3 py-2 rounded ${
                selectedCategoryId === null
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
              onClick={() => handleCategoryClick(null)}
            >
              Toutes les catégories
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id_categorie}>
              <button
                className={`w-full text-left px-3 py-2 rounded ${
                  selectedCategoryId === cat.id_categorie
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
                onClick={() => handleCategoryClick(cat.id_categorie)}
              >
                {cat.nom_categorie}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Produits */}
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">
          {selectedCategoryId
            ? `Catégorie : ${categories.find((c) => c.id_categorie === selectedCategoryId)?.nom_categorie}`
            : "Tous les produits"}
        </h1>

        {loading ? (
          <p>Chargement...</p>
        ) : products.length === 0 ? (
          <p>Aucun produit trouvé.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id_produit}
                onClick={() => navigate(`/produit/${product.id_produit}`)}
                className="cursor-pointer border rounded p-4 shadow hover:shadow-md transition bg-white dark:bg-gray-800 dark:border-gray-700"
              >
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.titre}
                    style={{
                      maxWidth: "300px",
                      maxHeight: "400px",
                      width: "100%",
                      objectFit: "cover",
                      borderRadius: "8px",
                      marginBottom: "1rem",
                      display: "block",
                      marginLeft: "auto",
                      marginRight: "auto",
                    }}
                  />
                )}
                <h2 className="text-lg font-semibold">{product.titre}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                  {categories.find((c) => c.id_categorie === product.id_categorie)?.nom_categorie}
                </p>
                <p className="mb-2">{product.description}</p>
                <p className="font-bold">{product.prix} €</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CataloguePage;