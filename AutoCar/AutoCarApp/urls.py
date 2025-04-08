from django.conf import settings
from django.urls import path
from django.conf.urls.static import static
from . import views

urlpatterns = [
    path('add-review/', views.add_review, name='add_review'),
    path('home/', views.home, name='home'),
    path('example/', views.example, name='example'),
    path('about/', views.about, name='about'),
    path('politics/', views.politics, name='politics'),
    path('news/', views.news, name='news'),
    path('news/<int:news_id>/', views.news_article, name='news_article'),
    path('faq/<int:faq_id>/', views.faq, name='faq'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('register/', views.register, name='register'),
    path('cars/', views.cars, name='cars'),
    path('cars/<int:car_id>/', views.car, name='car'),
    path('add_car/', views.add_car, name='add_car'),
    path('parking_spots/', views.parking_spots, name='parking_spots'),
    path('park_auto/<int:spot_number>/', views.park_auto, name='park_auto'),
    path('delete_car/<int:car_id>/', views.delete_car, name='delete_car'),
    path('edit_car/<int:car_id>/', views.edit_auto, name='edit_car'),
    path('remove_from_spot/<int:car_id>/', views.remove_from_spot, name='remove_from_spot'),
    path('replenish_balance/<int:car_id>/', views.replenish_balance, name='replenish_balance'),
    path('replenish_user_balance/', views.replenish_user_balance, name='replenish_user_balance'),
    path('edit_account/', views.edit_account, name='edit_account'),
    path('sales_statistics/', views.sales_statistics, name='sales_statistics'),
    path('politics/', views.politics, name='politics'),
    path('scripts_page/', views.scripts_page, name='scripts_page'),
    path('contacts_table/', views.contacts_table, name='contacts_table'),
    path('get_contacts/', views.get_contacts, name='get_contacts'),
    path("add_contact/", views.add_contact, name="add_contact"),
    path("task/classes/", views.classes_task, name="classes_task"),
    path("task/prototypes/", views.prototype_task, name="prototype_task"),
    path("math/", views.math, name="math"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
