'use strict';
/*
 * @overview    Number to word conversion
 * @copyright   Sutoiku, Inc. 2014
 * @author      Zhipeng Jiang
 */
var th = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion'];

// 0~9
var singleNumber = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
// 10~19
var tenPlus = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
// 20~90
var tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

module.exports.num2Word = function num2word(str) {


    //str = formatNum(str, 2, 0, '', '.');
    str = str.toString()
        .replace(/[\, ]/g, '');

    if (str != parseFloat(str)) {
        return 'not a number';
    }

    var strLength = str.indexOf('.');
    if (strLength == -1) {
        strLength = str.length;
    }

    var n = str.split('');
    var result = '';
    var skip = 0;
    for (var i = 0; i < strLength; i++) {

        if ((strLength - i) % 3 == 2) {
            if (n[i] == '1') {
                result += tenPlus[Number(n[i + 1])] + ' ';
                i++;
                skip = 1;
            } else if (n[i] !== '0') {
                //result += tens[n[i] - 2] + ' ';
                result += tens[n[i]] + ' ';
                skip = 1;
            }
        } else if (n[i] !== '0') {
            result += singleNumber[n[i]] + ' ';
            if ((strLength - i) % 3 === 0)
                result += 'hundred ';
            skip = 1;
        }

        if ((strLength - i) % 3 == 1) {
            if (skip) {
                result += th[(strLength - i - 1) / 3] + ' ';
                skip = 0;
            }
        }
    }

    // For decimal
    if (strLength != str.length) {
        var y = str.length;
        result += 'point ';
        for (i = strLength + 1; i < y; i++)
            result += singleNumber[n[i]] + ' ';
    }

    return result.replace(/\s+/g, ' ');
};




var a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
var b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

module.exports.inWords = function inWords(num) {
    if ((num = num.toString()).length > 9) return 'overflow';
    var n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return;
    var str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'only ' : '';
    return str;
};



// ======================== [ Begin Code ] ======================================
//
//  BAJI - EB1 - JS functions to convert numeric $ to words.
//
//  Adapted from PHP code found at:
//
//      http://www.phpro.org/examples/Convert-Numbers-to-Words.html
//

var ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight",
    "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
];

var tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];


function words999(n999, pre) { // n999 is an integer less than or equal to 999.
    //
    // Accept any 3 digit int incl 000 & 999 and return words.
    // 

    var words = '';
    var Hn = 0;
    var n99 = 0;

    Hn = Math.floor(n999 / 100); // # of hundreds in it

    if (Hn > 0) { // if at least one 100

        words = words99(Hn) + " Hundred"; // one call for hundreds
    }

    n99 = n999 - (Hn * 100); // subtract the hundreds.

    var andWord = '';
    if ((Hn == 0 || (n99 < 10 && n99 > 0)) && pre != 'and' && pre!='' ) {

        andWord = 'and '
    }
    words += ((words === '') ? '' : ' ') + andWord + words99(n99); // combine the hundreds with tens & ones.

    return words;
} // function words999( n999 )

function formatNum(num, n, x, s, c) {


    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
        num = num.toFixed(Math.max(0, ~~n));

    return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));


}

function words99(n99) { // n99 is an integer less than or equal to 99.
    //
    // Accept any 2 digit int incl 00 & 99 and return words.
    // 

    var words = '';
    var Dn = 0;
    var Un = 0;

    Dn = Math.floor(n99 / 10); // # of tens

    Un = n99 % 10; // units

    if (Dn > 0 || Un > 0) {

        if (Dn < 2) {

            words += ones[Dn * 10 + Un]; // words for a # < 20

        } else {

            words += tens[Dn];

            if (Un > 0) words += "-" + ones[Un];
        }
    } // if ( Dn > 0 || Un > 0 )

    return words;
} // function words99( n99 )

module.exports.getAmtInWords = function getAmtInWords(num) { // use numeric value of id1 to populate text in id2
    //
    // Read numeric amount field and convert into word amount
    // 

    num = formatNum(num, 2, 0, '', '.');
    var t1 = num.toString();

    var t2 = t1.trim();

    var amtStr = t2.replace(/,/g, ''); // $123,456,789.12 = 123456789.12

    var dotPos = amtStr.indexOf('.'); // position of dot before cents, -ve if it doesn't exist.

    var dollars;
    var cents;
    if (dotPos > 0) {

        dollars = amtStr.slice(0, dotPos); // 1234.56 = 1234
        cents = amtStr.slice(dotPos + 1); // 1234.56 = .56

    } else if (dotPos === 0) {

        dollars = '0';
        cents = amtStr.slice(dotPos + 1); // 1234.56 = .56

    } else {

        dollars = amtStr.slice(0); // 1234 = 1234
        cents = '0';
    }


    t1 = '000000000000' + dollars; // to extend to trillion, use 15 zeros
    dollars = t1.slice(-12); // and -15 here.

    var billions = Number(dollars.substr(0, 3));
    var millions = Number(dollars.substr(3, 3));
    var thousands = Number(dollars.substr(6, 3));
    var hundreds = Number(dollars.substr(9, 3));


    t1 = words999(billions, '');
    var bW = t1.trim(); // Billions  in words

    t1 = words999(millions, bW);
    var mW = t1.trim(); // Millions  in words

    t1 = words999(thousands, mW);
    var tW = t1.trim(); // Thousands in words

    t1 = words999(hundreds, tW);
    var hW = t1.trim(); // Hundres   in words

    t1 = words99(cents);
    var cW = t1.trim(); // Cents     in words


    var totAmt = '';

    if (bW !== '') totAmt += ((totAmt !== '') ? ' ' : '') + bW + (bW.trim()=='and'?'':' Billion');
    if (mW !== '') totAmt += ((totAmt !== '') ? ' ' : '') + mW + (mW.trim()=='and'?'':' Million');
    if (tW !== '') totAmt += ((totAmt !== '') ? ' ' : '') + tW + (tW.trim()=='and'?'':' Thousand');
    //if (hW !== '')   totAmt += ((totAmt !== '') ? ' '  : '') + hW + ' Dollars';
    if (hW !== '') totAmt += ((totAmt !== '') ? ' ' : '') + hW + ' ';


    if (cW !== '') totAmt += ((totAmt !== '') ? 'and Cents ' : '') + cW + ' ';



    //  alert('totAmt = ' + totAmt);    // display words in a alert


    return totAmt;
}; // function getAmtInWords( id1, id2 )

// ======================== [ End Code ] ====================================
