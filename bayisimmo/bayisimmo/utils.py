import random
from typing import Dict, List, Optional

def tombola(cagnotte: float, bien: str, montant_accumuler: float, pourcentage_redistribution: float) -> Dict:
    """
    Fonction pour gérer une tombola avec redistribution partielle.

    :param cagnotte: Montant total de la cagnotte à atteindre.
    :param bien: Description du bien en jeu (ex: "Terrain titré à Abidjan").
    :param montant_accumuler: Montant déjà accumulé dans la cagnotte.
    :param pourcentage_redistribution: Pourcentage de la cagnotte à redistribuer (entre 0 et 1).
    :return: Dictionnaire contenant le statut de la tombola et les résultats.
    """
    
    participants = [] 
    contributions = {}  
    redistributions = []  

    def ajouter_participant(participant_id: str, montant: int):
        nonlocal montant_accumuler
        if participant_id not in participants:
            participants.append(participant_id)
            contributions[participant_id] = 0
        contributions[participant_id] += montant
        montant_accumuler += montant

    def redistribuer():
        nonlocal montant_accumuler
        montant_redistribution = montant_accumuler * pourcentage_redistribution
        gagnants = random.sample(participants, k=min(3, len(participants)))  # 3 gagnants max
        gains_par_gagnant = montant_redistribution / len(gagnants)
        
        montant_accumuler -= montant_redistribution
        
        redistributions.append({
            "gagnants": gagnants,
            "montant_redistribution": montant_redistribution,
            "gains_par_gagnant": gains_par_gagnant,
        })
        return gagnants, gains_par_gagnant

    def designer_gagnant_final() -> Optional[str]:
        if montant_accumuler >= cagnotte:
            gagnant_final = random.choice(participants)
            return gagnant_final
        return None

    while montant_accumuler < cagnotte:
        participant_id = f"participant{len(participants) + 1}"
        ajouter_participant(participant_id, 250)  

        
        if montant_accumuler >= cagnotte * 0.1 and not any(
            r["montant_redistribution"] == montant_accumuler * pourcentage_redistribution for r in redistributions
        ):
            gagnants, gains = redistribuer()
            print(f"Redistribution à {montant_accumuler} FCFA : {gagnants} gagnent {gains:.2f} FCFA chacun.")

    
    gagnant_final = designer_gagnant_final()
    if gagnant_final:
        print(f"Le gagnant final est : {gagnant_final}")
    else:
        print("La cagnotte n'est pas encore atteinte.")

    
    return {
        "cagnotte_objectif": cagnotte,
        "bien": bien,
        "montant_accumule": montant_accumuler,
        "participants": participants,
        "contributions": contributions,
        "redistributions": redistributions,
        "gagnant_final": gagnant_final,
    }


# Exemple d'utilisation
if __name__ == "__main__":
    
    resultat = tombola(
        cagnotte=15000,  
        bien="Terrain titré à douala",  
        montant_accumuler=0,  
        pourcentage_redistribution=0.3  
    )
    print("Statut final de la tombola :", resultat)