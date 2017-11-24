'use strict';

process.env.DEBUG = 'actions-on-google:*';
const DialogflowApp = require('actions-on-google').DialogflowApp;
const functions = require('firebase-functions');
const Promise = require('promise');
const firebaseAdmin = require('firebase-admin');
const firebaseEncode = require('firebase-encode');
const shuffle = require('shuffle-array');
const convert = require('convert-units')
const { sprintf } = require('sprintf-js');
const utils = require('./utils');
const consts = require('./consts');

// Modules
const by_brand = require('./show_beer/by_brand');
const on_taps = require('./show_beer/on_taps');

const responses = require('./data/responses.json');

firebaseAdmin.initializeApp(functions.config().firebase);
exports.beerLogan = functions.https.onRequest((request, response) => {
    console.log('Request headers: ' + JSON.stringify(request.headers))
    console.log('Request body: ' + JSON.stringify(request.body))

    // Construct actions app object, processing request
    const app = new DialogflowApp({ request, response })
    const actionMap = new Map()
    actionMap.set(consts.ACTION_WELCOME, showWelcome)
    actionMap.set(consts.ACTION_GET_BEER_ON_TAPS, on_taps.showBeerOnTaps)
    actionMap.set(consts.ACTION_GET_BEER_ON_TAPS_FALLBACK, on_taps.showBeerOnTapsFallback)
    actionMap.set(consts.ACTION_GET_BEER_ON_TAPS_FILTER, on_taps.showFilteredBeerOnTaps)
    actionMap.set(consts.ACTION_GET_BEER_ON_TAPS_FILTER_FALLBACK, on_taps.showFilteredBeerOnTapsFallback)
    actionMap.set(consts.ACTION_GET_BEER_ON_TAPS_FILTER_PAGINATION, on_taps.showMoreFilteredBeerOnTaps)
    actionMap.set(consts.ACTION_GET_BEER_ON_TAPS_FILTER_ORDER, on_taps.acceptOrderFilteredBeerOnTaps)
    actionMap.set(consts.ACTION_GET_BEER_ON_TAPS_FILTER_ORDER_YES, on_taps.agreeAcceptOrderFilteredBeerOnTaps)
    actionMap.set(consts.ACTION_GET_BEER_ON_TAPS_FILTER_ORDER_NO, on_taps.declineAcceptOrderFilteredBeerOnTaps)
    actionMap.set(consts.ACTION_GET_BEER_ON_TAPS_FILTER_ORDER_FALLBACK, on_taps.fallbackAcceptOrderFilteredBeerOnTaps)
    actionMap.set(consts.ACTION_GET_BEER_ON_TAPS_FILTER_CANCEL, on_taps.cancelOrderFilteredBeerOnTaps)

    actionMap.set(consts.ACTION_GET_BEER_BY_BRAND, by_brand.showBeerByBrand)
    actionMap.set(consts.ACTION_GET_BEER_BY_BRAND_FALLBACK, by_brand.showBeerByBrandFallback)
    actionMap.set(consts.ACTION_GET_BEER_BY_BRAND_CANCEL, by_brand.cancelOrderBeerByBrand)
    actionMap.set(consts.ACTION_GET_BEER_BY_BRAND_ORDER, by_brand.acceptOrderBeerByBrand)
    app.handleRequest(actionMap)

    function showWelcome(app) {
        console.log("showWelcome")
        app.ask(shuffle(responses.WELCOME)[0])
    }
});