from django.db import models
from django.core.validators import RegexValidator, EmailValidator, MaxValueValidator, MinValueValidator
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class UserManager(BaseUserManager):
    def create_user(self, phone_number, email, password=None):
        if not phone_number:
            raise ValueError('Users must have a phone number')
        if not email:
            raise ValueError('Users must have an email address')

        user = self.model(
            phone_number=phone_number,
            email=self.normalize_email(email),
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number, email, password):
        user = self.create_user(
            phone_number,
            email,
            password=password,
        )
        user.is_admin = True
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user

class User(AbstractBaseUser, PermissionsMixin):
    name = models.CharField(max_length=50)
    phone_number = models.CharField(
        max_length=13,
        unique=True,
        validators=[RegexValidator(regex=r'^\+37529\d{7}$', message="Phone number must be entered in the format: '+37529******'. Up to 9 digits allowed.")]
    )
    email = models.EmailField(
        max_length=50,
        unique=True,
        validators=[EmailValidator()]
    )
    is_client = models.BooleanField(default=True)
    balance = models.DecimalField(default=0, max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)  # Добавьте это поле, если хотите разрешить доступ в админ-панель

    objects = UserManager()

    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.email


class Bill(models.Model):
    creation_date = models.DateTimeField(auto_now_add=True, blank=False)
    last_time_payed = models.DateTimeField(blank=True, null=True, auto_now_add=False)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)

class Auto(models.Model):
    number = models.CharField(unique=True, blank=False, max_length=4, null=False)
    auto_model = models.CharField(max_length=50, blank=False)
    users = models.ManyToManyField(User)
    is_parked = models.BooleanField(blank=False, default=False)
    bill = models.OneToOneField(Bill, on_delete=models.CASCADE, blank=False, null=False)

class ParkingSpot(models.Model):
    number = models.PositiveIntegerField(unique=True,validators=[
            MinValueValidator(1),
            MaxValueValidator(999)
        ], blank=False, max_length=3, null=False, primary_key=True)
    price = models.DecimalField(max_digits=7, validators=[
            MinValueValidator(0.0)
        ], decimal_places=3)
    auto = models.OneToOneField(Auto, on_delete=models.SET_NULL, null=True, blank=True)
    is_available = models.BooleanField(default=True)


class NewsArticle(models.Model):
    name = models.CharField(blank=False, max_length=100)
    image = models.ImageField(upload_to='news/', verbose_name='Картинка', blank=True, null=True)
    description = models.CharField(blank=False, max_length=1000)
    short_description = models.CharField(blank=True, max_length=100)

class Vacancy(models.Model):
    name = models.CharField(blank=False, max_length=50)
    description = models.CharField(blank=False, max_length=500)

class FAQ(models.Model):
    question = models.CharField(blank=False, max_length=300)
    answer = models.CharField(blank=False, max_length=1000)
    creation_time = models.DateTimeField(auto_now_add=True, blank=False)

class Contact(models.Model):
    name = models.CharField(blank=False, max_length=50)
    image = models.ImageField(upload_to='contacts/', verbose_name='Фото сотрудника', blank=True, null=True)
    email = models.EmailField(
        max_length=50,
        unique=True,
        blank=False,
        validators=[EmailValidator()]
    )
    phone_number = models.CharField(
        max_length=13,
        unique=True,
        blank=False,
        validators=[
            RegexValidator(
                regex=r'^\+37529\d{7}$',
                message="Phone number must be entered in the format: '+37529******'. Up to 9 digits allowed."
            )
        ]
    )
    photo = models.CharField(blank=True, max_length=100)
    position = models.CharField(max_length=50, blank=False)

class Promocode(models.Model):
    name = models.CharField(blank=False, max_length=50, unique=True)
    expires_at = models.DateTimeField(blank=False)
    surcharge = models.DecimalField(blank=False, max_digits=10, decimal_places=2)

class Review(models.Model):
    rating = models.IntegerField(
        validators=[
            MinValueValidator(1),
            MaxValueValidator(5)
        ],
        blank=False
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, blank=False)
    description = models.CharField(blank=False, max_length=500)


class Partner(models.Model):
    name = models.CharField(max_length=255, verbose_name='Название компании')
    logo = models.ImageField(upload_to='partners/logos', verbose_name='Логотип')
    website = models.URLField(max_length=255, verbose_name='Сайт компании')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Партнер'
        verbose_name_plural = 'Партнеры'

class AboutCompany(models.Model):
    title = models.CharField(max_length=255, verbose_name='Заголовок', blank=True, null=True)
    text = models.TextField(verbose_name='Текст', blank=True, null=True)
    video = models.FileField(upload_to='about/video', verbose_name='Видео', blank=True, null=True)
    logo = models.ImageField(upload_to='about/logo', verbose_name='Логотип', blank=True, null=True)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = 'О компании'
        verbose_name_plural = 'О компании'

class History(models.Model):
    year = models.IntegerField(verbose_name='Год')
    text = models.TextField(verbose_name='Текст')

    def __str__(self):
        return str(self.year)

    class Meta:
        verbose_name = 'История'
        verbose_name_plural = 'История'
        ordering = ['year']

class Requisites(models.Model):
    title = models.CharField(max_length=255, verbose_name='Заголовок')
    text = models.TextField(verbose_name='Текст')

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = 'Реквизиты'
        verbose_name_plural = 'Реквизиты'

class Certificate(models.Model):
    title = models.CharField(max_length=255, verbose_name='Заголовок')
    text = models.TextField(verbose_name='Текст')

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = 'Сертификат'
        verbose_name_plural = 'Сертификаты'

class Politics(models.Model):
    text = models.TextField(verbose_name='Текст')

class ContactForJs(models.Model):
    name = models.CharField(max_length=255, verbose_name="ФИО")
    photo = models.ImageField(upload_to='contacts_for_js/photos/', verbose_name="Фото")
    job_description = models.TextField(verbose_name="Описание выполняемых работ")
    phone = models.CharField(max_length=50, verbose_name="Телефон")
    email = models.EmailField(verbose_name="Электронная почта")

    def __str__(self):
        return self.name
