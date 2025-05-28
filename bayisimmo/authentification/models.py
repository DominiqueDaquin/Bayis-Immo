from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        """
        Crée et enregistre un utilisateur avec l'email et le mot de passe.
        """
        if not email:
            raise ValueError('L\'email est obligatoire')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """
        Crée et enregistre un superutilisateur avec l'email et le mot de passe.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    email = models.EmailField(unique=True)
    name=models.CharField(max_length=255)
    phone=models.CharField(max_length=20)
    photo=models.ImageField(blank=True,null=True,upload_to="profile/photos/")

    class Meta:
        verbose_name='Utilisateur'
        verbose_name_plural='Utilisateurs'

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS=[]
    objects = UserManager()
    def __str__(self):
        return f'{self.name}' 