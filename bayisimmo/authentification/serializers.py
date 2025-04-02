from rest_framework import serializers
from django.contrib.auth import get_user_model
from djoser.serializers import UserCreateSerializer
from django.core.validators import RegexValidator
from django.contrib.auth.models import Group 
User = get_user_model()



User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    groups=serializers.SlugRelatedField(
        read_only=True,
        slug_field="name",
        many=True
    )
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'phone','groups','name','photo','date_joined']

class UserRegistrationSerializer(UserCreateSerializer):
    phone = serializers.CharField(
        max_length=20,
        validators=[
            RegexValidator(
                regex=r'^\+\d{1,3}[ ]?\d{8,15}$',
                message="Le numéro doit être au format +indicatifnuméro ou +indicatif numéro (ex: +237699999999 ou +237 699999999)"
            )
        ]
    )

    class Meta(UserCreateSerializer.Meta):
        model = User
        fields = ['id', 'email', 'password', 'phone', 'name', 'username', 'photo']

    def validate_phone(self, value):
        """
        Validation du numéro de téléphone avec espace optionnel
        """
        clean_value = value.replace(' ', '')
        
        if not clean_value.replace('+', '').isdigit():
            raise serializers.ValidationError("Le numéro ne doit contenir que des chiffres et le signe +")
        
        if not clean_value.startswith('+'):
            raise serializers.ValidationError("Le numéro doit commencer par l'indicatif pays (ex: +237)")
        
        parts = clean_value[1:].split()  # On ignore le +
        if len(parts) == 0:
            raise serializers.ValidationError("Numéro incomplet")
            
        if len(parts) > 2:
            raise serializers.ValidationError("Format invalide")
            
        if len(parts) == 1:
            if len(parts[0]) < 9:  
                raise serializers.ValidationError("Numéro trop court")
            indicatif = parts[0][:3] 
            numero = parts[0][3:]
        else:
            
            indicatif = parts[0]
            numero = parts[1]
        
        
        if len(indicatif) < 1 or len(indicatif) > 3:
            raise serializers.ValidationError("L'indicatif pays doit contenir 1 à 3 chiffres")
        
        
        if len(numero) < 8 or len(numero) > 15:
            raise serializers.ValidationError("Le numéro doit contenir entre 8 et 15 chiffres")
        
        
        return f"+{indicatif} {numero}"


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'name', 'phone','photo']


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model= Group
        fields=["id","name"]