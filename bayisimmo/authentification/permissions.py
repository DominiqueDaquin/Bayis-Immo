from rest_framework.permissions import BasePermission

class EstAnnonceur(BasePermission):
    """ 
    Verifie si l'utiliseur est un annonceur
    """

    def has_persmission(self,request,view):
        return request.user and request.user.groups.filter(name="annonceur").exists()