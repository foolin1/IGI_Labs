from decimal import Decimal
import logging
import random
from django.contrib.auth import get_user_model
from AutoCarApp.models import FAQ, Certificate, Contact, History, NewsArticle, ParkingSpot, Partner, Politics, Promocode, Requisites, Vacancy, AboutCompany

logger = logging.getLogger('myapp')

def seed_data():
    create_superuser()
    create_contacts()
    create_faq_entries()
    create_news_articles()
    create_parking_spots()
    create_vacancies()
    create_history_entries()
    create_about_company_entry()
    create_partner_entry()
    create_politics()
    create_certificates()
    create_requisites()


def create_superuser():
    User = get_user_model()
    if not User.objects.filter(is_superuser=True).exists():
        User.objects.create_superuser(
            phone_number='+375290000000',
            email='admin@example.com',
            password='123456qW!'
        )
        logger.info('Superuser created.')
    else:
        logger.info('Superuser already exists.')

def create_contacts():
    logger = logging.getLogger('myapp')

    # Проверка на наличие контактов
    if Contact.objects.count() < 5:
        # Предопределенные данные для контактов
        contacts_data = [
            {"name": "Alice", "email": "alice@example.com", "image": "contacts/contact.png", "phone_number": "+375291234567", "position": "Manager"},
            {"name": "Bob", "email": "bob@example.com", "image": "contacts/contact.png", "phone_number": "+375291234568", "position": "Developer"},
            {"name": "Charlie", "email": "charlie@example.com", "image": "contacts/contact.png", "phone_number": "+375291234569", "position": "Designer"},
            {"name": "Diana", "email": "diana@example.com", "image": "contacts/contact.png", "phone_number": "+375291234570", "position": "Analyst"},
            {"name": "Eve", "email": "eve@example.com", "image": "contacts/contact.png", "phone_number": "+375291234571", "position": "Support"}
        ]

        # Создание контактов
        for contact_data in contacts_data:
            Contact.objects.get_or_create(
                name=contact_data["name"],
                email=contact_data["email"],
                phone_number=contact_data["phone_number"],
                image=contact_data["image"],
                position=contact_data["position"]
            )
        logger.info('Contacts created successfully.')
    else:
        logger.info('Contacts already exist.')


def create_faq_entries():
    if FAQ.objects.count() < 5:
        faq_data = [
            {"question": "How to register?", "answer": "To register, click the sign-up button on the homepage."},
            {"question": "How to reset my password?", "answer": "Click on the forgot password link and follow the instructions."},
            {"question": "What is the refund policy?", "answer": "Refunds are issued within 30 days of purchase."},
            # добавьте еще вопросы и ответы
        ]
        for entry in faq_data:
            FAQ.objects.create(**entry)
        logger.info('FAQ entries created.')
    else:
        logger.info('FAQ entries already exist.')


def create_news_articles():
    if NewsArticle.objects.count() < 7:
        news_data = [
        {
            "name": "Снижение стоимости парковки",
            "description": "Многие парковочные зоны снижены в цене на 10% для всех пользователей нашего сервиса. Это стало возможно благодаря новым партнёрствам с парковочными операторами. Теперь найти место для автомобиля будет проще и доступнее!",
            "image": "news/new1.jpg",
            "short_description": "Новое снижение стоимости парковки."
        },
        {
            "name": "Новое приложение для удобного управления",
            "description": "Мы обновили наше приложение для управления автомобилями и парковкой. В новой версии улучшена навигация, добавлены уведомления об изменениях в парковочной зоне и упрощён интерфейс пополнения баланса. Наслаждайтесь удобством прямо с телефона!",
            "image": "news/new2.jpg",
            "short_description": "Обновление приложения для удобства."
        },
        {
            "name": "Новые места для парковки в центре",
            "description": "Мы рады сообщить, что добавлены новые парковочные места в центре города. Теперь наши пользователи смогут легко припарковаться даже в самых загруженных районах. Места доступны для бронирования в приложении.",
            "image": "news/new1.jpg",
            "short_description": "Парковочные места в центре."
        },
        {
            "name": "Введены абонементы на парковку",
            "description": "Для пользователей, часто паркующихся в одних и тех же местах, мы ввели абонементы. Это поможет сэкономить до 20% стоимости и обеспечит гарантированное место. Абонементы уже доступны в приложении.",
            "image": "news/new2.jpg",
            "short_description": "Новые абонементы на парковку."
        },
        {
            "name": "Автосервис нового уровня",
            "description": "Наш сервис теперь предоставляет не только парковку, но и базовое техобслуживание. Припарковав машину, можно заказать проверку уровня жидкостей, диагностику двигателя и многое другое. Воспользуйтесь услугой в приложении.",
            "image": "news/new1.jpg",
            "short_description": "Автосервис прямо на парковке."
        },
        {
            "name": "Льготы на парковку для электромобилей",
            "description": "В целях поддержки экологичных решений мы вводим льготы на парковку для владельцев электромобилей. Теперь такие пользователи смогут парковаться бесплатно на ряде мест или по сниженной стоимости в центре города.",
            "image": "news/new2.jpg",
            "short_description": "Льготы для владельцев электромобилей."
        },
        {
            "name": "Запущена партнерская программа",
            "description": "Мы запускаем партнёрскую программу для владельцев автосервисов и парковок. Теперь вы можете сотрудничать с нами, предлагая свои услуги через наше приложение, привлекая новых клиентов и расширяя бизнес.",
            "image": "news/new1.jpg",
            "short_description": "Программа для автосервисов и парковок."
        }
    ]   

        
        for article in news_data:
            NewsArticle.objects.create(**article)
        
        logger.info('News articles created.')
    else:
        logger.info('News articles already exist.')


def create_parking_spots():
    if ParkingSpot.objects.count() < 100:
        for i in range(1, 101):
            price = round(Decimal(random.uniform(1.0, 100.0)), 3)  # случайная цена от 1.0 до 100.0 с тремя знаками после запятой
            ParkingSpot.objects.create(
                number=i,
                price=price,
                is_available=True
            )
        logger.info('100 parking spots created.')
    else:
        logger.info('Parking spots already exist.')


def create_vacancies():
    if Vacancy.objects.count() < 5:
        vacancies_data = [
            {
                "name": "Software Engineer",
                "description": "Responsible for developing software solutions."
            },
            {
                "name": "Data Analyst",
                "description": "Analyzes data to support business decision-making."
            },
            {
                "name": "Project Manager",
                "description": "Oversees project execution from start to finish."
            },
            {
                "name": "UI/UX Designer",
                "description": "Designs user interfaces and user experiences."
            },
            {
                "name": "System Administrator",
                "description": "Maintains and supports IT infrastructure."
            },
        ]

        for vacancy in vacancies_data:
            Vacancy.objects.create(**vacancy)

        logger.info('Vacancies created.')
    else:
        logger.info('Vacancies already exist.')


def create_history_entries():
    if History.objects.count() == 0:
        history_data = [
            {
                "year": 1990,
                "text": "Основание автостоянки. Начало обслуживания первых клиентов."
            },
            {
                "year": 2000,
                "text": "Расширение автостоянки и добавление новых парковочных мест."
            },
            {
                "year": 2010,
                "text": "Внедрение системы видеонаблюдения для повышения безопасности."
            },
            {
                "year": 2015,
                "text": "Открытие дополнительных услуг, таких как автомойка и технический осмотр."
            },
            {
                "year": 2020,
                "text": "Полная модернизация системы бронирования мест онлайн."
            }
        ]

        for entry in history_data:
            History.objects.create(**entry)

        logger.info('History entries created.')
    else:
        logger.info('History entries already exist.')


def create_about_company_entry():
    if not AboutCompany.objects.exists():
        AboutCompany.objects.create(
            title="О нашей компании",
            text="Наша автостоянка предоставляет услуги высочайшего качества с 1990 года. Мы заботимся о безопасности ваших автомобилей и предоставляем удобные условия для их хранения.",
            video="about/video/sample-5s.mp4",  
            logo="about/logo/logo.png"
        )
        logger.info("AboutCompany entry created.")
    else:
        logger.info("AboutCompany entry already exists.")


def create_partner_entry():
    if not Partner.objects.exists():
        Partner.objects.create(
            name="Github",
            website="https://github.com",
            logo="partners/logos/github.png"
        )
        Partner.objects.create(
            name="Discord",
            website="https://discord.com",
            logo="partners/logos/discord.png"
        )
        logger.info("Partner entry created.")
    else:
        logger.info("Partner entry already exists.")


def create_certificates():
    # Проверяем, есть ли уже сертификаты в базе данных
    if not Certificate.objects.exists():  # Можно менять количество в зависимости от требований
        certificates_data = [
            {"title": "Сертификат 1", "text": "Описание сертификата 1."}
        ]
        
        for cert_data in certificates_data:
            Certificate.objects.create(**cert_data)
        
        logger.info("Certificates created.")
    else:
        logger.info("Certificates already exist.")


def create_requisites():
    # Проверяем, есть ли уже реквизиты в базе данных
    if Requisites.objects.count() < 5:  # Укажите необходимое количество реквизитов
        requisites_data = [
            {"title": "Реквизит 1", "text": "Описание реквизита 1."},
            {"title": "Реквизит 2", "text": "Описание реквизита 2."},
            {"title": "Реквизит 3", "text": "Описание реквизита 3."},
            {"title": "Реквизит 4", "text": "Описание реквизита 4."},
            {"title": "Реквизит 5", "text": "Описание реквизита 5."},
        ]
        
        for req_data in requisites_data:
            Requisites.objects.create(**req_data)
        
        logger.info("Requisites created.")
    else:
        logger.info("Requisites already exist.")


def create_politics():
    if Politics.objects.count() < 1:
        politics_text = """
        **Политика конфиденциальности и условия использования**

        Ваше доверие для нас крайне важно, и мы стремимся защитить вашу личную информацию. Используя сервис AutoCar, вы соглашаетесь с нашими условиями и политикой обработки данных, описанной ниже.

        **1. Сбор данных**
        Мы собираем минимально необходимую информацию, такую как имя, контактные данные и историю пользования сервисом, чтобы предоставить вам качественное обслуживание. Эти данные помогают улучшить наш сервис и адаптировать его под ваши потребности.

        **2. Обработка данных**
        Все персональные данные обрабатываются в соответствии с действующим законодательством о защите данных. Мы не передаем вашу информацию третьим лицам без вашего согласия, кроме случаев, предусмотренных законом.

        **3. Использование данных**
        Ваши данные используются для управления вашим аккаунтом, предоставления доступа к парковочным местам, поддержания связи и предоставления персонализированных предложений. При посещении нашего веб-сайта также могут собираться технические данные, такие как IP-адрес и сведения о браузере.

        **4. Безопасность**
        Мы применяем современные технологии для защиты ваших данных от несанкционированного доступа, потерь и злоупотреблений. Доступ к данным ограничен только уполномоченным лицам компании.

        **5. Изменение политики**
        AutoCar оставляет за собой право изменять условия данной политики конфиденциальности. Все изменения будут опубликованы на сайте. Пожалуйста, регулярно проверяйте этот раздел, чтобы быть в курсе обновлений.

        Обращаясь к нам, вы подтверждаете, что ознакомлены с условиями использования и политикой конфиденциальности. Для любых вопросов обращайтесь к нашей службе поддержки.
        """

        politics = Politics(text=politics_text)
        politics.save()
        logger.info("Politics created.")
    else:
        logger.info("Politics already exist.")


def create_promocodes():
    if Promocode.objects.count() < 5:
        # Создаем данные для инициализации
        promocode_data = [
            {"name": "SUMMER2024", "expires_at": datetime.now() + timedelta(days=30), "surcharge": Decimal("10.00")},
            {"name": "WELCOME5", "expires_at": datetime.now() + timedelta(days=60), "surcharge": Decimal("5.00")},
            {"name": "HAPPYHOLIDAY", "expires_at": datetime.now() + timedelta(days=90), "surcharge": Decimal("15.00")},
            {"name": "VIP20", "expires_at": datetime.now() + timedelta(days=120), "surcharge": Decimal("20.00")},
            {"name": "NEWYEAR50", "expires_at": datetime.now() + timedelta(days=365), "surcharge": Decimal("50.00")},
        ]

        # Добавляем записи в базу данных
        for data in promocode_data:
            Promocode.objects.create(**data)
        logger.info("Promocodes created.")
    else:
        logger.info("Promocodes already exist.")
        