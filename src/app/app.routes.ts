import { Routes } from '@angular/router';
import { Login } from './pages/seller/login/login';
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

export const routes: Routes = [

    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
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
            { path: 'cart', component: CustomerCart },
            { path: 'orders', component: CustomerOrders },
            { path: 'checkout', component: Checkout }
        ]
    },
    {
        path: 'seller',
        component: Layout,
        children: [
            { path: 'products', component: Products },
            { path: 'categories', component: Categories },
            { path: 'cart', component: Cart },
            { path: 'order', component: Order },
            { path: 'customer', component: Customer }
        ]
    }
];
