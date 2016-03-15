SELECT `TradeHeader`.*,
`details`.`id` AS `details.id`,
`details`.`desc` AS `details.desc`,
 `details`.`seque` AS `details.seque`,
 `details`.`tradeDate` AS `details.tradeDate`,
 `details`.`open` AS `details.open`,
 `details`.`direction` AS `details.direction`,
 `details`.`quantity` AS `details.quantity`,
 `details`.`closedQuantity` AS `details.closedQuantity`,
 `details`.`closeQuantity` AS `details.closeQuantity`,
 `details`.`unit` AS `details.unit`,
  `details`.`price` AS `details.price`,
   `details`.`currency` AS `details.currency`,
   `details`.`exchangeCurrency` AS `details.exchangeCurrency`,
    `details`.`exchangeRate` AS `details.exchangeRate`,
    `details`.`dueDate` AS `details.dueDate`,
    `details`.`priceUnit` AS `details.priceUnit`,
    `details`.`diffUnit` AS `details.diffUnit`,
     `details`.`diffQuantity` AS `details.diffQuantity`,
     `details`.`openPrice` AS `details.openPrice`,
     `details`.`closePrice` AS `details.closePrice`,
     `details`.`price2` AS `details.price2`,
     `details`.`defferedCharge` AS `details.defferedCharge`,
     `details`.`createdAt` AS `details.createdAt`,
      `details`.`updatedAt` AS `details.updatedAt`,
       `details`.`tradeBookId` AS `details.tradeBookId`,
        `details`.`closeToId` AS `details.closeToId`,
        `details`.`contractId` AS `details.contractId`,
        `details`.`TradeHeaderId` AS `details.TradeHeaderId`,
         (SELECT SUM(quantity)  FROM `TradeDetails`
          WHERE `TradeDetails`.`closeToId` = `TradeHeader`.`id`
           and `open` = -1
           and TradeDetails.seque = `details`.`seque`) AS `details.closed`,
           `details.contract`.`id` AS `details.contract.id`,
           `details.contract`.`name` AS `details.contract.name`,
            `details.contract`.`createdAt` AS `details.contract.createdAt`,
             `details.contract`.`updatedAt` AS `details.contract.updatedAt`,
              `details.contract`.`articleId` AS `details.contract.articleId`,
              `strategy`.`id` AS `strategy.id`,
              `strategy`.`desc` AS `strategy.desc`,
               `strategy`.`direction1` AS `strategy.direction1`,
               `strategy`.`direction2` AS `strategy.direction2`,
               `strategy`.`dateFrom` AS `strategy.dateFrom`,
               `strategy`.`createdAt` AS `strategy.createdAt`,
                `strategy`.`updatedAt` AS `strategy.updatedAt`,
                 `strategy`.`contract1Id` AS `strategy.contract1Id`,
                 `strategy`.`contract2Id` AS `strategy.contract2Id`
                  FROM (SELECT `TradeHeader`.`id`, `TradeHeader`.`docType`, `TradeHeader`.`desc`, `TradeHeader`.`open`, `TradeHeader`.`priceDiff1`, `TradeHeader`.`priceDiff2`, `TradeHeader`.`tradeDate`, `TradeHeader`.`closeProfit`, `TradeHeader`.`currencyProfit`, `TradeHeader`.`defferedCharge`, `TradeHeader`.`closeAt`, `TradeHeader`.`createdAt`,
                     `TradeHeader`.`updatedAt`, `TradeHeader`.`parentId`, `TradeHeader`.`moveFromId`, `TradeHeader`.`moveToId`, `TradeHeader`.`strategyId`
                     FROM `TradeHeaders` AS `TradeHeader`
                      WHERE `TradeHeader`.`open` = 1
                      AND `TradeHeader`.`tradeDate` <= '2016-03-01 00:00:00'
                       AND (`TradeHeader`.`closeAt` IS NULL
                         OR `TradeHeader`.`closeAt` > '2016-03-01 00:00:00')
                          AND `TradeHeader`.`id` IN (1, 2, 5, 6, 9)
                           ORDER BY `TradeHeader`.`id` asc LIMIT 10) AS `TradeHeader`
                            LEFT OUTER JOIN `TradeDetails` AS `details` ON `TradeHeader`.`id` = `details`.`TradeHeaderId`
                             LEFT OUTER JOIN `Contracts` AS `details.contract`
                             ON `details`.`contractId` = `details.contract`.`id`
                              LEFT OUTER JOIN `Strategies` AS `strategy` ON `TradeHeader`.`strategyId` = `strategy`.`id`
                               ORDER BY `TradeHeader`.`id` asc;
