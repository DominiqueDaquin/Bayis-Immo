from rest_framework import serializers
from .models import Media,Annonce,Message,Discussion,AnnonceFavoris,Note
class MediaSerializer(serializers.ModelSerializer):

    class Meta:
        model=Media
        fields=['id','photo','type']
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
    class Meta:
        model=Annonce
        fields=['id','titre','description','creer_le','creer_par','status','photos']


class MessageSerializer(serializers.ModelSerializer):
    destinataire=serializers.SlugRelatedField(
        read_only=True,
        slug_field="name"
    )
    class Meta:
        model=Message
        fields=['id','text','envoyer_le','temps_ecoule','status','destinataire']

    def get_temps_ecoule(self,obj):
        return obj.temps_ecoule()
    
class DiscussionSerializer(serializers.ModelSerializer):

    createur1=serializers.SlugRelatedField(
        read_only=True,
        slug_field="name",
        
    )
    createur2=serializers.SlugRelatedField(
        read_only=True,
        slug_field="name",
        
    )
    messages=serializers.SlugRelatedField(
        read_only=True,
        slug_field="name",
        many=True
        
    )
    class Meta:
        model=Discussion
        fields=['id','creer_le','createur1','createur2','messages']


class AnnonceFavorisSerializer(serializers.ModelSerializer):

    annonce=serializers.SlugRelatedField(
        read_only=True,
        slug_name="titre"
    )

    class Meta:
        model=AnnonceFavoris
        fields=['id','user','annonce']


class NoteSerializer(serializers.ModelSerializer):

    class Meta:
        model=Note
        fields=['id','valeur','user','annonce','moyenne']

    def get_moyenne(self,obj):
        return obj.moyenne