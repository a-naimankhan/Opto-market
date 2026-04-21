
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
    'index.csr.html': {size: 440, hash: '1734414935d7dbb3af8a706be195e45e5fbdf26af3847d8a2ad2f1fa4a5ee37e', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 953, hash: 'c7559358c77b917c1e51705ad2417fc6376dcc405116f3e318130f41614dc400', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'buyer/orders/index.html': {size: 321, hash: 'b2c252f38ac377d1835bed21b47f19bfb9355dbe8c64dbbd625f839f6b4570e1', text: () => import('./assets-chunks/buyer_orders_index_html.mjs').then(m => m.default)},
    'buyer/checkout/index.html': {size: 327, hash: '353dfb1e6e490260bf736425e502f599e4f17dcbbef2e362b7a975766e0fdf9c', text: () => import('./assets-chunks/buyer_checkout_index_html.mjs').then(m => m.default)},
    'login/index.html': {size: 5833, hash: '7de83795d67cec52966f3b93761614e52d18d4457fdf0afe2b00dbfc364623e0', text: () => import('./assets-chunks/login_index_html.mjs').then(m => m.default)},
    'buyer/cart/index.html': {size: 315, hash: '229f6c3ef6b84203fff76681f6a4a9cc628657df9b33eb73259ae1118e87ade1', text: () => import('./assets-chunks/buyer_cart_index_html.mjs').then(m => m.default)},
    'seller/order/index.html': {size: 10533, hash: '6169aaabdc80d726ee343f345d21d1691a405b36ac34ca33b44380053dd4558c', text: () => import('./assets-chunks/seller_order_index_html.mjs').then(m => m.default)},
    'seller/customer/index.html': {size: 9775, hash: '5f93213b438e6991d0e1d5293e43c7596d962a64ee18acc607d3cc96c3300817', text: () => import('./assets-chunks/seller_customer_index_html.mjs').then(m => m.default)},
    'seller/categories/index.html': {size: 11821, hash: 'f09e255236d852cff74e0a22c09c149c7a0c3be11121ffc40ddfb766b633903b', text: () => import('./assets-chunks/seller_categories_index_html.mjs').then(m => m.default)},
    'index.html': {size: 18528, hash: '7bff50dafabc61e1d54fec2dc8b0437babff67de433fb6186c0f714bf7c5fe93', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'buyer/category-products/index.html': {size: 2221, hash: '2ca3f72eba3dbdcacfd021bc94f42f97cca61847a72c8acc1d84591f908781b2', text: () => import('./assets-chunks/buyer_category-products_index_html.mjs').then(m => m.default)},
    'seller/products/index.html': {size: 12977, hash: 'd4437b738f79681559c08133710cdc707507de2af60e9ba7afcbfeb6fe8c8bc6', text: () => import('./assets-chunks/seller_products_index_html.mjs').then(m => m.default)},
    'buyer/index.html': {size: 18528, hash: '7bff50dafabc61e1d54fec2dc8b0437babff67de433fb6186c0f714bf7c5fe93', text: () => import('./assets-chunks/buyer_index_html.mjs').then(m => m.default)},
    'seller/cart/index.html': {size: 6022, hash: '0a258220301528ca052354a055eb84919f5c16ff3f84575f19c6201d2c442e17', text: () => import('./assets-chunks/seller_cart_index_html.mjs').then(m => m.default)},
    'styles-5INURTSO.css': {size: 0, hash: 'menYUTfbRu8', text: () => import('./assets-chunks/styles-5INURTSO_css.mjs').then(m => m.default)}
  },
};
