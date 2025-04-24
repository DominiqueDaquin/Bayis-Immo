from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.mail import send_mail
from django.conf import settings

User = get_user_model()

class Command(BaseCommand):
    help = 'Ajoute un utilisateur au groupe de modérateurs'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Email de l\'utilisateur à ajouter comme modérateur')
        parser.add_argument('-s', '--super', action='store_true', help='Définir l\'utilisateur comme supermodérateur (is_staff=True)')

    def handle(self, *args, **options):
        email = options['email']
        is_super = options['super']
        
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise CommandError(f'Utilisateur avec l\'email {email} n\'existe pas')
        
        # Création ou récupération du groupe modérateur
        moderator_group, created = Group.objects.get_or_create(name='moderateur')
        if created:
            self.stdout.write(self.style.SUCCESS('Groupe de modérateurs créé avec succès'))
        
        # Ajout de l'utilisateur au groupe
        user.groups.add(moderator_group)
        
        # Définir comme supermodérateur si l'option est activée
        if is_super:
            user.is_staff = True
            self.stdout.write(self.style.SUCCESS(f'L\'utilisateur {email} est maintenant un supermodérateur'))
        
        # Sauvegarder l'utilisateur
        user.save()
        
        # Envoyer un email à l'utilisateur
        subject = 'Vous êtes maintenant un modérateur' if not is_super else 'Vous êtes maintenant un supermodérateur'
        message = f"""
        Bonjour {user.get_full_name() or user.username},
        
        Nous avons le plaisir de vous informer que vous avez été ajouté au groupe des modérateurs.
        {'Vous disposez également des privilèges de supermodérateur.' if is_super else ''}
        
        Cordialement,
        L'équipe d'administration de Bayisimmob
        """
        
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
            self.stdout.write(self.style.SUCCESS(f'Email envoyé à {email}'))
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'Impossible d\'envoyer l\'email: {str(e)}'))
        
        self.stdout.write(self.style.SUCCESS(f'L\'utilisateur {email} a été ajouté au groupe des modérateurs avec succès'))