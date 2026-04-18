from rest_framework import serializers
from .models import Product, Category, Order, OrderStatusHistory, ProductReview

# ModelSerializers (Requirement)
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    avg_rating = serializers.FloatField(read_only=True, default=0)
    reviews_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ['owner'] # Владелец назначается автоматически


class ProductReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ProductReview
        fields = ['id', 'product', 'user', 'username', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'product', 'user', 'username', 'created_at']

# Plain Serializers (Requirement)
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    changed_by_username = serializers.CharField(source='changed_by.username', read_only=True)

    class Meta:
        model = OrderStatusHistory
        fields = ['id', 'previous_status', 'new_status', 'changed_by', 'changed_by_username', 'changed_at']
        read_only_fields = fields

class OrderSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    status_logs = OrderStatusHistorySerializer(many=True, read_only=True)
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
            'order_group',
            'customer',
            'product',
            'product_id',
            'quantity',
            'total_price',
            'status',
            'created_at',
            'createdAt',
            'customer_first_name',
            'customer_last_name',
            'customer_phone',
            'customer_email',
            'has_other_recipient',
            'recipient_first_name',
            'recipient_last_name',
            'recipient_phone',
            'recipient_email',
            'delivery_method',
            'payment_method',
            'buyer_name',
            'buyer_phone',
            'status_logs',
        ]
        read_only_fields = ['id', 'order_number', 'order_group', 'customer', 'status', 'created_at']

class OrderSummarySerializer(serializers.Serializer):
    total_orders = serializers.IntegerField()
    total_spent = serializers.DecimalField(max_digits=10, decimal_places=2)

