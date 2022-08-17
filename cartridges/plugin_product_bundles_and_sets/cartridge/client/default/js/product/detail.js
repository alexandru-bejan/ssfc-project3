'use strict';

var base = require('base/product/detail');

/**
 * Update global add to cart button
 */
function updateGlobalAddToCart() {
    $(document).ready(function (e, response){
        var enable = $('.product-availability').toArray().every(function (item) {
            return $(item).data('available') && $(item).data('ready-to-order');
        });
        base.methods.updateAddToCartEnableDisableOtherElements(!enable);
    })
}

base.updateGlobalAddToCart = updateGlobalAddToCart;

module.exports = base;
