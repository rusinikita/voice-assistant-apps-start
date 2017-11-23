'use strict';

module.exports = Object.freeze({
    DB_PATH: {
        DRINKS: {
            BEER: 'drinks/beer/'
        },
        SNACKS: 'snacks/'
    },
    ACTION_WELCOME: 'input.welcome',
    ACTION_GET_BEER_ON_TAPS: 'get_beer.on_taps',
    ACTION_GET_BEER_ON_TAPS_FALLBACK: 'get_beer.on_taps.fallback',
    ACTION_GET_BEER_ON_TAPS_FILTER: 'get_beer.on_taps.filter',
    ACTION_GET_BEER_ON_TAPS_FILTER_FALLBACK: 'get_beer.on_taps.filter.fallback',
    ACTION_GET_BEER_ON_TAPS_FILTER_PAGINATION: 'get_beer.on_taps.filter.pagination',
    ACTION_GET_BEER_ON_TAPS_FILTER_ORDER: 'get_beer.on_taps.filter.accept_order',
    ACTION_GET_BEER_ON_TAPS_FILTER_ORDER_YES: 'get_beer.on_taps.filter.accept_order.yes',
    ACTION_GET_BEER_ON_TAPS_FILTER_ORDER_NO: 'get_beer.on_taps.filter.accept_order.no',
    ACTION_GET_BEER_ON_TAPS_FILTER_ORDER_FALLBACK: 'get_beer.on_taps.filter.accept_order.fallback',
    ACTION_GET_BEER_ON_TAPS_FILTER_CANCEL: 'get_beer.on_taps.filter.cancel_order',

    ACTION_GET_BEER_BY_BRAND: 'get_beer.by_brand',
    ACTION_GET_BEER_BY_BRAND_FALLBACK: 'get_beer.by_brand.fallback',
    ACTION_GET_BEER_BY_BRAND_CANCEL: 'get_beer.by_brand.cancel_order',
    ACTION_GET_BEER_BY_BRAND_ORDER: 'get_beer.by_brand.accept_order',

    ACTION_GET_BEER_BY_PROPERTIES: 'get_beer.by_properties',
    ACTION_GET_BEER_BY_PROPERTIES_FALLBACK: 'get_beer.by_properties.fallback',
    ACTION_GET_BEER_BY_PROPERTIES_CANCEL: 'get_beer.by_properties.cancel_order',
    ACTION_GET_BEER_BY_PROPERTIES_ORDER: 'get_beer.by_properties.accept_order',

    ACTION_GET_BEER_BY_QUESTION: 'get_beer.by_question',

    ARGUMENT_BEER_PROPERTIES: 'beer_properties',
    ARGUMENT_FILTERED_BEER: 'filtered_beer',
    ARGUMENT_CURRENT_BEER_INFO: 'current_beer_info',
    ARGUMENT_LIST_DIRECTION: 'list_direction',
    ARGUMENT_PAGE_COUNT: 'page_count',
    ARGUMENT_MAX_PROPERTIES: 'max_properties',
    ARGUMENT_DRINK_BRAND: 'drink_brand',
    ARGUMENT_DRINK_COST: 'drink_cost',
    ARGUMENT_DRINK_ORDINAL: 'drink_ordinal',
    ARGUMENT_DRINK_LITERS: 'drink_liters',
    ARGUMENT_SNACKS: 'snacks',

    CONTEXT_GET_BEER_ON_TAPS_FILTER: 'get_beer-on_taps-filter-followup',
    CONTEXT_GET_BEER_ON_TAPS_FILTER_ORDER: 'get_beer-on_taps-filter-order-followup',
    CONTEXT_GET_BEER_BY_BRAND: 'get_beer-by_brand-followup',
    CONTEXT_GET_BEER_BY_PROPERTIES: 'get_beer-by_properties-followup',
    CONTEXT_BEER_INFO: 'beer_info',
    CONTEXT_SHOW_BEER_ORDER_SUM: 'show_beer_order_sum'
});