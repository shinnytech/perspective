/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
import * as defaults from "./config/constants.js";
import {get_type_config} from "./config/index.js";
import {DataAccessor} from "./data_accessor";
import {extract_vector, extract_map, fill_vector} from "./emscripten.js";
import {bindall, get_column_type} from "./utils.js";
import {Server} from "./api/server.js";

import formatters from "./view_formatters";

if (typeof self !== "undefined" && self.performance === undefined) {
    self.performance = {now: Date.now};
}

const WARNED_KEYS = new Set();

/**
 * The main API module for `@finos/perspective`.
 *
 * For more information, see the
 * [Javascript user guide](https://perspective.finos.org/docs/md/js.html).
 *
 * @module perspective
 */
export default function (Module) {
    let __MODULE__ = Module;
    let accessor = new DataAccessor();
    const SIDES = ["zero", "one", "two"];

    /***************************************************************************
     *
     * Private
     *
     */

    let _POOL_DEBOUNCES = {};

    function _set_process(pool, table_id) {
        if (!_POOL_DEBOUNCES[table_id]) {
            _POOL_DEBOUNCES[table_id] = pool;
            setTimeout(() => _call_process(table_id));
        } else {
            pool.delete();
        }
    }

    function _call_process(table_id) {
        const pool = _POOL_DEBOUNCES[table_id];
        if (pool) {
            pool._process();
            _remove_process(table_id);
        }
    }

    function _remove_process(table_id) {
        _POOL_DEBOUNCES[table_id]?.delete();
        delete _POOL_DEBOUNCES[table_id];
    }

    function memory_usage() {
        const mem = performance.memory
            ? JSON.parse(
                  JSON.stringify(performance.memory, [
                      "totalJSHeapSize",
                      "usedJSHeapSize",
                      "jsHeapSizeLimit",
                  ])
              )
            : process.memoryUsage();
        mem.wasmHeap = __MODULE__.HEAP8.length;
        return mem;
    }

    /**
     * Common logic for creating and registering a Table.
     *
     * @param {DataAccessor|Object[]} accessor - the data we provide to the
     * Table
     * @param {Object} _Table - `undefined` if a new table will be created, or
     * an `std::shared_ptr<Table>` if updating.
     * @param {String} index - A column name to be used as a primary key.
     * @param {Number} limit - an upper bound on the number of rows in the
     * table. If set, new rows that exceed the limit start overwriting old ones
     * from row 0.
     * @param {t_op} op - either `OP_INSERT` or `OP_DELETE`
     * @param {boolean} is_update - true if we are updating an already-created
     * table
     * @param {boolean} is_arrow - true if the dataset is in the Arrow format
     * @param {Number} port_id - an integer indicating the internal `t_port`
     * which should receive this update.
     *
     * @private
     * @returns {Table} An `std::shared_ptr<Table>` to a `Table` inside C++.
     */
    function make_table(
        accessor,
        _Table,
        index,
        limit,
        op,
        is_update,
        is_arrow,
        is_csv,
        port_id
    ) {
        // C++ constructor cannot take null values - use default values if
        // index or limit are null.
        if (!index) {
            index = "";
        }

        if (!limit) {
            limit = 4294967295;
        }

        _Table = __MODULE__.make_table(
            _Table,
            accessor,
            limit,
            index,
            op,
            is_update,
            is_arrow,
            is_csv,
            port_id
        );

        const pool = _Table.get_pool();
        const table_id = _Table.get_id();

        if (is_update || op == __MODULE__.t_op.OP_DELETE) {
            _set_process(pool, table_id);
        } else {
            pool._process();
            pool.delete();
        }

        return _Table;
    }

    /***************************************************************************
     *
     * View
     *
     */

    /**
     * A View object represents a specific transform (configuration or pivot,
     * filter, sort, etc) configuration on an underlying
     * {@link module:perspective~table}. A View receives all updates from the
     * {@link module:perspective~table} from which it is derived, and can be
     * serialized to JSON or trigger a callback when it is updated.  View
     * objects are immutable, and will remain in memory and actively process
     * updates until its {@link module:perspective~view#delete} method is
     * called.
     *
     * <strong>Note</strong> This constructor is not public - Views are created
     * by invoking the {@link module:perspective~table#view} method.
     *
     * @example
     * // Returns a new View, pivoted in the row space by the "name" column.
     * await table.view({group_by: ["name"]});
     *
     * @class
     * @hideconstructor
     */
    function view(table, sides, config, view_config, name) {
        this.name = name;
        this._View = undefined;
        this.table = table;

        this.config = config || {};
        this.view_config = view_config || new view_config();

        this.is_unit_context =
            this.table.index === "" &&
            sides === 0 &&
            this.view_config.group_by.length === 0 &&
            this.view_config.split_by.length === 0 &&
            this.view_config.filter.length === 0 &&
            this.view_config.sort.length === 0 &&
            this.view_config.expressions.length === 0;

        if (this.is_unit_context) {
            this._View = __MODULE__.make_view_unit(
                table._Table,
                name,
                defaults.COLUMN_SEPARATOR_STRING,
                this.view_config,
                null
            );
        } else if (sides === 0) {
            this._View = __MODULE__.make_view_zero(
                table._Table,
                name,
                defaults.COLUMN_SEPARATOR_STRING,
                this.view_config,
                null
            );
        } else if (sides === 1) {
            this._View = __MODULE__.make_view_one(
                table._Table,
                name,
                defaults.COLUMN_SEPARATOR_STRING,
                this.view_config,
                null
            );
        } else if (sides === 2) {
            this._View = __MODULE__.make_view_two(
                table._Table,
                name,
                defaults.COLUMN_SEPARATOR_STRING,
                this.view_config,
                null
            );
        }

        this.ctx = this._View.get_context();
        this.column_only = this._View.is_column_only();
        this.update_callbacks = this.table.update_callbacks;
        this.overridden_types = this.table.overridden_types;
        this._delete_callbacks = [];
        bindall(this);
    }

    /**
     * A copy of the config object passed to the {@link table#view} method which
     * created this {@link module:perspective~view}.
     *
     * @returns {Promise<object>} Shared the same key/values properties as
     * {@link module:perspective~view}
     */
    view.prototype.get_config = function () {
        return JSON.parse(JSON.stringify(this.config));
    };

    /**
     * Delete this {@link module:perspective~view} and clean up all resources
     * associated with it. View objects do not stop consuming resources or
     * processing updates when they are garbage collected - you must call this
     * method to reclaim these.
     *
     * @async
     */
    view.prototype.delete = function () {
        _remove_process(this.table.get_id());
        this._View.delete();
        this.ctx.delete();

        this.table.views.splice(this.table.views.indexOf(this), 1);
        this.table = undefined;
        let i = 0,
            j = 0;

        // Remove old update callbacks from the Table.
        while (i < this.update_callbacks.length) {
            let val = this.update_callbacks[i];
            if (val.view !== this) this.update_callbacks[j++] = val;
            i++;
        }
        this.update_callbacks.length = j;
        this._delete_callbacks.forEach((cb) => cb());
    };

    /**
     * How many pivoted sides does this {@link module:perspective~view} have?
     *
     * @private
     * @returns {number} sides The number of sides of this
     * {@link module:perspective~view}.
     */
    view.prototype.sides = function () {
        return this._View.sides();
    };

    /**
     * Counts hidden columns in the {@link module:perspective~view}. A hidden
     * column is a column used as a sort column, but not shown in the view.
     *
     * @private
     * @returns {number} sides The number of hidden columns in this
     * {@link module:perspective~view}.
     */
    view.prototype._num_hidden = function () {
        // Count hidden columns.
        let hidden = 0;
        for (const sort of this.config.sort) {
            if (this.config.columns.indexOf(sort[0]) === -1) {
                hidden++;
            }
        }
        return hidden;
    };

    function col_path_vector_to_string(vector) {
        let extracted = [];
        for (let i = 0; i < vector.size(); i++) {
            let s = vector.get(i);
            extracted.push(__MODULE__.scalar_to_val(s, false, true));
            s.delete();
        }
        vector.delete();
        return extracted;
    }

    const extract_vector_scalar = function (vector) {
        // handles deletion already - do not call delete() on the input vector
        // again
        let extracted = [];
        for (let i = 0; i < vector.size(); i++) {
            let item = vector.get(i);
            extracted.push(col_path_vector_to_string(item));
        }
        vector.delete();
        return extracted;
    };

    /**
     * The schema of this {@link module:perspective~view}.
     *
     * A schema is an Object, the keys of which are the columns of this
     * {@link module:perspective~view}, and the values are their string type
     * names. If this {@link module:perspective~view} is aggregated, theses will
     * be the aggregated types; otherwise these types will be the same as the
     * columns in the underlying {@link module:perspective~table}.
     *
     * @example
     * // Create a view
     * const view = await table.view({
     *      columns: ["a", "b"]
     * });
     * const schema = await view.schema(); // {a: "float", b: "string"}
     *
     * @async
     *
     * @returns {Promise<Object>} A Promise of this
     * {@link module:perspective~view}'s schema.
     */
    view.prototype.schema = function (override = true) {
        const schema = extract_map(this._View.schema());
        if (override) {
            for (const key of Object.keys(schema)) {
                let colname = key.split(defaults.COLUMN_SEPARATOR_STRING);
                colname = colname[colname.length - 1];
                if (
                    this.overridden_types[colname] &&
                    get_type_config(this.overridden_types[colname]).type ===
                        schema[key]
                ) {
                    schema[key] = this.overridden_types[colname];
                }
            }
        }
        return schema;
    };

    /**
     * The expression schema of this {@link module:perspective~view},
     * which contains only the expressions created on this view.
     *
     * A schema is an Object, the keys of which are the columns of this
     * {@link module:perspective~view}, and the values are their string type
     * names. If this {@link module:perspective~view} is aggregated, these will
     * be the aggregated types; otherwise these types will be the same as the
     * columns in the underlying {@link module:perspective~table}.
     *
     * @example
     * // Create a view with expressions
     * const view = table.view({
     *      expressions: ['"x" + "y" - 100']
     * });
     *
     * await view.expression_schema(); // {'"x" + "y" - 100': "float"}
     *
     * @async
     *
     * @returns {Promise<Object>} A Promise of this
     * {@link module:perspective~view}'s expression schema.
     */
    view.prototype.expression_schema = function (override = true) {
        const schema = extract_map(this._View.expression_schema());
        if (override) {
            for (const key of Object.keys(schema)) {
                let colname = key.split(defaults.COLUMN_SEPARATOR_STRING);
                colname = colname[colname.length - 1];
                if (
                    this.overridden_types[colname] &&
                    get_type_config(this.overridden_types[colname]).type ===
                        schema[key]
                ) {
                    schema[key] = this.overridden_types[colname];
                }
            }
        }
        return schema;
    };

    view.prototype._column_names = function (skip = false, depth = 0) {
        return extract_vector_scalar(this._View.column_names(skip, depth)).map(
            (x) => x.join(defaults.COLUMN_SEPARATOR_STRING)
        );
    };

    /**
     * Returns an array of strings containing the column paths of the View
     * without any of the source columns.
     *
     * A column path shows the columns that a given cell belongs to after pivots
     * are applied.
     *
     * @returns {Array<String>} an Array of Strings containing the column paths.
     */
    view.prototype.column_paths = function () {
        return extract_vector_scalar(this._View.column_paths()).map((x) =>
            x.join(defaults.COLUMN_SEPARATOR_STRING)
        );
    };

    view.prototype.get_data_slice = function (
        start_row,
        end_row,
        start_col,
        end_col
    ) {
        if (this.is_unit_context) {
            return __MODULE__.get_data_slice_unit(
                this._View,
                start_row,
                end_row,
                start_col,
                end_col
            );
        } else {
            const num_sides = this.sides();
            const nidx = SIDES[num_sides];
            return __MODULE__[`get_data_slice_${nidx}`](
                this._View,
                start_row,
                end_row,
                start_col,
                end_col
            );
        }
    };

    /**
     * Given an `options` Object, calculate the correct start/end rows and
     * columns, as well as other metadata required by the data formatter.
     *
     * @private
     * @param {Object} options User-provided options for `to_format`.
     * @returns {Object} an Object containing the parsed options.
     */
    const _parse_format_options = function (options) {
        options = options || {};
        const max_cols =
            this._View.num_columns() + (this.sides() === 0 ? 0 : 1);
        const max_rows = this._View.num_rows();
        const hidden = this._num_hidden();
        const psp_offset = this.sides() > 0 || this.column_only ? 1 : 0;

        const viewport = this.config.viewport ? this.config.viewport : {};
        const start_row =
            options.start_row || (viewport.top ? viewport.top : 0);
        const end_row = Math.min(
            max_rows,
            options.end_row !== undefined
                ? options.end_row
                : viewport.height
                ? start_row + viewport.height
                : max_rows
        );
        const start_col =
            options.start_col || (viewport.left ? viewport.left : 0);
        const end_col = Math.min(
            max_cols,
            (options.end_col !== undefined
                ? options.end_col + psp_offset
                : viewport.width
                ? start_col + viewport.width
                : max_cols) *
                (hidden + 1)
        );

        // Return the calculated values
        options.start_row = Math.floor(start_row);
        options.end_row = Math.ceil(end_row);
        options.start_col = Math.floor(start_col);
        options.end_col = Math.ceil(end_col);

        return options;
    };

    /**
     * Calculates the [min, max] of the leaf nodes of a column `colname`.
     *
     * @param {String} colname A column name in this `View`.
     * @returns {Array<Object>} A tuple of [min, max], whose types are column
     * and aggregate dependent.
     */
    view.prototype.get_min_max = function (colname) {
        if (this.is_unit_context) {
            return __MODULE__.get_min_max_unit(this._View, colname);
        } else {
            const num_sides = this.sides();
            const nidx = SIDES[num_sides];
            return __MODULE__[`get_min_max_${nidx}`](this._View, colname);
        }
    };

    /**
     * Generic base function from which `to_json`, `to_columns` etc. derives.
     *
     * @private
     */
    const to_format = function (options, formatter) {
        _call_process(this.table.get_id());
        options = _parse_format_options.bind(this)(options);
        const start_row = options.start_row;
        const end_row = options.end_row;
        const start_col = options.start_col;
        const end_col = options.end_col;
        const hidden = this._num_hidden();

        const is_formatted = options.formatted;
        const get_pkeys = !!options.index;
        const get_ids = !!options.id;
        const leaves_only = !!options.leaves_only;
        const num_sides = this.sides();
        const has_row_path = num_sides !== 0 && !this.column_only;
        const nidx = SIDES[num_sides];

        let get_from_data_slice;

        if (this.is_unit_context) {
            get_from_data_slice = __MODULE__.get_from_data_slice_unit;
        } else {
            get_from_data_slice = __MODULE__[`get_from_data_slice_${nidx}`];
        }

        const slice = this.get_data_slice(
            start_row,
            end_row,
            start_col,
            end_col
        );
        const ns = slice.get_column_names();
        const col_names = extract_vector_scalar(ns).map((x) =>
            x.join(defaults.COLUMN_SEPARATOR_STRING)
        );
        const schema = this.schema();

        let data = formatter.initDataValue();

        for (let ridx = start_row; ridx < end_row; ridx++) {
            let row_path = has_row_path ? slice.get_row_path(ridx) : undefined;
            if (
                has_row_path &&
                leaves_only &&
                row_path.size() < this.config.group_by.length
            ) {
                row_path.delete();
                continue;
            }
            let row = formatter.initRowValue();

            if (get_ids) {
                formatter.initColumnValue(data, row, "__ID__");
            }

            for (let cidx = start_col; cidx < end_col; cidx++) {
                const col_name = col_names[cidx];
                const col_type = schema[col_name];
                const type_config = get_type_config(col_type);

                if (cidx === start_col && num_sides !== 0) {
                    if (!this.column_only) {
                        formatter.initColumnValue(data, row, "__ROW_PATH__");
                        for (let i = 0; i < row_path.size(); i++) {
                            const s = row_path.get(i);
                            const value = __MODULE__.scalar_to_val(
                                s,
                                false,
                                false
                            );
                            s.delete();
                            formatter.addColumnValue(
                                data,
                                row,
                                "__ROW_PATH__",
                                value
                            );
                            if (get_ids) {
                                formatter.addColumnValue(
                                    data,
                                    row,
                                    "__ID__",
                                    value
                                );
                            }
                        }
                    }
                } else if (
                    (cidx - (num_sides > 0 ? 1 : 0)) %
                        (this.config.columns.length + hidden) >=
                    this.config.columns.length
                ) {
                    // Hidden columns are always at the end of the column names
                    // list, and we need to skip them from the output.
                    continue;
                } else {
                    let value = get_from_data_slice(slice, ridx, cidx);
                    if (is_formatted && value !== null && value !== undefined) {
                        if (col_type === "datetime" || col_type === "date") {
                            // TODO Annoyingly, CSV occupies the gray area of
                            // needing formatting _just_ for Date and Datetime -
                            // e.g., 10000 will format as CSV `"10,000.00"
                            // Otherwise, this would not need to be conditional.
                            value = new Date(value);
                            value = value.toLocaleString(
                                "en-us",
                                type_config.format
                            );
                        }
                    }
                    formatter.setColumnValue(data, row, col_name, value);
                }
            }

            if (get_pkeys) {
                const keys = slice.get_pkeys(ridx, 0);
                formatter.initColumnValue(data, row, "__INDEX__");
                for (let i = 0; i < keys.size(); i++) {
                    // TODO: if __INDEX__ and set index have the same value,
                    // don't we need to make sure that it only emits one?
                    const s = keys.get(i);
                    const value = __MODULE__.scalar_to_val(s, false, false);
                    s.delete();
                    formatter.addColumnValue(data, row, "__INDEX__", value);
                }
                keys.delete();
            }

            // we could add an api to just clone the index column if
            // it's already calculated
            if (get_ids && num_sides === 0) {
                const keys = slice.get_pkeys(ridx, 0);
                for (let i = 0; i < keys.size(); i++) {
                    const s = keys.get(i);
                    const value = __MODULE__.scalar_to_val(s, false, false);
                    s.delete();
                    formatter.addColumnValue(data, row, "__ID__", value);
                }
                keys.delete();
            }

            if (row_path) {
                row_path.delete();
            }
            formatter.addRow(data, row);
        }

        slice.delete();
        return formatter.formatData(data, options.config);
    };

    /**
     * Generic base function for returning serialized data for a single column.
     *
     * @private
     */
    const column_to_format = function (col_name, options, format_function) {
        const num_rows = this.num_rows();
        const start_row = options.start_row || 0;
        const end_row = options.end_row || num_rows;
        const names = this._column_names();
        let idx = names.indexOf(col_name);

        if (idx === -1) {
            return undefined;
        }

        // mutate the column index if necessary: in pivoted views, columns start
        // at 1
        const num_sides = this.sides();
        if (num_sides > 0) {
            idx++;
        }

        // use a specified data slice, if provided
        let slice, data_slice;

        if (!options.data_slice) {
            data_slice = this.get_data_slice(start_row, end_row, idx, idx + 1);
            slice = data_slice.get_slice();
        } else {
            slice = options.data_slice.get_column_slice(idx);
        }

        const dtype = this._View.get_column_dtype(idx);

        const rst = format_function(slice, dtype, idx);
        slice.delete();
        if (data_slice) {
            data_slice.delete();
        }
        return rst;
    };

    /**
     * Serializes this view to JSON data in a column-oriented format.
     *
     * @async
     *
     * @param {Object} [options] An optional configuration object.
     * @param {number} options.start_row The starting row index from which to
     * serialize.
     * @param {number} options.end_row The ending row index from which to
     * serialize.
     * @param {number} options.start_col The starting column index from which to
     * serialize.
     * @param {number} options.end_col The ending column index from which to
     * serialize.
     * @param {boolean} [config.index=false] Should the index from the
     * underlying {@link module:perspective~table} be in the output (as
     * `"__INDEX__"`).
     *
     * @returns {Promise<Array>} A Promise resolving to An array of Objects
     * representing the rows of this {@link module:perspective~view}.  If this
     * {@link module:perspective~view} had a "group_by" config parameter
     * supplied when constructed, each row Object will have a "__ROW_PATH__"
     * key, whose value specifies this row's aggregated path.  If this
     * {@link module:perspective~view} had a "split_by" config parameter
     * supplied, the keys of this object will be comma-prepended with their
     * comma-separated column paths.
     */
    view.prototype.to_columns = function (options) {
        return to_format.call(this, options, formatters.jsonTableFormatter);
    };

    /**
     * Serializes this view to JSON data in a row-oriented format.
     *
     * @async
     *
     * @param {Object} [options] An optional configuration object.
     * @param {number} options.start_row The starting row index from which to
     * serialize.
     * @param {number} options.end_row The ending row index from which to
     * serialize.
     * @param {number} options.start_col The starting column index from which to
     * serialize.
     * @param {number} options.end_col The ending column index from which to
     * serialize.
     *
     * @returns {Promise<Array>} A Promise resolving to An array of Objects
     * representing the rows of this {@link module:perspective~view}.  If this
     * {@link module:perspective~view} had a "group_by" config parameter
     * supplied when constructed, each row Object will have a "__ROW_PATH__"
     * key, whose value specifies this row's aggregated path.  If this
     * {@link module:perspective~view} had a "split_by" config parameter
     * supplied, the keys of this object will be comma-prepended with their
     * comma-separated column paths.
     */
    view.prototype.to_json = function (options) {
        return to_format.call(this, options, formatters.jsonFormatter);
    };

    /**
     * Serializes this view to CSV data in a standard format.
     *
     * @async
     *
     * @param {Object} [options] An optional configuration object.
     * @param {number} options.start_row The starting row index from which to
     * serialize.
     * @param {number} options.end_row The ending row index from which to
     * serialize.
     * @param {number} options.start_col The starting column index from which to
     * serialize.
     * @param {number} options.end_col The ending column index from which to
     * serialize.
     * @returns {Promise<string>} A Promise resolving to a string in CSV format
     * representing the rows of this {@link module:perspective~view}.  If this
     * {@link module:perspective~view} had a "group_by" config parameter
     * supplied when constructed, each row will have prepended those values
     * specified by this row's aggregated path.  If this
     * {@link module:perspective~view} had a "split_by" config parameter
     * supplied, the keys of this object will be comma-prepended with their
     * comma-separated column paths.
     */
    view.prototype.to_csv = function (options) {
        _call_process(this.table.get_id());
        options = _parse_format_options.bind(this)(options);
        const start_row = options.start_row;
        const end_row = options.end_row;
        const start_col = options.start_col;
        const end_col = options.end_col;
        const sides = this.sides();
        if (this.is_unit_context) {
            return __MODULE__.to_csv_unit(
                this._View,
                start_row,
                end_row,
                start_col,
                end_col
            );
        } else if (sides === 0) {
            return __MODULE__.to_csv_zero(
                this._View,
                start_row,
                end_row,
                start_col,
                end_col
            );
        } else if (sides === 1) {
            return __MODULE__.to_csv_one(
                this._View,
                start_row,
                end_row,
                start_col,
                end_col
            );
        } else if (sides === 2) {
            return __MODULE__.to_csv_two(
                this._View,
                start_row,
                end_row,
                start_col,
                end_col
            );
        }
    };

    /**
     * Serializes a view column into a TypedArray.
     *
     * @async
     *
     * @param {string} column_name The name of the column to serialize.
     *
     * @param {Object} options An optional configuration object.
     *
     * @param {*} options.data_slice A data slice object from which to
     * serialize.
     *
     * @param {number} options.start_row The starting row index from which to
     * serialize.
     * @param {number} options.end_row The ending row index from which to
     * serialize.
     *
     * @returns {Promise<TypedArray>} A promise resolving to a TypedArray
     * representing the data of the column as retrieved from the
     * {@link module:perspective~view} - all pivots, aggregates, sorts, and
     * filters have been applied onto the values inside the TypedArray. The
     * TypedArray will be constructed based on data type - integers will resolve
     * to Int8Array, Int16Array, or Int32Array. Floats resolve to Float32Array
     * or Float64Array. If the column cannot be found, or is not of an
     * integer/float type, the Promise returns undefined.
     */
    view.prototype.col_to_js_typed_array = function (col_name, options = {}) {
        _call_process(this.table.get_id());
        const format_function = __MODULE__[`col_to_js_typed_array`];
        return column_to_format.call(this, col_name, options, format_function);
    };

    /**
     * Serializes a view to the Apache Arrow data format.
     *
     * @async
     *
     * @param {Object} [options] An optional configuration object.
     *
     * @param {number} options.start_row The starting row index from which to
     * serialize.
     * @param {number} options.end_row The ending row index from which to
     * serialize.
     * @param {number} options.start_col The starting column index from which to
     * serialize.
     * @param {number} options.end_col The ending column index from which to
     * serialize.
     *
     * @returns {Promise<ArrayBuffer>} An `ArrayBuffer` in the Apache Arrow
     * format containing data from the view.
     */
    view.prototype.to_arrow = function (options = {}) {
        _call_process(this.table.get_id());
        options = _parse_format_options.bind(this)(options);
        const start_row = options.start_row;
        const end_row = options.end_row;
        const start_col = options.start_col;
        const end_col = options.end_col;
        const sides = this.sides();

        if (this.is_unit_context) {
            return __MODULE__.to_arrow_unit(
                this._View,
                start_row,
                end_row,
                start_col,
                end_col
            );
        } else if (sides === 0) {
            return __MODULE__.to_arrow_zero(
                this._View,
                start_row,
                end_row,
                start_col,
                end_col
            );
        } else if (sides === 1) {
            return __MODULE__.to_arrow_one(
                this._View,
                start_row,
                end_row,
                start_col,
                end_col
            );
        } else if (sides === 2) {
            return __MODULE__.to_arrow_two(
                this._View,
                start_row,
                end_row,
                start_col,
                end_col
            );
        }
    };

    /**
     * The number of aggregated rows in this {@link module:perspective~view}.
     * This is affected by the "group_by" configuration parameter supplied to
     * this {@link module:perspective~view}'s contructor.
     *
     * @async
     *
     * @returns {Promise<number>} The number of aggregated rows.
     */
    view.prototype.num_rows = function () {
        _call_process(this.table.get_id());
        return this._View.num_rows();
    };

    /**
     * The number of aggregated columns in this {@link view}.  This is affected
     * by the "split_by" configuration parameter supplied to this
     * {@link view}'s contructor.
     *
     * @async
     *
     * @returns {Promise<number>} The number of aggregated columns.
     */
    view.prototype.num_columns = function () {
        const ncols = this._View.num_columns();
        const nhidden = this._num_hidden();
        return (
            ncols - (ncols / (this.config.columns.length + nhidden)) * nhidden
        );
    };

    /**
     * Whether this row at index `idx` is in an expanded or collapsed state.
     *
     * @async
     *
     * @returns {Promise<bool>} Whether this row is expanded.
     */
    view.prototype.get_row_expanded = function (idx) {
        return this._View.get_row_expanded(idx);
    };

    /**
     * Expands the row at index `idx`.
     *
     * @async
     *
     * @returns {Promise<void>}
     */
    view.prototype.expand = function (idx) {
        return this._View.expand(idx, this.config.group_by.length);
    };

    /**
     * Collapses the row at index `idx`.
     *
     * @async
     *
     * @returns {Promise<void>}
     */
    view.prototype.collapse = function (idx) {
        return this._View.collapse(idx);
    };

    /**
     * Set expansion `depth` of the pivot tree.
     *
     */
    view.prototype.set_depth = function (depth) {
        return this._View.set_depth(depth, this.config.group_by.length);
    };

    /**
     * Returns the data of all changed rows in JSON format, or for 1+ sided
     * contexts the entire dataset of the view.
     * @private
     */
    view.prototype._get_step_delta = async function () {
        let delta = this._View.get_step_delta(0, 2147483647);
        let data;
        if (delta.cells.size() === 0) {
            // FIXME This is currently not implemented for 1+ sided contexts.
            data = this.to_json();
        } else {
            let rows = {};
            for (let x = 0; x < delta.cells.size(); x++) {
                rows[delta.cells.get(x).row] = true;
            }
            rows = Object.keys(rows);
            const results = rows.map((row) =>
                this.to_json({
                    start_row: Number.parseInt(row),
                    end_row: Number.parseInt(row) + 1,
                })
            );
            data = [].concat.apply([], results);
        }
        delta.cells.delete();
        return data;
    };

    /**
     * Returns an Arrow-serialized dataset that contains the data from updated
     * rows. Do not call this function directly, instead use the
     * {@link module:perspective~view}'s `on_update` method with `{mode: "row"}`
     * in order to access the row deltas.
     *
     * @private
     */
    view.prototype._get_row_delta = async function () {
        if (this.is_unit_context) {
            return __MODULE__.get_row_delta_unit(this._View);
        } else {
            const sides = this.sides();
            const nidx = SIDES[sides];
            return __MODULE__[`get_row_delta_${nidx}`](this._View);
        }
    };

    /**
     * Register a callback with this {@link module:perspective~view}. Whenever
     * the {@link module:perspective~view}'s underlying table emits an update,
     * this callback will be invoked with an object containing `port_id`,
     * indicating which port the update fired on, and optionally `delta`, which
     * is the new data that was updated for each cell or each row.
     *
     * @example
     * // Attach an `on_update` callback
     * view.on_update(updated => console.log(updated.port_id));
     *
     * @example
     * // `on_update` with row deltas
     * view.on_update(updated => console.log(updated.delta), {mode: "row"});
     *
     * @param {function} callback A callback function invoked on update, which
     * receives an object with two keys: `port_id`, indicating which port the
     * update was triggered on, and `delta`, whose value is dependent on the
     * `mode` parameter:
     *     - "none" (default): `delta` is `undefined`.
     *     - "row": `delta` is an Arrow of the updated rows.
     */
    view.prototype.on_update = function (callback, {mode = "none"} = {}) {
        _call_process(this.table.get_id());

        if (["none", "row"].indexOf(mode) === -1) {
            throw new Error(
                `Invalid update mode "${mode}" - valid modes are "none" and "row".`
            );
        }

        if (mode === "row") {
            // Enable deltas only if needed by callback
            if (!this._View._get_deltas_enabled()) {
                this._View._set_deltas_enabled(true);
            }
        }

        this.update_callbacks.push({
            view: this,
            orig_callback: callback,
            callback: async (port_id, cache) => {
                // Cache prevents repeated calls to expensive delta functions
                // for on_update callbacks triggered sequentially from the same
                // update delta.
                if (cache[port_id] === undefined) {
                    cache[port_id] = {};
                }

                let updated = {port_id};

                if (mode === "row") {
                    if (cache[port_id]["row_delta"] === undefined) {
                        cache[port_id]["row_delta"] =
                            await this._get_row_delta();
                    }
                    updated.delta = cache[port_id]["row_delta"];
                }

                // Call the callback with the updated object containing
                // `port_id` and `delta`.
                callback(updated);
            },
        });
    };

    function filterInPlace(a, condition) {
        let i = 0,
            j = 0;

        while (i < a.length) {
            const val = a[i];
            if (condition(val, i, a)) a[j++] = val;
            i++;
        }

        a.length = j;
        return a;
    }

    /*
     * Unregister a previously registered update callback with this
     * {@link module:perspective~view}.
     *
     * @example
     * // remove an `on_update` callback
     * const callback = updated => console.log(updated);
     * view.remove_update(callback);
     *
     * @param {function} callback A update callback function to be removed
     */
    view.prototype.remove_update = function (callback) {
        _call_process(this.table.get_id());
        const total = this.update_callbacks.length;
        filterInPlace(
            this.update_callbacks,
            (x) => x.orig_callback !== callback
        );
        console.assert(
            total > this.update_callbacks.length,
            `"callback" does not match a registered updater`
        );
    };

    /**
     * Register a callback with this {@link module:perspective~view}.  Whenever
     * the {@link module:perspective~view} is deleted, this callback will be
     * invoked.
     *
     * @example
     * // attach an `on_delete` callback
     * view.on_delete(() => console.log("Deleted!"));
     *
     * @param {function} callback A callback function invoked on delete.
     */
    view.prototype.on_delete = function (callback) {
        this._delete_callbacks.push(callback);
    };

    /**
     * Unregister a previously registered delete callback with this
     * {@link module:perspective~view}.
     *
     * @example
     * // remove an `on_delete` callback
     * const callback = () => console.log("Deleted!")
     * view.remove_delete(callback);
     *
     * @param {function} callback A delete callback function to be removed
     */
    view.prototype.remove_delete = function (callback) {
        const initial_length = this._delete_callbacks.length;
        filterInPlace(this._delete_callbacks, (cb) => cb !== callback);
        console.assert(
            initial_length > this._delete_callbacks.length,
            `"callback" does not match a registered delete callbacks`
        );
    };

    /**
     * A view config is a set of options that configures the underlying
     * {@link module:perspective~view}, specifying its pivots, columns to show,
     * aggregates, filters, and sorts.
     *
     * The view config receives an `Object` containing configuration options,
     * and the `view_config` transforms it into a canonical format for
     * interfacing with the core engine.
     *
     * <strong>Note</strong> This constructor is not public - view config
     * objects should be created using standard Javascript `Object`s in the
     * {@link module:perspective~table#view} method, which has an `options`
     * parameter.
     *
     * @param {Object} config the configuration `Object` passed by the user to
     * the {@link module:perspective~table#view} method.
     * @private
     * @class
     * @hideconstructor
     */
    function view_config(config) {
        this.group_by = config.group_by || [];
        this.split_by = config.split_by || [];
        this.aggregates = config.aggregates || {};
        this.columns = config.columns;
        this.filter = config.filter || [];
        this.sort = config.sort || [];
        this.expressions = config.expressions || [];
        this.filter_op = config.filter_op || "and";
        this.group_by_depth = config.group_by_depth;
        this.split_by_depth = config.split_by_depth;
    }

    /**
     * Transform configuration items into `std::vector` objects for interface
     * with C++. `this.aggregates` is not transformed into a C++ map, as the use
     * of `ordered_map` in the engine makes binding more difficult.
     *
     * @private
     */
    view_config.prototype.get_group_by = function () {
        let vector = __MODULE__.make_string_vector();
        return fill_vector(vector, this.group_by);
    };

    view_config.prototype.get_split_by = function () {
        let vector = __MODULE__.make_string_vector();
        return fill_vector(vector, this.split_by);
    };

    view_config.prototype.get_columns = function () {
        let vector = __MODULE__.make_string_vector();
        return fill_vector(vector, this.columns);
    };

    view_config.prototype.get_filter = function () {
        let vector = __MODULE__.make_2d_val_vector();
        for (let filter of this.filter) {
            let filter_vector = __MODULE__.make_val_vector();
            let filled = fill_vector(filter_vector, filter);
            vector.push_back(filled);
        }
        return vector;
    };

    view_config.prototype.get_sort = function () {
        let vector = __MODULE__.make_2d_string_vector();
        for (let sort of this.sort) {
            let sort_vector = __MODULE__.make_string_vector();
            let filled = fill_vector(sort_vector, sort);
            vector.push_back(filled);
        }
        return vector;
    };

    view_config.prototype.get_expressions = function () {
        let vector = __MODULE__.make_2d_val_vector();
        for (let expression of this.expressions) {
            let inner = __MODULE__.make_val_vector();
            for (let val of expression) {
                inner.push_back(val);
            }
            vector.push_back(inner);
        }
        return vector;
    };

    /***************************************************************************
     *
     * Table
     *
     */

    /**
     * A Table object is the basic data container in Perspective.  Tables are
     * typed - they have an immutable set of column names, and a known type for
     * each.
     *
     * <strong>Note</strong> This constructor is not public - Tables are created
     * by invoking the {@link module:perspective~table} factory method, either
     * on the perspective module object, or an a
     * {@link module:perspective~worker} instance.
     *
     * @class
     * @hideconstructor
     */
    function table(_Table, index, limit, overridden_types) {
        this._Table = _Table;
        const gnode = this._Table.get_gnode();
        this.gnode_id = gnode.get_id();
        gnode.delete();
        const pool = this._Table.get_pool();
        pool.set_update_delegate(this);
        pool.delete();
        this.name = Math.random() + "";
        this.initialized = false;
        this.index = index;
        this.limit = limit;
        this.update_callbacks = [];
        this._delete_callbacks = [];
        this.views = [];
        this.overridden_types = overridden_types;
        bindall(this);
    }

    table.prototype.get_id = function () {
        return this._Table.get_id();
    };

    table.prototype.get_pool = function () {
        return this._Table.get_pool();
    };

    table.prototype.make_port = function () {
        return this._Table.make_port();
    };

    table.prototype.remove_port = function () {
        this._Table.remove_port();
    };

    table.prototype._update_callback = function (port_id) {
        let cache = {};
        for (let e in this.update_callbacks) {
            this.update_callbacks[e].callback(port_id, cache);
        }
    };

    /**
     * Returns the user-specified index column for this
     * {@link module:perspective~table} or null if an index is not set.
     */
    table.prototype.get_index = function () {
        return this.index;
    };

    /**
     * Returns the user-specified limit column for this
     * {@link module:perspective~table} or null if an limit is not set.
     */
    table.prototype.get_limit = function () {
        return this.limit;
    };

    /**
     * Remove all rows in this {@link module:perspective~table} while preserving
     * the schema and construction options.
     */
    table.prototype.clear = function () {
        _remove_process(this.get_id());
        this._Table.reset_gnode(this.gnode_id);
    };

    /**
     * Replace all rows in this {@link module:perspective~table} the input data.
     */
    table.prototype.replace = function (data) {
        _remove_process(this.get_id());
        this._Table.reset_gnode(this.gnode_id);
        this.update(data);
        _call_process(this.get_id());
    };

    /**
     * Delete this {@link module:perspective~table} and clean up all resources
     * associated with it. Table objects do not stop consuming resources or
     * processing updates when they are garbage collected - you must call this
     * method to reclaim these.
     */
    table.prototype.delete = function () {
        if (this.views.length > 0) {
            throw `Cannot delete Table as it still has ${this.views.length} registered View(s).`;
        }
        _remove_process(this.get_id());
        this._Table.unregister_gnode(this.gnode_id);
        this._Table.delete();

        // Call delete callbacks
        for (const callback of this._delete_callbacks) {
            callback();
        }
    };

    /**
     * Register a callback with this {@link module:perspective~table}.  Whenever
     * the {@link module:perspective~table} is deleted, this callback will be
     * invoked.
     *
     * @param {function} callback A callback function with no parameters
     *      that will be invoked on `delete()`.
     */
    table.prototype.on_delete = function (callback) {
        this._delete_callbacks.push(callback);
    };

    /**
     * Unregister a previously registered delete callback with this
     * {@link module:perspective~table}.
     *
     * @param {function} callback A delete callback function to be removed
     */
    table.prototype.remove_delete = function (callback) {
        const initial_length = this._delete_callbacks.length;
        filterInPlace(this._delete_callbacks, (cb) => cb !== callback);
        console.assert(
            initial_length > this._delete_callbacks.length,
            `"callback" does not match a registered delete callbacks`
        );
    };

    /**
     * The number of accumulated rows in this {@link module:perspective~table}.
     * This is affected by the "index" configuration parameter supplied to this
     * {@link module:perspective~view}'s contructor - as rows will be
     * overwritten when they share an idnex column.
     *
     * @async
     *
     * @returns {Promise<number>} The number of accumulated rows.
     */
    table.prototype.size = function () {
        _call_process(this._Table.get_id());
        return this._Table.size();
    };

    /**
     * The schema of this {@link module:perspective~table}.  A schema is an
     * Object whose keys are the columns of this
     * {@link module:perspective~table}, and whose values are their string type
     * names.
     *
     * @async
     * @returns {Promise<Object>} A Promise of this
     * {@link module:perspective~table}'s schema.
     */
    table.prototype.schema = function (override = true) {
        let schema = this._Table.get_schema();
        let columns = schema.columns();
        let types = schema.types();
        let new_schema = {};
        for (let key = 0; key < columns.size(); key++) {
            const name = columns.get(key);
            if (name === "psp_okey") {
                continue;
            }
            if (override && this.overridden_types[name]) {
                new_schema[name] = this.overridden_types[name];
            } else {
                new_schema[name] = get_column_type(types.get(key).value);
            }
        }
        schema.delete();
        columns.delete();
        types.delete();
        return new_schema;
    };

    /**
     * Transform an expression string into a vector that internally provides
     * the engine with more metadata in order to efficiently compute the
     * expression:
     *
     * v[0]: the expression string as typed by the user
     * v[1]: the expression string with "column" replaced with col0, col1,
     *  etc., which allows for faster lookup of column values.
     * v[2]: a map of column keys (col0, col1) to actual column names,
     *  which will be used in the engine to look up column values.
     *
     * @private
     * @param {Array<String>} expressions
     */
    function parse_expression_strings(expressions) {
        let validated_expressions = [];
        const expression_idx_map = {};

        for (let expression_string of expressions) {
            if (expression_string.includes('""')) {
                console.error(
                    `Skipping expression '${expression_string}', as it cannot reference an empty column!`
                );
                continue;
            }

            // Map of column names to column IDs, so that we generate
            // column IDs correctly without collision.
            let column_name_map = {};

            // Map of column IDs to column names, so the engine can look
            // up the right column internally without more transforms.
            let column_id_map = {};
            let running_cidx = 0;

            // First, look for a column alias, which is a // style comment
            // on the first line of the expression.
            let expression_alias;
            let alias_match = expression_string.match(/^\/\/(?<alias>.+?)\n/);

            if (alias_match?.groups?.alias) {
                expression_alias = alias_match.groups.alias.trim();
            }

            // If an alias does not exist, the alias is the expression itself.
            if (!expression_alias || expression_alias.length == 0) {
                expression_alias = expression_string;
            }

            // Replace `true` and `false` reserved words with symbols
            let parsed_expression_string = expression_string.replace(
                /([a-zA-Z_]+[a-zA-Z0-9_]*)/g,
                (match) => {
                    if (match == "true") {
                        return "True";
                    } else if (match == "false") {
                        return "False";
                    } else {
                        return match;
                    }
                }
            );

            parsed_expression_string = parsed_expression_string.replace(
                /\"(.*?[^\\])\"/g,
                (_, cname) => {
                    // If the column name contains escaped double quotes, replace
                    // them and assume that they escape one double quote. If there
                    // are multiple double quotes being escaped, i.e. \""...well?
                    cname = cname.replace(/\\"/g, '"');

                    if (column_name_map[cname] === undefined) {
                        let column_id = `COLUMN${running_cidx}`;
                        column_name_map[cname] = column_id;
                        column_id_map[column_id] = cname;
                    }

                    running_cidx++;
                    return column_name_map[cname];
                }
            );

            // Replace single quote string literals and wrap them in a call to
            // intern() which makes sure they don't leak
            parsed_expression_string = parsed_expression_string.replace(
                /'(.*?[^\\])'/g,
                (match) => `intern(${match})`
            );

            const replace_interned_param = (match, _, intern_fn, value) => {
                // Takes a string of the form fn(x, intern('y'))
                // and removes intern() to create fn(x, 'y')
                const intern_idx = match.indexOf(intern_fn);
                return `${match.substring(
                    0,
                    intern_idx
                )}'${value}'${match.substring(intern_idx + intern_fn.length)}`;
            };

            // Replace intern() for bucket and regex functions that take
            // a string literal parameter and does not work if that param is
            // interned. TODO: this is clumsy and we should have a better
            // way of handling it.
            // TODO I concur  -- texodus
            parsed_expression_string = parsed_expression_string.replace(
                /(bucket|match|match_all|search|indexof)\(.*?,\s*(intern\(\'(.+)\'\)).*\)/g,
                replace_interned_param
            );

            // replace and replace_all have multiple string params, only one of
            // which needs to be interned - the regex differs from the one
            // above as it asserts the middle parameter is the one to be
            // replaced.
            parsed_expression_string = parsed_expression_string.replace(
                /(replace_all|replace)\(.*?,\s*(intern\(\'(.*)\'\)),.*\)/g,
                replace_interned_param
            );

            const validated = [
                expression_alias,
                expression_string,
                parsed_expression_string,
                column_id_map,
            ];

            // Check if this expression is already in the array, if so then
            // we need to replace the expression so the last expression tagged
            // with the alias is the one that is applied to the engine.
            if (expression_idx_map[expression_alias] !== undefined) {
                const idx = expression_idx_map[expression_alias];
                validated_expressions[idx] = validated;
            } else {
                validated_expressions.push(validated);
                expression_idx_map[expression_alias] =
                    validated_expressions.length - 1;
            }
        }

        return validated_expressions;
    }

    /**
     * Given an array of expressions, return an object containing `expressions`,
     * which map expression aliases to data types, and `errors`, which
     * maps expression aliases to error messages. If an expression that was
     * passed in is not in `expressions`, it is guaranteed to be in `errors`.
     *
     * @async
     * @param {Array<String>} expressions An array of string expressions to
     * be validated.
     *
     * @returns {Promise<Object>}
     *
     * @example
     * const results = await table.validate_expressions([
     *  '"Sales" + "Profit"', "invalid", "1 + 'string'"
     * ]);
     *
     * // {'"Sales" + "Profit"': "float"}
     * console.log(results.expression_schema);
     *
     * // {
     * //   "invalid": {column: 0, line: 0, error_message: "unknown token!"},
     * //   "1 + 'string'": {column: 0, line: 0, error_message: "Type Error"}
     * // }
     * console.log(results.errors);
     */
    table.prototype.validate_expressions = function (
        expressions,
        override = true
    ) {
        const validated = {
            expression_schema: {},
            expression_alias: {},
            errors: {},
        };

        if (!expressions || expressions.length === 0) return validated;
        expressions = parse_expression_strings(expressions);

        // Transform Array into a C++ vector that can be passed through
        // Emscripten.
        let vector = __MODULE__.make_2d_val_vector();

        for (let expression of expressions) {
            let inner = __MODULE__.make_val_vector();
            for (let val of expression) {
                inner.push_back(val);
            }
            vector.push_back(inner);
            validated.expression_alias[expression[0]] = expression[1];
        }

        const validation_results = __MODULE__.validate_expressions(
            this._Table,
            vector
        );
        const expression_schema = validation_results.get_expression_schema();
        const expression_errors = validation_results.get_expression_errors();

        const expression_aliases = expression_schema.keys();

        for (let i = 0; i < expression_aliases.size(); i++) {
            const alias = expression_aliases.get(i);
            let dtype = expression_schema.get(alias);

            if (override && this.overridden_types[alias]) {
                dtype = this.overridden_types[alias];
            }

            validated.expression_schema[alias] = dtype;
        }

        const error_aliases = expression_errors.keys();

        for (let i = 0; i < error_aliases.size(); i++) {
            const alias = error_aliases.get(i);

            // bound using `value_object` in embind so no need to manually
            // convert to Object, or call delete() as memory is auto-managed.
            const error_object = expression_errors.get(alias);
            validated.errors[alias] = error_object;
        }

        error_aliases.delete();
        expression_aliases.delete();
        expression_errors.delete();
        expression_schema.delete();
        validation_results.delete();
        return validated;
    };

    /**
     * Validates a filter configuration, i.e. that the value to filter by is not
     * null or undefined.
     *
     * @async
     * @param {Array<string>} [filter] a filter configuration to test.
     */
    table.prototype.is_valid_filter = function (filter) {
        // isNull and isNotNull filter operators are always valid and apply to
        // all schema types
        if (
            filter[1] === perspective.FILTER_OPERATORS.isNull ||
            filter[1] === perspective.FILTER_OPERATORS.isNotNull
        ) {
            return true;
        }

        let value = filter[2];
        if (value === null) {
            return false;
        }

        const schema = this.schema();
        const exists = schema[filter[0]];
        if (
            exists &&
            (schema[filter[0]] === "date" || schema[filter[0]] === "datetime")
        ) {
            return __MODULE__.is_valid_datetime(filter[2]);
        }

        return typeof value !== "undefined" && value !== null;
    };

    /* eslint-disable max-len */

    /**
     * Create a new {@link module:perspective~view} from this table with a
     * specified configuration. For a better understanding of the View
     * configuration options, see the
     * [Documentation](https://perspective.finos.org/docs/md/view.html).
     *
     * @param {Object} [config] The configuration object for this
     * {@link module:perspective~view}.
     * @param {Array<string>} [config.group_by] An array of column names to
     * use as {@link https://en.wikipedia.org/wiki/Pivot_table#Row_labels Group By}.
     * @param {Array<string>} [config.split_by] An array of column names to
     * use as {@link https://en.wikipedia.org/wiki/Pivot_table#Column_labels Split By}.
     * @param {Array<Object>} [config.columns] An array of column names for the
     * output columns. If none are provided, all columns are output.
     * @param {Object} [config.aggregates] An object, the keys of which are
     * column names, and their respective values are the aggregates calculations
     * to use when this view has `group_by`. A column provided to
     * `config.columns` without an aggregate in this object, will use the
     * default aggregate calculation for its type.
     * @param {Array<Array<string>>} [config.filter] An Array of Filter
     * configurations to apply. A filter configuration is an array of 3
     * elements: A column name, a supported filter comparison string (e.g.
     * '===', '>'), and a value to compare.
     * @param {Array<string>} [config.sort] An Array of Sort configurations to
     * apply. A sort configuration is an array of 2 elements: A column name, and
     * a sort direction, which are: "none", "asc", "desc", "col asc", "col
     * desc", "asc abs", "desc abs", "col asc abs", "col desc abs".
     *
     * @example
     * const view = await table.view({
     *      group_by: ["region"],
     *      columns: ["region"],
     *      aggregates: {"region": "dominant"},
     *      filter: [["client", "contains", "fred"]],
     *      sort: [["value", "asc"]]
     * });
     *
     * @returns {Promise<view>} A Promise that resolves to a new
     * {@link module:perspective~view} object for the supplied configuration,
     * bound to this table.
     */
    table.prototype.view = function (_config = {}) {
        _call_process(this._Table.get_id());
        let config = {};
        for (const key of Object.keys(_config)) {
            if (defaults.CONFIG_ALIASES[key]) {
                if (!config[defaults.CONFIG_ALIASES[key]]) {
                    if (!WARNED_KEYS.has(key)) {
                        console.warn(
                            `Deprecated: "${key}" config parameter, please use "${defaults.CONFIG_ALIASES[key]}" instead`
                        );
                        WARNED_KEYS.add(key);
                    }
                    config[defaults.CONFIG_ALIASES[key]] = _config[key];
                } else {
                    throw new Error(
                        `Duplicate configuration parameter "${key}"`
                    );
                }
            } else if (key === "aggregate") {
                if (!WARNED_KEYS.has("aggregate")) {
                    console.warn(
                        `Deprecated: "aggregate" config parameter has been replaced by "aggregates" and "columns"`
                    );
                    WARNED_KEYS.add("aggregate");
                }
                // backwards compatibility: deconstruct `aggregate` into
                // `aggregates` and `columns`
                config["aggregates"] = {};
                config["columns"] = [];
                for (const agg of _config["aggregate"]) {
                    config["aggregates"][agg["column"]] = agg["op"];
                    config["columns"].push(agg["column"]);
                }
            } else if (defaults.CONFIG_VALID_KEYS.indexOf(key) > -1) {
                config[key] = _config[key];
            } else {
                throw new Error(`Unrecognized config parameter "${key}"`);
            }
        }

        config.group_by = config.group_by || [];
        config.split_by = config.split_by || [];
        config.aggregates = config.aggregates || {};
        config.filter = config.filter || [];
        config.sort = config.sort || [];
        config.expressions = config.expressions || [];

        const table_schema = this.schema();

        if (config.expressions.length > 0) {
            config.expressions = parse_expression_strings(config.expressions);
        }

        if (config.columns === undefined) {
            // If columns are not provided, use all columns
            config.columns = this.columns();

            if (config.expressions.length > 0) {
                for (const expr of config.expressions) {
                    config.columns.push(expr[0]);
                }
            }
        }

        // convert date/datetime filters to Date() objects, so they are parsed
        // as local time
        if (config.filter.length > 0) {
            for (let filter of config.filter) {
                // TODO: this does not work for expressions
                const dtype = table_schema[filter[0]];
                const is_compare =
                    filter[1] !== perspective.FILTER_OPERATORS.isNull &&
                    filter[1] !== perspective.FILTER_OPERATORS.isNotNull;
                if (is_compare && (dtype === "date" || dtype === "datetime")) {
                    // new Date() accepts strings and new Date() objects, so no
                    // need to type check here.
                    filter[2] = new Date(filter[2]);
                }
            }
        }

        let name = Math.random() + "";
        let sides;

        if (config.group_by.length > 0 || config.split_by.length > 0) {
            if (config.split_by && config.split_by.length > 0) {
                sides = 2;
            } else {
                sides = 1;
            }
        } else {
            sides = 0;
        }

        let vc = new view_config(config);
        let v = new view(this, sides, config, vc, name);
        this.views.push(v);
        return v;
    };

    /* eslint-enable max-len */

    let meter;

    function initialize_profile_thread() {
        if (meter === undefined) {
            let _msgs = 0;
            let start = performance.now();
            setTimeout(function poll() {
                let now = performance.now();
                console.log(
                    `${((1000 * _msgs) / (now - start)).toFixed(2)} msgs/sec`
                );
                _msgs = 0;
                start = now;
                setTimeout(poll, 5000);
            }, 5000);
            meter = function update(x) {
                _msgs += x;
            };
            console.log("Profiling initialized");
        }
    }

    /**
     * Updates the rows of a {@link module:perspective~table}. Updated rows are
     * pushed down to any derived {@link module:perspective~view} objects.
     *
     * @param {Object<string, Array>|Array<Object>|string} data The input data
     * for this table. {@link module:perspective~table}s are immutable after
     * creation, so this method cannot be called with a schema.
     *
     * Otherwise, the supported input types are the same as the
     * {@link module:perspective~table} constructor.
     *
     * @see {@link module:perspective~table}
     */
    table.prototype.update = function (data, options) {
        options = options || {};
        options.port_id = options.port_id || 0;

        let pdata;
        let cols = this.columns();
        let schema = this._Table.get_schema();
        let types = schema.types();
        let is_arrow = false;
        let is_csv = false;

        pdata = accessor;

        if (data instanceof ArrayBuffer) {
            pdata = new Uint8Array(data);
            is_arrow = true;
        } else if (typeof data === "string") {
            if (data[0] === ",") {
                data = "_" + data;
            }
            is_csv = true;
            is_arrow = true;
            pdata = data;
        } else {
            accessor.init(data);
            accessor.names = cols.concat(
                accessor.names.filter((x) => x === "__INDEX__")
            );
            accessor.types = extract_vector(types).slice(0, cols.length);

            if (meter) {
                meter(accessor.row_count);
            }
        }

        if (!is_arrow) {
            if (pdata.row_count === 0) {
                console.warn("table.update called with no data - ignoring");
                return;
            }

            // process implicit index column
            const has_index = accessor.names.indexOf("__INDEX__");
            if (has_index != -1) {
                const explicit_index = !!this.index;
                if (explicit_index) {
                    // find the type of the index column
                    accessor.types.push(
                        accessor.types[accessor.names.indexOf(this.index)]
                    );
                } else {
                    // default index is an integer
                    accessor.types.push(__MODULE__.t_dtype.DTYPE_INT32);
                }
            }
        }

        try {
            const op = __MODULE__.t_op.OP_INSERT;
            // update the Table in C++, but don't keep the returned C++ Table
            // reference as it is identical
            make_table(
                pdata,
                this._Table,
                this.index,
                this.limit,
                op,
                true,
                is_arrow,
                is_csv,
                options.port_id
            ).delete();
            this.initialized = true;
        } catch (e) {
            console.error(`Update failed: ${e}`);
        } finally {
            schema.delete();
        }
    };

    /**
     * Removes the rows of a {@link module:perspective~table}. Removed rows are
     * pushed down to any derived {@link module:perspective~view} objects.
     *
     * @param {Array<Object>} data An array of primary keys to remove.
     *
     * @see {@link module:perspective~table}
     */
    table.prototype.remove = function (data, options) {
        if (!this.index) {
            console.error(
                "Cannot call `remove()` on a Table without a user-specified index."
            );
            return;
        }

        options = options || {};
        options.port_id = options.port_id || 0;
        let pdata;
        let cols = this.columns();
        let schema = this._Table.get_schema();
        let types = schema.types();
        let is_arrow = false;

        data = data.map((idx) => ({[this.index]: idx}));

        if (data instanceof ArrayBuffer) {
            pdata = new Uint8Array(data);
            is_arrow = true;
        } else {
            accessor.init(data);
            accessor.names = [this.index];
            accessor.types = [extract_vector(types)[cols.indexOf(this.index)]];
            pdata = accessor;
        }

        try {
            const op = __MODULE__.t_op.OP_DELETE;
            // update the Table in C++, but don't keep the returned Table
            // reference as it is identical
            make_table(
                pdata,
                this._Table,
                this.index,
                this.limit,
                op,
                false,
                is_arrow,
                false,
                options.port_id
            ).delete();
            this.initialized = true;
        } catch (e) {
            console.error(`Remove failed`, e);
        } finally {
            schema.delete();
        }
    };

    /**
     * The column names of this table.
     *
     * @async
     * @returns {Promise<Array<string>>} An array of column names for this
     * table.
     */
    table.prototype.columns = function () {
        let schema = this._Table.get_schema();
        let cols = schema.columns();
        let names = [];
        for (let cidx = 0; cidx < cols.size(); cidx++) {
            let name = cols.get(cidx);
            if (name !== "psp_okey") {
                names.push(name);
            }
        }
        schema.delete();
        cols.delete();
        return names;
    };

    table.prototype.execute = function (f) {
        f(this);
    };

    /***************************************************************************
     *
     * Perspective
     *
     */

    const perspective = {
        __module__: __MODULE__,

        Server,

        worker: function () {
            return this;
        },

        initialize_profile_thread,

        memory_usage,

        /**
         * A factory method for constructing {@link module:perspective~table}s.
         *
         * @example
         * // Creating a table directly from node
         * const table = await perspective.table([{x: 1}, {x: 2}]);
         *
         * @example
         * // Creating a table from a Web Worker (instantiated via the worker()
         * method).
         * const table = await worker.table([{x: 1}, {x: 2}]);
         *
         * @param {Object<string, Array>|Object<string,
         *     string>|Array<Object>|string} data The input data for this table.
         *     When supplied an Object with string values, an empty table is
         *     returned using this Object as a schema. When an Object with
         *     Array values is supplied, a table is returned using this object's
         *     key/value pairs as name/columns respectively. When an Array is
         *     supplied, a table is constructed using this Array's objects as
         *     rows. When a string is supplied, the parameter as parsed as a
         *     CSV.
         * @param {Object} [options] An optional options dictionary.
         * @param {string} options.index The name of the column in the resulting
         *     table to treat as an index. When updating this table, rows
         *     sharing an index of a new row will be overwritten. `index`
         *     cannot be applied at the same time as `limit`.
         * @param {integer} options.limit The maximum number of rows that can be
         *     added to this table. When exceeded, old rows will be overwritten
         *     in the order they were inserted. `limit` cannot be applied at
         *     the same time as `index`.
         *
         * @returns {Promise<table>} A Promise that will resolve to a new
         * {@link module:perspective~table} object, or be rejected if an error
         * happens during Table construction.
         */
        table: function (data, options) {
            options = options || {};

            // Always store index and limit as user-provided values or `null`.
            options.index = options.index || null;
            options.limit = options.limit || null;

            let data_accessor;
            let is_arrow = false;
            let overridden_types = {};
            let is_csv = false;

            if (
                data instanceof ArrayBuffer ||
                (typeof Buffer !== "undefined" && data instanceof Buffer)
            ) {
                data_accessor = new Uint8Array(data);
                is_arrow = true;
            } else if (typeof data === "string") {
                if (data[0] === ",") {
                    data = "_" + data;
                }
                is_csv = true;
                is_arrow = true;
                data_accessor = data;
            } else {
                accessor.clean();
                overridden_types = accessor.init(data);
                data_accessor = accessor;
            }

            if (options.index && options.limit) {
                throw `Cannot specify both index '${options.index}' and limit '${options.limit}'.`;
            }

            let _Table;

            try {
                const op = __MODULE__.t_op.OP_INSERT;

                // C++ Table constructor cannot take null values for index
                // and limit, so `make_table` will convert null to default
                // values of "" for index and 4294967295 for limit. Tables
                // must be created on port 0.
                _Table = make_table(
                    data_accessor,
                    undefined,
                    options.index,
                    options.limit,
                    op,
                    false,
                    is_arrow,
                    is_csv,
                    0
                );

                // Pass through user-provided values or `null` to the
                // Javascript Table constructor.
                return new table(
                    _Table,
                    options.index,
                    options.limit,
                    overridden_types
                );
            } catch (e) {
                if (_Table) {
                    _Table.delete();
                }
                console.error(`Table initialization failed: ${e}`);
                throw e;
            }
        },
    };

    for (let prop of Object.keys(defaults)) {
        perspective[prop] = defaults[prop];
    }

    /**
     * Hosting Perspective
     *
     * Create a WebWorker API that loads perspective in `init` and extends
     * `post` using the worker's `postMessage` method.
     *
     * If Perspective is running inside a Web Worker, use the WebSorkerServer as
     * default.
     *
     * @extends Server
     * @private
     */
    class WebWorkerServer extends Server {
        /**
         * On initialization, listen for messages posted from the client and
         * send it to `Server.process()`.
         *
         * @param perspective a reference to the Perspective module, allowing
         * the `Server` to access Perspective methods.
         */
        constructor(perspective) {
            super(perspective);
            self.addEventListener(
                "message",
                (e) => this.process(e.data),
                false
            );
        }

        /**
         * Implements the `Server`'s `post()` method using the Web Worker
         * `postMessage()` API.
         *
         * @param {Object} msg a message to pass to the client
         * @param {*} transfer a transferable object to pass to the client, if
         * needed
         */
        post(msg, transfer) {
            self.postMessage(msg, transfer);
        }

        /**
         * When initialized, replace Perspective's internal `__MODULE` variable
         * with the WASM binary.
         *
         * @param {ArrayBuffer} buffer an ArrayBuffer or Buffer containing the
         * Perspective WASM code
         */
        init(msg) {
            if (typeof WebAssembly === "undefined") {
                throw new Error("WebAssembly not supported");
            } else {
                __MODULE__({
                    wasmBinary: msg.buffer,
                    wasmJSMethod: "native-wasm",
                }).then((mod) => {
                    __MODULE__ = mod;
                    __MODULE__.init();
                    notify_main_thread();
                    super.init(msg);
                });
            }
        }
    }

    /**
     * Use WebSorkerServer as default inside a Web Worker, where `window` is
     * replaced with `self`.
     */
    if (typeof self !== "undefined" && self.addEventListener) {
        new WebWorkerServer(perspective);
    }

    return perspective;
}

function notify_main_thread() {
    if (typeof self !== "undefined") {
        try {
            if (
                self.dispatchEvent &&
                !self._perspective_initialized &&
                self.document !== null
            ) {
                self._perspective_initialized = true;
                const event = self.document.createEvent("Event");
                event.initEvent("perspective-ready", false, true);
                self.dispatchEvent(event);
            } else if (!self.document && self.postMessage) {
                self.postMessage({});
            }
        } catch (e) {}
    }
}
