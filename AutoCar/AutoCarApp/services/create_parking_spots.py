from ..models import ParkingSpot

def create_parking_spots():
    for i in range(1, 1000):
        price = 100.0
        if i < 200:
            price = 200.0
        elif i < 300:
            price = 300.0
        elif i < 400:
            price = 400.0
        elif i < 500:
            price = 500.0
        elif i < 600:
            price = 600.0
        elif i < 700:
            price = 700.0
        elif i < 800:
            price = 800.0
        elif i < 900:
            price = 900.0
        elif i < 1000:
            price = 1000.0
        ParkingSpot.objects.create(
            number=i,
            price=price,
            is_available=True
        )


# Вызов функции для заполнения базы данных
create_parking_spots()