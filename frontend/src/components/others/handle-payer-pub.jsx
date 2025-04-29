import axiosInstance from "@/api/axios";
import { v4 as uuidv4 } from "uuid"
import { baseUrlFrontend } from "@/config";

const handlePayerPublicite = async (publicite) => {
  const order_id = uuidv4();
  const link = `${baseUrlFrontend}/merci`;
  const linkechec = `${baseUrlFrontend}/echec`;
  
  try {
    // 1. Configurez un timeout plus long (30 secondes)
    const config = {
      timeout: 30000, // 30 secondes
      headers: {
        'Content-Type': 'application/json',
      }
    };

    // 2. Envoyez la requête avec la configuration
    const response = await axiosInstance.post(
      "/api/paiement/lygos/", 
      {
        amount: publicite.montant,
        shop_name: "Bayis Immob",
        message: `Paiement pour la publicité: ${publicite.titre}`,
        order_id: order_id,
        publicite_id: publicite.id,
        success_url: link,
        failure_url: linkechec
      },
      config
    );

    if (response.status === 200) {
      // 3. Mettez à jour l'order_id avec un timeout séparé
      try {
        const orderResponse = await axiosInstance.patch(
          `/api/publicites/${publicite.id}/`,
          { order_id: order_id },
          { timeout: 10000 } // 10 secondes pour cette requête
        );

        if (orderResponse.status === 200) {
          window.location.href = response.data.link;
        } else {
          console.error("Erreur lors de la mise à jour de l'order_id");
          // Gestion d'erreur supplémentaire si nécessaire
        }
      } catch (updateError) {
        console.error("Erreur de mise à jour:", updateError);
        // Vous pourriez vouloir annuler le paiement ici ou afficher un message
      }
    }
  } catch (err) {
    console.error("Erreur de paiement:", err);
    
    // 4. Meilleure gestion des erreurs
    if (err.code === 'ECONNABORTED') {
      console.error("La requête a expiré");
      // Affichez un message à l'utilisateur
      alert("Le paiement prend trop de temps. Veuillez réessayer.");
    } else if (err.response) {
      // Erreur avec réponse du serveur
      console.error("Erreur serveur:", err.response.status, err.response.data);
    } else if (err.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      console.error("Pas de réponse du serveur");
    } else {
      // Erreur lors de la configuration de la requête
      console.error("Erreur de configuration:", err.message);
    }
    
    // Redirection vers la page d'échec
    window.location.href = linkechec;
  }
};

export default handlePayerPublicite;