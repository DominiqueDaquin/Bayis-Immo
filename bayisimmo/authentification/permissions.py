from rest_framework.permissions import BasePermission,SAFE_METHODS
class IsAnnonceur(BasePermission):
    """ 
    Verifie si l'utiliseur est un annonceur
    """

    def has_persmission(self,request,view):
        return request.user and request.user.groups.filter(name="annonceur").exists()


class IsAnnonceurOrReadOnly(BasePermission):
    """
    Permission personnalisée :
    - Les annonceurs peuvent créer, modifier et supprimer des annonces.
    - Les clients peuvent seulement voir les annonces.
    """
    def has_permission(self, request, view):
        print(request.user)
        if request.method in SAFE_METHODS:
            return True
        
        return request.user and (request.user.groups.filter(name='annonceur').exists() or request.user.groups.filter(name='moderateur').exists())

    def has_object_permission(self, request, view, obj):
        
        if request.method in SAFE_METHODS:
            return True
        try:    
            return (obj.creer_par == request.user ) or (request.user.groups.filter(name='moderateur').exists() )
        except:
            return (obj.user == request.user ) or (request.user.groups.filter(name='moderateur').exists() )
        finally:
            pass
         