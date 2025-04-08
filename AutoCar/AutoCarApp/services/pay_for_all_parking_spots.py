import decimal
from django.utils import timezone
from django.db import transaction
import logging
from ..models import Auto, Bill, ParkingSpot

logger = logging.getLogger('myapp')

def pay_for_all_parking_spots(user):
    user_cars = Auto.objects.filter(users=user)
    logger.info(f"Processing {user_cars.count()} cars for user {user.id}")

    for car in user_cars:
        try:
            parking_spot = ParkingSpot.objects.get(auto=car)
            logger.info(f"Parking spot {parking_spot.pk} for car {car.pk}")
            pay_for_parking_spot(car, parking_spot.price)
        except ParkingSpot.DoesNotExist:
            logger.error(f"No parking spot found for car {car.pk}")
        except Exception as e:
            logger.error(f"Error processing car {car.pk}: {str(e)}")

@transaction.atomic
def pay_for_parking_spot(car, monthly_price):
    bill = car.bill
    now = timezone.now()
    seconds_since_last_payment = (now - bill.last_time_payed).total_seconds()
    daily_price = monthly_price / decimal.Decimal(30.0)
    secondly_price = daily_price / (decimal.Decimal(24.0) * decimal.Decimal(3600.0))
    amount_to_pay = secondly_price * decimal.Decimal(seconds_since_last_payment)
    bill.balance -= decimal.Decimal(amount_to_pay)
    bill.last_time_payed = now
    bill.save()
    logger.info(f"Bill {bill.pk} updated: {amount_to_pay} charged")
