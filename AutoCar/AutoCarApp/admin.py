from django.contrib import admin
from .models import Politics, User, Bill, Auto, ParkingSpot, NewsArticle, Vacancy, FAQ, Contact, Promocode, Review
from .models import Partner, AboutCompany, History, Requisites, Certificate

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone_number', 'is_client', 'balance', 'created_at')
    search_fields = ('name', 'email', 'phone_number')
    list_filter = ('is_client', 'created_at')

@admin.register(Bill)
class BillAdmin(admin.ModelAdmin):
    list_display = ('creation_date', 'balance')
    list_filter = ('creation_date',)

@admin.register(Auto)
class AutoAdmin(admin.ModelAdmin):
    list_display = ('number', 'auto_model')
    search_fields = ('number', 'auto_model')
    list_filter = ('auto_model',)

@admin.register(ParkingSpot)
class ParkingSpotAdmin(admin.ModelAdmin):
    list_display = ('number', 'price', 'is_available')
    list_filter = ('is_available', 'price')
    search_fields = ('number',)

@admin.register(NewsArticle)
class NewsArticleAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name', 'description')

@admin.register(Vacancy)
class VacancyAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name', 'description')

@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ('question', 'answer', 'creation_time')
    list_filter = ('creation_time',)
    search_fields = ('question',)

@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone_number', 'position')
    search_fields = ('name', 'email', 'phone_number')
    list_filter = ('position',)

@admin.register(Promocode)
class PromocodeAdmin(admin.ModelAdmin):
    list_display = ('name', 'expires_at', 'surcharge')
    list_filter = ('expires_at',)
    search_fields = ('name',)

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('description', 'user', 'rating')
    search_fields = ('description', 'rating')
    list_filter = ('user', 'rating')

@admin.register(Partner)
class PartnerAdmin(admin.ModelAdmin):
    list_display = ('name', 'website')
    search_fields = ('name', 'website')

@admin.register(AboutCompany)
class AboutCompanyAdmin(admin.ModelAdmin):
    list_display = ('title', 'text')
    search_fields = ('title', 'text')

@admin.register(History)
class HistoryAdmin(admin.ModelAdmin):
    list_display = ('year', 'text')
    search_fields = ('year', 'text')
    ordering = ('year',)

@admin.register(Requisites)
class RequisitesAdmin(admin.ModelAdmin):
    list_display = ('title', 'text')
    search_fields = ('title', 'text')

@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ('title', 'text')
    search_fields = ('title', 'text')

@admin.register(Politics)
class PoliticsAdmin(admin.ModelAdmin):
    list_display = ('text',)
    search_fields = ('text',)