var race = require('race/product/quickView');

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

race.detailsAndDescriptionPid = detailsAndDescriptionPid;

module.exports = race;