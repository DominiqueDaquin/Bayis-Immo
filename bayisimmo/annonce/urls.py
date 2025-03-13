from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import AnnonceView
router=DefaultRouter()
router.register(r'annonces',AnnonceView)
urlpatterns=[
path('',include(router.urls))
]