from django.db import models
from django.contrib.auth.models import User

# Create your models here.
from django.db import models
from django.contrib.auth.models import User

# Расширяем модель User
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=[('buyer', 'Покупатель'), ('seller', 'Продавец')], default='buyer')

    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"

# 1. Custom Model Manager (Requirement)
class AvailableProductManager(models.Manager):
    def get_queryset(self):
        # Возвращает только те товары, которые есть в наличии
        return super().get_queryset().filter(stock_quantity__gt=0)

# 2. Модель Категории
class Category(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

# 3. Модель Товара (Овощи/Фрукты)
class Product(models.Model):
    name = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products') # ForeignKey 1
    owner = models.ForeignKey(User, on_delete=models.CASCADE) # ForeignKey 2 (Фермер)
    seller_name = models.CharField(max_length=255, blank=True)
    seller_phone = models.CharField(max_length=20, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    min_quantity = models.PositiveIntegerField(default=1)
    stock_quantity = models.PositiveIntegerField()
    unit = models.CharField(max_length=20, default='кг')

    objects = models.Manager() # Стандартный менеджер
    available = AvailableProductManager() # Кастомный менеджер

# 4. Модель Заказа
class Order(models.Model):
    customer = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    order_number = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='Pending')
    total_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    buyer_name = models.CharField(max_length=255, blank=True)
    buyer_phone = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f"#{self.order_number} {self.customer.username} {self.status}"