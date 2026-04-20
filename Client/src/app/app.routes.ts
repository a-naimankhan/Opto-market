import { Routes } from '@angular/router';
import { Layout } from './pages/seller/layout/layout';
import { Products } from './pages/seller/products/products';
import { Categories } from './pages/seller/categories/categories';
import { Cart } from './pages/seller/cart/cart';
import { Order } from './pages/seller/order/order';
import { Customer } from './pages/seller/customer/customer';
import { Landing } from './pages/buyer/landing/landing';
import { CategoryProducts } from './pages/buyer/category-products/category-products';
import { CustomerCart } from './pages/buyer/customer-cart/customer-cart';
import { CustomerOrders } from './pages/buyer/customer-orders/customer-orders';
import { Checkout } from './pages/buyer/checkout/checkout';
import { Login } from './pages/seller/login/login';
import { buyerAuthGuard } from './guards/buyer-auth.guard';

export const routes: Routes = [

    {
        path: '',
        component: Landing
    },
    {
        path: 'login',
        component: Login
    },
    {
        path: 'buyer',
        children: [
            { path: '', component: Landing },
            { path: 'category-products', component: CategoryProducts },
            { path: 'cart', component: CustomerCart, canActivate: [buyerAuthGuard] },
            { path: 'orders', component: CustomerOrders, canActivate: [buyerAuthGuard] },
            { path: 'checkout', component: Checkout, canActivate: [buyerAuthGuard] }
        ]
    },
    {
        path: 'seller',
        component: Layout,
        children: [
            { path: '', redirectTo: 'products', pathMatch: 'full' },
            { path: 'products', component: Products },
            { path: 'categories', component: Categories },
            { path: 'cart', component: Cart },
            { path: 'order', component: Order },
            { path: 'customer', component: Customer }
        ]
    }
];
