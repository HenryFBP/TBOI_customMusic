"""custommusic URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path
from . import views, settings


urlpatterns = [
    url(r'^admin/', admin.site.urls),

    path('', views.index, name='index'),
    path('post/', views.post, name='post'), # we are changing rooms!
    path('music/', views.music, name='music'), #we want to get a list of music!
    path('query/', views.query, name='query'), # we want to know if we should switch songs
    path('shutdown/', views.shutdown, name='shutdown'), # we want to shut down
    path('CORS/', views.CORS, name='CORS'), # dumb HTML header nonsense...
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
