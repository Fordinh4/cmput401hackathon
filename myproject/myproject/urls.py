"""
URL configuration for myproject project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import (
    hello,
    MasterResumeViewSet,
    JobApplicationViewSet,
    TailoredResumeViewSet,
    jobs_list_adapter
)

# Create router for ViewSets
router = DefaultRouter()
router.register(r'resume/master', MasterResumeViewSet, basename='master-resume')
router.register(r'jobs', JobApplicationViewSet, basename='job')
router.register(r'resume/tailored', TailoredResumeViewSet, basename='tailored-resume')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/hello/', hello),
    path('api/jobs/', jobs_list_adapter),  # Adapter for frontend compatibility
    path('api/', include(router.urls)),
]
