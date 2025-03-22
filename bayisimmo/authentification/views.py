from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework.views import APIView,status
from django.contrib.auth.models import Group

User=get_user_model()
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
