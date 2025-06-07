import React, { useEffect, useState } from 'react';
import WishlistList from '../../components/Wishlist/Wishlist-list';
// import './Wishlist.css'; 
import axios from 'axios';
import { toast, Bounce } from 'react-toastify';
import RedirectButton from '../../components/PageComponents/RedirectButton';


const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWishlist();
  }, []);


const loadWishlist = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Vous devez être connecté pour accéder à votre wishlist.");
      setLoading(false);
      return;
    }

    const res = await axios.get('http://localhost:8001/api/wishlist', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setWishlist(res.data);
    setError(null);
  } catch (err) {
    if (err.response) {
      // Erreur retournée par l'API
      if (err.response.status === 401) {
        setError("Vous devez être connecté pour accéder à votre wishlist.");
      } else {
        setError("Erreur lors du chargement de la wishlist. Veuillez réessayer.");
      }
    } else {
      // Erreur réseau ou autre
      setError("Une erreur réseau s'est produite. Vérifiez votre connexion.");
    }
    console.error(err);
  } finally {
    setLoading(false);
  }
};


  const handleRemove = async (id_produit) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8001/api/wishlist/delete/${id_produit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
      );
      loadWishlist();
    } catch {
      alert("Erreur lors de la suppression.");
    }
  };

  const handleClear = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete('http://localhost:8001/api/wishlist/clear',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
      );
      loadWishlist();
    } catch {
      alert("Erreur lors du vidage de la wishlist.");
    }
  };

  const handleAddToCart = async (id_produit) => {
  try {
    const token = localStorage.getItem("token");
    await axios.post(
      `http://localhost:8001/api/wishlist/add_to_cart/${id_produit}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    toast.success("Article ajouté au panier !",{
      position: "bottom-right",
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
    toast.error("Erreur lors de l'ajout au panier.");
  }
};

const handleAddAllToCart = async () => {
  try {
    const token = localStorage.getItem("token");
    await axios.post(
      'http://localhost:8001/api/wishlist/add_all_to_cart',
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    loadWishlist();
  } catch {
    alert("Erreur lors de l'ajout de tous les produits au panier.");
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

//   return (
// <div className="text-black dark:text-white min-h-screen flex flex-col bg-gradient-to-b from-blue-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
//         <div className="container mx-auto p-6">
//         <h1 className="text-2xl font-bold mb-4">Ma Wishlist</h1>
//         <WishlistList items={wishlist} onRemove={handleRemove} onAddToCart={handleAddToCart} />
//         {wishlist.length > 0 && (
//         <div className="mt-6 flex flex-wrap gap-4">
//           <button
//             onClick={handleAddAllToCart}
//             className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition shadow"
//           >
//             Ajouter tous les produits au panier
//           </button>
//           <button
//             onClick={handleClear}
//             className="bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700 transition shadow"
//           >
//             Vider la wishlist
//           </button>
//         </div>
//       )}
//       </div>
//     </div>
//   );
// };

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
                <button
                  onClick={handleAddAllToCart}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Ajouter tous les produits au panier
                </button>
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