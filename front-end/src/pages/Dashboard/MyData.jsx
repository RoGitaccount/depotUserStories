import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import { toast, Bounce } from "react-toastify";
import countries from 'i18n-iso-countries';
import fr from 'i18n-iso-countries/langs/fr.json';
import CountryListbox from '../../components/Checkout/CountryListbox';

// Components
import PersonalInfo from './MyDataComponents/PersonalInfo';
import BillingInfo from './MyDataComponents/BillingInfo';
import ModalBilling from "./MyDataComponents/ModalBilling";
import ModalPersonalInfo from "./MyDataComponents/ModalPersonalInfo";

countries.registerLocale(fr);
const countryList = countries.getNames('fr', { select: 'official' });
const countryOptions = Object.entries(countryList).map(([code, name]) => name).sort();

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
    try {
      await axiosInstance.put("/rgpd/me/email", { email: newEmail });
      toast.success("Un lien de confirmation a été envoyé à votre nouvel email.", {
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

      setShowEmailModal(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "❌ Erreur lors de la modification de l'email.", {
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
    }
  };

  const handleInfoChange = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put("/rgpd/me/info", { nom: form.nom, prenom: form.prenom });
      setUser((u) => ({ ...u, nom: form.nom, prenom: form.prenom }));
      setShowInfoModal(false);

      toast.success("Informations mises à jour !", {
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
    } catch (err) {
      toast.error(err?.response?.data?.message || " Erreur lors de la mise à jour des informations.", {
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
    }
  };

  const handleBillingChange = async (e) => {
    e.preventDefault();
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
      setShowBillingModal(false);

        // Affichage toast de succès
      toast.success("Informations de facturation mises à jour avec succès !", {
        className:"toast-top-position",
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        transition: Bounce,
      })
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erreur lors de la modification.", {
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
      // alert("Erreur lors de l'export PDF");
      toast.error('Erreur lors de l\'export PDF',
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

        {/* Informations personnelles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PersonalInfo
            user={user}
            onEditEmail={() => setShowEmailModal(true)}
            onEditInfo={() => setShowInfoModal(true)}
            onExportPDF={exportPDF}
          />

          {/* Informations de facturation */}
          <BillingInfo
              billing={billing}
              onEditBilling={() => setShowBillingModal(true)}
          />

        </div>
      </div>
    </div>

  {/* Modal Informations personnelles */}
      <ModalPersonalInfo
      showEmailModal={showEmailModal}
      showInfoModal={showInfoModal}
      onCloseEmail={() => setShowEmailModal(false)}
      onCloseInfo={() => setShowInfoModal(false)}
      onSubmitEmail={handleEmailChange}
      onSubmitInfo={handleInfoChange}
      newEmail={newEmail}
      setNewEmail={setNewEmail}
      form={form}
      setForm={setForm}
    />

    {/* Modal Informations de facturation */}
      <ModalBilling
      show={showBillingModal}
      onClose={() => setShowBillingModal(false)}
      onSubmit={handleBillingChange}
      billingForm={billingForm}
      setBillingForm={setBillingForm}
      billing={billing}
      countryOptions={countryOptions}
    />
  </>
);
};
