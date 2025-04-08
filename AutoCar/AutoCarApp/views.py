import calendar
import os
from django.http import HttpResponse, HttpResponseNotFound, JsonResponse
from django.utils import timezone
import decimal
from django.shortcuts import get_object_or_404, redirect, render
import pytz
import requests

from django.conf import settings
from .models import FAQ, Contact, ContactForJs, Partner, Politics, Review, NewsArticle, AboutCompany, History, Requisites, Certificate, User, Auto, Bill, ParkingSpot, Vacancy
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from .forms import ReplenishBalanceForm, ReviewForm, UserRegistrationForm, LoginForm, AutoForm, UserUpdateForm
from django.contrib.auth.hashers import check_password
from .services.pay_for_all_parking_spots import pay_for_all_parking_spots
from django.contrib.auth.decorators import login_required
import matplotlib.pyplot as plt
from django.db.models import Sum, Avg, Count
from .models import Bill, User
from django.db.models import F
import logging
import numpy as np
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

import faker
import requests

# Получаем экземпляр логгера
logger = logging.getLogger('myapp')


def example(request):
    return render(request, 'AutoCarApp/example.html')

def home(request):
    """
    Функция отображения для домашней страницы сайта.
    """
    # Получение отзывов
    reviews = Review.objects.all()

    # Запрос изображения кота
    try:
        response = requests.get("https://api.thecatapi.com/v1/images/search")
        if response.status_code == 200:
            cat_image_url = response.json()[0]['url']
            logger.info("Successfully retrieved cat image.")
        else:
            logger.error(f"Failed to retrieve cat image. Status code: {response.status_code}")
            cat_image_url = None
    except Exception as e:
        logger.error(f"Error retrieving cat image: {e}")
        cat_image_url = None

    # Запрос случайной шутки
    try:
        joke_response = requests.get("https://v2.jokeapi.dev/joke/Any")
        if joke_response.status_code == 200:
            joke = joke_response.json()
            logger.info("Successfully retrieved joke.")
        else:
            logger.error(f"Failed to retrieve joke. Status code: {joke_response.status_code}")
            joke = None
    except Exception as e:
        logger.error(f"Error retrieving joke: {e}")
        joke = None

    # Генерация случайного текста
    fake = faker.Faker()
    lorem_ipsum = fake.text()

    # Фиктивное изображение Unsplash
    unsplash_url = "https://dummyimage.com/200x300/000/ffe"
    try:
        response = requests.get(unsplash_url)
        if response.status_code == 200:
            unsplash_image = response.url
            logger.info("Successfully retrieved unsplash image.")
        else:
            unsplash_image = unsplash_url  # Резервный URL
            logger.error(f"Failed to retrieve unsplash image. Status code: {response.status_code}")
    except Exception as e:
        unsplash_image = unsplash_url  # Резервный URL
        logger.error(f"Error retrieving unsplash image: {e}")

    # Календарь и время
    cal = calendar.month(2023, 5)
    user_timezone = pytz.timezone('Europe/Moscow')
    now_utc = timezone.now()
    now_user = now_utc.astimezone(user_timezone)

    # Данные для отображения
    news_articles = NewsArticle.objects.all()
    last_article = news_articles.last()
    vacancys = Vacancy.objects.all()
    faqs = FAQ.objects.all()
    contacts = Contact.objects.all()
    partners = Partner.objects.all()

    return render(
        request,
        'AutoCarApp/home.html',
        context={
            'reviews': reviews,
            'now_user': now_user.strftime('%d/%m/%Y %H:%M:%S'),
            'calendar': cal,
            'vacancys': vacancys,
            'contacts': contacts,
            'now_utc': now_utc.strftime('%d/%m/%Y %H:%M:%S'),
            'news_articles': news_articles,
            'last_article': last_article,
            'faqs': faqs,
            'cat_image_url': cat_image_url,
            'joke': joke,
            'lorem_ipsum': lorem_ipsum,
            'unsplash_image': unsplash_image,
            'partners': partners
        },
    )

def scripts_page(request):
    # Слайды
    slides = [
        {"image_url": "AutoCarApp/js/slide.jpg", "title": "Слайд 1"},
        {"image_url": "AutoCarApp/js/slide.jpg", "title": "Слайд 2"},
        {"image_url": "AutoCarApp/js/slide.jpg", "title": "Слайд 3"},
    ]

    slider_settings = {
        "loop": True,              # Листать по кругу
        "auto": True,              # Автоматическое переключение
        "delay": 5,                # Задержка в секундах между слайдами
        "navs": True,              # Показывать кнопки "вперед"/"назад"
        "pags": True,              # Показывать пагинацию
        "stopmousehover": True,    # Остановка слайдера при наведении
    }

    return render(
        request,
        'AutoCarApp/scripts_page.html',  # Имя вашего HTML-шаблона
        context={
            "slides": slides,
            "slider_settings": slider_settings,
        },
    )

from django.views.decorators.csrf import csrf_exempt
@csrf_exempt
def add_contact(request):
    if request.method == "POST":
        name = request.POST.get("name")
        job_description = request.POST.get("job_description")
        phone = request.POST.get("phone")
        email = request.POST.get("email")
        photo = request.FILES.get("photo")

        if not all([name, job_description, phone, email, photo]):
            logger.log(logging.ERROR, msg=f"FORM: {[name, job_description, phone, email, photo]}. error : Все поля обязательны")
            return JsonResponse({"success": False, "error": "Все поля обязательны."})

        logger.log(logging.INFO, msg=f"FORM: {[name, job_description, phone, email, photo]}")

        # Сохранение записи
        contact = ContactForJs.objects.create(
            name=name,
            job_description=job_description,
            phone=phone,
            email=email,
            photo=photo,
        )
        contact.save()
        return JsonResponse({"success": True})

    return JsonResponse({"success": False, "error": "Метод не поддерживается."})


def validate_phone(phone):
    import re
    # Простое регулярное выражение для проверки номера телефона
    phone_regex = r"^(8|\+375)[\d\s\(\)-]{9,}$"
    return bool(re.match(phone_regex, phone))


def validate_email(email):
    from django.core.validators import validate_email
    from django.core.exceptions import ValidationError
    try:
        validate_email(email)
        return True
    except ValidationError:
        return False

def contacts_table(request):
    if request.method == "GET":
        return render(request, "AutoCarApp/contacts_table.html")

def get_contacts(request):
    contacts = ContactForJs.objects.all().values(
        'id', 'name', 'photo', 'job_description', 'phone', 'email'
    )
    return JsonResponse(list(contacts), safe=False)

def about(request):
    return render(request, 'AutoCarApp/about.html', context={'about_company': AboutCompany.objects.first(), 'history': History.objects.all(),
    'requisites': Requisites.objects.all(), 'certificate': Certificate.objects.first()})


def parking_spots(request):
    try:
        spots = ParkingSpot.objects.all()
        sort_by = request.GET.get('sort_by')

        if sort_by == 'price':
            spots = spots.order_by('-price')
            logger.info("Sorting parking spots by price.")
        elif sort_by == 'number':
            spots = spots.order_by('-is_available')
            logger.info("Sorting parking spots by availability.")

        # Пагинация
        paginator = Paginator(spots, 15)  # 3 элемента на страницу
        page = request.GET.get('page', 1)  # Получаем текущую страницу из запроса
        try:
            spots = paginator.page(page)
        except PageNotAnInteger:
            spots = paginator.page(1)
        except EmptyPage:
            spots = paginator.page(paginator.num_pages)

        if request.user.is_authenticated:
            available_autos = Auto.objects.filter(is_parked=False, users=request.user)
            logger.info(f"User {request.user} is authenticated. Showing available autos.")
            return render(request, 'AutoCarApp/parking_spots.html', {
                'spots': spots,
                'available_autos': available_autos,
                'paginator': paginator
            })
        else:
            logger.warning(f"User {request.user} is not authenticated. Not showing available autos.")
            return render(request, 'AutoCarApp/parking_spots.html', {
                'spots': spots,
                'paginator': paginator
            })

    except Exception as e:
        logger.exception("An error occurred while fetching parking spots:")
        return redirect('home')

@login_required
def park_auto(request, spot_number):
    if request.method == 'POST':
        auto_number = request.POST.get('auto_number')
        auto = get_object_or_404(Auto, number=auto_number, users=request.user)  # Проверка, что авто принадлежит пользователю
        if auto.is_parked:
            return redirect('parking_spots')
        spot = get_object_or_404(ParkingSpot, number=spot_number, is_available=True)
        spot.auto = auto
        spot.is_available = False
        auto.is_parked = True
        auto.bill.last_time_payed = timezone.now()
        auto.save()
        spot.save()
        return redirect('parking_spots')
    return redirect('parking_spots')



@login_required
def cars(request):
    user_cars = Auto.objects.filter(users=request.user)
    cars_with_balance = []
    for car in user_cars:
        try:
            cars_with_balance.append({'car': car, 'balance': car.bill.balance, 'parking_spot': ParkingSpot.objects.get(auto=car)})
        except ParkingSpot.DoesNotExist:
            cars_with_balance.append({'car': car, 'balance': car.bill.balance})
    return render(request, 'AutoCarApp/cars.html', {'cars_with_balance': cars_with_balance})


@login_required
def car(request, car_id):
    car = Auto.objects.get(pk=car_id)
    try:
        return render(request, 'AutoCarApp/car.html', {'car': car, 'balance': car.bill.balance, 'parking_spot': ParkingSpot.objects.get(auto=car)})
    except ParkingSpot.DoesNotExist:
        return render(request, 'AutoCarApp/car.html', {'car': car, 'balance': car.bill.balance})


    
@login_required
def logout(request):
    """
    Функция для выхода пользователя из системы.
    """
    auth_logout(request)
    return redirect('home')  # Перенаправление на главную страницу после выхода


def register(request):
    if request.method == 'POST':
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('login')
    else:
        form = UserRegistrationForm()
    return render(request, 'AutoCarApp/register.html', {'form': form})

def login(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            phone_number = form.cleaned_data['phone_number']
            password = form.cleaned_data['password']
            user = authenticate(request, username=phone_number, password=password)  # Используем стандартную функцию authenticate
            if user is not None:
                auth_login(request, user)
                pay_for_all_parking_spots(user)
                return redirect('home')
            else:
                return render(request, 'AutoCarApp/login.html', {'form': form, 'error': 'Invalid phone number or password'})
    else:
        form = LoginForm()
    return render(request, 'AutoCarApp/login.html', {'form': form})


@login_required
def add_car(request):
    if request.method == 'POST':
        form = AutoForm(request.POST)
        if form.is_valid():
            new_bill = Bill()
            new_bill.save()
            auto = form.save(commit=False)
            auto.bill = new_bill
            auto.save()
            auto.users.add(request.user)
            return redirect('cars')
    else:
        form = AutoForm()

    return render(request, 'AutoCarApp/add_car.html', {'form': form})


@login_required
def delete_car(request, car_id):
    if request.method == 'POST':
        auto = get_object_or_404(Auto, id=car_id, users=request.user)
        pay_for_all_parking_spots(request.user)
        try:
            parking_spot = ParkingSpot.objects.get(auto=car_id)
            parking_spot.is_available = True
            parking_spot.auto = None
            parking_spot.save()
        except ParkingSpot.DoesNotExist:
            pass
        auto.delete()
        return redirect('cars')
    return redirect('cars')

        

@login_required
def replenish_balance(request, car_id):
    if request.method == 'POST':
        bill = Auto.objects.get(id=car_id).bill
        if request.user.balance < decimal.Decimal(request.POST['amount']):
            return redirect('home')
        bill.balance += decimal.Decimal(request.POST['amount'])
        request.user.balance -= decimal.Decimal(request.POST['amount'])
        request.user.save()
        bill.save()
        return redirect('cars')
    else:
        redirect('cars')


@login_required
def edit_auto(request, car_id):
    auto = get_object_or_404(Auto, id=car_id)
    if request.method == 'POST':
        form = AutoForm(request.POST, instance=auto)
        if form.is_valid():
            if Auto.objects.filter(users=request.user, pk=auto.pk).exists():
                form.save()
                return redirect('cars')  # Перенаправление на нужную страницу после сохранения
    else:
        form = AutoForm(instance=auto)
    return render(request, 'AutoCarApp/edit_car.html', {'form': form})


@login_required
def remove_from_spot(request, car_id):
    car = Auto.objects.get(id=car_id)
    if car.is_parked:
        if Auto.objects.filter(users=request.user, pk=car.pk).exists():
            car.is_parked = False
            parking_spot = ParkingSpot.objects.get(auto=car)
            parking_spot.is_available = True
            parking_spot.auto = None
            pay_for_all_parking_spots(request.user)
            parking_spot.save()
            car.save()
    return redirect('cars')


@login_required
def replenish_user_balance(request):
    if request.method == 'POST':
        form = ReplenishBalanceForm(request.POST)
        if form.is_valid():
            amount = form.cleaned_data['amount']
            request.user.balance += decimal.Decimal(amount)
            request.user.save()
            return redirect('home')
        else:
            return render(request, 'AutoCarApp/replenish_user_balance.html', {'form': form})
    else:
        form = ReplenishBalanceForm()
        return render(request, 'AutoCarApp/replenish_user_balance.html', {'form': form})

@login_required
def edit_account(request):
    if request.method == 'POST':
        form = UserUpdateForm(request.POST, instance=request.user)
        if form.is_valid():
            form.save()
            return redirect('home')  # Перенаправляем пользователя на главную страницу после успешного обновления
    else:
        form = UserUpdateForm(instance=request.user)
    return render(request, 'AutoCarApp/edit_account.html', {'form': form})


@login_required
def add_review(request):
    if Review.objects.filter(user=request.user).exists():
        return redirect('home')  # Перенаправление, если отзыв уже существует

    if request.method == 'POST':
        form = ReviewForm(request.POST)
        if form.is_valid():
            review = form.save(commit=False)
            review.user = request.user
            review.save()
            return redirect('home')
    else:
        form = ReviewForm()

    return render(request, 'AutoCarApp/add_review.html', {'form': form})


@login_required
def sales_statistics(request):
    if request.user.is_staff:
        sales_values = list(Bill.objects.annotate(sale=F('balance')).values_list('sale', flat=True))
        median_sales = np.median(sales_values)

        total_sales = Bill.objects.aggregate(total=Sum('balance'))

        average_sales = Bill.objects.aggregate(average=Avg('balance'))

        total_clients = User.objects.filter(is_client=True).count()
        plt.figure(figsize=(10, 5))
        plt.bar(['Total Sales', 'Average Sales'], [total_sales['total'], average_sales['average']])
        plt.ylabel('Amount')
        plt.title('Sales Statistics')
        plt.savefig(os.path.join(settings.MEDIA_ROOT, 'sales_stats.png'))
        logger.debug(settings.MEDIA_ROOT)
        logger.debug(settings.MEDIA_URL)
        context = {
            'total_sales': total_sales['total'],
            'average_sales': average_sales['average'],
            'median_sales': median_sales,
            'total_clients': total_clients
        }
        return render(request, 'AutoCarApp/sales_statistics.html', context)
    else:
        return HttpResponse(status=403)
    

def politics(request):
    politics = Politics.objects.first()
    return render(request, 'AutoCarApp/politics.html', {'politics': politics})


def news(request):
    news_articles = NewsArticle.objects.all()
    return render(request, 'AutoCarApp/news.html', {'news_articles': news_articles})


def news_article(request, news_id):
    logger.info(f"News article {news_id} requested.")
    news_article = get_object_or_404(NewsArticle, id=news_id)
    return render(request, 'AutoCarApp/news_article.html', {'news_article': news_article})


def faq(request, faq_id):
    logger.info(f"Faq {faq_id} requested.")
    faq = get_object_or_404(FAQ, id=faq_id)
    return render(request, 'AutoCarApp/faq.html', {'faq': faq})

def classes_task(request):
    return render(request, 'AutoCarApp/classes_task.html')

def prototype_task(request):
    return render(request, 'AutoCarApp/prototype_task.html')

def math(request):
    return render(request, 'AutoCarApp/math.html')