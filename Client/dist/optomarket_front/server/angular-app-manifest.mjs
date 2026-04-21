
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
    'index.csr.html': {size: 435, hash: 'bb2c07e8882960227f6203fc4018c1d3421b2f1bb148c02c62187fa2982e71a0', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 948, hash: 'd951e388fb4e35bc094493c0126d04dc36437b3c7949c361c1c7d2292181032e', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'buyer/orders/index.html': {size: 321, hash: 'b2c252f38ac377d1835bed21b47f19bfb9355dbe8c64dbbd625f839f6b4570e1', text: () => import('./assets-chunks/buyer_orders_index_html.mjs').then(m => m.default)},
    'buyer/checkout/index.html': {size: 327, hash: '353dfb1e6e490260bf736425e502f599e4f17dcbbef2e362b7a975766e0fdf9c', text: () => import('./assets-chunks/buyer_checkout_index_html.mjs').then(m => m.default)},
    'login/index.html': {size: 6114, hash: '000e57a7510341151547cf7d1d84e4c3b14625e041f1ab46dcb77de929d8d5b4', text: () => import('./assets-chunks/login_index_html.mjs').then(m => m.default)},
    'buyer/cart/index.html': {size: 315, hash: '229f6c3ef6b84203fff76681f6a4a9cc628657df9b33eb73259ae1118e87ade1', text: () => import('./assets-chunks/buyer_cart_index_html.mjs').then(m => m.default)},
    'seller/order/index.html': {size: 10528, hash: '6c078779e54180ba67122d10f409bff6d2efbedfc0ca09bea5fe8417c866936d', text: () => import('./assets-chunks/seller_order_index_html.mjs').then(m => m.default)},
    'seller/categories/index.html': {size: 13888, hash: '0d81d8662632d5105ccdacec61e77b69825a3db5269cc38e6153fe4c98282bad', text: () => import('./assets-chunks/seller_categories_index_html.mjs').then(m => m.default)},
    'index.html': {size: 20402, hash: 'bf07526f8437e6e25adc8474328b7cbef3e86ab6ba021d83f145be6527f7f239', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'buyer/index.html': {size: 20402, hash: 'bf07526f8437e6e25adc8474328b7cbef3e86ab6ba021d83f145be6527f7f239', text: () => import('./assets-chunks/buyer_index_html.mjs').then(m => m.default)},
    'buyer/category-products/index.html': {size: 2218, hash: '836b0609ed6f725628d0be44df7d8d0d255e2815f32c72c5cec264daf22027dc', text: () => import('./assets-chunks/buyer_category-products_index_html.mjs').then(m => m.default)},
    'seller/customer/index.html': {size: 9770, hash: 'b4437e7b73301a8a2bc0efc98a8da6e182bc8976546aa50d321a2d465a240567', text: () => import('./assets-chunks/seller_customer_index_html.mjs').then(m => m.default)},
    'seller/products/index.html': {size: 15372, hash: 'f8cbdb9c088223420806441a9698d1307ab70565bd162c15005e1caf4c1532df', text: () => import('./assets-chunks/seller_products_index_html.mjs').then(m => m.default)},
    'seller/cart/index.html': {size: 6017, hash: '0b7a8f6f60d3e89dc7a0299c359721e1b43cf9794f213d5bf4ce44b2833362f2', text: () => import('./assets-chunks/seller_cart_index_html.mjs').then(m => m.default)},
    'styles-5INURTSO.css': {size: 0, hash: 'menYUTfbRu8', text: () => import('./assets-chunks/styles-5INURTSO_css.mjs').then(m => m.default)}
  },
};
