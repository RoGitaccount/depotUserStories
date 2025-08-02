import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";
import axiosInstance from "../services/axiosInstance";
import TextareaWithLimit from "../components/PageComponents/textarea";
import { toast, Bounce } from "react-toastify";
import { Link } from "react-router-dom";

const ProductDetailPage = () => {
  const { id } = useParams();
  const [produit, setProduit] = useState(null);
  const [loading, setLoading] = useState(true);

  // Avis
  const [avis, setAvis] = useState([]);
  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState("");
  const [editId, setEditId] = useState(null);
  const [editNote, setEditNote] = useState(5);
  const [editCommentaire, setEditCommentaire] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // Auth
  const { user, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    fetchProduit();
    fetchAvis();
    fetchSuggestions();
  }, [id]);

  const fetchSuggestions = async () => {
    try {
      const res = await fetch(`http://localhost:8001/api/products/${id}/suggestions`);
      const data = await res.json();
  
      // Récupérer les images pour chaque suggestion
      const suggestionsWithImages = await Promise.all(
        data.map(async (prod) => {
          if (prod.image) {
            try {
              const imgRes = await fetch(`http://localhost:8001/api/products/${prod.id_produit}/image`);
              const blob = await imgRes.blob();
              const imageUrl = URL.createObjectURL(blob);
              return { ...prod, imageObjectUrl: imageUrl };
            } catch (imgErr) {
              console.error(`Erreur chargement image produit ${prod.id_produit}`, imgErr);
              return prod; // Retourne sans image
            }
          } else {
            return prod;
          }
        })
      );
  
      setSuggestions(suggestionsWithImages);
    } catch (error) {
      console.error("Erreur récupération suggestions :", error);
    }
  };

  const fetchProduit = async () => {
    try {
      const res = await fetch(`http://localhost:8001/api/products/${id}`);
      const data = await res.json();
  
      // Si l'image est un Blob (base64 ou autre), la récupérer à part
      if (data.image) {
        const imageRes = await fetch(`http://localhost:8001/api/products/${id}/image`);
        const blob = await imageRes.blob();
        const imageUrl = URL.createObjectURL(blob);
        data.imageObjectUrl = imageUrl;
      }
  
      setProduit(data);
    } catch (error) {
      console.error("Erreur récupération produit :", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvis = async () => {
    try {
      const res = await axiosInstance.get(`/reviews/${id}`);
      setAvis(res.data);
    } catch (error) {
      console.error("Erreur récupération avis :", error);
    }
  };

  const handleAddToCart = async () => {
    try {
      await axiosInstance.post(`/wishlist/add_to_cart/${produit.id_produit}`, {});
      // alert("Produit ajouté au panier !");
      toast.success('Produit ajouté au panier !',{
          className:"toast-top-position",
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
          transition: Bounce,
        });
    } catch (error) {
      console.error("Erreur ajout panier :", error);
      // alert("Erreur lors de l'ajout au panier.");
      toast.error('Erreur lors de l\'ajout au panier.',
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

  const handleAddToWishlist = async () => {
    try {
      await axiosInstance.post(`/wishlist/add/${produit.id_produit}`, {});
      // alert("Produit ajouté à la wishlist !");
      toast.success('Produit ajouté à la wishlist !',{
          className:"toast-top-position",
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
          transition: Bounce,
      });
    } catch (error) {
      console.error("Erreur ajout wishlist :", error);
      // alert("Erreur lors de l'ajout à la wishlist.");
      toast.error('Erreur lors de l\'ajout à la wishlist.',
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

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      // alert("Vous devez être connecté pour laisser un avis.");
      toast.warning('Vous devez être connecté pour laisser un avis.',
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
      return;
    }
    try {
      await axiosInstance.post("/reviews/add-review", {
        id_produit: produit.id_produit,
        note,
        commentaire,
      });
      setCommentaire("");
      setNote(5);
      fetchAvis();
      // alert("Avis envoyé !");
       toast.success('Avis envoyé !',{
        className:"toast-top-position",
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        transition: Bounce,
      });
    } catch (error) {
      // alert(error.response?.data?.message || "Erreur lors de l'envoi de l'avis.");
      toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi de l\'avis.',
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

  const handleDeleteReview = async (id_avis) => {
    if (!window.confirm("Supprimer cet avis ?")) return;
    try {
      await axiosInstance.delete(`/reviews/delete-review/${id_avis}`);
      fetchAvis();
    } catch (error) {
      // alert(error.response?.data?.message || "Erreur lors de la suppression.");
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression.',
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

  // Préparation modification
  const handleEditClick = (avis) => {
    setEditId(avis.id_avis);
    setEditNote(avis.note);
    setEditCommentaire(avis.commentaire);
  };

  // Annuler modification
  const handleCancelEdit = () => {
    setEditId(null);
    setEditNote(5);
    setEditCommentaire("");
  };

  const handleEditReview = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/reviews/update-review/${editId}`, {
        note: editNote,
        commentaire: editCommentaire,
      });
      setEditId(null);
      fetchAvis();
    } catch (error) {
      // alert(error.response?.data?.message || "Erreur lors de la modification.");
      toast.error(error.response?.data?.message || 'Erreur lors de la modification.',
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

  if (loading) return <p>Chargement...</p>;
  if (!produit) return <p>Produit non trouvé.</p>;

  // Pour savoir si l'utilisateur peut modifier/supprimer un avis
  const canEditOrDelete = (avisItem) => {
    if (!user) return false;
    return user.id === avisItem.id_user || user.role === "admin";
  };

  return (
    <div className="mx-auto p-6 min-h-screen bg-gradient-to-b from-blue-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300 text-black dark:text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 items-start mb-10 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          {/* Colonne gauche : infos produit */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-4">{produit.titre}</h1>
              {produit.imageObjectUrl && (
                <img
                  src={produit.imageObjectUrl}
                  alt={produit.nom}
                  className="w-full max-w-md object-cover rounded-lg mb-4"
                />
              )}
            <p className="text-gray-700 dark:text-gray-300 mb-4">{produit.description}</p>
          </div>

          {/* Colonne droite : prix + boutons */}
          <div className="w-full md:w-1/3 flex flex-col gap-4 items-start">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{produit.prix} €</p>
            <p className="text-sm font-medium">
              Disponibilité :{" "}
              {produit.stock > 0 ? (
                <span className="text-green-600 dark:text-green-400">
                  En stock ({produit.stock})
                </span>
              ) : (
                <span className="text-red-600 dark:text-red-400">Rupture de stock</span>
              )}
            </p>

            {produit.stock > 0 && (
              <button
                onClick={handleAddToCart}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Ajouter au panier
              </button>
            )}

            <button
              onClick={handleAddToWishlist}
              className="w-full bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
            >
              Ajouter à la wishlist
            </button>
          </div>
        </div>
      </div>

      {/* Formulaire d'avis */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-10">
        {isAuthenticated ? (
          <>
            <h2 className="text-xl font-semibold mb-4">Laisser un avis</h2>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label htmlFor="note" className="block font-medium mb-1">Note :</label>
                <select
                  id="note"
                  value={note}
                  onChange={(e) => setNote(Number(e.target.value))}
                  className="border p-2 rounded w-full dark:bg-gray-700 dark:text-white"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n} étoile{n > 1 ? "s" : ""}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="commentaire" className="block font-medium mb-1">Commentaire :</label>
                <TextareaWithLimit
                  id="commentaire"
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  rows={3}
                  required
                  maxLength={200}
                />

              </div>
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Envoyer l’avis
              </button>
            </form>
          </>
        ) : (
          <p className="italic text-gray-600 dark:text-gray-300">Vous devez être connecté pour laisser un avis.</p>
        )}
      </div>

      {/* Liste des avis */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">Avis des clients</h2>
        {avis.length === 0 ? (
          <p>Aucun avis pour ce produit.</p>
        ) : (
          <ul className="space-y-6">
            {avis.map((a) => (
              <li key={a.id_avis} className="border p-4 rounded bg-gray-50 dark:bg-gray-700">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold">{a.prenom || "Utilisateur"}</span> - {a.note} / 5
                  </div>
                  {canEditOrDelete(a) && (
                    <div>
                      <button
                        onClick={() => handleEditClick(a)}
                        className="text-blue-600 hover:underline mr-3"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteReview(a.id_avis)}
                        className="text-red-600 hover:underline"
                      >
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
                {editId === a.id_avis ? (
                  <form onSubmit={handleEditReview} className="mt-3 space-y-2">
                    <select
                      value={editNote}
                      onChange={(e) => setEditNote(Number(e.target.value))}
                      className="border p-1 rounded dark:bg-gray-600 dark:text-white"
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>{n} étoile{n > 1 ? "s" : ""}</option>
                      ))}
                    </select>
                    <TextareaWithLimit
                      value={editCommentaire}
                      onChange={(e) => setEditCommentaire(e.target.value)}
                      rows={3}
                      required
                      maxLength={200}
                    />
                    <div className="flex gap-2">
                      <button type="submit" className="bg-green-600 text-white px-2 py-1 rounded">
                        Enregistrer
                      </button>
                      <button type="button" onClick={handleCancelEdit} className="bg-gray-400 text-white px-2 py-1 rounded">
                        Annuler
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="mt-2">{a.commentaire}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

        {/* Produits similaires */}
        {suggestions.length > 0 && (
        <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Produits similaires</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {suggestions.map((prod) => (
                <div
                  key={prod.id_produit}
                  className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow hover:shadow-lg transition"
                >
                  {prod.imageObjectUrl && (
                    <img
                      src={prod.imageObjectUrl}
                      alt={prod.titre}
                      className="w-full h-40 object-cover rounded mb-3"
                    />
                  )}
                  <h3 className="text-lg font-semibold mb-2">{prod.titre}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">{prod.description}</p>
                  <p className="font-bold text-green-600 dark:text-green-400 mb-2">{prod.prix} €</p>
                  <Link to={`/produit/${prod.id_produit}`} className="text-blue-600 hover:underline">
                    Voir le produit
                  </Link>
                </div>
              ))}
            </div>
        </div>
        )}
    </div>
);
};

export default ProductDetailPage;