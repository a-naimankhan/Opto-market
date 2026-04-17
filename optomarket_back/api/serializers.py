from rest_framework import serializers
from .models import Product, Category, Order

# ModelSerializers (Requirement)
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ['owner'] # Владелец назначается автоматически

# Plain Serializers (Requirement)
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

class OrderSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        source='product',
        queryset=Product.objects.all(),
        write_only=True,
        required=False,
    )

    class Meta:
        model = Order
        fields = [
            'id',
            'order_number',
            'customer',
            'product',
            'product_id',
            'quantity',
            'total_price',
            'status',
            'created_at',
            'buyer_name',
            'buyer_phone',
        ]
        read_only_fields = ['id', 'order_number', 'customer', 'status', 'created_at']

class OrderSummarySerializer(serializers.Serializer):
    total_orders = serializers.IntegerField()
    total_spent = serializers.DecimalField(max_digits=10, decimal_places=2)

