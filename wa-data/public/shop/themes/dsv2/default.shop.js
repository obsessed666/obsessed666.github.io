$(document).ready(function () {
    
    if ($('.product-items').length && $('.autobadge-pl').length) {
        $('.autobadge-pl').each(function() {
           $(this).closest("li").find('form').change(); 
        });
    }
    
    //sliders
    $('.homepage-bxslider').bxSlider( { auto : true, pause : 5000, autoHover : true, pager: true });
    $('.related-bxslider').bxSlider( { minSlides: 1, maxSlides: 4, slideWidth: 150, slideMargin: 10, infiniteLoop: false, pager: false });

    //cart update
    $(".container,.slider").on('submit', '.product-list form.addtocart', function () {
        var f = $(this);
        if (f.data('url')) {
            var d = $('#dsvdialog');
            var c = d.find('.modal-body');
            var title = d.find('.modal-title'), header = d.find('.modal-header');
            var image = f.closest('li').find('.image').html();
            c.load(f.data('url'), function () {
                d.modal('show');
                title.html(f.data('name'));
                d.find('.modal-image').html(image);
            });
            return false;
        }
        $.post(f.attr('action') + '?html=1', f.serialize(), function (response) {
            if (response.status == 'ok') {
                var cart_total = $(".cart-total");
                var cart_count = $(".cart-count");
                cart_total.closest('#cart').addClass('highlight');
                cart_total.html(response.data.total);
                cart_count.html(response.data.count);
                f.find('button[type="submit"]').hide();
                f.find('span.added2cart').show();
                if($('.flying-cart').length){
                    var item = $("#cart-content .row[data-id='"+response.data.item_id+"']");
                    var count = parseInt(f.find('input[name="quantity"]').val()) || 1;
                    var fcart_total = $('.flying-cart').find('.fcart-total');
                    fcart_total.html(response.data.total);
                    if(item.length){
                        var qty = item.find('.fcart-qty');
                        count += parseInt(qty.val());
                        qty.val(count);
                        item.find('.fcart-price').html(currency_format(f.find('.fcart').data("price")*count, 1, $.dsv.currency));
                    } else {
                        f.find('.row').attr("data-id",response.data.item_id);
                        $('#cart-content').prepend(f.find('.fcart').html());
                    }
                    $('.flying-cart').scrollTop( $('.flying-cart .row[data-id="'+response.data.item_id+'"]').position().top );
                }
                myPopover($("#cart"),'В корзине');
            } else if (response.status == 'fail') {
                alert(response.errors);
            }
        }, "json");
        return false;
    });


    var f = function () {
        //product filtering
        var ajax_form_callback = function (f) {
            var fields = f.serializeArray();
            var params = [];
            for (var i = 0; i < fields.length; i++) {
                if (fields[i].value !== '') {
                    params.push(fields[i].name + '=' + fields[i].value);
                }
            }
            var url = '?' + params.join('&');
            $(window).lazyLoad && $(window).lazyLoad('sleep');
            $('#product-list').html('<i class="fa fa-spinner fa-spin fa-2x theme-color"></i>');
            $.get(url, function(html) {
                var tmp = $('<div></div>').html(html);
                $('#product-list').html(tmp.find('#product-list').html());
                if (!!(history.pushState && history.state !== undefined)) {
                    window.history.pushState({}, '', url);
                }
                $(window).lazyLoad && $(window).lazyLoad('reload');
                if (typeof $.autobadgeFrontend !== 'undefined') {
    $.autobadgeFrontend.reinit();
} 
            });
        };

        $('.filters.ajax form input').change(function () {
            ajax_form_callback($(this).closest('form'));
        });
        $('.filters.ajax form').submit(function () {
            ajax_form_callback($(this));
            $('#filterDialog').modal('hide');
            return false;
        });

        $('.filters .slider').each(function () {
            if (!$(this).find('.filter-slider').length) {
                $(this).append('<div class="filter-slider"></div>');
            } else {
                return;
            }
            var min = $(this).find('.min');
            var max = $(this).find('.max');
            var min_value = parseFloat(min.attr('placeholder'));
            var max_value = parseFloat(max.attr('placeholder'));
            var step = 1;
            var slider = $(this).find('.filter-slider');
            if (slider.data('step')) {
                step = parseFloat(slider.data('step'));
            } else {
                var diff = max_value - min_value;
                if (Math.round(min_value) != min_value || Math.round(max_value) != max_value) {
                    step = diff / 10;
                    var tmp = 0;
                    while (step < 1) {
                        step *= 10;
                        tmp += 1;
                    }
                    step = Math.pow(10, -tmp);
                    tmp = Math.round(100000 * Math.abs(Math.round(min_value) - min_value)) / 100000;
                    if (tmp && tmp < step) {
                        step = tmp;
                    }
                    tmp = Math.round(100000 * Math.abs(Math.round(max_value) - max_value)) / 100000;
                    if (tmp && tmp < step) {
                        step = tmp;
                    }
                }
            }
            slider.slider({
                range: true,
                min: parseFloat(min.attr('placeholder')),
                max: parseFloat(max.attr('placeholder')),
                step: step,
                values: [parseFloat(min.val().length ? min.val() : min.attr('placeholder')),
                    parseFloat(max.val().length ? max.val() : max.attr('placeholder'))],
                slide: function( event, ui ) {
                    var v = ui.values[0] == $(this).slider('option', 'min') ? '' : ui.values[0];
                    min.val(v);
                    v = ui.values[1] == $(this).slider('option', 'max') ? '' : ui.values[1];
                    max.val(v);
                },
                stop: function (event, ui) {
                    min.change();
                }
            });
            min.add(max).change(function () {
                var v_min =  min.val() === '' ? slider.slider('option', 'min') : parseFloat(min.val());
                var v_max = max.val() === '' ? slider.slider('option', 'max') : parseFloat(max.val());
                if (v_max >= v_min) {
                    slider.slider('option', 'values', [v_min, v_max]);
                }
            });
        });
    };
    f();

    $(".crosselling ul").bxSlider({
        auto: false, /*авто прокрутка*/
        speed: 1000,
        pause: 4000,
        minSlides: 1,
        maxSlides: 5,
        slideWidth: 215,
        slideMargin: 5,
        moveSlides: 1, /*количество товаров при прокрутке*/
        nextSelector: '#cross-next',
        prevSelector: '#cross-prev',
        nextText: '<i class="fa fa-angle-right fa-lg"></i>',
        prevText: '<i class="fa fa-angle-left fa-lg"></i>',
        pager: false,
        responsive: true,
        infiniteLoop: true /*зацикливание*/
    });

    $(".upselling ul").bxSlider({
        auto: false, /*авто прокрутка*/
        speed: 1000,
        pause: 4000,
        minSlides: 1,
        maxSlides: 5,
        slideWidth: 215,
        slideMargin: 5,
        moveSlides: 1, /*количество товаров при прокрутке*/
        nextSelector: '#upsell-next',
        prevSelector: '#upsell-prev',
        nextText: '<i class="fa fa-angle-right fa-lg"></i>',
        prevText: '<i class="fa fa-angle-left fa-lg"></i>',
        pager: false,
        responsive: true,
        infiniteLoop: true /*зацикливание*/
    });

    $('.carousel').carousel();

    $(document).on("click",".product-view button",function() {
        var btn = $(this);
        if(btn.hasClass('active')) return false;
        $(".product-view button").removeClass('active');
        btn.addClass("active");
        if (btn.data("view") == 'thumbs') {
            $(".product-items").addClass("thumbs").removeClass("list");
            $.cookie('product_view', 'thumbs', { expires: 30, path: '/'});
        } else if (btn.data("view") == 'list') {
            $(".product-items").addClass("list").removeClass("thumbs");
            $.cookie('product_view', 'list', { expires: 30, path: '/'});
        }
    });

    $('#filterDialog').on('show.bs.modal', function() {
        $('.filters').appendTo('#filterDialog .modal-body');
    })

    $("#compare-remove-all").click(function () {
        $.cookie('shop_compare', null, { expires: 0, path: '/'});
    });


    $(document).on("click",".favourite",function() {
        var wishlist = $.cookie('dsv_wishlist');
        if (wishlist) {
            wishlist = wishlist.split(',');
        } else {
            wishlist = [];
        }
        var i = $.inArray($(this).data('product') + '', wishlist);
        if (i != -1) {
            wishlist.splice(i, 1);
        }
        
        if ($(".product-links").length) {
            var title = $(this).find('span');
        }
        if (!$(this).hasClass("active")) {
            wishlist.push($(this).data('product'));
            
            if($(".product-links").length){
                $(this).addClass("active");
                title.text('Удалить из избранного');
            }
            else {
                $(this).closest('li').find('.favourite span').text('Удалить из избранного')
                $(this).closest('li').find('.favourite').addClass('active');
            }
            myPopover($("#count-wishlist"),'В избранном');
            
            $.cookie('dsv_wishlist', wishlist.join(','), { expires: 30, path: '/' });
        } else {
            if (wishlist.length) {
                $.cookie('dsv_wishlist', wishlist.join(','), { expires: 30, path: '/' });
            } else {
                $.cookie('dsv_wishlist', null, { expires: 30, path: '/' });
            }
            if($(".product-links").length){
                title.text("Добавить в избранное");
                $(this).removeClass("active");
            }
            else {
                $(this).closest('li').find('.favourite span').text("Добавить в избранное");
                $(this).closest('li').find('.favourite').removeClass('active');
            }
            
        }
        if(wishlist.length){
            $("#count-wishlist").addClass("highlight")
            $("#count-wishlist .count").html(wishlist.length);
        }
        else {
            $("#count-wishlist").removeClass("highlight")
            $("#count-wishlist .count").html('0');
        }
        return false;
    });

    $(document).on("click", ".addtocompare", function() {
        var shop_url = $.dsv.shop_url;
        var compare = $.cookie('shop_compare');
        if (compare) {
            compare = compare.split(',');
        } else {
            compare = [];
        }
        var i = $.inArray($(this).data('product') + '', compare);
        if (i != -1) {
            compare.splice(i, 1);
        }
        if (!$(this).hasClass("active")) {
            if ($('#count-compare').hasClass("highlight")) {
                var href = $("#count-compare a").attr('href');
                var url = href.substr(0, href.length - 1) + ',' + $(this).data('product') + '/';
            } else {
                var url = shop_url + 'compare/' + $(this).data('product') + '/';
            }
            compare.push($(this).data('product'));
            $(this).closest('li').find('.addtocompare').addClass("active")
            $(this).closest('li').find('.addtocompare span').text('Удалить из сравнения');
            $(this).closest('li').find('span.addtocompare').attr('title', 'Удалить из сравнения');

            $("#count-compare").addClass("highlight").find(".count").html(compare.length);
            myPopover($("#count-compare"),'В сравнении');
            $.cookie('shop_compare', compare.join(','), { expires: 30, path: '/'});
        } else {
            if (compare.length == 0) {
                var url = 'javascript:void(0)';
                $('#count-compare').removeClass('highlight').find('.count').html(compare.length);
                /*$('#count-compare a').attr('href',url);*/
                $.cookie('shop_compare', null, {expires: 30, path: '/'});
            } else {
                var url = shop_url + 'compare/' + compare.join(',') + '/';
                $('#count-compare').find('.count').html(compare.length);
                /*$('#count-compare a').attr('href',url);*/
                $.cookie('shop_compare', compare.join(','), {expires: 30, path: '/'});
            }
            $(this).closest('li').find('.addtocompare').removeClass("active");
            $(this).closest('li').find('.addtocompare span').text('Добавить к сравнению');
            $(this).closest('li').find('span.addtocompare').attr('title', 'Добавить к сравнению');
        }
        $("#count-compare a").attr('href',url);
        return false;
    });

    $(".accordion-group").on('hidden.bs.collapse', function(){
        $(this).find('.fa').removeClass('fa-chevron-circle-up').addClass('fa-chevron-circle-down');
    });
    $(".accordion-group").on('shown.bs.collapse', function(){
        $(this).find('.fa').removeClass('fa-chevron-circle-down').addClass('fa-chevron-circle-up');
    });

    $(document).on("click","a.minus",function(){
        var qty = $(this).closest('.qty');
        var data = qty.find('input').val();
        if(data >= 2){qty.find('input').val(parseInt(data) - 1).change();}
        return false;
    });
    $(document).on("click","a.plus",function(){
        var qty = $(this).closest('.qty');
        var data = qty.find('input').val();
        qty.find('input').val(parseInt(data) + 1).change();
        return false;
    });

    $('.currencies a').click(function(){
        var url = location.href;
        if (url.indexOf('?') == -1) {url += '?';}
        else {url += '&';}
        location.href = url + 'currency=' + $(this).data("crcy");
    })

    $('.product-count a').click(function(){
        if(!$(this).hasClass('active')){
            if($(this).data('perpage')){
                $.cookie('products_per_page', $(this).data('perpage'), { expires: 30, path: '/'});
                $.cookie('lazyppp', '', { expires: 0, path: '/'}); 
            }
            else {
                $.cookie('products_per_page', '', { expires: 0, path: '/'});
                $.cookie('lazyppp', '1', { expires: 30, path: '/'});
                document.location = $(this).data('href');
                return false;
            }
            document.location = location.href;    
        } 
        return false;
    })

    var cat = $('.category-description');
    if(cat.length){
        var descHeight = "130px";
        cat.each(function () {
            var current = $(this);
            current.attr("box_h", current.height());
        });
        cat.css("height", descHeight);
        $('#cat-readmore').click(function() { 
            if(cat.hasClass('trunc'))
            {
                var open_height = cat.attr("box_h") + "px";
                cat.animate({"height": open_height}, {duration: "slow" });
                cat.removeClass('trunc')
            } else {
                cat.animate({"height": descHeight}, {duration: "slow" });
                cat.addClass('trunc');
            }
        }) 
    }
    
    $(document).on("click",".quickoverview",function(){
        var d = $('#dsvoverview');
        var c = d.find('.modal-body');
        var product_url = $(this).data('url');
        $.ajax({
          url: product_url,
        }).done(function ( data ) {
          c.html($(data).find('.product-page').html());
          d.modal('show');
        });
        return false;
    });

    if($('#dsvoverview').hasClass('zoom')){
        $('#dsvoverview').on('shown.bs.modal', function() {
            $("#product-image").elevateZoom({
                gallery:'product-gallery',
                galleryActiveClass:'active',
                cursor:"crosshair",
                zoomType:"lens",
                lensShape:"round",
                lensSize:200
            });
        })
        $('#dsvoverview').on('hidden.bs.modal', function (e) {
            $.removeData(jQuery('#product-image'), 'elevateZoom');
            $('.zoomContainer').remove();
        });
    }

    $(".product-gallery .fancybox-button").fancybox({
        groupAttr:'data-rel',
        prevEffect:'none',
        nextEffect: 'none',
        closeBtn: true,
        helpers: {
            title: {
                type: 'inside'
            }
        },
        beforeShow: function () {
            this.title = (this.title ? '' + this.title + '<br />' : '') + 'Изображение ' + (this.index + 1) + ' из ' + this.group.length;
        }
    });

    $(".product-items .fancybox-button").fancybox({prevEffect:'none',nextEffect:'none',closeBtn:true});

    $("#sidebar-nav .active").parents("ul.collapse[id^='sidebarcat']").addClass('in');

    //LAZYLOADING
    if ($.fn.lazyLoad) {
        var paging = $('.lazyloading-paging');
        if (!paging.length) {
            return;
        }

        var times = parseInt(paging.data('times'), 10);
        var link_text = paging.data('linkText') || 'Load more';
        var loading_str = paging.data('loading-str') || 'Loading...';

        // check need to initialize lazy-loading
        var current = paging.find('li.selected');
        if (current.children('a').text() != '1') {
            return;
        }
        paging.hide();
        var win = $(window);

        // prevent previous launched lazy-loading
        win.lazyLoad('stop');

        // check need to initialize lazy-loading
        var next = current.next();
        if (next.length) {
            win.lazyLoad({
                container: '#product-list .product-list',
                load: function () {
                    win.lazyLoad('sleep');

                    var paging = $('.lazyloading-paging').hide();

                    // determine actual current and next item for getting actual url
                    var current = paging.find('li.selected');
                    var next = current.next();
                    var url = next.find('a').attr('href');
                    if (!url) {
                        win.lazyLoad('stop');
                        return;
                    }

                    var product_list = $('#product-list .product-list');
                    var loading = paging.parent().find('.loading').parent();
                    if (!loading.length) {
                        loading = $('<div><i class="icon16 loading"></i>'+loading_str+'</div>').insertBefore(paging);
                    }

                    loading.show();
                    $.get(url, function (html) {
                        var tmp = $('<div></div>').html(html);
                        if ($.Retina) {
                            tmp.find('#product-list .product-list img').retina();
                        }
                        product_list.append(tmp.find('#product-list .product-list').children());
                        var tmp_paging = tmp.find('.lazyloading-paging').hide();
                        paging.replaceWith(tmp_paging);
                        paging = tmp_paging;

                        times -= 1;

                        // check need to stop lazy-loading
                        var current = paging.find('li.selected');
                        var next = current.next();
                        if (next.length) {
                            if (!isNaN(times) && times <= 0) {
                                win.lazyLoad('sleep');
                                if (!$('.lazyloading-load-more').length) {
                                    $('<a href="#" class="lazyloading-load-more">' + link_text + '</a>').insertAfter(paging)
                                        .click(function () {
                                            loading.show();
                                            times = 1;      // one more time
                                            win.lazyLoad('wake');
                                            win.lazyLoad('force');
                                            if (typeof $.autobadgeFrontend !== 'undefined') {
    $.autobadgeFrontend.reinit();
}
                                            return false;
                                        });
                                }
                            } else {
                                win.lazyLoad('wake');
                            }
                        } else {
                            win.lazyLoad('stop');
                            $('.lazyloading-load-more').hide();
                        }

                        loading.hide();
                        tmp.remove();
                        if (typeof $.autobadgeFrontend !== 'undefined') {
    $.autobadgeFrontend.reinit();
} 
                    });
                }
            });
        }
    }
});

function currency_format(number, no_html, currency) {

    // Format a number with grouped thousands
    //
    // +   original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +     bugfix by: Michael White (http://crestidg.com)

    var i, j, kw, kd, km;
    var decimals = currency.frac_digits;
    var dec_point = currency.decimal_point;
    var thousands_sep = currency.thousands_sep;

    // input sanitation & defaults
    if( isNaN(decimals = Math.abs(decimals)) ){
        decimals = 2;
    }
    if( dec_point == undefined ){
        dec_point = ",";
    }
    if( thousands_sep == undefined ){
        thousands_sep = ".";
    }

    i = parseInt(number = (+number || 0).toFixed(decimals)) + "";

    if( (j = i.length) > 3 ){
        j = j % 3;
    } else{
        j = 0;
    }

    km = (j ? i.substr(0, j) + thousands_sep : "");
    kw = i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands_sep);
    //kd = (decimals ? dec_point + Math.abs(number - i).toFixed(decimals).slice(2) : "");
    kd = (decimals && (number - i) ? dec_point + Math.abs(number - i).toFixed(decimals).replace(/-/, 0).slice(2) : "");


    var number = km + kw + kd;
    var s = (no_html!=1) ? currency.sign : currency.sign_html;
    if (!currency.sign_position) {
        return s + currency.sign_delim + number;
    } else {
        return number + currency.sign_delim + s;
    }
}

function myPopover(elem, message){
    elem.popover({ content : message });
    elem.popover('toggle');
    setTimeout(function() {
        elem.popover('hide');
    }, 1000);
}