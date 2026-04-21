
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/"
  },
  {
    "renderMode": 2,
    "route": "/login"
  },
  {
    "renderMode": 2,
    "route": "/buyer"
  },
  {
    "renderMode": 2,
    "route": "/buyer/category-products"
  },
  {
    "renderMode": 2,
    "route": "/buyer/cart"
  },
  {
    "renderMode": 2,
    "route": "/buyer/orders"
  },
  {
    "renderMode": 2,
    "route": "/buyer/checkout"
  },
  {
    "renderMode": 2,
    "redirectTo": "/seller/products",
    "route": "/seller"
  },
  {
    "renderMode": 2,
    "route": "/seller/products"
  },
  {
    "renderMode": 2,
    "route": "/seller/categories"
  },
  {
    "renderMode": 2,
    "route": "/seller/cart"
  },
  {
    "renderMode": 2,
    "route": "/seller/order"
  },
  {
    "renderMode": 2,
    "route": "/seller/customer"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 435, hash: '1f2d73adbe6818826eeff0fb4276061b4215556fc106e291d1ba4d6f2445d0ed', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 948, hash: 'be982cf79f9251542a089bbf38a7417213dec1ed0f24a869da554da186480785', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'buyer/orders/index.html': {size: 321, hash: 'b2c252f38ac377d1835bed21b47f19bfb9355dbe8c64dbbd625f839f6b4570e1', text: () => import('./assets-chunks/buyer_orders_index_html.mjs').then(m => m.default)},
    'buyer/checkout/index.html': {size: 327, hash: '353dfb1e6e490260bf736425e502f599e4f17dcbbef2e362b7a975766e0fdf9c', text: () => import('./assets-chunks/buyer_checkout_index_html.mjs').then(m => m.default)},
    'login/index.html': {size: 6114, hash: 'f3472a0b8286ddc50edbeb5d3e66ea76ee3424d783aef5bb94208c4b6dedecbd', text: () => import('./assets-chunks/login_index_html.mjs').then(m => m.default)},
    'buyer/cart/index.html': {size: 315, hash: '229f6c3ef6b84203fff76681f6a4a9cc628657df9b33eb73259ae1118e87ade1', text: () => import('./assets-chunks/buyer_cart_index_html.mjs').then(m => m.default)},
    'seller/categories/index.html': {size: 13436, hash: '01ce96d8cf0347b51fa2352aca8fa6b2fbc13d011005ba21e89b828a6c166b59', text: () => import('./assets-chunks/seller_categories_index_html.mjs').then(m => m.default)},
    'seller/order/index.html': {size: 10528, hash: 'b45e87d8127ed0c2adacc945396afe607baa539d6c05b7173f8a9b21c8012f4c', text: () => import('./assets-chunks/seller_order_index_html.mjs').then(m => m.default)},
    'buyer/index.html': {size: 19950, hash: 'd80196b7157bb7da75dea9b824e1210dda67f60fa484caf7541108e302fa7986', text: () => import('./assets-chunks/buyer_index_html.mjs').then(m => m.default)},
    'index.html': {size: 19950, hash: 'd80196b7157bb7da75dea9b824e1210dda67f60fa484caf7541108e302fa7986', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'buyer/category-products/index.html': {size: 2218, hash: '4c4534fa3fb2c7a64826642028baca04485ea756492a9e825cf5a91699150559', text: () => import('./assets-chunks/buyer_category-products_index_html.mjs').then(m => m.default)},
    'seller/cart/index.html': {size: 6017, hash: '993ae8ed9049dc0b18354b9f435bb9bfc50716a6b32d83ec2c66959ea1993946', text: () => import('./assets-chunks/seller_cart_index_html.mjs').then(m => m.default)},
    'seller/customer/index.html': {size: 9775, hash: 'f0b6e5c14b07b34540de107fe9e119a5a41742e0d22664353434fa2dae9aac94', text: () => import('./assets-chunks/seller_customer_index_html.mjs').then(m => m.default)},
    'seller/products/index.html': {size: 14581, hash: 'c2075ad9ad8337eeaad52ad80e44f0c25b4c0dec8b2daeded3916c23d8f7dd5d', text: () => import('./assets-chunks/seller_products_index_html.mjs').then(m => m.default)},
    'styles-5INURTSO.css': {size: 0, hash: 'menYUTfbRu8', text: () => import('./assets-chunks/styles-5INURTSO_css.mjs').then(m => m.default)}
  },
};
