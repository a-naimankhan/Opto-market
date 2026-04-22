from django.urls import path
from .views import ProductList, ProductDetail, ProductReviewList, price_stats, welcome, register_user, logout_user, user_profile, CategoryList, CategoryDetail, OrderList, OrderStatusUpdate
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('', welcome),  # root of /api/ returns a welcome/info response
    path('products/', ProductList.as_view()),
    path('products/<int:pk>/', ProductDetail.as_view()),
    path('products/<int:product_id>/reviews/', ProductReviewList.as_view(), name='product-reviews'),
    path('categories/', CategoryList.as_view()),
    path('categories/<int:pk>/', CategoryDetail.as_view(), name='category-detail'),
    path('stats/', price_stats),
    path('welcome/', welcome),
    path('register/', register_user, name='register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', logout_user, name='logout'),
    path('user/profile/', user_profile, name='user_profile'),
    path('orders/', OrderList.as_view(), name='orders'),
    path('orders/<int:pk>/status/', OrderStatusUpdate.as_view(), name='order-status-update'),
]