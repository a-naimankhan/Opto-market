
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
    'index.csr.html': {size: 435, hash: '75ba31ebb304f092cacd99732a4f8a4a12ffbe9ab0d79a713ae2c007402b5291', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 948, hash: '05cfc327bc0d501f84faf57dec35abc83afa97d8aec0189ec69502c4390c41c6', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'buyer/orders/index.html': {size: 321, hash: 'b2c252f38ac377d1835bed21b47f19bfb9355dbe8c64dbbd625f839f6b4570e1', text: () => import('./assets-chunks/buyer_orders_index_html.mjs').then(m => m.default)},
    'buyer/checkout/index.html': {size: 327, hash: '353dfb1e6e490260bf736425e502f599e4f17dcbbef2e362b7a975766e0fdf9c', text: () => import('./assets-chunks/buyer_checkout_index_html.mjs').then(m => m.default)},
    'login/index.html': {size: 6114, hash: 'd048b2d5c040ecc571fcc2bb484612beec80c5c7ac6be3d4176a61f8c39b7969', text: () => import('./assets-chunks/login_index_html.mjs').then(m => m.default)},
    'buyer/cart/index.html': {size: 315, hash: '229f6c3ef6b84203fff76681f6a4a9cc628657df9b33eb73259ae1118e87ade1', text: () => import('./assets-chunks/buyer_cart_index_html.mjs').then(m => m.default)},
    'seller/categories/index.html': {size: 14311, hash: '1e63d4422203f30168a3a062e89014ad1c8099961215decd125273a2cb37d164', text: () => import('./assets-chunks/seller_categories_index_html.mjs').then(m => m.default)},
    'seller/order/index.html': {size: 11129, hash: 'c9e9a37675952b63e8978c31c3b89494c6d23130477a7d46b773566314c0ce3a', text: () => import('./assets-chunks/seller_order_index_html.mjs').then(m => m.default)},
    'index.html': {size: 21818, hash: '26631e7f947e5ccd234bcec7874b5a007981ea8f2186f56e85a72f7fb673ac89', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'buyer/index.html': {size: 21818, hash: '26631e7f947e5ccd234bcec7874b5a007981ea8f2186f56e85a72f7fb673ac89', text: () => import('./assets-chunks/buyer_index_html.mjs').then(m => m.default)},
    'seller/customer/index.html': {size: 10583, hash: 'c9d80674bf2e2a1ae5fe15cbe80b39d705a2fa74be27e70e1cc4060b3b26ed53', text: () => import('./assets-chunks/seller_customer_index_html.mjs').then(m => m.default)},
    'buyer/category-products/index.html': {size: 2218, hash: '98da7bd3e42c0be185772475302870b6f9c9e34f9d9602c542fb9fef21d5519c', text: () => import('./assets-chunks/buyer_category-products_index_html.mjs').then(m => m.default)},
    'seller/cart/index.html': {size: 6619, hash: '09bc252517c153c25e5bae6a327e72c208b5139fcaef0848bc8d8d028efef707', text: () => import('./assets-chunks/seller_cart_index_html.mjs').then(m => m.default)},
    'seller/products/index.html': {size: 15456, hash: '832d8d05555588886b52455cc6eaa3dc726593d345b51102d9ae64ef709b0be9', text: () => import('./assets-chunks/seller_products_index_html.mjs').then(m => m.default)},
    'styles-5INURTSO.css': {size: 0, hash: 'menYUTfbRu8', text: () => import('./assets-chunks/styles-5INURTSO_css.mjs').then(m => m.default)}
  },
};
