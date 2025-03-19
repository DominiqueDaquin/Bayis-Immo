import random
import requests
from django.core.files.base import ContentFile
from django.utils import timezone
from annonce.models import Annonce, Media, Note
from django.contrib.auth import get_user_model
from io import BytesIO
from PIL import Image

# Configuration
NUMBER_OF_ANNONCES = 20  # Nombre minimum d'annonces à créer
USER_ID = 1  # ID de l'utilisateur qui créera les annonces
IMAGE_URLS = [
    "https://picsum.photos/300/200",  
    "https://picsum.photos/301/201",  
    "https://picsum.photos/302/202",  
    "https://picsum.photos/303/203",  
    "https://picsum.photos/304/204",  
    "https://picsum.photos/305/205",  
    "https://picsum.photos/306/206",  
    "https://picsum.photos/307/207",  
    "https://picsum.photos/308/208",  
    "https://picsum.photos/309/209"
]  # URLs d'images aléatoires

def download_image(url):
    """Télécharge une image depuis une URL et retourne un fichier Django"""
    response = requests.get(url)
    if response.status_code == 200:
        return ContentFile(response.content, name=f"image_{random.randint(1000,9999)}.jpg")
    return None

def create_media():
    """Crée un objet Media avec une image téléchargée depuis Internet"""
    url = random.choice(IMAGE_URLS)
    image_file = download_image(url)
    if image_file:
        media = Media.objects.create(photo=image_file, type='photo')
        return media
    return None

def generate_random_announcement():
    """Génère une annonce avec des images associées"""
    user = get_user_model().objects.get(id=USER_ID)
    
    annonce = Annonce.objects.create(
        titre=f"Annonce {random.randint(1000, 9999)}",
        description=f"Description aléatoire {random.randint(1000, 9999)}",
        creer_par=user  # Utilisateur ID=1
    )
    
    # Ajouter 1 à 3 médias
    for _ in range(random.randint(1, 3)):
        media = create_media()
        if media:
            annonce.photos.add(media)
    
    return annonce

def create_annonces():
    """Crée plusieurs annonces"""
    for i in range(NUMBER_OF_ANNONCES):
        generate_random_announcement()
        print(f"Annonce {i+1} créée.")

if __name__ == '__main__':
    create_annonces()
