from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework.views import APIView,status
from django.contrib.auth.models import Group
from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import AllowAny
from .serializers import GroupSerializer
from rest_framework.viewsets import ModelViewSet
from rest_framework_simplejwt.tokens import RefreshToken
from social_django.utils import load_strategy, load_backend
from social_core.exceptions import MissingBackend, AuthForbidden
from django.urls import reverse


User=get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def exchange_token(request):
    """
    Exchange Google auth token for JWT
    """
    provider = request.data.get('provider', 'google-oauth2')
    access_token = request.data.get('access_token', None)
    
    if not access_token:
        return Response({'error': 'No access token provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Initialisation de la stratégie et du backend
        strategy = load_strategy(request)
        backend = load_backend(strategy=strategy, name=provider, redirect_uri=None)
        
        # Obtenir les données utilisateur depuis le token
        user = backend.do_auth(access_token)
        
        if user:
            # Générer les tokens JWT
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                }
            })
        else:
            return Response({'error': 'Failed to authenticate'}, status=status.HTTP_400_BAD_REQUEST)
    
    except (MissingBackend, AuthForbidden) as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)




class AddToGroupView(APIView):
    
    
    def post(self, request):
        user_id = request.data.get("user_id")
        group_name = request.data.get("group_name")
        
        if not user_id or not group_name:
            return Response({"error": "Données manquante pour réaliser cette opération"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "Utilisateur non trouvé"}, status=status.HTTP_404_NOT_FOUND)
        
        group, created = Group.objects.get_or_create(name=group_name)
        user.groups.add(group)
        
        return Response({"message": "Utilisateur a été ajouté au groupe avec success "}, status=status.HTTP_200_OK)
    

@api_view(['POST'])
@permission_classes([AllowAny])
def custom_password_reset(request):
    try:
        user_id = request.data.get('user_id')
        new_password = request.data.get('new_password')
        code = request.data.get('code')
        
        User = get_user_model()
        user = User.objects.get(id=user_id)
        
        
        
        user.set_password(new_password)
        user.save()
        
        return Response(
            {"detail": "Mot de passe mis à jour avec succès"},
            status=status.HTTP_200_OK
        )
        
    except User.DoesNotExist:
        return Response(
            {"detail": "Utilisateur non trouvé"},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


class GroupView(ModelViewSet):

    queryset=Group.objects.all()
    serializer_class=GroupSerializer