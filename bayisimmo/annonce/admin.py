from django.contrib import admin
from .models import Notification
from .models import Media,Annonce,Discussion,Message,Note,Commentaire,Publicite,Tombola
admin.site.register(Media)
admin.site.register(Annonce)
admin.site.register(Discussion)
admin.site.register(Message)
admin.site.register(Note)
admin.site.register(Notification)
admin.site.register(Commentaire)
admin.site.register(Publicite)
admin.site.register(Tombola)