from django.urls import path
from .views import ProductList, ProductDetail, price_stats, welcome, register_user, user_profile, CategoryList, OrderList
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('', welcome),  # root of /api/ returns a welcome/info response
    path('products/', ProductList.as_view()),
    path('products/<int:pk>/', ProductDetail.as_view()),
    path('categories/', CategoryList.as_view()),
    path('stats/', price_stats),
    path('welcome/', welcome),
    path('register/', register_user, name='register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/profile/', user_profile, name='user_profile'),
    path('orders/', OrderList.as_view(), name='orders'),
]