from rest_framework import serializers
from .models import Media,Annonce,Message,Discussion
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
        fields=['id','titre','description','creer_le','creer_par','status','photos','note']


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model=Message
        fields=['id','text','envoyer_le','temps_ecoule','status']

    def get_temps_ecoule(self,obj):
        return obj.temps_ecoule()