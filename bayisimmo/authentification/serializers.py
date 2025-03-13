from rest_framework import  serializers
from django.contrib.auth import get_user_model
from djoser.serializers import UserCreateSerializer
User=get_user_model()
class UserSerializer(serializers.ModelSerializer):
    
    class Meta:
        models=User
        fields=['id','email','username','phone']


class UserRegistrationSerializer(UserCreateSerializer):
    class Meta(UserCreateSerializer.Meta):
        model=User
        fields=['id','email','username','password','phone','name']

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields=['email','name','phone']