'use strict';

process.env.DEBUG = 'actions-on-google:*';
const functions = require('firebase-functions');
const Promise = require('promise');
const firebaseAdmin = require('firebase-admin');
const shuffle = require('shuffle-array');
const convert = require('convert-units')
const { sprintf } = require('sprintf-js');
const utils = require('../utils');

const consts = require('../consts');
const enums = require('../data/enums.json');
const ALL_DRINK_PROPERTIES = new Array()
    .concat(enums.BEER_COLOR, enums.BEER_FILTERING, enums.DRINK_ALCOHOLICITY, enums.DRINK_TASTE)
    .filter(item => item.code !== 'undefined')
const responses = require('../data/responses.json');

function showBeerOnTaps(app) {
    console.log("showBeerOnTaps")

    const maxProperties = app.getArgument(consts.ARGUMENT_MAX_PROPERTIES) || 2
    firebaseAdmin.database()
        .ref(consts.DB_PATH.DRINKS.BEER + "items")
        .once('value', (allBeerItemsSnap) => {
            const beerOnTaps = allBeerItemsSnap.val()
                .filter(beerItem => beerItem.is_on_tap && beerItem.liters_current > 0)
            console.log('beer on taps: ' + JSON.stringify(beerOnTaps))
            if (beerOnTaps.length === 0) {
                app.tell(shuffle(responses.SHOW_BEER_ON_TAPS.main.no_tap_beer)[0])
            } else {
                const propertiesAtChoice = shuffle(ALL_DRINK_PROPERTIES)
                    .map(prop => prop.name)
                    .slice(0, maxProperties)
                const propertiesMessage = utils.getMessageFromArray_(propertiesAtChoice, false)
                const successResponse = sprintf(shuffle(responses.SHOW_BEER_ON_TAPS.main.has_tap_beer)[0],
                    {
                        tap_beer_count: beerOnTaps.length,
                        beer_properties: propertiesMessage
                    })
                app.ask(successResponse)
            }
        })
}

function showBeerOnTapsFallback(app) {
    console.log("showBeerOnTapsFallback")
    app.ask(shuffle(responses.SHOW_BEER_ON_TAPS.fallback)[0])
}

function showFilteredBeerOnTaps(app) {
    console.log("showFilteredBeerOnTaps")

    const searchingBeerProperties = app
        .getArgument(consts.ARGUMENT_BEER_PROPERTIES)
        .map(el => {
            const firstFieldName = Object.keys(el)[0]
            return el[firstFieldName] ? el[firstFieldName] : el
        });
    console.log("filtered properties = " + JSON.stringify(searchingBeerProperties))

    const beerRef = firebaseAdmin.database()
        .ref(consts.DB_PATH.DRINKS.BEER + "items")
    const beerPropertiesRef = firebaseAdmin.database()
        .ref(consts.DB_PATH.DRINKS.BEER + "item_properties")

    const fallbackResponse = shuffle(responses.SHOW_BEER_ON_TAPS.filter.no_filtered_beer)[0]
    Promise.all([beerRef.once('value'), beerPropertiesRef.once('value')])
        .then(response => {
            var filteredBeerItems = utils.filterBeerByProperties_(response[0].val(), response[1].val(), searchingBeerProperties)
                .filter(beerItem => beerItem.is_on_tap && beerItem.liters_current > 0);
            filteredBeerItems = shuffle(filteredBeerItems)
            console.log("filtered beer items = " + JSON.stringify(filteredBeerItems))

            if (filteredBeerItems.length !== 0) {
                const firstFilteredBeer = filteredBeerItems[0]
                firstFilteredBeer.beer_index = filteredBeerItems.indexOf(firstFilteredBeer)
                console.log("first filtered beer = " + JSON.stringify(firstFilteredBeer))

                const lifespan = 5
                app.setContext(consts.CONTEXT_GET_BEER_ON_TAPS_FILTER, lifespan, {
                    [consts.ARGUMENT_FILTERED_BEER]: filteredBeerItems,
                    [consts.ARGUMENT_CURRENT_BEER_INFO]: firstFilteredBeer
                })
                const firstFilteredBeerPropertiesMessage = utils.getMessageFromArray_(firstFilteredBeer.properties.slice(0, 2))
                const successResponse = sprintf(shuffle(responses.SHOW_BEER_ON_TAPS.filter.has_filtered_beer)[0],
                    {
                        filtered_beer_brand: firstFilteredBeer.brand,
                        filtered_beer_properties: firstFilteredBeerPropertiesMessage,
                        filtered_beer_country: firstFilteredBeer.country,
                    })
                app.ask(successResponse)
            } else {
                app.ask(fallbackResponse)
            }
        })
        .catch(error => {
            console.log("Failed to filter beer = ", error)
            app.ask(fallbackResponse)
        });
}

function showFilteredBeerOnTapsFallback(app) {
    console.log("showFilteredBeerOnTapsFallback")
    app.ask(shuffle(responses.SHOW_BEER_ON_TAPS.filter.fallback)[0])
}

function showMoreFilteredBeerOnTaps(app) {
    console.log("showMoreFilteredBeerOnTaps")

    const filteredBeerItems = app.getContextArgument(consts.CONTEXT_GET_BEER_ON_TAPS_FILTER, consts.ARGUMENT_FILTERED_BEER).value
    const currentBeerInfo = app.getContextArgument(consts.CONTEXT_GET_BEER_ON_TAPS_FILTER, consts.ARGUMENT_CURRENT_BEER_INFO).value
    const listDirection = app.getArgument(consts.ARGUMENT_LIST_DIRECTION)
    const pageCount = app.getArgument(consts.ARGUMENT_PAGE_COUNT)

    const currentBeerPropertiesMessage = utils.getMessageFromArray_(currentBeerInfo.properties.slice(0, 2))

    console.log("filteredBeerItems = " + filteredBeerItems.length + ", " + JSON.stringify(filteredBeerItems))
    console.log("beforeBeerInfo = " + JSON.stringify(currentBeerInfo))
    const lifespan = 2
    if (filteredBeerItems.length == 1) {
        app.setContext(consts.CONTEXT_GET_BEER_ON_TAPS_FILTER, lifespan, {
            [consts.ARGUMENT_FILTERED_BEER]: filteredBeerItems,
            [consts.ARGUMENT_CURRENT_BEER_INFO]: currentBeerInfo
        })
        const successResponse = sprintf(shuffle(responses.SHOW_BEER_ON_TAPS.filter.show_more.one_beer)[0],
            {
                current_beer_brand: currentBeerInfo.brand,
                current_beer_properties: currentBeerPropertiesMessage
            })
        app.ask(successResponse)
    } else {
        const nextBeerIndex = utils.calculateNextIndex_(currentBeerInfo.beer_index, listDirection, filteredBeerItems.length - 1)
        const nextBeerInfo = filteredBeerItems[nextBeerIndex]
        nextBeerInfo.beer_index = nextBeerIndex
        app.setContext(consts.CONTEXT_GET_BEER_ON_TAPS_FILTER, lifespan, {
            [consts.ARGUMENT_FILTERED_BEER]: filteredBeerItems,
            [consts.ARGUMENT_CURRENT_BEER_INFO]: nextBeerInfo
        })

        const nextBeerPropertiesMessage = utils.getMessageFromArray_(nextBeerInfo.properties.slice(0, 2))
        const successResponse = sprintf(shuffle(responses.SHOW_BEER_ON_TAPS.filter.show_more.many_beer)[0],
            {
                current_beer_brand: currentBeerInfo.brand,
                next_beer_brand: nextBeerInfo.brand,
                next_beer_properties: nextBeerPropertiesMessage,
                next_beer_country: nextBeerInfo.country
            })
        app.ask(successResponse)
    }
}

function acceptOrderFilteredBeerOnTaps(app) {
    console.log("acceptOrderFilteredBeerOnTaps")

    const filteredBeerItems = app.getContextArgument(consts.CONTEXT_GET_BEER_ON_TAPS_FILTER, consts.ARGUMENT_FILTERED_BEER).value
    const currentBeerInfo = app.getContextArgument(consts.CONTEXT_GET_BEER_ON_TAPS_FILTER, consts.ARGUMENT_CURRENT_BEER_INFO).value
    console.log("acepting beer = " + JSON.stringify(currentBeerInfo))
    const beerBrand = app.getArgument(consts.ARGUMENT_DRINK_BRAND) || currentBeerInfo.brand
    const ordinal = app.getArgument(consts.ARGUMENT_DRINK_ORDINAL) || 1
    const unitsInfo = app.getArgument(consts.ARGUMENT_DRINK_LITERS)

    const orderedLiters = convert(unitsInfo.amount).from(unitsInfo.unit.toLowerCase()).to('l')

    const lifespan = 2
    if (orderedLiters > currentBeerInfo.liters_current) {
        app.setContext(consts.CONTEXT_BEER_INFO, lifespan, {
            [consts.ARGUMENT_DRINK_LITERS]: new String(currentBeerInfo.liters_current),
            [consts.ARGUMENT_DRINK_LITERS + '.original']: currentBeerInfo.liters_current + ' liters',
            [consts.ARGUMENT_DRINK_BRAND]: beerBrand,
            [consts.ARGUMENT_DRINK_COST]: currentBeerInfo.cost
        })
        const successResponse = sprintf(shuffle(responses.SHOW_BEER_ON_TAPS.filter.accept_order.low_liters)[0],
            {
                beer_brand: beerBrand,
                beer_remained_liters: new String(currentBeerInfo.liters_current)
            })
        app.ask(successResponse)
    } else {
        app.setContext(consts.CONTEXT_BEER_INFO, lifespan, {
            [consts.ARGUMENT_DRINK_LITERS]: orderedLiters,
            [consts.ARGUMENT_DRINK_LITERS + '.original']: orderedLiters + ' liters',
            [consts.ARGUMENT_DRINK_BRAND]: beerBrand,
            [consts.ARGUMENT_DRINK_COST]: currentBeerInfo.cost
        })
        const successResponse = sprintf(shuffle(responses.SHOW_BEER_ON_TAPS.filter.accept_order.beer_order_sum)[0],
            {
                beer_brand: beerBrand,
                beer_ordered_liters: new String(orderedLiters)
            })
        app.setContext(consts.CONTEXT_SHOW_BEER_ORDER_SUM, lifespan)
        app.ask(successResponse)
    }
}

function cancelOrderFilteredBeerOnTaps(app) {
    console.log("cancelOrderFilteredBeerOnTaps")

    const maxProperties = app.getArgument(consts.ARGUMENT_MAX_PROPERTIES) || 2

    const propertiesAtChoice = shuffle(ALL_DRINK_PROPERTIES)
        .map(prop => prop.name)
        .slice(0, maxProperties)
    const propertiesMessage = utils.getMessageFromArray_(propertiesAtChoice, false)
    const successResponse = sprintf(shuffle(responses.SHOW_BEER_ON_TAPS.filter.cancel_order)[0],
        {
            beer_properties: propertiesMessage
        })
    app.ask(successResponse)
}

function agreeAcceptOrderFilteredBeerOnTaps(app) {
    console.log("agreeAcceptOrderFilteredBeerOnTaps")
    const orderingBeerBrand = app.getArgument(consts.ARGUMENT_DRINK_BRAND)
    const orderingBeerCost = app.getArgument(consts.ARGUMENT_DRINK_COST)
    console.log("beer cost = " + orderingBeerCost)
    const orderingLiters = app.getArgument(consts.ARGUMENT_DRINK_LITERS)
    console.log("beer liters = " + orderingLiters)
    
    const filterContext = app.getContext(consts.CONTEXT_GET_BEER_ON_TAPS_FILTER)
    const filterOrderContext = app.getContext(consts.CONTEXT_GET_BEER_ON_TAPS_FILTER_ORDER)

    const wasSumShow = app.getContext(consts.CONTEXT_SHOW_BEER_ORDER_SUM)

    if (filterContext) {
        filterContext.lifespan = wasSumShow ? 0 : 2
    }
    if (filterOrderContext) {
        filterOrderContext.lifespan = wasSumShow ? 0 : 2
    }

    const orderPrice = utils.calculatePriceWithCurrency_(orderingBeerCost, orderingLiters)
    if (wasSumShow) {
        const successResponse = sprintf(shuffle(responses.SHOW_BEER_ON_TAPS.filter.accept_order.agree)[0], {
            beer_brand: orderingBeerBrand,
            beer_liters: new String(orderingLiters),
            order_price: orderPrice
        })
        app.tell(successResponse)
    } else {
        const successResponse = sprintf(shuffle(responses.SHOW_BEER_ON_TAPS.filter.accept_order.beer_order_sum)[0],
            {
                beer_brand: orderingBeerBrand,
                beer_ordered_liters: new String(orderingLiters)
            })
        const lifespan = 2
        app.setContext(consts.CONTEXT_SHOW_BEER_ORDER_SUM, lifespan)
        app.ask(successResponse)
    }
}

function declineAcceptOrderFilteredBeerOnTaps(app) {
    console.log("declineAcceptOrderFilteredBeerOnTaps")
    app.ask(shuffle(responses.SHOW_BEER_ON_TAPS.filter.cancel_order)[0])
}

function fallbackAcceptOrderFilteredBeerOnTaps(app) {
    console.log("orderFilteredBeerOnTapsFallback")
    const orderingBeerBrand = app.getContextArgument(consts.CONTEXT_BEER_INFO, consts.ARGUMENT_DRINK_BRAND).value
    if (app.getContext(consts.CONTEXT_SHOW_BEER_ORDER_SUM)) {
        const lifespan = 2
        app.setContext(consts.CONTEXT_SHOW_BEER_ORDER_SUM, lifespan)
    }
    app.ask(sprintf(shuffle(responses.SHOW_BEER_ON_TAPS.filter.accept_order.fallback)[0], {
        beer_brand: orderingBeerBrand
    }))
}

module.exports = {
    showBeerOnTaps,
    showBeerOnTapsFallback,
    showFilteredBeerOnTaps,
    showFilteredBeerOnTapsFallback,
    showMoreFilteredBeerOnTaps,
    acceptOrderFilteredBeerOnTaps,
    agreeAcceptOrderFilteredBeerOnTaps,
    declineAcceptOrderFilteredBeerOnTaps,
    fallbackAcceptOrderFilteredBeerOnTaps,
    cancelOrderFilteredBeerOnTaps
};