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
const responses = require('../data/responses.json');

function showBeerByBrand(app) {
    console.log("showBeerByBrand")

    const searchingBeerBrand = app.getArgument(consts.ARGUMENT_DRINK_BRAND)
    const unitsInfo = app.getArgument(consts.ARGUMENT_DRINK_LITERS)

    const orderedLiters = convert(unitsInfo.amount).from(unitsInfo.unit.toLowerCase()).to('l')

    const beerRef = firebaseAdmin.database()
        .ref(consts.DB_PATH.DRINKS.BEER + "items")
    const beerPropertiesRef = firebaseAdmin.database()
        .ref(consts.DB_PATH.DRINKS.BEER + "item_properties")

    const noBeerfallbackResponce = shuffle(responses.SHOW_BEER_BY_BRAND.main.no_beer)[0]
    Promise.all([beerRef.once('value'), beerPropertiesRef.once('value')])
        .then(response => {
            const allBeer = response[0].val()
            const allBeerProperties = response[1].val()

            const searchingBeer = allBeer.filter(beer => beer.brand.toLowerCase() === searchingBeerBrand.toLowerCase())[0]
            console.log('all beer in tavern: ' + JSON.stringify(allBeer))
            console.log('all beer properties: ' + JSON.stringify(allBeerProperties))
            console.log('searching beer: ' + JSON.stringify(searchingBeer))

            if (allBeer.length === 0) {
                app.tell(noBeerfallbackResponce)
            } else if (!searchingBeer) {
                const lifespan = 0
                app.setContext(consts.CONTEXT_GET_BEER_BY_BRAND, lifespan)
                app.ask(sprintf(shuffle(responses.SHOW_BEER_BY_BRAND.main.no_brand)[0], {
                    beer_brand: searchingBeerBrand
                }))
            } else if (searchingBeer.count === 0 || searchingBeer.litres_current === 0) {
                const searchingBeerPropertiesAll = response[1].child(searchingBeer.id).val()
                const searchingBeerPropertiesRandom = shuffle(searchingBeerPropertiesAll).slice(0, 2)
                console.log('searching beer properties: ' + JSON.stringify(searchingBeerPropertiesAll))

                const similarBeer = utils.filterBeerByProperties_(allBeer, allBeerProperties, searchingBeerPropertiesRandom)
                    .filter(beerItem => beerItem.id !== searchingBeer.id && (beerItem.cont > 0 || beerItem.litres_current > 0))[0];

                if (similarBeer) {
                    const lifespan = 2
                    app.setContext(consts.CONTEXT_BEER_INFO, lifespan, {
                        [consts.ARGUMENT_DRINK_LITERS]: similarBeer.litres_current,
                        [consts.ARGUMENT_DRINK_LITERS + '.original']: similarBeer.litres_current + ' liters',
                        [consts.ARGUMENT_DRINK_BRAND]: similarBeer.brand,
                        [consts.ARGUMENT_DRINK_COST]: similarBeer.cost
                    })
                    const similarBeerPropertiesRandom = similarBeer.properties.slice(0, 2)
                    app.ask(sprintf(shuffle(responses.SHOW_BEER_BY_BRAND.main.similar_beer)[0], {
                        beer_brand: searchingBeer.brand,
                        alternative_beer_brand: similarBeer.brand,
                        alternative_beer_properties: utils.getMessageFromArray_(similarBeerPropertiesRandom)
                    }))
                } else {
                    const lifespan = 0
                    app.setContext(consts.CONTEXT_GET_BEER_BY_BRAND, lifespan)
                    app.ask(sprintf(shuffle(responses.SHOW_BEER_BY_BRAND.main.no_similar_beer)[0], {
                        beer_brand: searchingBeer.brand
                    }))
                }
            } else if (orderedLiters > searchingBeer.litres_current) {
                const lifespan = 2
                app.setContext(consts.CONTEXT_BEER_INFO, lifespan, {
                    [consts.ARGUMENT_DRINK_LITERS]: searchingBeer.litres_current,
                    [consts.ARGUMENT_DRINK_LITERS + '.original']: searchingBeer.litres_current + ' liters',
                    [consts.ARGUMENT_DRINK_BRAND]: searchingBeer.brand,
                    [consts.ARGUMENT_DRINK_COST]: searchingBeer.cost
                })
                const successResponse = sprintf(shuffle(responses.SHOW_BEER_BY_BRAND.main.low_liters)[0],
                    {
                        beer_brand: searchingBeer.brand,
                        beer_remained_liters: searchingBeer.litres_current
                    })
                app.ask(successResponse)
            } else {
                const lifespan = 2
                app.setContext(consts.CONTEXT_BEER_INFO, lifespan, {
                    [consts.ARGUMENT_DRINK_LITERS]: orderedLiters,
                    [consts.ARGUMENT_DRINK_LITERS + '.original']: orderedLiters + ' liters',
                    [consts.ARGUMENT_DRINK_BRAND]: searchingBeer.brand,
                    [consts.ARGUMENT_DRINK_COST]: searchingBeer.cost
                })
                const orderPrice = utils.calculatePriceWithCurrency_(searchingBeer.cost, orderedLiters)                
                const successResponse = sprintf(shuffle(responses.SHOW_BEER_BY_BRAND.main.enough_liters)[0],
                    {
                        beer_brand: searchingBeer.brand,
                        beer_ordered_liters: orderedLiters,
                        order_price: orderPrice
                    })
                app.tell(successResponse)
            }
        })
        .catch(error => {
            console.log("Failed to get beer in tavern = ", error)
            app.tell(noBeerfallbackResponce)
        });
}

function showBeerByBrandFallback(app) {
    console.log("showBeerByBrandFallback")
    app.ask(shuffle(responses.SHOW_BEER_BY_BRAND.fallback)[0])
}

function acceptOrderBeerByBrand(app) {
    console.log("acceptOrderBeerByBrand")

    const orderingBeerCost = app.getArgument(consts.ARGUMENT_DRINK_COST)
    const orderingLiters = app.getArgument(consts.ARGUMENT_DRINK_LITERS)
    const orderPrice = utils.calculatePriceWithCurrency_(orderingBeerCost, orderingLiters)

    app.tell(sprintf(shuffle(responses.SHOW_BEER_BY_BRAND.accept_order)[0], {
        beer_liters: orderingLiters,
        beer_brand: app.getArgument(consts.ARGUMENT_DRINK_BRAND),
        order_price: orderPrice
    }))
}

function cancelOrderBeerByBrand(app) {
    console.log("cancelOrderBeerByBrand")
    app.ask(shuffle(responses.SHOW_BEER_BY_BRAND.cancel_order)[0])
}

module.exports = {
    showBeerByBrand,
    showBeerByBrandFallback,
    acceptOrderBeerByBrand,
    cancelOrderBeerByBrand
};