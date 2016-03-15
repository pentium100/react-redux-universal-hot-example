const unitTable = {
    'G-KG': 0.001,
    'KG-G': 1000,
    'OZ-G': 31.1034768,
    'G-OZ': 1 / 31.1034768,
    'KG-KG': 1,
    'G-G': 1,
    'OZ-OZ': 1,
    'TON-KG': 1000,
    'KG-TON': 0.001
}
module.exports = {

    convertPriceUnit: function (price, fromUnit, toUnit) {
        return price / unitTable[fromUnit + '-' + toUnit];
    },

    convertUnit: function (quantity, fromUnit, toUnit) {

        return quantity * unitTable[fromUnit + '-' + toUnit];


    },

    convertToCurrency: function (amount, fromCurrency, toCurrency, USDExchangeRate) {

        if (fromCurrency == toCurrency) {
            return amount;
        }

        if (fromCurrency != 'CNY') {

            return amount * USDExchangeRate;
        }
        if (toCurrency != 'CNY') {

            return amount / USDExchangeRate;
        }


    }
};