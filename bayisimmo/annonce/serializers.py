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


    creer_par=serializers.SlugRelatedField(
        read_only=True,
        slug_field="name"
    )
    photos = MediaSerializer(many=True, read_only=True)
    #mes_vues=serializers.SerializerMethodField()
    class Meta:
        model=Annonce
        fields=['id','titre','description','creer_le','creer_par','status','photos','localisation','prix','vues']
        read_only_fields=['vues']

    
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
        fields=['id','creer_le','createur1','createur2','messages','name1','name2','last_message']

    def get_name1(self, obj):
        return obj.createur1.name if obj.createur1 else None


    def get_name2(self, obj):
        return obj.createur2.name if obj.createur2 else None
    
    def get_last_message(self, obj):
        # Assurez-vous d'avoir une relation 'messages' dans Discussion
        last_message = obj.messages.order_by('-envoyer_le').first()  # Trie par 'envoyer_le' pour récupérer le dernier
        return last_message.texte if last_message else None


class AnnonceFavorisSerializer(serializers.ModelSerializer):

    

    class Meta:
        model=AnnonceFavoris
        fields=['id','user','annonce']


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
