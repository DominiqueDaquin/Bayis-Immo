from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import (GroupView )

router=DefaultRouter()
router.register(r'groups',GroupView)


urlpatterns=[
path('',include(router.urls)),



]