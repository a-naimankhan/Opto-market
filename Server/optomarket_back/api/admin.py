from django.contrib import admin
from .models import Category, Product, UserProfile, Order

# Register your models here.
admin.site.register(Category)
admin.site.register(Product)
admin.site.register(UserProfile)
admin.site.register(Order)
