# blume-backend
 JSDoc: Global  

Global
======

### Methods

#### addNotifications(notifications, investorInfo)

Inserts notifications into the database if they don't already exist.

##### Parameters:

Name

Type

Description

`notifications`

Object

Object containing notification details.

`investorInfo`

Array.<Object>

An array of investor information objects. The function: 1. Extracts necessary notification and investor info. 2. Inserts the new notification into the database, ensuring no duplicates are added.

Source:

*   [index.js](index.js.html), [line 432](index.js.html#line432)

##### Throws:

Logs any errors that occur during the database operation.

Type

Error

##### Example

    const notificationDetails = { userID: '123', ... };
    const investorData = [{ investorID: 'abc', ... }];
    addNotifications(notificationDetails, investorData);

#### (async) atomConditionalSnapshotCall(ticker, type) → {Array.<Object>|undefined}

Fetches a snapshot of prices for a given ticker and type from the Atom Finance API.

##### Parameters:

Name

Type

Description

`ticker`

string

The ticker symbol for which to fetch the snapshot.

`type`

string

The type of the asset (e.g., 'equity' or 'fund').

Source:

*   [index.js](index.js.html), [line 877](index.js.html#line877)

##### Throws:

Throws an error if the fetch operation fails.

Type

Error

##### Returns:

Returns an array of merged asset and snapshot data or undefined if no snapshots exist.

Type

Array.<Object> | undefined

##### Example

    const ticker = 'AAPL';
    const type = 'equity';
    const snapshot = await atomConditionalSnapshotCall(ticker, type);

#### (async) atomSnapshotCall(ticker) → {Array.<Object>|undefined}

Fetches a snapshot of equity prices for a given ticker from the Atom Finance API.

##### Parameters:

Name

Type

Description

`ticker`

string

The equity ticker symbol for which to fetch the snapshot.

Source:

*   [index.js](index.js.html), [line 769](index.js.html#line769)

##### Throws:

Throws an error if the fetch operation fails.

Type

Error

##### Returns:

Returns an array of merged asset and snapshot data with type "equity" or undefined if no snapshots exist.

Type

Array.<Object> | undefined

##### Example

    const ticker = 'AAPL';
    const snapshot = await atomSnapshotCall(ticker);

#### (async) atomSnapshotCallFund(ticker) → {Array.<Object>|undefined}

Fetches a snapshot of fund prices for a given ticker from the Atom Finance API.

##### Parameters:

Name

Type

Description

`ticker`

string

The fund ticker symbol for which to fetch the snapshot.

Source:

*   [index.js](index.js.html), [line 812](index.js.html#line812)

##### Throws:

Throws an error if the fetch operation fails.

Type

Error

##### Returns:

Returns an array of merged asset and snapshot data with type "fund" or undefined if no snapshots exist.

Type

Array.<Object> | undefined

##### Example

    const ticker = 'VFINX';
    const snapshot = await atomSnapshotCallFund(ticker);

#### (async) getAllBalances(token, investorID) → {void}

Retrieves all balances for a given investor and inserts ROI and other information into a database. this function calculates the investors entire ROI by finding the ROI of each holding by using this algo " ROI: (i.institution\_price - (i.cost\_basis/i.quantity)) \* i.quantity "

##### Parameters:

Name

Type

Description

`token`

string

The access token used for API authentication.

`investorID`

string

The unique ID of the investor for whom to retrieve balances.

Source:

*   [index.js](index.js.html), [line 1644](index.js.html#line1644)

##### Throws:

Will throw an error if the API request or database operations fail.

Type

Error

##### Returns:

This function does not have a return value; its results are stored in a database.

Type

void

#### (async) getAtomNews(ticker, type) → {Array.<Object>|undefined}

Fetches news feed for a specific ticker from the Atom Finance API.

##### Parameters:

Name

Type

Description

`ticker`

string

The ticker symbol for which to fetch the news.

`type`

string

The type of the asset (e.g., 'equity' or 'fund').

Source:

*   [index.js](index.js.html), [line 925](index.js.html#line925)

##### Throws:

Throws an error if the fetch operation fails.

Type

Error

##### Returns:

Returns an array of news data or undefined if no news is found.

Type

Array.<Object> | undefined

##### Example

    const ticker = 'AAPL';
    const type = 'equity';
    const newsData = await getAtomNews(ticker, type);

#### (async) getInvestorNotificationInfo(itemID) → {Promise.<Array.<Object>>}

Retrieves notification information for a specified investor from the database.

##### Parameters:

Name

Type

Description

`itemID`

string | number

The account ID of the investor to retrieve information for.

Source:

*   [index.js](index.js.html), [line 325](index.js.html#line325)

##### Throws:

Throws an error if there's an issue with the database query or mapping the result.

Type

Error

##### Returns:

A promise that resolves with an array of investor information objects. Each object contains the investor's ID, access token, first name, last name, and photo.

Type

Promise.<Array.<Object>>

##### Example

    const investorInfo = await getInvestorNotificationInfo('12345');
    console.log(investorInfo[0].firstName);  // Outputs the first name of the investor

#### (async) getRecentTransactions(investorInfo)

Fetches and processes recent investment transactions for a given investor.

##### Parameters:

Name

Type

Description

`investorInfo`

Array.<Object>

An array of investor information objects. Each object should contain the access token for the investor.

##### Properties:

Name

Type

Description

`investorInfo.token`

string

The access token for the investor. The function performs the following steps: 1. Retrieves investment transactions for the investor from the last 50 days. 2. Merges the retrieved transactions with their corresponding securities data. 3. Retrieves investor subscription information. 4. Merges subscription data with transactions and securities data. 5. Processes and adds notifications based on the merged data.

Source:

*   [index.js](index.js.html), [line 377](index.js.html#line377)

##### Throws:

Logs any errors that occur during data fetching or processing.

Type

Error

##### Example

    const investorData = [{ token: 'abc123' }];
    await getRecentTransactions(investorData);

#### (async) getRelatedAtomNews(tickers, type) → {Array.<Object>|undefined}

Fetches news feed for multiple tickers from the Atom Finance API.

##### Parameters:

Name

Type

Description

`tickers`

Array.<string>

An array of ticker symbols for which to fetch the news.

`type`

string

The type of the asset (e.g., 'equity' or 'fund').

Source:

*   [index.js](index.js.html), [line 987](index.js.html#line987)

##### Throws:

Throws an error if the fetch operation fails.

Type

Error

##### Returns:

Returns an array of news data or undefined if no news is found.

Type

Array.<Object> | undefined

##### Example

    const tickers = ['AAPL', 'GOOGL'];
    const type = 'equity';
    const newsData = await getRelatedAtomNews(tickers, type);

#### (async) getTopAtomNews(ticker, type) → {Array.<Object>|undefined}

Fetches top news from the Atom Finance API.

##### Parameters:

Name

Type

Description

`ticker`

string

The ticker symbol for which to fetch the news (currently unused in the function but kept for consistency).

`type`

string

The type of the asset (e.g., 'equity' or 'fund'). Currently unused in the function but kept for consistency.

Source:

*   [index.js](index.js.html), [line 1049](index.js.html#line1049)

##### Throws:

Throws an error if the fetch operation fails.

Type

Error

##### Returns:

Returns an array of top news data or undefined if no news is found.

Type

Array.<Object> | undefined

##### Example

    const ticker = 'AAPL';
    const type = 'equity';
    const topNewsData = await getTopAtomNews(ticker, type);

#### mergeByIdNotifications(a1, a2) → {Array.<Object>}

Merges two arrays based on the \`security\_id\` property.

##### Parameters:

Name

Type

Description

`a1`

Array.<Object>

First array containing transaction details.

`a2`

Array.<Object>

Second array containing securities data.

Source:

*   [index.js](index.js.html), [line 494](index.js.html#line494)

##### Returns:

A merged array where each object combines matching data from both input arrays.

Type

Array.<Object>

##### Example

    const transactions = [{ security_id: '1', ... }];
    const securities = [{ security_id: '1', name: 'StockA', ... }];
    const merged = mergeByIdNotifications(transactions, securities);

#### (async) timedBalances() → {Promise.<void>}

Retrieves balances for all investors at a certain point in time. Creates an array of all the investors and their plaid credentials then maps through them and for each will calculate their current ROI and then add that to the table investor\_balance\_history

Source:

*   [index.js](index.js.html), [line 1625](index.js.html#line1625)

##### Throws:

Will throw an error if retrieving subscriptions, investors, or balances fails.

Type

Error

##### Returns:

This function does not have a return value; its results are logged to the console.

Type

Promise.<void>

[Home](index.html)
------------------

### Global

*   [addNotifications](global.html#addNotifications)
*   [atomConditionalSnapshotCall](global.html#atomConditionalSnapshotCall)
*   [atomSnapshotCall](global.html#atomSnapshotCall)
*   [atomSnapshotCallFund](global.html#atomSnapshotCallFund)
*   [getAllBalances](global.html#getAllBalances)
*   [getAtomNews](global.html#getAtomNews)
*   [getInvestorNotificationInfo](global.html#getInvestorNotificationInfo)
*   [getRecentTransactions](global.html#getRecentTransactions)
*   [getRelatedAtomNews](global.html#getRelatedAtomNews)
*   [getTopAtomNews](global.html#getTopAtomNews)
*   [mergeByIdNotifications](global.html#mergeByIdNotifications)
*   [timedBalances](global.html#timedBalances)

  

Documentation generated by [JSDoc 4.0.2](https://github.com/jsdoc/jsdoc) on Mon Jan 08 2024 09:51:23 GMT-0500 (Eastern Standard Time)

prettyPrint();