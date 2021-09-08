function start() {


    const Metadata = require('./metadata');


    /**
     * Store the metadata result in a promise so the API isn't
     * queried unneccesarily.
     */
    let cache = {};


    /**
     * A simple deep clone function for JSON format-able data.
     * @param {Object} obj The object to clone.
     * @return {Object} The cloned object.
     */
    function clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }


    /**
     * Make a request to `metadata.columns.list` and cache the response. If a
     * cached response already exists, return that.
     * @return {goog.Promise} The response promise.
     */
    function requestColumns() {
        let key = 'columns';
        if (cache[key]) return cache[key];

        return cache[key] = gapi.client.request({
            path: '/analytics/v3/metadata/ga/columns'
        });
    }


    /**
     * Make a request to `management.customMetrics.list` and cache the response.
     * If a cached response already exists, return that.
     * @param {number} accountId The ID of the account to fetch data from.
     * @param {string} propertyId The ID of the property to fetch data from.
     * @return {goog.Promise} The response promise.
     */
    function requestCustomMetrics(accountId, propertyId) {
        let key = 'customMetrics:' + accountId + ':' + propertyId;
        if (cache[key]) return cache[key];

        return cache[key] = gapi.client.request({
            path: '/analytics/v3/management/accounts/' + accountId +
                '/webproperties/' + propertyId + '/customMetrics'
        });
    }


    /**
     * Make a request to `management.customDimensions.list` and cache the response.
     * If a cached response already exists, return that.
     * @param {number} accountId The ID of the account to fetch data from.
     * @param {string} propertyId The ID of the property to fetch data from.
     * @return {goog.Promise} The response promise.
     */
    function requestCustomDimensions(accountId, propertyId) {
        let key = 'customDimensions:' + accountId + ':' + propertyId;
        if (cache[key]) return cache[key];

        return cache[key] = gapi.client.request({
            path: '/analytics/v3/management/accounts/' + accountId +
                '/webproperties/' + propertyId + '/customDimensions'
        });
    }


    /**
     * Make a request to `management.goals.list` and cache the response.
     * If a cached response already exists, return that.
     * @param {number} accountId The ID of the account to fetch data from.
     * @param {string} propertyId The ID of the property to fetch data from.
     * @param {number} viewId The ID of the view to fetch data from.
     * @return {goog.Promise} The response promise.
     */
    function requestGoals(accountId, propertyId, viewId) {
        let key = 'goals:' + accountId + ':' + propertyId + ':' + viewId;
        if (cache[key]) return cache[key];

        return cache[key] = gapi.client.request({
            path: '/analytics/v3/management/accounts/' + accountId +
                '/webproperties/' + propertyId +
                '/profiles/' + viewId +
                '/goals'
        });
    }


    /**
     * Takes a list of metadata columns and applies a set of transform functions
     * on them returning a new, transformed, list.
     * @param {Array} columns A list of columns in the format returned by the
     *     metadata API's column#list method.
     * @param {Array} transforms A list of functions, each of which is invoked with
     *     the current column object to inspect and the list of new columns. If the
     *     transform function modifies the list, it should return true, otherwise
     *     if should return falsy. After a true transform is encountered,
     *     subsequent transforms are ignored. If no transforms return true, the
     *     column is added to the new columns list as is.
     * @returns {Array} A new list of columns after all the transforms have run.
     */
    function applyTransforms(columns, transforms) {
        let newColumns = [];
        columns.forEach(function (column) {
            if (!transforms.some(function (transform) {
                return transform(column, newColumns);
            })) newColumns.push(column);
        });
        return newColumns;
    }


    /**
     * Returns a function that transforms the generic custom metric column into a
     * list of property-specific custom metric columns based on the passed object.
     * @param {Array} customMetrics An array of custom metrics as returned by the
     *     `management.customMetrics.list` method.
     * @return {Function} A function that can be passed to `applyTransforms`.
     */
    function transformCustomMetrics(customMetrics) {
        return function (column, newColumns) {
            if (column.id == 'ga:metricXX') {
                customMetrics.forEach(function (customMetric, i) {
                    let newColumn = clone(column);
                    newColumn.id = customMetric.id;
                    newColumn.attributes.uiName = customMetric.name +
                        ' (Custom Metric ' + (i + 1) + ')';
                    newColumns.push(newColumn);
                });
                return true;
            }
        };
    }


    /**
     * Returns a function that transforms the generic custom dimension column into
     * a list of property-specific custom dimensions columns based on the passed
     * object.
     * @param {Array} customDimensions An array of custom metrics as returned by
     *     the `management.customDimensions.list` method.
     * @return {Function} A function that can be passed to `applyTransforms`.
     */
    function transformCustomDimensions(customDimensions) {
        return function (column, newColumns) {
            if (column.id == 'ga:dimensionXX') {
                customDimensions.forEach(function (customDimension, i) {
                    let newColumn = clone(column);
                    newColumn.id = customDimension.id;
                    newColumn.attributes.uiName = customDimension.name +
                        ' (Custom Dimension ' + (i + 1) + ')';
                    newColumns.push(newColumn);
                });
                return true;
            }
        };
    }


    /**
     * Returns a function that transforms a generic goal column into a list of
     * view-specific goal columns based on the passed object.
     * @param {Array} goals An array of goals as returned by the
     *     `management.goals.list` method.
     * @return {Function} A function that can be passed to `applyTransforms`.
     */
    function transformGoals(goals) {
        return function (column, newColumns) {
            if (column.attributes.minTemplateIndex && /goal/i.test(column.id)) {
                goals.forEach(function (goal) {
                    let newColumn = clone(column);
                    newColumn.id = column.id.replace('XX', goal.id);
                    newColumn.attributes.uiName = goal.name +
                        ' (' + column.attributes.uiName.replace('XX', goal.id) + ')';
                    newColumns.push(newColumn);
                });
                return true;
            }
        };
    }


    /**
     * Returns a function that transforms a generic template column into all its
     * possible values based on the corresponding min/max template index
     * properties.
     * @param {boolean} isPremium If true use the premium template index properties
     *     rather than the regular ones.
     * @return {Function} A function that can be passed to `applyTransforms`.
     */
    function transformTemplates(isPremium) {
        return function (column, newColumns) {
            if (column.attributes.minTemplateIndex) {
                if (isPremium && column.attributes.premiumMinTemplateIndex) {
                    let min = +column.attributes.premiumMinTemplateIndex;
                    let max = +column.attributes.premiumMaxTemplateIndex;
                } else {
                    let min = +column.attributes.minTemplateIndex;
                    let max = +column.attributes.maxTemplateIndex;
                }
                for (let i = min; i <= max; i++) {
                    let newColumn = clone(column);
                    newColumn.id = column.id.replace('XX', i);
                    newColumn.attributes.uiName =
                        column.attributes.uiName.replace('XX', i);
                    newColumns.push(newColumn);
                }
                return true;
            }
        };
    };


    /**
     * @module metadata
     *
     * This module requires the `gapi.client` library to be installed and the user
     * to be authenticated.
     */
    module.exports = {

        /**
         * Return a promise that is resolved with a Metadata instance containing
         * the columns from the `metadata.columns.list` method.
         * @return {Promise} A promise fulfilled with a Metadata instance.
         */
        get: function () {
            return Promise.resolve(requestColumns()).then(function (resp) {
                return new Metadata(resp.result.items);
            });
        },


        /**
         * Return a promise that is resolved with a Metadata instance containing
         * the columns from the `metadata.columns.list` method after they've been
         * transformed based on the custom goals and definitions of the passed view.
         * @param {Object} account A account object as return by the
         *     `AccountSummaries` module.
         * @param {Object} property A property object as return by the
         *     `AccountSummaries` module.
         * @param {Object} property A view object as return by the
         *     `AccountSummaries` module.
         * @return {Promise} A promise fulfilled with a Metadata instance.
         */
        getAuthenticated: function (account, property, view) {
            return Promise.all([
                requestColumns(),
                requestCustomMetrics(account.id, property.id),
                requestCustomDimensions(account.id, property.id),
                requestGoals(account.id, property.id, view.id)
            ])
                .then(function (responses) {
                    return applyTransforms(responses[0].result.items, [
                        transformCustomMetrics(responses[1].result.items),
                        transformCustomDimensions(responses[2].result.items),
                        transformGoals(responses[3].result.items),
                        transformTemplates(property.level == 'PREMIUM')
                    ]);
                })
                .then(function (columns) {
                    return new Metadata(columns);
                });
        },

        clearCache: function () {
            cache = {};
        }
    };

    /** // gathers metadata, copy/paste json, worker
     * @constuctor Metadata
     *
     * Takes an array of metadata columns...
     * @param {Array} columns A list of columns in the format returned by the
     *     metadata API's column#list method.
     * @returns {AccountSummaries}
     */
    function Metadata(columns) {
        this._columns = columns;

        this._metrics = [];
        this._dimensions = [];
        this._ids = {};

        this._columns.forEach(function (column) {
            this._ids[column.id] = column.attributes;

            if (column.attributes.type == 'METRIC') {
                this._metrics.push(column);
            } else if (column.attributes.type == 'DIMENSION') {
                this._dimensions.push(column);
            }
        }.bind(this));
    }


    /**
     * Returns an array of all columns, with an optional filter applied.
     * @param {Object|Function} filter An optional filter object or function.
     *     If an object is passed, all property values must match. If a function is
     *     passed, it is invoked with the column's attributes object and the
     *     the column will be included if the function returns true.
     * @return {Array} A list of columns passing the filter.
     */
    Metadata.prototype.all = function (filter) {
        return filter ? applyFilter(this._columns, filter) : this._columns;
    };


    /**
     * Returns an array of all metric columns, with an optional filter applied.
     * @param {Object|Function} filter An optional filter object or function.
     *     If an object is passed, all property values must match. If a function is
     *     passed, it is invoked with the column's attributes object and the
     *     the column will be included if the function returns true.
     * @return {Array} A list of metric columns passing the filter.
     */
    Metadata.prototype.allMetrics = function (filter) {
        return filter ? applyFilter(this._metrics, filter) : this._metrics;
    };


    /**
     * Returns an array of all dimension columns, with an optional filter applied.
     * @param {Object|Function} filter An optional filter object or function.
     *     If an object is passed, all property values must match. If a function is
     *     passed, it is invoked with the column's attributes object and the
     *     the column will be included if the function returns true.
     * @return {Array} A list of dimension columns passing the filter.
     */
    Metadata.prototype.allDimensions = function (filter) {
        return filter ? applyFilter(this._dimensions, filter) : this._dimensions;
    };


    /**
     * Get the attributs object of a column given the passed ID.
     * @param {string} id The column ID.
     * @return {Object} The column attributes object.
     */
    Metadata.prototype.get = function (id) {
        return this._ids[id];
    };


    /**
     * Returns a list of metadata columns passing a filter.
     * @param {Array} columns The list of metadata columns.
     * @param {Object|Function} filter An object or function filter.
     *     If an object is passed, all property values must exactly match the
     *     corresponding column attributes. If a function is passed, it is invoked
     *     with the column's attributes object as the first argument and the
     *     column's ID as the second argument. The column will be included if the
     *     function returns true.
     * @return {Array} The new columns after the filter has been applied.
     */
    function applyFilter(columns, filter) {
        return columns.filter(function (column) {
            if (typeof filter == 'function') {
                return filter(column.attributes, column.id);
            } else {
                return Object.keys(filter).every(function (key) {
                    return filter[key] === column.attributes[key];
                });
            }
        });
    };


    module.exports = Metadata
}
