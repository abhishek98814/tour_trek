from django.urls import path

from .views import (
    GearCategoryListView, GearListView, GearCreateView, FeaturedGearView, MyGearListView,
    GearDetailView, GearUpdateDeleteView, GearImageUploadView, GearRentalAvailabilityView,
    GearReviewView,
    GearOfferCreateView, GearOffersReceivedView, GearOffersSentView, GearOfferRespondView,
)

from .views import (
    GearCreateView, MyGearListView, AdminGearListView, AdminGearReviewView,
)

from django.urls import path
from . import views


# urlpatterns = [
#     path('categories/', GearCategoryListView.as_view(), name='gear-category-list'),
#     path('', GearListView.as_view(), name='gear-list'),
#     path('create/', GearCreateView.as_view(), name='gear-create'),
#     path('featured/', FeaturedGearView.as_view(), name='gear-featured'),
#     path('my/', MyGearListView.as_view(), name='gear-my'),

#     # offers: the fixed words go BEFORE the <slug> routes so they never get mistaken for a slug
#     path('offers/received/', GearOffersReceivedView.as_view(), name='gear-offers-received'),
#     path('offers/sent/', GearOffersSentView.as_view(), name='gear-offers-sent'),
#     path('offers/<int:pk>/respond/', GearOfferRespondView.as_view(), name='gear-offer-respond'),

#     path('<slug:slug>/', GearDetailView.as_view(), name='gear-detail'),
#     path('<slug:slug>/edit/', GearUpdateDeleteView.as_view(), name='gear-update-delete'),
#     path('<slug:slug>/images/', GearImageUploadView.as_view(), name='gear-image-upload'),
#     path('<slug:slug>/availability/', GearRentalAvailabilityView.as_view(), name='gear-availability'),
#     path('<slug:slug>/reviews/', GearReviewView.as_view(), name='gear-reviews'),
#     path('<slug:slug>/offers/', GearOfferCreateView.as_view(), name='gear-offer-create'),

#     path('create/', GearCreateView.as_view(), name='gear-create'),
#     path('my-gear/', MyGearListView.as_view(), name='gear-mine'),
#     path('admin/list/', AdminGearListView.as_view(), name='gear-admin-list'),
#     path('admin/<int:pk>/approve/', AdminGearReviewView.as_view(action='approve'), name='gear-approve'),
#     path('admin/<int:pk>/reject/', AdminGearReviewView.as_view(action='reject'), name='gear-reject'),
# ]


urlpatterns = [
    # fixed paths first
    path('categories/', views.GearCategoryListView.as_view()),
    path('create/', views.GearCreateView.as_view()),
    path('my-gear/', views.MyGearListView.as_view()),
    path('featured/', views.FeaturedGearView.as_view()),
    path('offers/received/', views.GearOffersReceivedView.as_view()),
    path('offers/sent/', views.GearOffersSentView.as_view()),
    path('offers/<int:pk>/respond/', views.GearOfferRespondView.as_view()),
    path('admin/list/', views.AdminGearListView.as_view()),
    path('admin/<int:pk>/approve/', views.AdminGearReviewView.as_view(action='approve')),
    path('admin/<int:pk>/reject/', views.AdminGearReviewView.as_view(action='reject')),

    # list
    path('', views.GearListView.as_view()),

    # slug routes last
    path('<slug:slug>/images/', views.GearImageUploadView.as_view()),
    path('<slug:slug>/availability/', views.GearRentalAvailabilityView.as_view()),
    path('<slug:slug>/reviews/', views.GearReviewView.as_view()),
    path('<slug:slug>/offers/', views.GearOfferCreateView.as_view()),
    path('<slug:slug>/edit/', views.GearUpdateDeleteView.as_view()),
    path('<slug:slug>/', views.GearDetailView.as_view()),
]