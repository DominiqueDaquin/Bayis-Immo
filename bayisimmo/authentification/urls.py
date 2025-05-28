from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import (GroupView,exchange_token )

router=DefaultRouter()
router.register(r'groups',GroupView)


urlpatterns=[
path('',include(router.urls)),
path('social/token/', exchange_token, name='social_token'),


]