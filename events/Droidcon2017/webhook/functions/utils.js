'use strict';

const shuffle = require('shuffle-array');
const convert = require('convert-units')
const { sprintf } = require('sprintf-js');

function filterBeerByProperties_(allBeer, beerProperties, searchingBeerProperties) {
    const filteredBeer = new Array();
    for (let i = 0; i < allBeer.length; i++) {
        let beerItem = allBeer[i]
        let beerItemProperties = beerProperties[i]
        let isBeerContainsAllSearchingProps = isArrayContainsAll_(beerItemProperties, searchingBeerProperties)

        console.log('is beer contains all searching props ' + isBeerContainsAllSearchingProps)
        if (!isBeerContainsAllSearchingProps) {
            continue
        }
        beerItem.properties = beerItemProperties
        filteredBeer.push(beerItem)
    }
    return filteredBeer;
}

function getArrayFromObject_(obj) {
    if (!obj) return []
    return Object.keys(obj).map(key => {
        const childAtId = obj[key]
        childAtId.id = key
        return childAtId
    });
}

function getMessageFromArray_(array, useListConjuction = true) {
    var message = ""
    array.forEach((item, index) => {
        const conjunction = useListConjuction ? " and " : " or "
        if (index == 0) {
            message += item
        } else {
            message += (index !== (array.length - 1)) ? (", " + item) : (conjunction + item)
        }
    })
    return message.trim()
}

function isArrayContainsAll_(originalItems, searchingItems) {
    var searchedItemsCount = 0
    for (var item of searchingItems) {
        if (originalItems.indexOf(item) !== -1) {
            searchedItemsCount++
        }
    }
    return searchedItemsCount === searchingItems.length &&
        originalItems.length !== 0 && originalItems !== 0;
}

function calculateNextIndex_(currentIndex, direction, lastItemIndex) {
    var nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1
    if (nextIndex > lastItemIndex) {
        nextIndex = 0
    } else if (nextIndex < 0) {
        lastItemIndex
    } else {
        nextIndex
    }
    console.log('Final next index = ' + nextIndex + ", curent index = " + currentIndex + ", direction =" + direction)
    return nextIndex
}

function calculatePriceWithCurrency_(orderingBeerCost, orderingLiters) {
    return (orderingBeerCost * orderingLiters).toFixed(2) + " roubles"
}

module.exports = {
    filterBeerByProperties_,
    getArrayFromObject_,
    getMessageFromArray_,
    isArrayContainsAll_,
    calculateNextIndex_,
    calculatePriceWithCurrency_
};