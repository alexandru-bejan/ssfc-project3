'use strict';

let sfraBase = require('base/product/base');
let sfraDetail = require('base/product/detail');

/**
*Update global add to cart button
*/
function enableGlobalAddToCart() {
    $(document).ready(function (e, response) {
        sfraDetail.methods.updateAddToCartEnableDisableOtherElements(false);
    })
}

/**
* Manage invalid marks for sets at product variant selection
*/
function manageInvalidMarks() {
    $(document).ready(function (e, response) {
        manageInvalidMarkForSizeSelect();
        manageInvalidMarkForColorSelect();
    })
}

/**
* Manage invalid marks for sets at product size selection
*/
function manageInvalidMarkForSizeSelect() {
    $(".select-size").on('change', function () {
        if ($(this).val() != $(this).find("option:first-child").val() ) {
            $(this).removeClass("is-invalid")
        } else {
            $(this).addClass("is-invalid")
        }
    })
}

/**
* Manage invalid marks for sets at product color selection
*/
function manageInvalidMarkForColorSelect() {
    $(".attribute > :button").on("click", function () {
        if (($(this).find("span").hasClass("selectable") && !$(this).find("span").hasClass("selected")) ||
            ($(this).find("span").hasClass("unselectable") && $(this).parent().find("span").hasClass("selected"))){
            $(this).parent().css({ border: '' })
        } else {
            $(this).parent().css({
                border: "1px",
                "border-style": "solid",
                "border-color":"red"
            })
        }
    })
}

/**
 * Retrieve product options
 *
 * @param {jQuery} $productContainer - DOM element for current product
 * @return {string} - Product options and their selected values
 */
 function getOptions($productContainer) {
    var options = $productContainer
        .find('.product-option')
        .map(function () {
            var $elOption = $(this).find('.options-select');
            var urlValue = $elOption.val();
            var selectedValueId = $elOption.find('option[value="' + urlValue + '"]')
                .data('value-id');
            return {
                optionId: $(this).data('option-id'),
                selectedValueId: selectedValueId
            };
        }).toArray();

    return JSON.stringify(options);
}

/**
 * Retrieves url to use when adding a product to the cart
 *
 * @return {string} - The provided URL to use when adding a product to the cart
 */
 function getAddToCartUrl() {
    return $('.add-to-cart-url').val();
}

/**
 * Retrieves the bundle product item ID's for the Controller to replace bundle master product
 * items with their selected variants
 *
 * @return {string[]} - List of selected bundle product item ID's
 */
 function getChildProducts() {
    var childProducts = [];
    $('.bundle-item').each(function () {
        childProducts.push({
            pid: $(this).find('.product-id').text(),
            quantity: parseInt($(this).find('label.quantity').data('quantity'), 10)
        });
    });

    return childProducts.length ? JSON.stringify(childProducts) : [];
}

/**
 * Updates the Mini-Cart quantity value after the customer has pressed the "Add to Cart" button
 * @param {string} response - ajax response from clicking the add to cart button
 */
 function handlePostCartAdd(response) {
    $('.minicart').trigger('count:update', response);
    var messageType = response.error ? 'alert-danger' : 'alert-success';
    // show add to cart toast
    if (response.newBonusDiscountLineItem
        && Object.keys(response.newBonusDiscountLineItem).length !== 0) {
        sfraBase.methods.editBonusProducts(response.newBonusDiscountLineItem);
    } else {
        if ($('.add-to-cart-messages').length === 0) {
            $('body').append(
                '<div class="add-to-cart-messages"></div>'
            );
        }

        $('.add-to-cart-messages').append(
            '<div class="alert ' + messageType + ' add-to-basket-alert text-center" role="alert">'
            + response.message
            + '</div>'
        );

        setTimeout(function () {
            $('.add-to-basket-alert').remove();
        }, 5000);
    }
}

/**
 * Makes a call to the server to report the event of adding an item to the cart
 *
 * @param {string | boolean} url - a string representing the end point to hit so that the event can be recorded, or false
 */
 function miniCartReportingUrl(url) {
    if (url) {
        $.ajax({
            url: url,
            method: 'GET',
            success: function () {
                // reporting urls hit on the server
            },
            error: function () {
                // no reporting urls hit on the server
            }
        });
    }
}

function addToCart(){
    $(document).on('click', 'button.add-to-cart, button.add-to-cart-global', function () {
        let canBeOrdered = $('.product-availability').toArray().every(function (item) {
            return $(item).data('available') && $(item).data('ready-to-order');
        });

        if ($(this).hasClass("add-to-cart-global") && !canBeOrdered) {
            $(".select-size").each(function () {
                if ($(this).find(":selected").text() == $(this).find("option:first-child").text()) {
                    $(this).addClass("is-invalid")
                }
            })

            $(".color-attribute").each(function () {
                if ($(this).parent().find("span").hasClass("selected")) {
                    $(this).parent().css({ border: '' })
                } else {
                    $(this).parent().css({
                        border: "1px",
                        "border-style": "solid",
                        "border-color":"red"
                    })
                }
            })
        } else {
            var addToCartUrl;
            var pid;
            var pidsObj;
            var setPids;
    
            $('body').trigger('product:beforeAddToCart', this);
    
            if ($('.set-items').length && $(this).hasClass('add-to-cart-global')) {
                setPids = [];
    
                $('.product-detail').each(function () {
                    if (!$(this).hasClass('product-set-detail')) {
                        setPids.push({
                            pid: $(this).find('.product-id').text(),
                            qty: $(this).find('.quantity-select').val(),
                            options: getOptions($(this))
                        });
                    }
                });
                pidsObj = JSON.stringify(setPids);
            }
    
            pid = sfraBase.getPidValue($(this));
    
            var $productContainer = $(this).closest('.product-detail');
            if (!$productContainer.length) {
                $productContainer = $(this).closest('.quick-view-dialog').find('.product-detail');
            }
    
            addToCartUrl = getAddToCartUrl();
    
            var form = {
                pid: pid,
                pidsObj: pidsObj,
                childProducts: getChildProducts(),
                quantity: sfraBase.getQuantitySelected($(this))
            };
    
            if (!$('.bundle-item').length) {
                form.options = getOptions($productContainer);
            }
    
            $(this).trigger('updateAddToCartFormData', form);
            if (addToCartUrl) {
                $.ajax({
                    url: addToCartUrl,
                    method: 'POST',
                    data: form,
                    success: function (data) {
                        handlePostCartAdd(data);
                        $('body').trigger('product:afterAddToCart', data);
                        $.spinner().stop();
                        miniCartReportingUrl(data.reportingURL);
                    },
                    error: function () {
                        $.spinner().stop();
                    }
                });
            }
        }
    });
}

function showStickyAddToCart() {
    $(document).ready(function () {
        $(window).bind('scroll', function (event) {
            var win = $(this),
                doc = $(document),
                winH = win.height(),
                winT = win.scrollTop(),
                docH = doc.height();

            if ($('.product-bundle').length > 0) {
                var elH = $('.product-bundle').height() - 100;
            }

            if ($('.product-set').length > 0) {
                var elH = $('.product-set').height() - 100;
            }

            if (docH - winH - winT < elH) {
                $('.custom-sticky-prices-add-to-cart-actions').css("display", "block");
            } else {
                $('.custom-sticky-prices-add-to-cart-actions').css("display", "none");
            }
        });
    });
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

sfraDetail.enableGlobalAddToCart = enableGlobalAddToCart;
sfraDetail.manageInvalidMarks = manageInvalidMarks;
sfraDetail.showStickyAddToCart = showStickyAddToCart;
sfraDetail.detailsAndDescriptionPid = detailsAndDescriptionPid;

$('body').on("product:afterAttributeSelect", function () {
    $('button.add-to-cart-global').prop("disabled", false);
})

var exportDetails = $.extend({}, sfraBase, sfraDetail, {
    addToCart: addToCart
});

module.exports = exportDetails;