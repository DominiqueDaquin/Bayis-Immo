import axiosInstance from "@/api/axios";
import { v4 as uuidv4 } from "uuid"
import { baseUrlFrontend } from "@/config";

  const handlePayerPublicite = async (publicite) => {
    
    const order_id=uuidv4()
    const link=`${baseUrlFrontend}/merci`
    const linkechec=`${baseUrlFrontend}/echec`
    try {
      const response = await axiosInstance.post("/api/paiement/lygos/", {
        amount:publicite.montant ,
        shop_name: "Bayis Immob",
        message: `Paiement pour la publicité: ${publicite.titre}`,
        order_id: order_id,
        publicite_id: publicite.id,
        success_url:link,
        failure_url:linkechec
      })
      if (response.status === 200) {

        const orderResponse= await axiosInstance.patch(`/api/publicites/${publicite.id}/`,{
          order_id:order_id
        })
        if(orderResponse.status==200){
        window.open(response.data.link, "_blank")
        }
      }
    } catch (err) {
      console.log(err);
    }
  }
  export default handlePayerPublicite;