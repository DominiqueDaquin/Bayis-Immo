from rest_framework import serializers
from .models import Media,Annonce,Message,Discussion,AnnonceFavoris,Note,Tombola,Commentaire,Vue,Publicite,UserTombola
from django.contrib.auth import get_user_model
from .models import Notification
User=get_user_model()
class MediaSerializer(serializers.ModelSerializer):
    photo=serializers.SerializerMethodField()
    class Meta:
        model=Media
        fields=['id','photo','type']

    def get_photo(self,obj):
        return obj.photo.url


    def validate_photo(self, value):
        """
        Valide que la taille de l'image ne dépasse pas une certaine limite.
        """
        max_size = 3 * 1024 * 1024  

        if value.size > max_size:
            raise serializers.ValidationError("La taille de l'image ne doit pas dépasser 3 Mo.")

        return value

    
class AnnonceSerializer(serializers.ModelSerializer):
    creer_par = serializers.SlugRelatedField(
        read_only=True,
        slug_field="name"
    )
    photos = MediaSerializer(many=True, required=False)  # Permet d'afficher les photos existantes
    photos_upload = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )  
    avis=serializers.SerializerMethodField()
    moyenne=serializers.SerializerMethodField()

    class Meta:
        model = Annonce
        fields = [
            'id', 'titre', 'description', 'creer_le', 'creer_par', 'status',
            'photos', 'photos_upload', 'localisation', 'prix', 'vues','avis','moyenne'
        ]
        read_only_fields = ['vues']

    def create(self, validated_data):
        """ Création d'une annonce avec un tableau de photos """
        photos_data = validated_data.pop('photos_upload', [])  
        print(f"Nombre de photos reçues : {len(photos_data)}")
        
        annonce = Annonce.objects.create(**validated_data)
        print("annonce créée......................................")
        
        # Créer une liste pour stocker les médias
        media_list = []
        for photo in photos_data:
            print(f"Traitement de la photo : {photo}")
            media = Media.objects.create(photo=photo, type='photo')  
            media_list.append(media)
        
        # Utiliser set() avec tous les médias à la fois
        if media_list:
            annonce.photos.set(media_list)
            print(f"{len(media_list)} photos ajoutées.........") 
        else:
            print("Aucune photo à ajouter")

        return annonce

    def update(self, instance, validated_data):
        """ Mise à jour d'une annonce avec un tableau de photos """
        photos_data = validated_data.pop('photos_upload', None)

        # Mettre à jour les attributs de l'instance
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Gestion des photos
        if photos_data is not None:
            # Supprimer les anciennes photos
            instance.photos.clear()  
            
            # Créer et ajouter les nouvelles photos
            media_list = []
            for photo in photos_data:
                media = Media.objects.create(photo=photo, type='photo')
                media_list.append(media)
            
            # Utiliser set() avec tous les médias à la fois
            if media_list:
                instance.photos.set(media_list)

        return instance


    def get_moyenne(self, obj):
        """Récupère la moyenne des notes depuis une instance de Note associée à l'annonce."""
        note = Note.objects.filter(annonce=obj).first()  
        return note.moyenne if note else 0  

    def get_avis(self, obj):
        """Récupère la moyenne des notes depuis une instance de Note associée à l'annonce."""
        avis = Note.objects.filter(annonce=obj).count() 
        return avis or 0  

    
    # def get_mes_vues(self,obj):
    #     return obj.nombre_vues

class MessageSerializer(serializers.ModelSerializer):

    class Meta:
        model=Message
        fields=['id','texte','envoyer_le','temps_ecoule','status','destinataire','discussion']

    def get_temps_ecoule(self,obj):
        return obj.temps_ecoule()
    
class DiscussionSerializer(serializers.ModelSerializer):
    name1 = serializers.SerializerMethodField()
    name2 = serializers.SerializerMethodField()
    last_message=serializers.SerializerMethodField()
    messages=serializers.SlugRelatedField(
        read_only=True,
        slug_field="texte",
        many=True
        
    )
    class Meta:
        model=Discussion
        fields=['id','creer_le','createur1','createur2','messages','name1','name2','last_message','un_read']

    def get_name1(self, obj):
        return obj.createur1.name if obj.createur1 else None


    def get_name2(self, obj):
        return obj.createur2.name if obj.createur2 else None
    
    def get_last_message(self, obj):

        last_message = obj.messages.order_by('-envoyer_le').first()  
        return last_message.texte if last_message else None

class AnnonceFavorisSerializer(serializers.ModelSerializer):
    annonce = AnnonceSerializer(read_only=True)
    annonce_id = serializers.PrimaryKeyRelatedField(
        queryset=Annonce.objects.all(), 
        source='annonce', 
        write_only=True
    )

    class Meta:
        model = AnnonceFavoris
        fields = ['id', 'user', 'annonce', 'annonce_id']

class NoteSerializer(serializers.ModelSerializer):

    class Meta:
        model=Note
        fields=['id','valeur','user','annonce','moyenne']

    def get_moyenne(self,obj):
        return obj.moyenne
    
class TombolaSerializer(serializers.ModelSerializer):
    participants = serializers.PrimaryKeyRelatedField(
        many=True, queryset=User.objects.all(), required=False
    )
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)

    class Meta:
        model = Tombola
        fields = [
            'id', 'titre', 'cagnotte', 'participants_actuel', 'statut', 'statut_display', 
            'date_fin', 'participants','photo','creer_par'
        ]
        read_only_fields = ['participants_actuel','statut_display']

class UserTombolaSerializer(serializers.ModelSerializer):
    class Meta:
        model=UserTombola
        fields=['id','user','tombola','date_participation']

class UserSerializer(serializers.ModelSerializer):
    
    class Meta:
        model=UserTombola
        fields=["user","tombola","date_participation"]

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id','user','message','is_read','created_at','is_important','is_archived','type']

class CommentaireSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)  
    reponses = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    commentaire_parent = serializers.SerializerMethodField()  # Champ pour récupérer le texte du commentaire parent

    class Meta:
        model = Commentaire
        fields = ["id", "user", "annonce", "parent_commentaire", "texte", "reponses", "commentaire_parent", "creer_le"]
        extra_kwargs = {
            "parent_commentaire": {"allow_null": True, "required": False},
            "annonce": {"allow_null": True, "required": False},
        }

    def get_commentaire_parent(self, obj):
        """
        Récupère le texte du commentaire parent s'il existe, sinon retourne None.
        """
        if obj.parent_commentaire:
            return obj.parent_commentaire.texte
        return None

class VueSerializer(serializers.ModelSerializer):
    """
    Serializer pour le modèle Vue.
    Permet de créer une vue.
    """

    class Meta:
        model = Vue
        fields = ['annonce','user','publicite']  
        extra_kwargs={
            "annonce":{"allow_null":True,"required":False},
            "publicite":{"allow_null":True,"required":False}
        }

    def validate(self, data):
        """
        Vérifie qu'un utilisateur ne peut voir qu'une seule fois un article.
        """
        if Vue.objects.filter(user=data['user'], annonce=data['annonce']).exists():
            raise serializers.ValidationError("L'utilisateur a déjà vu cet article.")
        return data


class PubliciteSerializer(serializers.ModelSerializer):
    nombre_de_jours = serializers.IntegerField(read_only=True)
    date_fin = serializers.DateTimeField(read_only=True) 
    date_creation = serializers.DateTimeField(read_only=True) 

    class Meta:
        model = Publicite
        fields = ['id', 'user', 'titre', 'annonce', 'montant', 'is_active', 'date_creation', 'nombre_de_jours', 'date_fin']
    
    def validate_montant(self, value):
        """Validation du montant minimum"""
        if value < 500:
            raise serializers.ValidationError("Le montant minimum est de 500 FCFA.")
        return value
