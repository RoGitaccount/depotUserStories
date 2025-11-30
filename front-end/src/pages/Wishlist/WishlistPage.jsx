import React, { useEffect, useState } from 'react';
import WishlistList from '../../components/Wishlist/Wishlist-list';
import axios from 'axios';
import { toast, Bounce } from 'react-toastify';
import RedirectButton from '../../components/PageComponents/RedirectButton';
import axiosInstance from '../../services/axiosInstance';

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasStock = wishlist.some((produit) => produit.stock > 0);

  useEffect(() => {
    loadWishlist();
  }, []);


  const loadWishlist = async () => {
    setLoading(true);
    try {
  
      const res = await axiosInstance.get('/wishlist');
      const data = res.data;

      // Charger les images blob pour chaque produit
      const wishlistWithImages = await Promise.all(
        data.map(async (product) => {
          if (product.image) {  // si tu as un champ image qui indique qu’il y a une image
            try {
              const blobRes = await axiosInstance.get(`/products/${product.id_produit}/image`, {
                responseType: "blob"
              });
              const imageUrl = URL.createObjectURL(blobRes.data); //data correspond au données que le backend a renvoyées
              return { ...product, image_url: imageUrl };
            } catch (err) {
              console.error("Erreur chargement image produit", product.id_produit, err);
              return product;
            }
          }
          return product;
        })
      );
      setWishlist(wishlistWithImages);
      setError(null);
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setError("Vous devez être connecté pour accéder à votre wishlist.");
        } else {
          setError("Erreur lors du chargement de la wishlist. Veuillez réessayer.");
        }
      } else {
        setError("Une erreur réseau s'est produite. Vérifiez votre connexion.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  


  const handleRemove = async (id_produit) => {
    try {
      await axiosInstance.delete(`/wishlist/delete/${id_produit}`);
      loadWishlist();
    } catch {
      toast.error('Erreur lors de la suppression.',
        {
        className:"toast-top-position",
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        transition: Bounce,
        }
      );
    }
  };

  const handleClear = async () => {
    try {
      await axiosInstance.delete('/wishlist/clear');
      loadWishlist();
    } catch {
      toast.error('Erreur lors du vidage de la wishlist.',
        {
        className:"toast-top-position",
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        transition: Bounce,
        }
      );
    }
  };

const handleAddToCart = async (id_produit) => {
  try {
    const produit = wishlist.find(p => p.id_produit === id_produit && Number(p.stock) > 0);

    if (!produit) {
      toast.info("Ce produit est en rupture de stock.", {
        className: "toast-top-position",
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        transition: Bounce,
      });
      return;
    }

    await axiosInstance.post(`/wishlist/add_to_cart/${id_produit}`, {});

    toast.success("Article ajouté au panier !", {
      className: "toast-top-position",
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
      transition: Bounce,
    });

    loadWishlist();
  } catch {
    toast.error("Erreur lors de l'ajout au panier.", {
      className: "toast-top-position",
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
      transition: Bounce,
    });
  }
};

const handleAddAllToCart = async () => {
  try {
    const produitsEnStock = wishlist.filter(p => Number(p.stock) > 0);

    if (produitsEnStock.length === 0) {
      toast.info("Aucun produit en stock à ajouter.", {
        className: "toast-top-position",
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        transition: Bounce,
      });
      return;
    }

    await axiosInstance.post('/wishlist/add_all_to_cart', {});

    toast.success("Articles ajoutés au panier !", {
      className: "toast-top-position",
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
      transition: Bounce,
    });

    loadWishlist();
  } catch {
    toast.error("Erreur lors de l'ajout de tous les produits au panier.", {
      className: "toast-top-position",
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
      transition: Bounce,
    });
  }
};




if (error === "Vous devez être connecté pour accéder à votre wishlist.") {
  return (
    <div className="text-center text-black dark:text-white min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-blue-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <p className="mb-4 text-lg font-semibold text-red-400">{error}</p>
      <RedirectButton
        to="/login"
        failureMessage={null} // pas de message ici, car déjà affiché au-dessus
        className="w-fit px-6 py-2 "
      >
        Se connecter
      </RedirectButton>
    </div>
  );
}

if (loading) return <div className="text-black dark:text-white min-h-screen flex flex-col bg-gradient-to-b from-blue-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">Chargement...</div>;
if (error) return <div className="error text-black dark:text-white min-h-screen flex flex-col bg-gradient-to-b from-blue-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">{error}</div>;

return (
  <div className="text-black dark:text-white min-h-screen flex flex-col bg-gradient-to-b from-blue-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Ma Wishlist</h1>

      {wishlist.length === 0 ? (
        <p className="text-center text-lg">Votre wishlist est vide</p>
      ) : (
        <div className="flex flex-col md:flex-row gap-8">
          {/* Colonne gauche : Liste des articles */}
          <div className="w-full md:w-2/3">
            <WishlistList
              items={wishlist}
              onRemove={handleRemove}
              onAddToCart={handleAddToCart}
            />
          </div>

          {/* Colonne droite : Actions */}
          <div className="w-full md:w-1/3">
            <div className="p-6 rounded shadow bg-white dark:bg-gray-800/80 backdrop-blur">
              <h2 className="text-xl font-semibold mb-4">Actions</h2>
              <div className="flex flex-col gap-4">
                {hasStock && (
                  <button
                    onClick={handleAddAllToCart}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    Ajouter tous les produits au panier
                  </button>
                )}
                <button
                  onClick={handleClear}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                >
                  Vider la wishlist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
}

export default WishlistPage;