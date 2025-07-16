// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import axiosInstance from "../../services/axiosInstance";

// export default function MyData() {
//   const [user, setUser] = useState(null);
//   const [billing, setBilling] = useState(null);
//   const [showEmailModal, setShowEmailModal] = useState(false);
//   const [showInfoModal, setShowInfoModal] = useState(false);
//   const [showBillingModal, setShowBillingModal] = useState(false);
//   const [form, setForm] = useState({ nom: "", prenom: "" });
//   const [billingForm, setBillingForm] = useState({
//     nom_entreprise: "",
//     numero_tva: "",
//     adresse_ligne1: "",
//     adresse_ligne2: "",
//     ville: "",
//     region: "",
//     code_postal: "",
//     pays: "",
//     telephone: ""
//   });
//   const [newEmail, setNewEmail] = useState("");
//   const [message, setMessage] = useState("");
//   const navigate = useNavigate();

//     // Charger les données personnelles
//   useEffect(() => {
//     axiosInstance.get("/rgpd/me")
//       .then((res) => {
//         setUser(res.data);
//         setForm({ nom: res.data.nom, prenom: res.data.prenom });
//       })
//       .catch(() => {
//         navigate("/login");
//       });
//   }, [navigate]);


//   // useEffect(() => {
//   //    axiosInstance.get("/rgpd/get_billing_info/me")
//   //     .then((res) => {
//   //       let billingData = res.data;
//   //       if (Array.isArray(res.data) && res.data.length > 0) {
//   //         billingData = res.data[0];
//   //       }

//   //       if (billingData && Object.keys(billingData).length > 0) {
//   //         setBilling(billingData);
//   //         setBillingForm({
//   //           nom_entreprise: billingData.nom_entreprise || "",
//   //           numero_tva: billingData.numero_tva || "",
//   //           adresse_ligne1: billingData.adresse_ligne1 || "",
//   //           adresse_ligne2: billingData.adresse_ligne2 || "",
//   //           ville: billingData.ville || "",
//   //           region: billingData.region || "",
//   //           code_postal: billingData.code_postal || "",
//   //           pays: billingData.pays || "",
//   //           telephone: billingData.telephone || ""
//   //         });
//   //       }
//   //     })
//   //     .catch((error) => {
//   //       console.error("Erreur lors de la récupération des données de facturation:", error);
//   //     });
//   // }, []);

//   // Charger les informations de facturation
//   useEffect(() => {
//     axiosInstance.get("/rgpd/get_billing_info/me")
//       .then((res) => {
//         const data = Array.isArray(res.data) ? res.data[0] : res.data;
//         if (data && Object.keys(data).length > 0) {
//           setBilling(data);
//           setBillingForm({
//             nom_entreprise: data.nom_entreprise || "",
//             numero_tva: data.numero_tva || "",
//             adresse_ligne1: data.adresse_ligne1 || "",
//             adresse_ligne2: data.adresse_ligne2 || "",
//             ville: data.ville || "",
//             region: data.region || "",
//             code_postal: data.code_postal || "",
//             pays: data.pays || "",
//             telephone: data.telephone || ""
//           });
//         }
//       })
//       .catch((err) => {
//         console.error("Erreur lors de la récupération des infos de facturation:", err);
//       });
//   }, []);


//   const handleEmailChange = async (e) => {
//     e.preventDefault();
//     setMessage("");
//     try {
//       await axiosInstance.put("/rgpd/me/email", { email: newEmail });
//       setMessage("Un lien de confirmation a été envoyé à votre nouvel email.");
//       setShowEmailModal(false);
//     } catch (err) {
//       setMessage(err?.response?.data?.message || "Erreur lors de la modification.");
//     }
//   };

//   const handleInfoChange = async (e) => {
//     e.preventDefault();
//     setMessage("");
//     try {
//       await axios.put(
//         "http://localhost:8001/api/rgpd/me/info",
//         { nom: form.nom, prenom: form.prenom },
//         { withCredentials: true }
//       );
//       setUser((u) => ({ ...u, nom: form.nom, prenom: form.prenom }));
//       setMessage("Informations mises à jour !");
//       setShowInfoModal(false);
//     } catch (err) {
//       setMessage(err?.response?.data?.message || "Erreur lors de la modification.");
//     }
//   };

//   const handleBillingChange = async (e) => {
//     e.preventDefault();
//     setMessage("");
//     try {
//       const billingData = {
//         telephone: billingForm.telephone,
//         nomEntreprise: billingForm.nom_entreprise,
//         numeroTva: billingForm.numero_tva,
//         adresse: billingForm.adresse_ligne1,
//         complementAdresse: billingForm.adresse_ligne2,
//         ville: billingForm.ville,
//         region: billingForm.region,
//         codePostal: billingForm.code_postal,
//         pays: billingForm.pays
//       };

//       await axios.post(
//         "http://localhost:8001/api/rgpd/update_billing_data/me",
//         billingData,
//         { withCredentials: true }
//       );

//       setBilling({ ...billingForm });
//       setMessage("Informations de facturation enregistrées !");
//       setShowBillingModal(false);
//     } catch (err) {
//       setMessage(err?.response?.data?.message || "Erreur lors de la modification.");
//     }
//   };

//   const exportPDF = async () => {
//     try {
//       const response = await axios.get(
//         "http://localhost:8001/api/rgpd/export/me",
//         { withCredentials: true, responseType: "blob" }
//       );
//       const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
//       const link = document.createElement("a");
//       link.href = url;
//       link.setAttribute("download", "donnees_utilisateur.pdf");
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//     } catch (err) {
//       alert("Erreur lors de l'export PDF");
//     }
//   };

//   if (!user) return <div>Chargement...</div>;

//   return (
//     <>
//       <div className="max-w-xl mx-auto mt-10 p-8 bg-white dark:bg-gray-800 rounded-xl shadow space-y-8">
//         <h1 className="text-2xl font-bold mb-4 text-center">Mes données personnelles</h1>
//         <div className="space-y-2">
//           <div><span className="font-semibold">Nom :</span> {user.nom}</div>
//           <div><span className="font-semibold">Prénom :</span> {user.prenom}</div>
//           <div><span className="font-semibold">Email :</span> {user.email}</div>
//         </div>
//         {billing && (
//           <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded space-y-1">
//             <h2 className="font-semibold mb-2">Informations de facturation</h2>
//             <div><span className="font-semibold">Nom entreprise :</span> {billing.nom_entreprise}</div>
//             <div><span className="font-semibold">Numéro TVA :</span> {billing.numero_tva}</div>
//             <div><span className="font-semibold">Adresse :</span> {billing.adresse_ligne1}</div>
//             <div><span className="font-semibold">Complément d'adresse :</span> {billing.adresse_ligne2}</div>
//             <div><span className="font-semibold">Ville :</span> {billing.ville}</div>
//             <div><span className="font-semibold">Région :</span> {billing.region}</div>
//             <div><span className="font-semibold">Code postal :</span> {billing.code_postal}</div>
//             <div><span className="font-semibold">Pays :</span> {billing.pays}</div>
//             <div><span className="font-semibold">Téléphone :</span> {billing.telephone}</div>
//           </div>
//         )}

//         <div className="flex flex-col gap-4 mt-6">
//           <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={() => setShowEmailModal(true)}>
//             Modifier mon email
//           </button>
//           <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600" onClick={() => setShowInfoModal(true)}>
//             Modifier mes informations
//           </button>
//           <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={exportPDF}>
//             Exporter mes données (PDF)
//           </button>
//           <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700" onClick={() => setShowBillingModal(true)}>
//             {billing ? "Modifier mes informations de facturation" : "Ajouter mes informations de facturation"}
//           </button>
//         </div>

//         {message && <div className="text-center text-green-600">{message}</div>}
//       </div>

//       {showEmailModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//           <form className="bg-white dark:bg-gray-900 p-6 rounded shadow space-y-4" onSubmit={handleEmailChange}>
//             <h2 className="font-bold text-lg">Modifier mon email</h2>
//             <input
//               type="email"
//               className="border px-3 py-2 rounded w-full"
//               placeholder="Nouvel email"
//               value={newEmail}
//               onChange={(e) => setNewEmail(e.target.value)}
//               required
//             />
//             <div className="flex gap-2 justify-end">
//               <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowEmailModal(false)}>
//                 Annuler
//               </button>
//               <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
//                 Envoyer
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {showInfoModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//           <form className="bg-white dark:bg-gray-900 p-6 rounded shadow space-y-4" onSubmit={handleInfoChange}>
//             <h2 className="font-bold text-lg">Modifier mes informations</h2>
//             <input
//               type="text"
//               className="border px-3 py-2 rounded w-full"
//               placeholder="Nom"
//               value={form.nom}
//               onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
//               required
//             />
//             <input
//               type="text"
//               className="border px-3 py-2 rounded w-full"
//               placeholder="Prénom"
//               value={form.prenom}
//               onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))}
//               required
//             />
//             <div className="flex gap-2 justify-end">
//               <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowInfoModal(false)}>
//                 Annuler
//               </button>
//               <button type="submit" className="px-4 py-2 bg-yellow-500 text-white rounded">
//                 Valider
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {showBillingModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//           <form className="bg-white dark:bg-gray-900 p-6 rounded shadow space-y-4" onSubmit={handleBillingChange}>
//             <h2 className="font-bold text-lg">
//               {billing ? "Modifier mes informations de facturation" : "Ajouter mes informations de facturation"}
//             </h2>
//             <input
//               type="text"
//               className="border px-3 py-2 rounded w-full"
//               placeholder="Nom entreprise"
//               value={billingForm.nom_entreprise}
//               onChange={(e) => setBillingForm((f) => ({ ...f, nom_entreprise: e.target.value }))}
//             />
//             <input
//               type="text"
//               className="border px-3 py-2 rounded w-full"
//               placeholder="Numéro TVA"
//               value={billingForm.numero_tva}
//               onChange={(e) => setBillingForm((f) => ({ ...f, numero_tva: e.target.value }))}
//             />
//             <input
//               type="text"
//               className="border px-3 py-2 rounded w-full"
//               placeholder="Adresse"
//               value={billingForm.adresse_ligne1}
//               onChange={(e) => setBillingForm((f) => ({ ...f, adresse_ligne1: e.target.value }))}
//               required
//             />
//             <input
//               type="text"
//               className="border px-3 py-2 rounded w-full"
//               placeholder="Complément d'adresse"
//               value={billingForm.adresse_ligne2}
//               onChange={(e) => setBillingForm((f) => ({ ...f, adresse_ligne2: e.target.value }))}
//             />
//             <input
//               type="text"
//               className="border px-3 py-2 rounded w-full"
//               placeholder="Ville"
//               value={billingForm.ville}
//               onChange={(e) => setBillingForm((f) => ({ ...f, ville: e.target.value }))}
//               required
//             />
//             <input
//               type="text"
//               className="border px-3 py-2 rounded w-full"
//               placeholder="Région"
//               value={billingForm.region}
//               onChange={(e) => setBillingForm((f) => ({ ...f, region: e.target.value }))}
//             />
//             <input
//               type="text"
//               className="border px-3 py-2 rounded w-full"
//               placeholder="Code postal"
//               value={billingForm.code_postal}
//               onChange={(e) => setBillingForm((f) => ({ ...f, code_postal: e.target.value }))}
//               required
//             />
//             <input
//               type="text"
//               className="border px-3 py-2 rounded w-full"
//               placeholder="Pays"
//               value={billingForm.pays}
//               onChange={(e) => setBillingForm((f) => ({ ...f, pays: e.target.value }))}
//             />
//             <input
//               type="text"
//               className="border px-3 py-2 rounded w-full"
//               placeholder="Téléphone"
//               value={billingForm.telephone}
//               onChange={(e) => setBillingForm((f) => ({ ...f, telephone: e.target.value }))}
//             />
//             <div className="flex gap-2 justify-end">
//               <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowBillingModal(false)}>
//                 Annuler
//               </button>
//               <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded">
//                 {billing ? "Modifier" : "Ajouter"}
//               </button>
//             </div>
//           </form>
//         </div>
//       )}
//     </>
//   );
// }

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";

export default function MyData() {
  const [user, setUser] = useState(null);
  const [billing, setBilling] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [form, setForm] = useState({ nom: "", prenom: "" });
  const [billingForm, setBillingForm] = useState({
    nom_entreprise: "",
    numero_tva: "",
    adresse_ligne1: "",
    adresse_ligne2: "",
    ville: "",
    region: "",
    code_postal: "",
    pays: "",
    telephone: ""
  });
  const [newEmail, setNewEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Charger les données personnelles
  useEffect(() => {
    axiosInstance.get("/rgpd/me")
      .then((res) => {
        setUser(res.data);
        setForm({ nom: res.data.nom, prenom: res.data.prenom });
      })
      .catch(() => {
        navigate("/login");
      });
  }, [navigate]);

  // Charger les informations de facturation
  useEffect(() => {
    axiosInstance.get("/rgpd/get_billing_info/me")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        if (data && Object.keys(data).length > 0) {
          setBilling(data);
          setBillingForm({
            nom_entreprise: data.nom_entreprise || "",
            numero_tva: data.numero_tva || "",
            adresse_ligne1: data.adresse_ligne1 || "",
            adresse_ligne2: data.adresse_ligne2 || "",
            ville: data.ville || "",
            region: data.region || "",
            code_postal: data.code_postal || "",
            pays: data.pays || "",
            telephone: data.telephone || ""
          });
        }
      })
      .catch((err) => {
        console.error("Erreur lors de la récupération des infos de facturation:", err);
      });
  }, []);

  const handleEmailChange = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await axiosInstance.put("/rgpd/me/email", { email: newEmail });
      setMessage("Un lien de confirmation a été envoyé à votre nouvel email.");
      setShowEmailModal(false);
    } catch (err) {
      setMessage(err?.response?.data?.message || "Erreur lors de la modification.");
    }
  };

  const handleInfoChange = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await axiosInstance.put("/rgpd/me/info", { nom: form.nom, prenom: form.prenom });
      setUser((u) => ({ ...u, nom: form.nom, prenom: form.prenom }));
      setMessage("Informations mises à jour !");
      setShowInfoModal(false);
    } catch (err) {
      setMessage(err?.response?.data?.message || "Erreur lors de la modification.");
    }
  };

  const handleBillingChange = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const billingData = {
        telephone: billingForm.telephone,
        nomEntreprise: billingForm.nom_entreprise,
        numeroTva: billingForm.numero_tva,
        adresse: billingForm.adresse_ligne1,
        complementAdresse: billingForm.adresse_ligne2,
        ville: billingForm.ville,
        region: billingForm.region,
        codePostal: billingForm.code_postal,
        pays: billingForm.pays
      };

      await axiosInstance.post("/rgpd/update_billing_data/me", billingData);

      setBilling({ ...billingForm });
      setMessage("Informations de facturation enregistrées !");
      setShowBillingModal(false);
    } catch (err) {
      setMessage(err?.response?.data?.message || "Erreur lors de la modification.");
    }
  };

  const exportPDF = async () => {
    try {
      const response = await axiosInstance.get("/rgpd/export/me", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "donnees_utilisateur.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Erreur lors de l'export PDF");
    }
  };

//   if (!user) return <div>Chargement...</div>;

//   return (
//     <>
//       <div className="max-w-xl mx-auto mt-10 p-8 bg-white dark:bg-gray-800 rounded-xl shadow space-y-8">
//         <h1 className="text-2xl font-bold mb-4 text-center">Mes données personnelles</h1>
//         <div className="space-y-2">
//           <div><span className="font-semibold">Nom :</span> {user.nom}</div>
//           <div><span className="font-semibold">Prénom :</span> {user.prenom}</div>
//           <div><span className="font-semibold">Email :</span> {user.email}</div>
//         </div>
//         {billing && (
//           <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded space-y-1">
//             <h2 className="font-semibold mb-2">Informations de facturation</h2>
//             <div><span className="font-semibold">Nom entreprise :</span> {billing.nom_entreprise}</div>
//             <div><span className="font-semibold">Numéro TVA :</span> {billing.numero_tva}</div>
//             <div><span className="font-semibold">Adresse :</span> {billing.adresse_ligne1}</div>
//             <div><span className="font-semibold">Complément d'adresse :</span> {billing.adresse_ligne2}</div>
//             <div><span className="font-semibold">Ville :</span> {billing.ville}</div>
//             <div><span className="font-semibold">Région :</span> {billing.region}</div>
//             <div><span className="font-semibold">Code postal :</span> {billing.code_postal}</div>
//             <div><span className="font-semibold">Pays :</span> {billing.pays}</div>
//             <div><span className="font-semibold">Téléphone :</span> {billing.telephone}</div>
//           </div>
//         )}

//         <div className="flex flex-col gap-4 mt-6">
//           <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={() => setShowEmailModal(true)}>
//             Modifier mon email
//           </button>
//           <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600" onClick={() => setShowInfoModal(true)}>
//             Modifier mes informations
//           </button>
//           <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={exportPDF}>
//             Exporter mes données (PDF)
//           </button>
//           <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700" onClick={() => setShowBillingModal(true)}>
//             {billing ? "Modifier mes informations de facturation" : "Ajouter mes informations de facturation"}
//           </button>
//         </div>

//         {message && <div className="text-center text-green-600">{message}</div>}
//       </div>

//       {showEmailModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//           <form className="bg-white dark:bg-gray-900 p-6 rounded shadow space-y-4" onSubmit={handleEmailChange}>
//             <h2 className="font-bold text-lg">Modifier mon email</h2>
//             <input
//               type="email"
//               className="border px-3 py-2 rounded w-full"
//               placeholder="Nouvel email"
//               value={newEmail}
//               onChange={(e) => setNewEmail(e.target.value)}
//               required
//             />
//             <div className="flex gap-2 justify-end">
//               <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowEmailModal(false)}>
//                 Annuler
//               </button>
//               <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
//                 Envoyer
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {showInfoModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//           <form className="bg-white dark:bg-gray-900 p-6 rounded shadow space-y-4" onSubmit={handleInfoChange}>
//             <h2 className="font-bold text-lg">Modifier mes informations</h2>
//             <input
//               type="text"
//               className="border px-3 py-2 rounded w-full"
//               placeholder="Nom"
//               value={form.nom}
//               onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
//               required
//             />
//             <input
//               type="text"
//               className="border px-3 py-2 rounded w-full"
//               placeholder="Prénom"
//               value={form.prenom}
//               onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))}
//               required
//             />
//             <div className="flex gap-2 justify-end">
//               <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowInfoModal(false)}>
//                 Annuler
//               </button>
//               <button type="submit" className="px-4 py-2 bg-yellow-500 text-white rounded">
//                 Valider
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {showBillingModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//           <form className="bg-white dark:bg-gray-900 p-6 rounded shadow space-y-4" onSubmit={handleBillingChange}>
//             <h2 className="font-bold text-lg">
//               {billing ? "Modifier mes informations de facturation" : "Ajouter mes informations de facturation"}
//             </h2>
//             <input
//               type="text"
//               className="border px-3 py-2 rounded w-full"
//               placeholder="Nom entreprise"
//               value={billingForm.nom_entreprise}
//               onChange={(e) => setBillingForm((f) => ({ ...f, nom_entreprise: e.target.value }))}
//             />
//             <input
//               type="text"
//               className="border px-3 py-2 rounded w-full"
//               placeholder="Numéro TVA"
//               value={billingForm.numero_tva}
//               onChange={(e) => setBillingForm((f) => ({ ...f, numero_tva: e.target.value }))}
//             />
//             <input
//               type="text"
//               className="border px-3 py-2 rounded w-full"
//               placeholder="Adresse"
//               value={billingForm.adresse_ligne1}
//               onChange={(e) => setBillingForm((f) => ({ ...f, adresse_ligne1: e.target.value }))}
//               required
//             />
//             <input
//               type="text"
//               className="border px-3 py-2 rounded w-full"
//               placeholder="Complément d'adresse"
//               value={billingForm.adresse_ligne2}
//               onChange={(e) => setBillingForm((f) => ({ ...f, adresse_ligne2: e.target.value }))}
//             />
//             <input
//               type="text"
//               className="border px-3 py-2 rounded w-full"
//               placeholder="Ville"
//               value={billingForm.ville}
//               onChange={(e) => setBillingForm((f) => ({ ...f, ville: e.target.value }))}
//               required
//             />
//             <input
//               type="text"
//               className="border px-3 py-2 rounded w-full"
//               placeholder="Région"
//               value={billingForm.region}
//               onChange={(e) => setBillingForm((f) => ({ ...f, region: e.target.value }))}
//             />
//             <input
//               type="text"
//               className="border px-3 py-2 rounded w-full"
//               placeholder="Code postal"
//               value={billingForm.code_postal}
//               onChange={(e) => setBillingForm((f) => ({ ...f, code_postal: e.target.value }))}
//               required
//             />
//             <input
//               type="text"
//               className="border px-3 py-2 rounded w-full"
//               placeholder="Pays"
//               value={billingForm.pays}
//               onChange={(e) => setBillingForm((f) => ({ ...f, pays: e.target.value }))}
//             />
//             <input
//               type="text"
//               className="border px-3 py-2 rounded w-full"
//               placeholder="Téléphone"
//               value={billingForm.telephone}
//               onChange={(e) => setBillingForm((f) => ({ ...f, telephone: e.target.value }))}
//             />
//             <div className="flex gap-2 justify-end">
//               <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowBillingModal(false)}>
//                 Annuler
//               </button>
//               <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded">
//                 {billing ? "Modifier" : "Ajouter"}
//               </button>
//             </div>
//           </form>
//         </div>
//       )}
//     </>
//   );
// }

if (!user) return (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
    </div>
  </div>
);

return (
  <>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Mes données personnelles
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Gérez vos informations personnelles et de facturation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Informations personnelles */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Informations personnelles
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 sm:w-24 mb-1 sm:mb-0">Nom :</span>
                <span className="text-gray-900 dark:text-white font-medium">{user.nom}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 sm:w-24 mb-1 sm:mb-0">Prénom :</span>
                <span className="text-gray-900 dark:text-white font-medium">{user.prenom}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center py-3">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 sm:w-24 mb-1 sm:mb-0">Email :</span>
                <span className="text-gray-900 dark:text-white font-medium break-all">{user.email}</span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                onClick={() => setShowEmailModal(true)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Modifier mon email</span>
              </button>
              <button 
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                onClick={() => setShowInfoModal(true)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Modifier mes informations</span>
              </button>
              <button 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                onClick={exportPDF}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Exporter mes données (PDF)</span>
              </button>
            </div>
          </div>

          {/* Informations de facturation */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-6">
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full mr-4">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Informations de facturation
              </h2>
            </div>

            {billing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Nom entreprise</label>
                    <p className="text-gray-900 dark:text-white font-medium mt-1">{billing.nom_entreprise}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Numéro TVA</label>
                    <p className="text-gray-900 dark:text-white font-medium mt-1">{billing.numero_tva}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Adresse</label>
                  <div className="mt-1 space-y-1">
                    <p className="text-gray-900 dark:text-white font-medium">{billing.adresse_ligne1}</p>
                    {billing.adresse_ligne2 && (
                      <p className="text-gray-900 dark:text-white font-medium">{billing.adresse_ligne2}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Ville</label>
                    <p className="text-gray-900 dark:text-white font-medium mt-1">{billing.ville}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Code postal</label>
                    <p className="text-gray-900 dark:text-white font-medium mt-1">{billing.code_postal}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Région</label>
                    <p className="text-gray-900 dark:text-white font-medium mt-1">{billing.region}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Pays</label>
                    <p className="text-gray-900 dark:text-white font-medium mt-1">{billing.pays}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Téléphone</label>
                  <p className="text-gray-900 dark:text-white font-medium mt-1">{billing.telephone}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Aucune information de facturation ajoutée
                </p>
              </div>
            )}

            <div className="mt-8">
              <button 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                onClick={() => setShowBillingModal(true)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={billing ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
                </svg>
                <span>
                  {billing ? "Modifier mes informations de facturation" : "Ajouter mes informations de facturation"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Message de confirmation */}
        {message && (
          <div className="mt-8 max-w-md mx-auto">
            <div className="bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-800 dark:text-green-200 font-medium">{message}</span>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Modal Email */}
    {showEmailModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-auto">
          <form onSubmit={handleEmailChange} className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Modifier mon email
              </h2>
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nouvel email
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                placeholder="exemple@email.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button 
                type="button" 
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setShowEmailModal(false)}
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Confirmer
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Modal Informations */}
    {showInfoModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-auto">
          <form onSubmit={handleInfoChange} className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Modifier mes informations
              </h2>
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white transition-colors"
                  placeholder="Votre nom"
                  value={form.nom}
                  onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prénom
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white transition-colors"
                  placeholder="Votre prénom"
                  value={form.prenom}
                  onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button 
                type="button" 
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setShowInfoModal(false)}
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Valider
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Modal Facturation */}
    {showBillingModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleBillingChange} className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {billing ? "Modifier mes informations de facturation" : "Ajouter mes informations de facturation"}
              </h2>
              <button
                type="button"
                onClick={() => setShowBillingModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom entreprise
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-colors"
                  placeholder="Nom de l'entreprise"
                  value={billingForm.nom_entreprise}
                  onChange={(e) => setBillingForm((f) => ({ ...f, nom_entreprise: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Numéro TVA
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-colors"
                  placeholder="FR12345678901"
                  value={billingForm.numero_tva}
                  onChange={(e) => setBillingForm((f) => ({ ...f, numero_tva: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Adresse <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-colors"
                  placeholder="123 Rue de la Paix"
                  value={billingForm.adresse_ligne1}
                  onChange={(e) => setBillingForm((f) => ({ ...f, adresse_ligne1: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Complément d'adresse
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-colors"
                  placeholder="Appartement, étage, etc."
                  value={billingForm.adresse_ligne2}
                  onChange={(e) => setBillingForm((f) => ({ ...f, adresse_ligne2: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ville <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-colors"
                  placeholder="Paris"
                  value={billingForm.ville}
                  onChange={(e) => setBillingForm((f) => ({ ...f, ville: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Code postal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-colors"
                  placeholder="75001"
                  value={billingForm.code_postal}
                  onChange={(e) => setBillingForm((f) => ({ ...f, code_postal: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Région
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-colors"
                  placeholder="Île-de-France"
                  value={billingForm.region}
                  onChange={(e) => setBillingForm((f) => ({ ...f, region: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pays
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-colors"
                  placeholder="France"
                  value={billingForm.pays}
                  onChange={(e) => setBillingForm((f) => ({ ...f, pays: e.target.value }))}
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Téléphone
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-colors"
                placeholder="+33 1 23 45 67 89"
                value={billingForm.telephone}
                onChange={(e) => setBillingForm((f) => ({ ...f, telephone: e.target.value }))}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button 
                type="button" 
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setShowBillingModal(false)}
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                {billing ? "Modifier" : "Ajouter"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </>
);
}


// TODO retirer les svg et faire des import puis modifier les champs requis ajouter les vérification necessaires