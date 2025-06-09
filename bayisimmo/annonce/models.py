from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from datetime import timedelta
from django.core.exceptions import ValidationError
from django.utils.timezone import now
from django.db.models import Avg
from django.dispatch import receiver
from django.db.models.signals import post_save
User=get_user_model()
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
        ('s','sponsorise'),
        ('d','desactivez')
    ]
    titre=models.CharField(max_length=255,db_index=True)
    description=models.TextField()


    creer_le=models.DateTimeField(auto_now_add=True)
    creer_par=models.ForeignKey(get_user_model(),on_delete=models.CASCADE)
    status=models.CharField(max_length=1,choices=CHOICES,default='p')
    photos=models.ManyToManyField(Media)
    notes=models.ManyToManyField(get_user_model(),
                                 through='Note',
                                 related_name='notes'

                                 )
    localisation=models.CharField(max_length=255,default='Akwa Soudanaise')
    prix=models.DecimalField(max_digits=20,decimal_places=2,default=0.0)

    class Meta:
        verbose_name='Annonce'
        verbose_name_plural='Annonces'
        ordering=["-creer_le"]

    def nombre_vues(self):
        """
        Retourne le nombre total de vues de cette annonce.
        """
        return self.vues.count()

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
    destinataire=models.ForeignKey(get_user_model(),on_delete=models.CASCADE)
    discussion=models.ForeignKey("Discussion",on_delete=models.CASCADE,related_name="messages")



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

    def clean(self):
        """ Vérifie que le destinataire est bien l'un des deux créateurs de la discussion """
        if self.destinataire not in [self.discussion.createur1, self.discussion.createur2]:
            raise ValidationError("Le destinataire doit être l'un des créateurs de la discussion.")
        
    def __str__(self):
        return f"Message de {self.envoyer_le} : {self.texte[:50]}..."

    class Meta:
        verbose_name='Message'
        verbose_name_plural='Messages'
        ordering=["-envoyer_le"]
        
    
    def __str__(self):
        return f'message {self.id}'
    
class Discussion(models.Model):
    """ Une discussion correspond à une conversation démarrée entre deux personnes """
    creer_le = models.DateTimeField(auto_now_add=True)
    createur1 = models.ForeignKey(
        get_user_model(), on_delete=models.SET_NULL, null=True, related_name="discussions_initiees"
    )
    createur2 = models.ForeignKey(
        get_user_model(), on_delete=models.SET_NULL, null=True, related_name="discussions_recues"
    )
    un_read=models.BooleanField(default=False)
    class Meta:
        unique_together = ('createur1', 'createur2')  
        ordering = ['-creer_le']  

    def update_unread_status(self):
        """Met à jour le statut un_read en fonction des messages non lus"""
        unread_messages = self.messages.filter(status='e')  
        self.un_read = unread_messages.exists()
        self.save()

 

    def __str__(self):
        return f"Discussion entre {self.createur1} et {self.createur2}"
    

class AnnonceFavoris(models.Model):
    user=models.ForeignKey(get_user_model(),on_delete=models.CASCADE)
    annonce=models.ForeignKey(Annonce,on_delete=models.CASCADE)

    class Meta:
        verbose_name='Annonce favorie'
        verbose_name_plural='Annonces Favories'
        unique_together=['user','annonce']
    
    def __str__(self):
        return f"{self.user} - annonce : {self.annonce.titre}"

class Note(models.Model):
    valeur = models.DecimalField(max_digits=3, decimal_places=1, validators=[MinValueValidator(0), MaxValueValidator(5)],default=0.0)
    user=models.ForeignKey(get_user_model(),on_delete=models.CASCADE)
    annonce=models.ForeignKey(Annonce,on_delete=models.CASCADE)
    
    class Meta:
        verbose_name='Note'
        verbose_name_plural='Notes'
        unique_together=['user','annonce']

    @property
    def moyenne(self):
        moyenne = Note.objects.filter(annonce=self.annonce).aggregate(Avg('valeur'))['valeur__avg']
        return moyenne if moyenne is not None else 0  
    
class Commentaire(models.Model):
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    annonce = models.ForeignKey(Annonce, on_delete=models.CASCADE, null=True, blank=True)
    parent_commentaire = models.ForeignKey(
        "Commentaire", on_delete=models.CASCADE, null=True, blank=True, related_name="reponses"
    )
    texte = models.TextField()
    creer_le=models.DateTimeField(auto_now_add=True)

class Publicite(models.Model):
    CHOICES=[
        ("p","En attente"),
        ("a","approuver"),
        ("r","rejeter")
        
    ]
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    titre = models.CharField(max_length=255)
    annonce = models.ForeignKey(Annonce, on_delete=models.CASCADE)
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=False)
    date_creation = models.DateTimeField(auto_now_add=True)
    order_id=models.CharField(max_length=100,null=True)
    is_payed=models.BooleanField(default=False)
    duree_jours=models.SmallIntegerField(default=0)
    statut=models.CharField(max_length=1,default="p",choices=CHOICES)


    class Meta:
        verbose_name="Publicité"
        verbose_name_plural="Publicités"
    

    # @property
    # def duree_jours(self):
    #     montant_quotidien = 250
    #     return max(int(self.montant // montant_quotidien), 2)

    @property
    def date_fin(self):
        return self.date_creation + timedelta(days=int(self.duree_jours))

    def clean(self):
        if self.montant < 250:
            raise ValidationError("Le montant minimum est de 250 FCFA.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.titre} - {self.duree_jours} jours (Fin: {self.date_fin})"

class Vue(models.Model):
    """
    Ce modèle stocke les vues d'un article par utilisateur.
    """
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    annonce = models.ForeignKey("Annonce", on_delete=models.CASCADE, related_name="vues",null=True,blank=True)
    date_vue = models.DateTimeField(auto_now_add=True)  
    publicite=models.ForeignKey(Publicite,on_delete=models.CASCADE,blank=True,null=True)

    class Meta:
        unique_together = ('user', 'annonce')  

    def __str__(self):
        return f"{self.user} a vu {self.article}"

class Tombola(models.Model):
    STATUS_CHOICES = [
        ('a', 'Active'),
        ('p', 'En attente'),
        ('f', 'Terminée'),
        ('r', 'rejeté'),
    ]
    
    photo = models.ImageField(upload_to='tombola_photos/', blank=True, null=True)
    titre = models.CharField(max_length=200)
    description=models.TextField()
    cagnotte = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        help_text="Montant de la cagnotte (FCFA)"
    )
    participants_actuel = models.PositiveIntegerField(default=0)
    statut = models.CharField(
        max_length=1,
        choices=STATUS_CHOICES,
        default='p'
    )
    date_fin = models.DateField(null=True,blank=True)
    participants = models.ManyToManyField(
        get_user_model(), 
        related_name="tombolas",
        through='UserTombola',
        blank=True
    )
    creer_par=models.ForeignKey(get_user_model(),on_delete=models.CASCADE)
    creer_le=models.DateTimeField(auto_now_add=True)
    

    def __str__(self):
        return self.titre
    
class UserTombola(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    tombola = models.ForeignKey("Tombola", on_delete=models.CASCADE)
    date_participation = models.DateTimeField(auto_now_add=True)
    order_id=models.CharField(max_length=100,null=True)
    is_payed=models.BooleanField(default=False)
    statut=models.CharField(max_length=20,default="En attente")
    class Meta:
        unique_together = ('user', 'tombola')

    def __str__(self):
        return f"{self.user.username} - {self.tombola.titre}"
    
class Notification(models.Model):
    CHOICES=[
        ('a','alerte'),
        ('c','critique'),
        ('d','default')
    ]
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name="notifications")
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=now)
    is_important=models.BooleanField(default=False)
    is_archived=models.BooleanField(default=False)
    type=models.CharField(max_length=1,choices=CHOICES,default='d')

    def __str__(self):
        return f"{self.user} - {self.message[:50]}"
    

class DemandeBien(models.Model):


    TYPE_BIEN_CHOICES = [
        ('terrain', 'Terrain'),
        ('maison', 'Maison'),
        ('appartement', 'Appartement'),
        ('local_commercial', 'Local Commercial'),
        ('autres', 'Autres'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='demandes')
    type_bien = models.CharField(max_length=50, choices=TYPE_BIEN_CHOICES)
    ville=models.CharField(max_length=50)
    localisation = models.CharField(max_length=255)
    superficie_min = models.PositiveIntegerField(help_text="Superficie minimale en m²")
    superficie_max = models.PositiveIntegerField(help_text="Superficie maximale en m²")
    budget_min = models.DecimalField(max_digits=12, decimal_places=2)
    budget_max = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.TextField(blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    statut = models.CharField(max_length=20, default='en_attente', choices=[
        ('en_attente', 'En attente'),
        ('en_cours', 'En cours de traitement'),
        ('traitee', 'Traitée'),
    ])    
    frais=models.DecimalField(max_digits=12, decimal_places=2)
    order_id=models.CharField(max_length=100)

    class Meta:
        ordering = ['-date_creation']
        verbose_name = "Demande de bien"
        verbose_name_plural = "Demandes de biens"

    def __str__(self):
        return f"Demande de {self.get_type_bien_display()} à {self.localisation}"


@receiver(post_save, sender=Message)
def update_discussion_unread(sender, instance, created, **kwargs):
        if created:  
            discussion = instance.discussion
            discussion.un_read = True
            discussion.save()




class UserSubscription(models.Model):
    PLAN_CHOICES = (
        ('daily', 'Journalier - 250 FCFA'),
        ('weekly', 'Hebdomadaire - 500 FCFA'),
        ('monthly', 'Mensuel - 1000 FCFA'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions')
    plan_type = models.CharField(max_length=10, choices=PLAN_CHOICES)
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    order_id = models.CharField(max_length=100, blank=True, null=True)
    
    class Meta:
        ordering = ['-start_date']
    
    def __str__(self):
        return f"{self.user.email} - {self.get_plan_type_display()} ({'Actif' if self.is_active else 'Inactif'})"
    
    def save(self, *args, **kwargs):
        if not self.pk:  # Nouvel abonnement
            duration_days = {
                'daily': 1,
                'weekly': 7,
                'monthly': 30
            }.get(self.plan_type, 0)
            
            self.end_date = self.start_date + timezone.timedelta(days=duration_days)
        super().save(*args, **kwargs)
    
    @property
    def price(self):
        prices = {
            'daily': 250,
            'weekly': 500,
            'monthly': 1000
        }
        return prices.get(self.plan_type, 0)
    
    @property
    def remaining_days(self):
        if self.is_active:
            return max(0, (self.end_date - timezone.now()).days)
        return 0