from datetime import datetime
from django.db import IntegrityError, transaction
from django.db.models import Avg, Count, Max, Min, Q
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework.decorators import APIView, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from .serializers import CategorySerializer, ProductSerializer, OrderSerializer, ProductReviewSerializer
from .models import UserProfile, Product, Category, Order, OrderStatusHistory, ProductReview

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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return Response({'error': 'Refresh token обязателен'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
    except TokenError:
        return Response({'error': 'Некорректный refresh token'}, status=status.HTTP_400_BAD_REQUEST)

    return Response({'message': 'Выход выполнен успешно'}, status=status.HTTP_200_OK)

# Профиль пользователя
@api_view(['GET'])
@permission_classes([IsAuthenticated])
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
        # Backward compatibility: infer seller role from owned products as well.
        owns_products = Product.objects.filter(owner=user).exists()
        fallback_role = 'seller' if (user.is_staff or user.is_superuser or owns_products) else 'buyer'
        profile = UserProfile.objects.create(user=user, role=fallback_role)
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': profile.role
        })
# 1. CBV для списка и создания (Full CRUD)
class ProductList(APIView):
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    # Список открыт для всех, изменения только для аутентифицированных
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request):
        # mine=1 → возвращаем только товары текущего продавца (включая 0 остаток)
        mine = request.query_params.get('mine') == '1'
        if mine and request.user.is_authenticated:
            products = Product.objects.filter(owner=request.user).annotate(
                avg_rating=Avg('reviews__rating'),
                reviews_count=Count('reviews', distinct=True),
            ).order_by('-id')
        else:
            products = Product.available.annotate(
            avg_rating=Avg('reviews__rating'),
            reviews_count=Count('reviews', distinct=True),
        ).order_by('-id')

        category_id = request.query_params.get('category')
        if not mine:
            # Фильтр категории только для публичного каталога
            pass
        if category_id:
            try:
                products = products.filter(category_id=int(category_id))
            except (TypeError, ValueError):
                pass

        # Filter by sale status
        is_with_sale = request.query_params.get('is_with_sale')
        if is_with_sale and is_with_sale.lower() in ['true', '1', 'yes']:
            products = products.filter(is_with_sale=True)

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
        serializer = ProductSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        print("POST data received:", request.data)  # Добавляем логирование

        try:
            profile = UserProfile.objects.get(user=request.user)
        except UserProfile.DoesNotExist:
            return Response({'error': 'Профиль не найден'}, status=400)

        category_id = request.data.get('category')

        if not category_id:
            return Response({'category': ['Категория обязательна']}, status=400)

        try:
            category_obj = Category.objects.get(pk=category_id)
        except Category.DoesNotExist:
            return Response({'category': ['Категория не найдена']}, status=400)

        payload = request.data.copy()
        payload['category'] = category_obj.id

        serializer = ProductSerializer(data=payload, context={'request': request})
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data, status=201)

        print("Serializer errors:", serializer.errors)  # Добавляем логирование ошибок
        return Response(serializer.errors, status=400)


# 1.5 CBV для категорий
class CategoryList(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request):
        categories = Category.objects.order_by('id')
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CategoryDetail(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def _get_object(self, pk):
        try:
            return Category.objects.get(pk=pk)
        except Category.DoesNotExist:
            return None

    def get(self, request, pk):
        category = self._get_object(pk)
        if category is None:
            return Response({'error': 'Категория не найдена'}, status=status.HTTP_404_NOT_FOUND)
        return Response(CategorySerializer(category).data)

    def put(self, request, pk):
        category = self._get_object(pk)
        if category is None:
            return Response({'error': 'Категория не найдена'}, status=status.HTTP_404_NOT_FOUND)
        serializer = CategorySerializer(category, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        category = self._get_object(pk)
        if category is None:
            return Response({'error': 'Категория не найдена'}, status=status.HTTP_404_NOT_FOUND)
        serializer = CategorySerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        category = self._get_object(pk)
        if category is None:
            return Response({'error': 'Категория не найдена'}, status=status.HTTP_404_NOT_FOUND)
        category.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProductReviewList(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request, product_id):
        reviews = ProductReview.objects.filter(product_id=product_id).select_related('user')
        serializer = ProductReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    def post(self, request, product_id):
        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Товар не найден'}, status=404)

        try:
            profile = UserProfile.objects.get(user=request.user)
        except UserProfile.DoesNotExist:
            return Response({'error': 'Профиль не найден'}, status=404)

        if profile.role != 'buyer':
            return Response({'error': 'Только покупатель может оставлять отзывы'}, status=403)

        has_order = Order.objects.filter(customer=request.user, product_id=product_id).exists()
        if not has_order:
            return Response({'error': 'Можно оставить отзыв только на товар из ваших заказов'}, status=403)

        rating = request.data.get('rating')
        comment = (request.data.get('comment') or '').strip()

        try:
            rating = int(rating)
        except (TypeError, ValueError):
            return Response({'error': 'rating должен быть числом от 1 до 5'}, status=400)

        if rating < 1 or rating > 5:
            return Response({'error': 'rating должен быть в диапазоне 1..5'}, status=400)

        review, _ = ProductReview.objects.update_or_create(
            product=product,
            user=request.user,
            defaults={
                'rating': rating,
                'comment': comment,
            },
        )

        serializer = ProductReviewSerializer(review)
        return Response(serializer.data, status=201)

# 1.6 CBV для заказов
class OrderList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        role = self._get_role(request.user)
        orders = Order.objects.all()

        if role == 'seller':
            orders = orders.filter(product__owner=request.user)
        else:
            orders = orders.filter(customer=request.user)

        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        status_filter = request.query_params.get('status')

        if date_from:
            parsed_from = self._parse_date(date_from)
            if parsed_from:
                orders = orders.filter(created_at__date__gte=parsed_from)

        if date_to:
            parsed_to = self._parse_date(date_to)
            if parsed_to:
                orders = orders.filter(created_at__date__lte=parsed_to)

        if status_filter:
            normalized_status = self._normalize_status_filter(status_filter)
            orders = orders.filter(self._status_query(normalized_status))

        orders = orders.select_related('product', 'customer').order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    def post(self, request):
        role = self._get_role(request.user)
        if role != 'buyer':
            return Response({'error': 'Только покупатель может оформить заказ'}, status=403)

        items = request.data.get('items') or []
        if not isinstance(items, list) or not items:
            return Response({'items': ['Корзина пуста']}, status=400)

        customer_first_name = request.data.get('customer_first_name', '').strip()
        customer_last_name = request.data.get('customer_last_name', '').strip()
        customer_phone = request.data.get('customer_phone', '').strip()
        customer_email = request.data.get('customer_email', '').strip()

        has_other_recipient = bool(request.data.get('has_other_recipient', False))
        recipient_first_name = request.data.get('recipient_first_name', '').strip()
        recipient_last_name = request.data.get('recipient_last_name', '').strip()
        recipient_phone = request.data.get('recipient_phone', '').strip()
        recipient_email = request.data.get('recipient_email', '').strip()

        delivery_method = request.data.get('delivery_method', Order.DELIVERY_PICKUP)
        payment_method = request.data.get('payment_method', Order.PAYMENT_CASH)

        if not all([customer_first_name, customer_last_name, customer_phone, customer_email]):
            return Response({'error': 'Заполните контактные данные покупателя'}, status=400)

        if has_other_recipient and not all([recipient_first_name, recipient_last_name, recipient_phone, recipient_email]):
            return Response({'error': 'Заполните данные получателя'}, status=400)

        if delivery_method not in {Order.DELIVERY_PICKUP, Order.DELIVERY_OTHER_CITY}:
            return Response({'error': 'Некорректный способ доставки'}, status=400)

        if payment_method not in {Order.PAYMENT_CASH, Order.PAYMENT_NON_CASH}:
            return Response({'error': 'Некорректный способ оплаты'}, status=400)

        products_to_update = []
        prepared_items = []

        for item in items:
            product_id = item.get('product_id')
            quantity = int(item.get('quantity', 1))

            if not product_id:
                return Response({'error': 'product_id обязателен для каждого товара'}, status=400)

            try:
                product = Product.objects.select_for_update().get(pk=product_id)
            except Product.DoesNotExist:
                return Response({'error': f'Товар #{product_id} не найден'}, status=404)

            if quantity < 1:
                return Response({'error': f'Некорректное количество для товара {product.name}'}, status=400)

            min_quantity = max(1, int(product.min_quantity or 1))
            if quantity < min_quantity:
                return Response(
                    {'error': f'Минимальный объем заказа для товара {product.name}: {min_quantity}'},
                    status=400,
                )

            if quantity > product.stock_quantity:
                return Response({'error': f'Недостаточно остатка для товара {product.name}'}, status=400)

            prepared_items.append((product, quantity))
            products_to_update.append((product, quantity))

        now = timezone.now()
        order_group = f"ORD{now.strftime('%Y%m%d%H%M%S')}{request.user.id}"
        created_orders = []

        with transaction.atomic():
            for index, (product, quantity) in enumerate(prepared_items, start=1):
                total_price = product.price * quantity
                order = Order.objects.create(
                    customer=request.user,
                    product=product,
                    quantity=quantity,
                    total_price=total_price,
                    status=Order.STATUS_ACCEPTED,
                    order_group=order_group,
                    order_number=f"{order_group}-{index}",
                    customer_first_name=customer_first_name,
                    customer_last_name=customer_last_name,
                    customer_phone=customer_phone,
                    customer_email=customer_email,
                    has_other_recipient=has_other_recipient,
                    recipient_first_name=recipient_first_name,
                    recipient_last_name=recipient_last_name,
                    recipient_phone=recipient_phone,
                    recipient_email=recipient_email,
                    delivery_method=delivery_method,
                    payment_method=payment_method,
                    buyer_name=f"{customer_first_name} {customer_last_name}".strip(),
                    buyer_phone=customer_phone,
                )
                created_orders.append(order)
                OrderStatusHistory.objects.create(
                    order=order,
                    previous_status='',
                    new_status=Order.STATUS_ACCEPTED,
                    changed_by=request.user,
                )

            for product, quantity in products_to_update:
                product.stock_quantity -= quantity
                product.save(update_fields=['stock_quantity'])

        serializer = OrderSerializer(created_orders, many=True)
        return Response(serializer.data, status=201)

    @staticmethod
    def _parse_date(raw_value):
        try:
            return datetime.strptime(raw_value, '%Y-%m-%d').date()
        except (TypeError, ValueError):
            return None

    @staticmethod
    def _normalize_status_filter(raw_value):
        value = (raw_value or '').strip().lower()
        status_map = {
            'accepted': Order.STATUS_ACCEPTED,
            'заказ принят': Order.STATUS_ACCEPTED,
            'pending': Order.STATUS_PENDING_PAYMENT,
            'pending_payment': Order.STATUS_PENDING_PAYMENT,
            'ожидает оплаты': Order.STATUS_PENDING_PAYMENT,
            'paid': Order.STATUS_PAID,
            'оплачено': Order.STATUS_PAID,
            'delivered': Order.STATUS_DELIVERED,
            'доставлено': Order.STATUS_DELIVERED,
        }
        return status_map.get(value, value)

    @staticmethod
    def _status_query(status_value):
        # Include legacy title-case values that can still exist in old rows.
        if status_value == Order.STATUS_ACCEPTED:
            return Q(status=Order.STATUS_ACCEPTED) | Q(status='Pending')
        if status_value == Order.STATUS_PENDING_PAYMENT:
            return Q(status=Order.STATUS_PENDING_PAYMENT)
        if status_value == Order.STATUS_PAID:
            return Q(status=Order.STATUS_PAID) | Q(status='Paid')
        if status_value == Order.STATUS_DELIVERED:
            return Q(status=Order.STATUS_DELIVERED) | Q(status='Delivered')
        return Q(status=status_value)

    @staticmethod
    def _get_role(user):
        try:
            return UserProfile.objects.get(user=user).role
        except UserProfile.DoesNotExist:
            if user.is_staff or user.is_superuser:
                return 'seller'
            if Product.objects.filter(owner=user).exists():
                return 'seller'
            return 'buyer'


class OrderStatusUpdate(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            profile = UserProfile.objects.get(user=request.user)
        except UserProfile.DoesNotExist:
            return Response({'error': 'Профиль пользователя не найден'}, status=404)

        if profile.role != 'seller':
            return Response({'error': 'Только продавец может менять статус заказа'}, status=403)

        try:
            order = Order.objects.select_related('product').get(pk=pk)
        except Order.DoesNotExist:
            return Response({'error': 'Заказ не найден'}, status=404)

        if order.product.owner_id != request.user.id:
            return Response({'error': 'Нельзя менять статус чужого заказа'}, status=403)

        new_status = request.data.get('status')
        allowed_statuses = {
            Order.STATUS_PENDING_PAYMENT,
            Order.STATUS_PAID,
            Order.STATUS_DELIVERED,
        }

        if new_status not in allowed_statuses:
            return Response({'error': 'Недопустимый статус заказа'}, status=400)

        previous_status = order.status
        order.status = new_status

        with transaction.atomic():
            order.save(update_fields=['status'])
            OrderStatusHistory.objects.create(
                order=order,
                previous_status=previous_status,
                new_status=new_status,
                changed_by=request.user,
            )

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=200)

# 2. CBV для удаления/обновления
class ProductDetail(APIView):
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request, pk):
        try:
            product = Product.objects.annotate(
                avg_rating=Avg('reviews__rating'),
                reviews_count=Count('reviews', distinct=True),
            ).get(pk=pk)
        except Product.DoesNotExist:
            return Response({'error': 'Товар не найден'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProductSerializer(product, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk):
        return self._update(request, pk, partial=False)

    def patch(self, request, pk):
        return self._update(request, pk, partial=True)

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

<<<<<<< HEAD:Server/optomarket_back/api/views.py
    def patch(self, request, pk):
        """Update product fields (including is_with_sale)"""
        try:
            product = Product.objects.get(pk=pk)
            # Проверяем, что пользователь является владельцем товара
            if product.owner != request.user:
                return Response({'error': 'Вы можете редактировать только свои товары'}, status=status.HTTP_403_FORBIDDEN)

            serializer = ProductSerializer(product, data=request.data, partial=True, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Product.DoesNotExist:
            return Response({'error': 'Товар не найден'}, status=status.HTTP_404_NOT_FOUND)

=======
    def _update(self, request, pk, partial):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({'error': 'Товар не найден'}, status=status.HTTP_404_NOT_FOUND)

        if product.owner != request.user:
            return Response({'error': 'Вы можете изменять только свои товары'}, status=status.HTTP_403_FORBIDDEN)

        serializer = ProductSerializer(product, data=request.data, partial=partial, context={'request': request})
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

>>>>>>> origin/feat/fixing-bugs:optomarket_back/api/views.py
# 3. FBV: Статистика цен
@api_view(['GET'])
def price_stats(request):
    products = Product.available.all()

    category_id = request.query_params.get('category')
    if category_id:
        try:
            products = products.filter(category_id=int(category_id))
        except (TypeError, ValueError):
            return Response({'error': 'category должен быть числом'}, status=status.HTTP_400_BAD_REQUEST)

    stats = products.aggregate(
        avg_price=Avg('price'),
        min_price=Min('price'),
        max_price=Max('price'),
        products_count=Count('id'),
    )

    return Response({
        'category': int(category_id) if category_id else None,
        'products_count': stats['products_count'],
        'avg_price': stats['avg_price'],
        'min_price': stats['min_price'],
        'max_price': stats['max_price'],
    })

# 4. FBV: Приветствие
@api_view(['GET'])
def welcome(request):
    return Response({"message": "Welcome to OptoMarket API"})

