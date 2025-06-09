import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";

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

  // Auth
  const { user, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    fetchProduit();
    fetchAvis();
  }, [id]);

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
      const res = await axios.get(`http://localhost:8001/api/reviews/${id}`);
      setAvis(res.data);
    } catch (error) {
      console.error("Erreur récupération avis :", error);
    }
  };

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:8001/api/wishlist/add_to_cart/${produit.id_produit}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Produit ajouté au panier !");
    } catch (error) {
      console.error("Erreur ajout panier :", error);
      alert("Erreur lors de l'ajout au panier.");
    }
  };

  const handleAddToWishlist = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:8001/api/wishlist/add/${produit.id_produit}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Produit ajouté à la wishlist !");
    } catch (error) {
      console.error("Erreur ajout wishlist :", error);
      alert("Erreur lors de l'ajout à la wishlist.");
    }
  };

  // Ajout d'avis
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Vous devez être connecté pour laisser un avis.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:8001/api/reviews/add-review",
        {
          id_produit: produit.id_produit,
          note,
          commentaire,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCommentaire("");
      setNote(5);
      fetchAvis();
      alert("Avis envoyé !");
    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors de l'envoi de l'avis.");
    }
  };

  // Suppression d'avis
  const handleDeleteReview = async (id_avis) => {
    if (!window.confirm("Supprimer cet avis ?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:8001/api/reviews/delete-review/${id_avis}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchAvis();
    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors de la suppression.");
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

  // Modification d'avis
  const handleEditReview = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8001/api/reviews/update-review/${editId}`,
        {
          note: editNote,
          commentaire: editCommentaire,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEditId(null);
      fetchAvis();
    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors de la modification.");
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
          <button
            onClick={handleAddToCart}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Ajouter au panier
          </button>
          <button
            onClick={handleAddToWishlist}
            className="w-full bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
          >
            Ajouter à la wishlist
          </button>
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
                <textarea
                  id="commentaire"
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  className="border p-2 rounded w-full dark:bg-gray-700 dark:text-white"
                  rows={3}
                  required
                ></textarea>
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
                    <textarea
                      value={editCommentaire}
                      onChange={(e) => setEditCommentaire(e.target.value)}
                      className="border p-1 rounded w-full dark:bg-gray-600 dark:text-white"
                      rows={2}
                      required
                    ></textarea>
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
    </div>
  </div>
);




  // return (
  //     <div className="mx-auto p-6 text-center text-black dark:text-white min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-blue-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
  //     <h1 className="text-2xl font-bold mb-4">{produit.titre}</h1>
  //     {produit.image_url && (
  //       <img
  //         src={produit.image_url}
  //         alt={produit.nom}
  //         style={{
  //           maxWidth: "300px",
  //           maxHeight: "400px",
  //           width: "100%",
  //           objectFit: "cover",
  //           borderRadius: "8px",
  //           marginBottom: "1rem",
  //           display: "block",
  //           marginLeft: "auto",
  //           marginRight: "auto"
  //         }}
  //       />
  //     )}
  //     <p className="text-gray-600 mb-2">{produit.description}</p>
  //     <p className="text-lg font-bold">{produit.prix} €</p>
  //     <button
  //       onClick={handleAddToCart}
  //       className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4 mr-2"
  //     >
  //       Ajouter au panier
  //     </button>
  //     <button
  //       onClick={handleAddToWishlist}
  //       className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 mb-4"
  //     >
  //       Ajouter à la wishlist
  //     </button>

  //     {/* Formulaire d'avis */}
  //     {isAuthenticated ? (
  //       <div className="mb-6">
  //         <h2 className="text-xl font-semibold mb-2">Laisser un avis</h2>
  //         <form onSubmit={handleSubmitReview} className="space-y-4">
  //           <div>
  //             <label htmlFor="note" className="block font-medium">Note :</label>
  //             <select
  //               id="note"
  //               value={note}
  //               onChange={(e) => setNote(Number(e.target.value))}
  //               className="border p-2 rounded w-full"
  //             >
  //               {[1, 2, 3, 4, 5].map((n) => (
  //                 <option key={n} value={n}>{n} étoile{n > 1 ? "s" : ""}</option>
  //               ))}
  //             </select>
  //           </div>
  //           <div>
  //             <label htmlFor="commentaire" className="block font-medium">Commentaire :</label>
  //             <textarea
  //               id="commentaire"
  //               value={commentaire}
  //               onChange={(e) => setCommentaire(e.target.value)}
  //               className="border p-2 rounded w-full"
  //               rows={3}
  //               required
  //             ></textarea>
  //           </div>
  //           <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
  //             Envoyer l’avis
  //           </button>
  //         </form>
  //       </div>
  //     ) : (
  //       <p className="text-gray-600 italic">Vous devez être connecté pour laisser un avis.</p>
  //     )}

  //     {/* Liste des avis */}
  //     <div>
  //       <h2 className="text-xl font-semibold mb-2">Avis des clients</h2>
  //       {avis.length === 0 ? (
  //         <p>Aucun avis pour ce produit.</p>
  //       ) : (
  //         <ul className="space-y-4">
  //           {avis.map((a) => (
  //             <li key={a.id_avis} className="border p-3 rounded bg-gray-50">
  //               <div className="flex items-center justify-between">
  //                 <div>
  //                   <span className="font-semibold">{a.prenom || "Utilisateur"}</span>
  //                   {" - "}
  //                   <span>{a.note} / 5</span>
  //                 </div>
  //                 {canEditOrDelete(a) && (
  //                   <div>
  //                     <button
  //                       onClick={() => handleEditClick(a)}
  //                       className="text-blue-600 hover:underline mr-2"
  //                     >
  //                       Modifier
  //                     </button>
  //                     <button
  //                       onClick={() => handleDeleteReview(a.id_avis)}
  //                       className="text-red-600 hover:underline"
  //                     >
  //                       Supprimer
  //                     </button>
  //                   </div>
  //                 )}
  //               </div>
  //               {editId === a.id_avis ? (
  //                 <form onSubmit={handleEditReview} className="mt-2 space-y-2">
  //                   <select
  //                     value={editNote}
  //                     onChange={(e) => setEditNote(Number(e.target.value))}
  //                     className="border p-1 rounded"
  //                   >
  //                     {[1, 2, 3, 4, 5].map((n) => (
  //                       <option key={n} value={n}>{n} étoile{n > 1 ? "s" : ""}</option>
  //                     ))}
  //                   </select>
  //                   <textarea
  //                     value={editCommentaire}
  //                     onChange={(e) => setEditCommentaire(e.target.value)}
  //                     className="border p-1 rounded w-full"
  //                     rows={2}
  //                     required
  //                   ></textarea>
  //                   <div>
  //                     <button type="submit" className="bg-green-600 text-white px-2 py-1 rounded mr-2">
  //                       Enregistrer
  //                     </button>
  //                     <button type="button" onClick={handleCancelEdit} className="bg-gray-400 text-white px-2 py-1 rounded">
  //                       Annuler
  //                     </button>
  //                   </div>
  //                 </form>
  //               ) : (
  //                 <p className="mt-1">{a.commentaire}</p>
  //               )}
  //             </li>
  //           ))}
  //         </ul>
  //       )}
  //     </div>
  //   </div>
  // );
};

export default ProductDetailPage;