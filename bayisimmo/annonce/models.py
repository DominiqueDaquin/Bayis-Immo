from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from datetime import timedelta

class Media(models.Model):
    """ Un média représente tout ce qui est photo ou vidéo attaché à une annonce """
    TYPE_CHOICES = [
        ('photo', 'Photo'),
        ('video', 'Vidéo'),
    ]
    photo = models.ImageField(upload_to='medias/', verbose_name="Photo")
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='photo')

    class Meta:
        verbose_name = "Média"
        verbose_name_plural = "Médias"

    def __str__(self):
        return f"{self.type} - {self.photo.name}"

class Annonce(models.Model):
    """ Une annonce représente une offre publier par un vendeur """

    CHOICES=[
        ('p','en attente'),
        ('r','rejecter'),
        ('a','approuver'),
        ('s','signaler'),
        ('d','desactivez')
    ]
    titre=models.CharField(max_length=255,db_index=True)
    description=models.TextField()


    creer_le=models.DateTimeField(auto_now_add=True)
    creer_par=models.ForeignKey(get_user_model(),on_delete=models.CASCADE)
    status=models.CharField(max_length=1,choices=CHOICES,default='p')
    photos=models.ManyToManyField(Media)
    note = models.DecimalField(max_digits=3, decimal_places=1, validators=[MinValueValidator(0), MaxValueValidator(5)])

    class Meta:
        verbose_name='Annonce'
        verbose_name_plural='Annonces'

    def __str__(self):
        return f"{self.titre}"


class Message(models.Model):
    """ Message pour les discussions  """
    CHOICES=[
        ('l','lu'),
        ('e','envoyé'),
        ('s','signalé'),
        ('r','recu'),

    ]
    texte=models.TextField()
    envoyer_le=models.DateTimeField(auto_now_add=True)
    status=models.CharField(max_length=1,choices=CHOICES,default='e')

    def temps_ecoule(self):
        """
        Retourne une chaîne de caractères indiquant depuis combien de temps le message a été envoyé.
        """
        maintenant = timezone.now()
        difference = maintenant - self.envoyer_le

        if difference < timedelta(minutes=1):
            return "À l'instant"
        elif difference < timedelta(hours=1):
            minutes = int(difference.total_seconds() // 60)
            return f"Il y a {minutes} min"
        elif difference < timedelta(days=1):
            heures = int(difference.total_seconds() // 3600)
            return f"Il y a {heures} h"
        elif difference < timedelta(days=30):
            jours = difference.days
            return f"Il y a {jours} jours"
        else:
            mois = difference.days // 30
            return f"Il y a {mois} mois"

    def __str__(self):
        return f"Message de {self.envoyer_le} : {self.texte[:50]}..."

    class Meta:
        verbose_name='Message'
        verbose_name_plural='Messages'
    
    def __str__(self):
        return f'message {self.id}'
    
class Discussion(models.Model):
    """ une discussion correspond a une conversation demarrer en 2 personnes"""
    creer_le=models.DateTimeField(auto_now_add=True)
    createur1=models.ForeignKey(get_user_model(),on_delete=models.SET_NULL,null=True,related_name="discussions_initiees")
    createur2=models.ForeignKey(get_user_model(),on_delete=models.SET_NULL,null=True,related_name="discussion_recues")
    messages = models.ManyToManyField(Message)



