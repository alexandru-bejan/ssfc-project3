'use strict';

var base = require('base/product/detail');

/**
 * Update global add to cart button
 */
function updateGlobalAddToCart() {
    $(document).ready(function (e, response) {
        var enable = $('.product-availability').toArray().every(function (item) {
            return $(item).data('available') && $(item).data('ready-to-order');
        });
        base.methods.updateAddToCartEnableDisableOtherElements(!enable);
    })
}

/**
 * Add product id to details and description accordions
 */

function detailsAndDescriptionPid() {
    $(document).ready(function () {
        $('.accBody').each(function () {
            let prodId = $(this).attr('id');
            $(this).parent().find($('a')).attr('href', '#' + prodId)
        })
    })
}

function showStickyAddToCart() {
    $(document).ready(function () {
        $(window).bind('scroll', function (event) {
            var win = $(this),
                doc = $(document),
                winH = win.height(),
                winT = win.scrollTop(),
                docH = doc.height(),
                elH = $('.product-bundle').height() - 100;
            if (docH - winH - winT < elH) {
                $('.sticky-add-to-cart').css("right", "5%");
            } else {
                $('.sticky-add-to-cart').css("right", "-20%");
            }
        });
    });
}

base.updateGlobalAddToCart = updateGlobalAddToCart;
base.detailsAndDescriptionPid = detailsAndDescriptionPid;
base.showStickyAddToCart = showStickyAddToCart;

module.exports = base;