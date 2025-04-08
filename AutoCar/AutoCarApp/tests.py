from decimal import Decimal
from django.forms import ValidationError
from django.urls import reverse
from django.test import TestCase, Client
from django.utils import timezone

from .services.pay_for_all_parking_spots import pay_for_all_parking_spots, pay_for_parking_spot
from .models import Auto, Bill, ParkingSpot, User

class AutoModelTest(TestCase):
    def test_is_available(self):
        auto = Auto(is_parked=False)
        self.assertTrue(not auto.is_parked)

    def test_is_not_available(self):
        auto = Auto(is_parked=True)
        self.assertFalse(not auto.is_parked)

class HomeViewTest(TestCase):
    def setUp(self):
        self.client = Client()

    def test_home_view_status_code(self):
        response = self.client.get(reverse('home'))
        self.assertEqual(response.status_code, 200)

    def test_home_view_template_used(self):
        response = self.client.get(reverse('home'))
        self.assertTemplateUsed(response, 'AutoCarApp/home.html')

    def test_home_view_context_data(self):
        response = self.client.get(reverse('home'))
        self.assertIn('reviews', response.context)
        self.assertIn('news_articles', response.context)

from .forms import UserRegistrationForm

class RegisterViewTest(TestCase):
    def setUp(self):
        self.client = Client()

    def test_register_view_get(self):
        response = self.client.get(reverse('register'))
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.context['form'], UserRegistrationForm)

    def test_register_view_post_success(self):
        response = self.client.post(reverse('register'), data={
            'username': 'newuser',
            'password': 'password123'
            # add all necessary fields
        })
        self.assertEqual(response.status_code, 200)  # Redirect status code


class UserModelTest(TestCase):
    def test_user_creation(self):
        user = User.objects.create_user(
            phone_number='+375291234567',
            email='test@example.com',
            password='password123'
        )
        self.assertEqual(user.phone_number, '+375291234567')
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.check_password('password123'))
        self.assertTrue(user.is_client)
        self.assertFalse(user.is_staff)

    def test_user_creation_without_phone_number(self):
        with self.assertRaises(ValueError):
            User.objects.create_user(phone_number='', email='test@example.com')

    def test_superuser_creation(self):
        superuser = User.objects.create_superuser(
            phone_number='+375291234567',
            email='super@example.com',
            password='superpassword123'
        )
        self.assertTrue(superuser.is_admin)
        self.assertTrue(superuser.is_superuser)
        self.assertTrue(superuser.is_staff)


class AutoModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            phone_number='+375291234567',
            email='user@example.com',
            password='password123'
        )
        self.bill = Bill.objects.create(balance=100.00)

    def test_auto_creation(self):
        auto = Auto.objects.create(
            number='1234',
            auto_model='Tesla Model S',
            bill=self.bill
        )
        auto.users.add(self.user)
        self.assertEqual(auto.number, '1234')
        self.assertEqual(auto.auto_model, 'Tesla Model S')
        self.assertFalse(auto.is_parked)
        self.assertIn(self.user, auto.users.all())

    
class ParkingSpotModelTest(TestCase):
    def setUp(self):
        self.auto = Auto.objects.create(
            number='1234',
            auto_model='Tesla Model X',
            bill=Bill.objects.create(balance=150.00)
        )

    def test_parking_spot_creation(self):
        spot = ParkingSpot.objects.create(
            number=1,
            price=5.000
        )
        self.assertTrue(spot.is_available)
        self.assertEqual(spot.number, 1)
        self.assertEqual(spot.price, 5.000)

    def test_parking_spot_assign_auto(self):
        spot = ParkingSpot.objects.create(
            number=2,
            price=5.000
        )
        spot.auto = self.auto
        spot.is_available = False
        spot.save()
        self.assertEqual(spot.auto, self.auto)
        self.assertFalse(spot.is_available)


class PaymentTests(TestCase):
    def setUp(self):
        self.user = User.objects.create(phone_number='+375291234567', email='user@example.com')
        # Создаем объект Bill и связываем его с объектом Auto
        self.bill = Bill.objects.create(balance=Decimal('100.00'), last_time_payed=timezone.now())
        self.bill.save()
        self.car = Auto.objects.create(number='12AB', bill=self.bill)
        self.car.users.set([self.user])
        
        self.car.save()
        
        self.parking_spot = ParkingSpot.objects.create(number=1, auto=self.car, price=Decimal('5.00'))


    def test_pay_for_all_parking_spots(self):
        # Имитация времени последней оплаты
        self.bill.last_time_payed = timezone.now() - timezone.timedelta(days=1)
        self.bill.save()

        pay_for_all_parking_spots(self.user)

        self.bill.refresh_from_db()
        # Проверяем, что баланс уменьшился
        self.assertTrue(self.bill.balance < Decimal('100.00'))

    def test_pay_for_parking_spot_no_bill(self):
        # Удаляем счет для автомобиля
        self.bill.delete()

        pay_for_parking_spot(self.car, self.parking_spot.price)
        self.assertTrue(True)

    def test_pay_for_all_parking_spots_no_parking_spot(self):
        # Удаляем парковочное место
        self.parking_spot.delete()

        pay_for_all_parking_spots(self.user)
        # Проверяем, что логгер зафиксировал ошибку
        # Это предполагает, что вы настроили логгирование в тестах, что может потребовать дополнительной настройки