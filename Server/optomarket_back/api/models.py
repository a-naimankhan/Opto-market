from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator

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
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

# 3. Модель Товара (Овощи/Фрукты)
class Product(models.Model):
    name = models.CharField(max_length=255)
    image = models.FileField(upload_to='products/', blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products') # ForeignKey 1
    owner = models.ForeignKey(User, on_delete=models.CASCADE) # ForeignKey 2 (Фермер)
    seller_name = models.CharField(max_length=255, blank=True)
    seller_phone = models.CharField(max_length=20, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    min_quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    stock_quantity = models.PositiveIntegerField(validators=[MinValueValidator(0)])
    unit = models.CharField(max_length=20, default='кг')

    objects = models.Manager() # Стандартный менеджер
    available = AvailableProductManager() # Кастомный менеджер


class ProductReview(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField(default=5)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('product', 'user')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.product.name} - {self.rating}/5"

# 4. Модель Заказа
class Order(models.Model):
    STATUS_ACCEPTED = 'accepted'
    STATUS_PENDING_PAYMENT = 'pending_payment'
    STATUS_PAID = 'paid'
    STATUS_DELIVERED = 'delivered'

    STATUS_CHOICES = [
        (STATUS_ACCEPTED, 'Заказ принят'),
        (STATUS_PENDING_PAYMENT, 'Ожидает оплаты'),
        (STATUS_PAID, 'Оплачено'),
        (STATUS_DELIVERED, 'Доставлено'),
    ]

    DELIVERY_PICKUP = 'pickup'
    DELIVERY_OTHER_CITY = 'other_city'
    DELIVERY_CHOICES = [
        (DELIVERY_PICKUP, 'Самовывоз'),
        (DELIVERY_OTHER_CITY, 'Доставка в другой город'),
    ]

    PAYMENT_CASH = 'cash'
    PAYMENT_NON_CASH = 'non_cash'
    PAYMENT_CHOICES = [
        (PAYMENT_CASH, 'Наличный расчет'),
        (PAYMENT_NON_CASH, 'Безналичный расчет'),
    ]

    customer = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    order_number = models.CharField(max_length=64, unique=True)
    order_group = models.CharField(max_length=64, db_index=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_ACCEPTED)
    total_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    customer_first_name = models.CharField(max_length=255, blank=True)
    customer_last_name = models.CharField(max_length=255, blank=True)
    customer_phone = models.CharField(max_length=20, blank=True)
    customer_email = models.EmailField(blank=True)

    has_other_recipient = models.BooleanField(default=False)
    recipient_first_name = models.CharField(max_length=255, blank=True)
    recipient_last_name = models.CharField(max_length=255, blank=True)
    recipient_phone = models.CharField(max_length=20, blank=True)
    recipient_email = models.EmailField(blank=True)

    delivery_method = models.CharField(max_length=20, choices=DELIVERY_CHOICES, default=DELIVERY_PICKUP)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default=PAYMENT_CASH)

    # Legacy fields are kept for backwards compatibility with older clients.
    buyer_name = models.CharField(max_length=255, blank=True)
    buyer_phone = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f"#{self.order_number} {self.customer.username} {self.status}"


class OrderStatusHistory(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='status_logs')
    previous_status = models.CharField(max_length=20, blank=True)
    new_status = models.CharField(max_length=20)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    changed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order {self.order_id}: {self.previous_status} -> {self.new_status}"