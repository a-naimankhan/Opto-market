from django.db import IntegrityError
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.decorators import APIView, api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from .serializers import CategorySerializer, ProductSerializer, OrderSerializer
from .models import UserProfile, Product, Category, Order

# Регистрация пользователя
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    role = request.data.get('role')

    if not all([username, email, password, role]):
        return Response({'error': 'Все поля обязательны'}, status=status.HTTP_400_BAD_REQUEST)

    if role not in ['buyer', 'seller']:
        return Response({'error': 'Неверная роль'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.create_user(username=username, email=email, password=password)
        UserProfile.objects.create(user=user, role=role)
        return Response({'message': 'Пользователь зарегистрирован'}, status=status.HTTP_201_CREATED)
    except IntegrityError:
        return Response({'error': 'Пользователь с таким именем уже существует'}, status=status.HTTP_400_BAD_REQUEST)

# Профиль пользователя
@api_view(['GET'])
def user_profile(request):
    user = request.user
    try:
        profile = UserProfile.objects.get(user=user)
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': profile.role
        })
    except UserProfile.DoesNotExist:
        return Response({'error': 'Профиль не найден'}, status=status.HTTP_404_NOT_FOUND)
from rest_framework.permissions import IsAuthenticated

# 1. CBV для списка и создания (Full CRUD)
class ProductList(APIView):
    # Список открыт для всех, изменения только для аутентифицированных
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]
         
    def get(self, request):
        # Показываем доступные товары всем пользователям
        products = Product.available.all().order_by('-id')

        paginator = PageNumberPagination()
        # defaults
        paginator.page_size = 12
        # allow page_size override (bounded)
        try:
            page_size = int(request.query_params.get('page_size', paginator.page_size))
            paginator.page_size = max(1, min(48, page_size))
        except (TypeError, ValueError):
            pass

        page = paginator.paginate_queryset(products, request)
        serializer = ProductSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        print("POST data received:", request.data)  # Добавляем логирование

        try:
            profile = UserProfile.objects.get(user=request.user)
        except UserProfile.DoesNotExist:
            return Response({'error': 'Профиль не найден'}, status=400)

        # Поддерживаем передачу категории по id или по названию
        category_id = request.data.get('category')
        category_name = request.data.get('category_name')

        if category_name:
            category_obj, _ = Category.objects.get_or_create(name=category_name.strip())
            category_id = category_obj.id

        if not category_id:
            return Response({'category': ['Категория обязательна']}, status=400)

        try:
            category_obj = Category.objects.get(pk=category_id)
        except Category.DoesNotExist:
            return Response({'category': ['Категория не найдена']}, status=400)

        payload = request.data.copy()
        payload['category'] = category_obj.id
        # удаляем поле category_name, чтобы сериализатор не ругался
        if 'category_name' in payload:
            payload.pop('category_name')

        serializer = ProductSerializer(data=payload)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data, status=201)

        print("Serializer errors:", serializer.errors)  # Добавляем логирование ошибок
        return Response(serializer.errors, status=400)


# 1.5 CBV для категорий
class CategoryList(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

# 1.6 CBV для заказов
class OrderList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(customer=request.user).order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    def post(self, request):
        print("Order POST received:", request.data)  # Логирование
        product_id = request.data.get('product')
        quantity = int(request.data.get('quantity', 1))

        if not product_id:
            print("No product_id provided")
            return Response({'product': ['Товар обязателен']}, status=400)

        try:
            product = Product.objects.get(pk=product_id)
            print(f"Product found: {product.name}")
        except Product.DoesNotExist:
            print(f"Product {product_id} not found")
            return Response({'product': ['Товар не найден']}, status=404)

        if quantity < 1 or quantity > product.stock_quantity:
            print(f"Invalid quantity: {quantity}, stock: {product.stock_quantity}")
            return Response({'quantity': ['Недопустимое количество']}, status=400)

        total_price = product.price * quantity
        print(f"Creating order: customer={request.user}, product={product}, quantity={quantity}, total={total_price}")

        # Get buyer profile for contact info
        buyer_name = ''
        buyer_phone = ''
        try:
            profile = UserProfile.objects.get(user=request.user)
            buyer_name = request.user.username  # or profile.name if exists
            # buyer_phone can be added to UserProfile if needed
        except UserProfile.DoesNotExist:
            buyer_name = request.user.username

        order = Order.objects.create(
            customer=request.user,
            product=product,
            quantity=quantity,
            total_price=total_price,
            status='Paid',
            order_number=f"ORD{request.user.id}{product.id}{int(product.stock_quantity)}{Order.objects.count()+1}",
            buyer_name=buyer_name,
            buyer_phone=buyer_phone
        )

        product.stock_quantity = product.stock_quantity - quantity
        product.save()
        print(f"Order created: {order.order_number}, stock updated to {product.stock_quantity}")

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=201)

# 2. CBV для удаления/обновления
class ProductDetail(APIView):
    permission_classes = [IsAuthenticated]  # Требуем аутентификацию для удаления товаров

    def delete(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
            # Проверяем, что пользователь является владельцем товара
            if product.owner != request.user:
                return Response({'error': 'Вы можете удалять только свои товары'}, status=status.HTTP_403_FORBIDDEN)
            product.delete()
            return Response(status=204)
        except Product.DoesNotExist:
            return Response({'error': 'Товар не найден'}, status=status.HTTP_404_NOT_FOUND)

# 3. FBV: Статистика цен
@api_view(['GET'])
def price_stats(request):
    return Response({"info": "Average price is 500 KZT"})

# 4. FBV: Приветствие
@api_view(['GET'])
def welcome(request):
    return Response({"message": "Welcome to OptoMarket API"})

