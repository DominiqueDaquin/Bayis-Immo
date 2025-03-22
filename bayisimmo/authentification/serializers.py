from rest_framework import serializers
from django.contrib.auth import get_user_model
from djoser.serializers import UserCreateSerializer

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    groups=serializers.SlugRelatedField(
        read_only=True,
        slug_field="name",
        many=True
    )
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'phone','groups','name','photo']

class UserRegistrationSerializer(UserCreateSerializer):
    class Meta(UserCreateSerializer.Meta):
        model = User
        fields = ['id', 'email', 'password', 'phone', 'name','username']

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'name', 'phone','photo']