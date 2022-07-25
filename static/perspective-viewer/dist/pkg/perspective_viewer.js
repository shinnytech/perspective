import { ClipboardItem } from './snippets/perspective-viewer-362cf5cec2bfcc07/inline0.js';
import { default as default1 } from './snippets/perspective-viewer-362cf5cec2bfcc07/inline1.js';
import { monaco_module } from './snippets/perspective-viewer-362cf5cec2bfcc07/inline2.js';
import { ResizeObserver } from './snippets/perspective-viewer-362cf5cec2bfcc07/inline3.js';

let wasm;

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

let heap_next = heap.length;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function getObject(idx) { return heap[idx]; }

let WASM_VECTOR_LEN = 0;

let cachedTextEncoder = new TextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachegetFloat64Memory0 = null;
function getFloat64Memory0() {
    if (cachegetFloat64Memory0 === null || cachegetFloat64Memory0.buffer !== wasm.memory.buffer) {
        cachegetFloat64Memory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachegetFloat64Memory0;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);

            } else {
                state.a = a;
            }
        }
    };
    real.original = state;

    return real;
}
function __wbg_adapter_36(arg0, arg1, arg2) {
    wasm.__wbindgen_export_3(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_39(arg0, arg1, arg2) {
    var ret = wasm.__wbindgen_export_4(arg0, arg1, addHeapObject(arg2));
    return takeObject(ret);
}

function __wbg_adapter_42(arg0, arg1, arg2) {
    wasm.__wbindgen_export_5(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_45(arg0, arg1) {
    wasm.__wbindgen_export_6(arg0, arg1);
}

function makeClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        try {
            return f(state.a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(state.a, state.b);
                state.a = 0;

            }
        }
    };
    real.original = state;

    return real;
}
function __wbg_adapter_48(arg0, arg1, arg2) {
    wasm.__wbindgen_export_7(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_51(arg0, arg1, arg2) {
    wasm.__wbindgen_export_8(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_54(arg0, arg1, arg2, arg3, arg4) {
    var ret = wasm.__wbindgen_export_9(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3), addHeapObject(arg4));
    return takeObject(ret);
}

function __wbg_adapter_57(arg0, arg1, arg2) {
    var ret = wasm.__wbindgen_export_10(arg0, arg1, addHeapObject(arg2));
    return takeObject(ret);
}

function __wbg_adapter_60(arg0, arg1) {
    wasm.__wbindgen_export_11(arg0, arg1);
}

function __wbg_adapter_63(arg0, arg1, arg2) {
    wasm.__wbindgen_export_12(arg0, arg1, addHeapObject(arg2));
}

let stack_pointer = 32;

function addBorrowedObject(obj) {
    if (stack_pointer == 1) throw new Error('out of js stack');
    heap[--stack_pointer] = obj;
    return stack_pointer;
}
function __wbg_adapter_66(arg0, arg1, arg2) {
    try {
        wasm.__wbindgen_export_13(arg0, arg1, addBorrowedObject(arg2));
    } finally {
        heap[stack_pointer++] = undefined;
    }
}

let cachegetUint32Memory0 = null;
function getUint32Memory0() {
    if (cachegetUint32Memory0 === null || cachegetUint32Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint32Memory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachegetUint32Memory0;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4);
    const mem = getUint32Memory0();
    for (let i = 0; i < array.length; i++) {
        mem[ptr / 4 + i] = addHeapObject(array[i]);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_export_14(addHeapObject(e));
    }
}
/**
* @param {string} name
*/
export function register_plugin(name) {
    var ptr0 = passStringToWasm0(name, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
    var len0 = WASM_VECTOR_LEN;
    wasm.register_plugin(ptr0, len0);
}

function getArrayJsValueFromWasm0(ptr, len) {
    const mem = getUint32Memory0();
    const slice = mem.subarray(ptr / 4, ptr / 4 + len);
    const result = [];
    for (let i = 0; i < slice.length; i++) {
        result.push(takeObject(slice[i]));
    }
    return result;
}
/**
* @returns {any[]}
*/
export function get_exprtk_commands() {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.get_exprtk_commands(retptr);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var v0 = getArrayJsValueFromWasm0(r0, r1).slice();
        wasm.__wbindgen_export_15(r0, r1 * 4);
        return v0;
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

function __wbg_adapter_539(arg0, arg1, arg2, arg3) {
    wasm.__wbindgen_export_16(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}

/**
*/
export class CopyDropDownMenuElement {

    static __wrap(ptr) {
        const obj = Object.create(CopyDropDownMenuElement.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_copydropdownmenuelement_free(ptr);
    }
    /**
    * @param {HTMLElement} elem
    */
    constructor(elem) {
        var ret = wasm.copydropdownmenuelement_new(addHeapObject(elem));
        return CopyDropDownMenuElement.__wrap(ret);
    }
    /**
    * @param {HTMLElement} target
    */
    open(target) {
        wasm.copydropdownmenuelement_open(this.ptr, addHeapObject(target));
    }
    /**
    */
    hide() {
        wasm.copydropdownmenuelement_hide(this.ptr);
    }
    /**
    * @param {number} ptr
    */
    unsafe_set_model(ptr) {
        wasm.copydropdownmenuelement_unsafe_set_model(this.ptr, ptr);
    }
    /**
    */
    connected_callback() {
        wasm.copydropdownmenuelement_connected_callback(this.ptr);
    }
}
/**
*/
export class ExportDropDownMenuElement {

    static __wrap(ptr) {
        const obj = Object.create(ExportDropDownMenuElement.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_exportdropdownmenuelement_free(ptr);
    }
    /**
    * @param {HTMLElement} elem
    */
    constructor(elem) {
        var ret = wasm.exportdropdownmenuelement_new(addHeapObject(elem));
        return ExportDropDownMenuElement.__wrap(ret);
    }
    /**
    * @param {HTMLElement} target
    */
    open(target) {
        wasm.exportdropdownmenuelement_open(this.ptr, addHeapObject(target));
    }
    /**
    */
    hide() {
        wasm.exportdropdownmenuelement_hide(this.ptr);
    }
    /**
    * @param {number} ptr
    */
    unsafe_set_model(ptr) {
        wasm.exportdropdownmenuelement_unsafe_set_model(this.ptr, ptr);
    }
    /**
    */
    connected_callback() {
        wasm.exportdropdownmenuelement_connected_callback(this.ptr);
    }
}
/**
*/
export class ExpressionEditorElement {

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_expressioneditorelement_free(ptr);
    }
}
/**
*/
export class FilterDropDownElement {

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_filterdropdownelement_free(ptr);
    }
}
/**
*/
export class PerspectiveNumberColumnStyleElement {

    static __wrap(ptr) {
        const obj = Object.create(PerspectiveNumberColumnStyleElement.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_perspectivenumbercolumnstyleelement_free(ptr);
    }
    /**
    * @param {HTMLElement} elem
    * @param {any} js_config
    * @param {any} js_def_config
    */
    constructor(elem, js_config, js_def_config) {
        var ret = wasm.perspectivenumbercolumnstyleelement_new(addHeapObject(elem), addHeapObject(js_config), addHeapObject(js_def_config));
        return PerspectiveNumberColumnStyleElement.__wrap(ret);
    }
    /**
    * Reset to a provided JSON config, to be used in place of `new()` when
    * re-using this component.
    *
    * # Arguments
    * * `config` - a `ColumnStyle` config in JSON form.
    * * `default_config` - the default `ColumnStyle` config for this column
    *   type, in JSON form.
    * @param {any} config
    * @param {any} default_config
    */
    reset(config, default_config) {
        wasm.perspectivenumbercolumnstyleelement_reset(this.ptr, addHeapObject(config), addHeapObject(default_config));
    }
    /**
    * Dispatches to `ModalElement::open(target)`
    *
    * # Arguments
    * `target` - the relative target to pin this `ModalElement` to.
    * @param {HTMLElement} target
    */
    open(target) {
        wasm.perspectivenumbercolumnstyleelement_open(this.ptr, addHeapObject(target));
    }
    /**
    * Remove this `ModalElement` from the DOM.
    */
    close() {
        wasm.perspectivenumbercolumnstyleelement_close(this.ptr);
    }
    /**
    */
    destroy() {
        const ptr = this.__destroy_into_raw();
        wasm.perspectivenumbercolumnstyleelement_destroy(ptr);
    }
    /**
    * DOM lifecycle method when connected.  We don't use this, as it can fire
    * during innocuous events like re-parenting.
    */
    connected_callback() {
        wasm.perspectivenumbercolumnstyleelement_connected_callback(this.ptr);
    }
}
/**
*/
export class PerspectiveStringColumnStyleElement {

    static __wrap(ptr) {
        const obj = Object.create(PerspectiveStringColumnStyleElement.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_perspectivestringcolumnstyleelement_free(ptr);
    }
    /**
    * @param {HTMLElement} elem
    * @param {any} js_config
    * @param {any} js_default_config
    */
    constructor(elem, js_config, js_default_config) {
        var ret = wasm.perspectivestringcolumnstyleelement_new(addHeapObject(elem), addHeapObject(js_config), addHeapObject(js_default_config));
        return PerspectiveStringColumnStyleElement.__wrap(ret);
    }
    /**
    * Reset to a provided JSON config, to be used in place of `new()` when
    * re-using this component.
    *
    * # Arguments
    * * `config` - a `ColumnStyle` config in JSON form.
    * @param {any} config
    */
    reset(config) {
        wasm.perspectivestringcolumnstyleelement_reset(this.ptr, addHeapObject(config));
    }
    /**
    * Dispatches to `ModalElement::open(target)`
    *
    * # Arguments
    * `target` - the relative target to pin this `ModalElement` to.
    * @param {HTMLElement} target
    */
    open(target) {
        wasm.perspectivestringcolumnstyleelement_open(this.ptr, addHeapObject(target));
    }
    /**
    * Remove this `ModalElement` from the DOM.
    */
    close() {
        wasm.perspectivestringcolumnstyleelement_close(this.ptr);
    }
    /**
    */
    destroy() {
        const ptr = this.__destroy_into_raw();
        wasm.perspectivestringcolumnstyleelement_destroy(ptr);
    }
    /**
    * DOM lifecycle method when connected.  We don't use this, as it can fire
    * during innocuous events like re-parenting.
    */
    connected_callback() {
        wasm.perspectivestringcolumnstyleelement_connected_callback(this.ptr);
    }
}
/**
* A `customElements` class which encapsulates both the `<perspective-viewer>`
* public API, as well as the Rust component state.
*
*     ┌───────────────────────────────────────────┐
*     │ Custom Element                            │
*     │┌──────────────┐┌─────────────────────────┐│
*     ││ yew::app     ││ Model                   ││
*     ││┌────────────┐││┌─────────┐┌────────────┐││
*     │││ Components ││││ Session ││ Renderer   │││
*     ││└────────────┘│││┌───────┐││┌──────────┐│││
*     │└──────────────┘│││ Table ││││ Plugin   ││││
*     │┌──────────────┐││└───────┘││└──────────┘│││
*     ││ HtmlElement  │││┌───────┐│└────────────┘││
*     │└──────────────┘│││ View  ││┌────────────┐││
*     │                ││└───────┘││ DragDrop   │││
*     │                │└─────────┘└────────────┘││
*     │                │┌──────────────┐┌───────┐││
*     │                ││ CustomEvents ││ Theme │││
*     │                │└──────────────┘└───────┘││
*     │                └─────────────────────────┘│
*     └───────────────────────────────────────────┘
*/
export class PerspectiveViewerElement {

    static __wrap(ptr) {
        const obj = Object.create(PerspectiveViewerElement.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_perspectiveviewerelement_free(ptr);
    }
    /**
    * @param {HTMLElement} elem
    */
    constructor(elem) {
        var ret = wasm.perspectiveviewerelement_new(addHeapObject(elem));
        return PerspectiveViewerElement.__wrap(ret);
    }
    /**
    */
    connected_callback() {
        wasm.perspectiveviewerelement_connected_callback(this.ptr);
    }
    /**
    * Loads a promise to a `JsPerspectiveTable` in this viewer.
    * @param {Promise<any>} table
    * @returns {Promise<any>}
    */
    js_load(table) {
        var ret = wasm.perspectiveviewerelement_js_load(this.ptr, addHeapObject(table));
        return takeObject(ret);
    }
    /**
    * Delete the `View` and all associated state, rendering this
    * `<perspective-viewer>` unusable and freeing all associated resources.
    * Does not delete the supplied `Table` (as this is constructed by the
    * callee).  Allowing a `<perspective-viewer>` to be garbage-collected
    * without calling `delete()` will leak WASM memory.
    * @returns {Promise<any>}
    */
    js_delete() {
        var ret = wasm.perspectiveviewerelement_js_delete(this.ptr);
        return takeObject(ret);
    }
    /**
    * Get the underlying `View` for thie viewer.
    * @returns {Promise<any>}
    */
    js_get_view() {
        var ret = wasm.perspectiveviewerelement_js_get_view(this.ptr);
        return takeObject(ret);
    }
    /**
    * Get the underlying `Table` for this viewer.
    *
    * # Arguments
    * - `wait_for_table` whether to wait for `load()` to be called, or fail
    *   immediately if `load()` has not yet been called.
    * @param {boolean} wait_for_table
    * @returns {Promise<any>}
    */
    js_get_table(wait_for_table) {
        var ret = wasm.perspectiveviewerelement_js_get_table(this.ptr, wait_for_table);
        return takeObject(ret);
    }
    /**
    * @returns {Promise<any>}
    */
    js_flush() {
        var ret = wasm.perspectiveviewerelement_js_flush(this.ptr);
        return takeObject(ret);
    }
    /**
    * Restores this element from a full/partial `JsPerspectiveViewConfig`.
    *
    * # Arguments
    * - `update` The config to restore to, as returned by `.save()` in either
    *   "json", "string" or "arraybuffer" format.
    * @param {any} update
    * @returns {Promise<any>}
    */
    js_restore(update) {
        var ret = wasm.perspectiveviewerelement_js_restore(this.ptr, addHeapObject(update));
        return takeObject(ret);
    }
    /**
    * Save this element to serialized state object, one which can be restored
    * via the `.restore()` method.
    *
    * # Arguments
    * - `format` Supports "json" (default), "arraybuffer" or "string".
    * @param {string | undefined} format
    * @returns {Promise<any>}
    */
    js_save(format) {
        var ptr0 = isLikeNone(format) ? 0 : passStringToWasm0(format, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.perspectiveviewerelement_js_save(this.ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * Download this viewer's `View` or `Table` data as a `.csv` file.
    *
    * # Arguments
    * - `flat` Whether to use the current `ViewConfig` to generate this data,
    *   or use the default.
    * @param {boolean} flat
    * @returns {Promise<any>}
    */
    js_download(flat) {
        var ret = wasm.perspectiveviewerelement_js_download(this.ptr, flat);
        return takeObject(ret);
    }
    /**
    * Copy this viewer's `View` or `Table` data as CSV to the system
    * clipboard.
    *
    * # Arguments
    * - `flat` Whether to use the current `ViewConfig` to generate this data,
    *   or use the default.
    * @param {boolean} flat
    * @returns {Promise<any>}
    */
    js_copy(flat) {
        var ret = wasm.perspectiveviewerelement_js_copy(this.ptr, flat);
        return takeObject(ret);
    }
    /**
    * Reset the viewer's `ViewerConfig` to the default.
    *
    * # Arguments
    * - `all` Whether to clear `expressions` also.
    * @param {any} reset_expressions
    * @returns {Promise<any>}
    */
    js_reset(reset_expressions) {
        var ret = wasm.perspectiveviewerelement_js_reset(this.ptr, addHeapObject(reset_expressions));
        return takeObject(ret);
    }
    /**
    * Recalculate the viewer's dimensions and redraw.
    * @param {boolean} force
    * @returns {Promise<any>}
    */
    js_resize(force) {
        var ret = wasm.perspectiveviewerelement_js_resize(this.ptr, force);
        return takeObject(ret);
    }
    /**
    * Sets the auto-size behavior of this component.  When `true`, this
    * `<perspective-viewer>` will register a `ResizeObserver` on itself and
    * call `resize()` whenever its own dimensions change.
    *
    * # Arguments
    * - `autosize` Whether to register a `ResizeObserver` on this element or
    *   not.
    * @param {boolean} autosize
    */
    js_set_auto_size(autosize) {
        wasm.perspectiveviewerelement_js_set_auto_size(this.ptr, autosize);
    }
    /**
    * Get this viewer's edit port for the currently loaded `Table`.
    * @returns {number}
    */
    js_get_edit_port() {
        var ret = wasm.perspectiveviewerelement_js_get_edit_port(this.ptr);
        return ret;
    }
    /**
    * Restyle all plugins from current document.
    * @returns {Promise<any>}
    */
    js_restyle_element() {
        var ret = wasm.perspectiveviewerelement_js_restyle_element(this.ptr);
        return takeObject(ret);
    }
    /**
    * Set the available theme names available in the status bar UI.
    * @param {any[] | undefined} themes
    * @returns {Promise<any>}
    */
    js_reset_themes(themes) {
        var ptr0 = isLikeNone(themes) ? 0 : passArrayJsValueToWasm0(themes, wasm.__wbindgen_export_0);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.perspectiveviewerelement_js_reset_themes(this.ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * Determines the render throttling behavior. Can be an integer, for
    * millisecond window to throttle render event; or, if `None`, adaptive
    * throttling will be calculated from the measured render time of the
    * last 5 frames.
    *
    * # Examples
    * // Only draws at most 1 frame/sec.
    * viewer.js_set_throttle(Some(1000_f64));
    *
    * # Arguments
    * - `throttle` The throttle rate - milliseconds (f64), or `None` for
    *   adaptive throttling.
    * @param {number | undefined} val
    */
    js_set_throttle(val) {
        wasm.perspectiveviewerelement_js_set_throttle(this.ptr, !isLikeNone(val), isLikeNone(val) ? 0 : val);
    }
    /**
    * Toggle (or force) the config panel open/closed.
    *
    * # Arguments
    * - `force` Force the state of the panel open or closed, or `None` to
    *   toggle.
    * @param {boolean | undefined} force
    * @returns {Promise<any>}
    */
    js_toggle_config(force) {
        var ret = wasm.perspectiveviewerelement_js_toggle_config(this.ptr, isLikeNone(force) ? 0xFFFFFF : force ? 1 : 0);
        return takeObject(ret);
    }
    /**
    * Get an `Array` of all of the plugin custom elements registered for this
    * element. This may not include plugins which called
    * `registerPlugin()` after the host has rendered for the first time.
    * @returns {Array<any>}
    */
    js_get_all_plugins() {
        var ret = wasm.perspectiveviewerelement_js_get_all_plugins(this.ptr);
        return takeObject(ret);
    }
    /**
    * Gets a plugin Custom Element with the `name` field, or get the active
    * plugin if no `name` is provided.
    *
    * # Arguments
    * - `name` The `name` property of a perspective plugin Custom Element, or
    *   `None` for the active plugin's Custom Element.
    * @param {string | undefined} name
    * @returns {any}
    */
    js_get_plugin(name) {
        var ptr0 = isLikeNone(name) ? 0 : passStringToWasm0(name, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.perspectiveviewerelement_js_get_plugin(this.ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * Internal Only.
    *
    * Get this custom element model's raw pointer.
    * @returns {number}
    */
    js_unsafe_get_model() {
        var ret = wasm.perspectiveviewerelement_js_unsafe_get_model(this.ptr);
        return ret;
    }
}

async function load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

async function init(input) {
    if (typeof input === 'undefined') {
        input = new URL('perspective_viewer_bg.wasm', import.meta.url);
    }
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_json_parse = function(arg0, arg1) {
        var ret = JSON.parse(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_json_serialize = function(arg0, arg1) {
        const obj = getObject(arg1);
        var ret = JSON.stringify(obj === undefined ? null : obj);
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        var ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_jsval_eq = function(arg0, arg1) {
        var ret = getObject(arg0) === getObject(arg1);
        return ret;
    };
    imports.wbg.__wbindgen_cb_drop = function(arg0) {
        const obj = takeObject(arg0).original;
        if (obj.cnt-- == 1) {
            obj.a = 0;
            return true;
        }
        var ret = false;
        return ret;
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        var ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_view_e3b1f5dab63015c7 = function() { return handleError(function (arg0, arg1) {
        var ret = getObject(arg0).view(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_monacomodule_9d24db234e2e1549 = function() {
        var ret = monaco_module();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_tocsv_2ec429ab1e0bb451 = function() { return handleError(function (arg0, arg1) {
        var ret = getObject(arg0).to_csv(takeObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_resize_8a11e82f499e6d89 = function() { return handleError(function (arg0) {
        var ret = getObject(arg0).resize();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_register_1a0bbab9f7619662 = function(arg0, arg1) {
        getObject(arg0).register(takeObject(arg1));
    };
    imports.wbg.__wbg_setMonarchTokensProvider_1fa51a80d68f1ac1 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).setMonarchTokensProvider(getStringFromWasm0(arg1, arg2), takeObject(arg3));
    };
    imports.wbg.__wbg_setLanguageConfiguration_d6c86e31029d9ef5 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).setLanguageConfiguration(getStringFromWasm0(arg1, arg2), takeObject(arg3));
    };
    imports.wbg.__wbg_registerCompletionItemProvider_61ecf83f366d2e16 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).registerCompletionItemProvider(getStringFromWasm0(arg1, arg2), takeObject(arg3));
    };
    imports.wbg.__wbg_tocolumns_d45b3454003d346b = function() { return handleError(function (arg0) {
        var ret = getObject(arg0).to_columns();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_validateexpressions_eca5656ca2844419 = function() { return handleError(function (arg0, arg1) {
        var ret = getObject(arg0).validate_expressions(takeObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_numrows_dfd6ed430e0147ff = function() { return handleError(function (arg0) {
        var ret = getObject(arg0).num_rows();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_columns_b15d8d6c4a353055 = function() { return handleError(function (arg0) {
        var ret = getObject(arg0).columns();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_schema_b1cd087318fe451d = function() { return handleError(function (arg0) {
        var ret = getObject(arg0).schema();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_default_3edfeada4cfc405b = function() {
        var ret = default1();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_delete_cd3c8d59be8fee68 = function() { return handleError(function (arg0) {
        var ret = getObject(arg0).delete();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_update_b0b2df3342b63ce2 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        var ret = getObject(arg0).update(getObject(arg1), arg2 === 0 ? undefined : arg3 >>> 0, arg4 === 0 ? undefined : arg5 >>> 0, arg6 !== 0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_toarrow_e23fb00f4ad5e9f8 = function() { return handleError(function (arg0) {
        var ret = getObject(arg0).to_arrow();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_restyle_d98bfa634bd438a3 = function() { return handleError(function (arg0, arg1) {
        var ret = getObject(arg0).restyle(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_restore_f1fbc066c9637e24 = function(arg0, arg1) {
        getObject(arg0).restore(getObject(arg1));
    };
    imports.wbg.__wbg_schema_ad095ebcdb4dd76f = function() { return handleError(function (arg0) {
        var ret = getObject(arg0).schema();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_draw_f7001e36a5451367 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        var ret = getObject(arg0).draw(getObject(arg1), arg2 === 0 ? undefined : arg3 >>> 0, arg4 === 0 ? undefined : arg5 >>> 0, arg6 !== 0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_size_ea3857b7b9c01a01 = function() { return handleError(function (arg0) {
        var ret = getObject(arg0).size();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_makeport_8c752476acd3fe27 = function() { return handleError(function (arg0) {
        var ret = getObject(arg0).make_port();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_numcolumns_6a8d86bb12e88692 = function() { return handleError(function (arg0) {
        var ret = getObject(arg0).num_columns();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_is_null = function(arg0) {
        var ret = getObject(arg0) === null;
        return ret;
    };
    imports.wbg.__wbg_lineNumber_6b2a1c0159871238 = function(arg0) {
        var ret = getObject(arg0).lineNumber;
        return ret;
    };
    imports.wbg.__wbg_column_885264f87b0a4a0b = function(arg0) {
        var ret = getObject(arg0).column;
        return ret;
    };
    imports.wbg.__wbg_findTokenIndexAtOffset_847b202bf8c16c65 = function(arg0, arg1) {
        var ret = getObject(arg0).findTokenIndexAtOffset(arg1 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_getClassName_5bc865fe97705383 = function(arg0, arg1) {
        var ret = getObject(arg0).getClassName(arg1 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_triggerKind_9e780becc9ed4ce7 = function(arg0) {
        var ret = getObject(arg0).triggerKind;
        return ret;
    };
    imports.wbg.__wbg_delete_55c2b041a4419d5d = function(arg0) {
        getObject(arg0).delete();
    };
    imports.wbg.__wbg_setrenderwarning_2b6ccbc5a0b49b4f = function(arg0, arg1) {
        getObject(arg0).render_warning = arg1 !== 0;
    };
    imports.wbg.__wbg_new_fa9aa30b261aba73 = function(arg0) {
        var ret = new ClipboardItem(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_editor_91084c85a69a3fde = function(arg0) {
        var ret = getObject(arg0).editor;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_languages_aca44d3eda97078c = function(arg0) {
        var ret = getObject(arg0).languages;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_create_806f286d290f99c8 = function(arg0, arg1, arg2) {
        var ret = getObject(arg0).create(takeObject(arg1), takeObject(arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_defineTheme_c4f18cdd46a4014d = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).defineTheme(getStringFromWasm0(arg1, arg2), takeObject(arg3));
    };
    imports.wbg.__wbg_setTheme_7cb365ba1d2ad549 = function(arg0, arg1, arg2) {
        getObject(arg0).setTheme(getStringFromWasm0(arg1, arg2));
    };
    imports.wbg.__wbg_setModelMarkers_f49dfc56a0816242 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).setModelMarkers(getObject(arg1), getStringFromWasm0(arg2, arg3), getObject(arg4));
    };
    imports.wbg.__wbg_layout_901473f7828d2488 = function(arg0, arg1) {
        getObject(arg0).layout(getObject(arg1));
    };
    imports.wbg.__wbg_getModel_4ba1a741bc1eaaff = function(arg0) {
        var ret = getObject(arg0).getModel();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getValue_e8d4002de327ab32 = function(arg0) {
        var ret = getObject(arg0).getValue();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_setValue_464f1cd5da0d99d4 = function(arg0, arg1, arg2) {
        getObject(arg0).setValue(getStringFromWasm0(arg1, arg2));
    };
    imports.wbg.__wbg_setPosition_53889da2861e22f4 = function(arg0, arg1) {
        getObject(arg0).setPosition(getObject(arg1));
    };
    imports.wbg.__wbg_addCommand_0087418877d24153 = function(arg0, arg1, arg2) {
        getObject(arg0).addCommand(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_focus_d1521065885d8ced = function(arg0) {
        getObject(arg0).focus();
    };
    imports.wbg.__wbg_onDidChangeContent_333bdbf90ce64b26 = function(arg0, arg1) {
        getObject(arg0).onDidChangeContent(getObject(arg1));
    };
    imports.wbg.__wbg_getLineTokens_6c81bc0a3f533604 = function(arg0, arg1) {
        var ret = getObject(arg0).getLineTokens(arg1 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_onupdate_b8cf42908fc20235 = function(arg0, arg1) {
        getObject(arg0).on_update(getObject(arg1));
    };
    imports.wbg.__wbg_removeupdate_77fe2a7740d00e48 = function(arg0, arg1) {
        getObject(arg0).remove_update(getObject(arg1));
    };
    imports.wbg.__wbg_errors_20c512f8dca36c8d = function(arg0) {
        var ret = getObject(arg0).errors;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_expressionschema_7a07dfdf1c19fa1f = function(arg0) {
        var ret = getObject(arg0).expression_schema;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_expressionalias_c0691678ddeeed2e = function(arg0) {
        var ret = getObject(arg0).expression_alias;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_name_4e59ce156796a1db = function(arg0, arg1) {
        var ret = getObject(arg1).name;
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_category_3b675f446e35f445 = function(arg0, arg1) {
        var ret = getObject(arg1).category;
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_maxcolumns_41c0acb329b63f5a = function(arg0, arg1) {
        var ret = getObject(arg1).max_columns;
        getInt32Memory0()[arg0 / 4 + 1] = isLikeNone(ret) ? 0 : ret;
        getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
    };
    imports.wbg.__wbg_maxcells_240ed21a2cc23a45 = function(arg0, arg1) {
        var ret = getObject(arg1).max_cells;
        getInt32Memory0()[arg0 / 4 + 1] = isLikeNone(ret) ? 0 : ret;
        getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
    };
    imports.wbg.__wbg_renderwarning_28b6ae4b73e78f68 = function(arg0) {
        var ret = getObject(arg0).render_warning;
        return isLikeNone(ret) ? 0xFFFFFF : ret ? 1 : 0;
    };
    imports.wbg.__wbg_selectmode_2d072add5bfb5e92 = function(arg0) {
        var ret = getObject(arg0).select_mode;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_minconfigcolumns_fc8660538ce7232d = function(arg0, arg1) {
        var ret = getObject(arg1).min_config_columns;
        getInt32Memory0()[arg0 / 4 + 1] = isLikeNone(ret) ? 0 : ret;
        getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
    };
    imports.wbg.__wbg_configcolumnnames_1a26628997420d20 = function(arg0) {
        var ret = getObject(arg0).config_column_names;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_save_5742b4ec09ae0d34 = function(arg0) {
        var ret = getObject(arg0).save();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_fcda59553629199d = function(arg0) {
        var ret = new ResizeObserver(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_observe_86c9286ddb2080e3 = function(arg0, arg1) {
        getObject(arg0).observe(getObject(arg1));
    };
    imports.wbg.__wbg_unobserve_6d276eada6182ea1 = function(arg0, arg1) {
        getObject(arg0).unobserve(getObject(arg1));
    };
    imports.wbg.__wbg_contentRect_3f8cd97f6e2969a6 = function(arg0) {
        var ret = getObject(arg0).contentRect;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_listenerid_25425097ae5fdb72 = function(arg0, arg1) {
        var ret = getObject(arg1).__yew_listener_id;
        getInt32Memory0()[arg0 / 4 + 1] = isLikeNone(ret) ? 0 : ret;
        getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
    };
    imports.wbg.__wbg_setlistenerid_007d4751f70f0e32 = function(arg0, arg1) {
        getObject(arg0).__yew_listener_id = arg1 >>> 0;
    };
    imports.wbg.__wbg_setsubtreeid_6966527169be2ec4 = function(arg0, arg1) {
        getObject(arg0).__yew_subtree_id = arg1 >>> 0;
    };
    imports.wbg.__wbg_setcachekey_a9744e4c550ca52b = function(arg0, arg1) {
        getObject(arg0).__yew_subtree_cache_key = arg1 >>> 0;
    };
    imports.wbg.__wbg_subtreeid_05e7e8ba671b1a4e = function(arg0, arg1) {
        var ret = getObject(arg1).__yew_subtree_id;
        getInt32Memory0()[arg0 / 4 + 1] = isLikeNone(ret) ? 0 : ret;
        getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
    };
    imports.wbg.__wbg_cachekey_57f0ac7b26342cf7 = function(arg0, arg1) {
        var ret = getObject(arg1).__yew_subtree_cache_key;
        getInt32Memory0()[arg0 / 4 + 1] = isLikeNone(ret) ? 0 : ret;
        getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
    };
    imports.wbg.__wbg_new_693216e109162396 = function() {
        var ret = new Error();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_stack_0ddaca5d1abfb52f = function(arg0, arg1) {
        var ret = getObject(arg1).stack;
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_error_09919627ac0992f5 = function(arg0, arg1) {
        try {
            console.error(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_export_15(arg0, arg1);
        }
    };
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        var ret = getObject(arg0) === undefined;
        return ret;
    };
    imports.wbg.__wbindgen_number_new = function(arg0) {
        var ret = arg0;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_warn_2aa0e7178e1d35f6 = function(arg0, arg1) {
        var v0 = getArrayJsValueFromWasm0(arg0, arg1).slice();
        wasm.__wbindgen_export_15(arg0, arg1 * 4);
        console.warn(...v0);
    };
    imports.wbg.__wbg_newwithu8arraysequence_fdc7895dacd60d21 = function() { return handleError(function (arg0) {
        var ret = new Blob(getObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_newwithstrsequenceandoptions_becd1cf522768c06 = function() { return handleError(function (arg0, arg1) {
        var ret = new Blob(getObject(arg0), getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_write_10adfe8afa301d18 = function(arg0, arg1) {
        var ret = getObject(arg0).write(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_length_294c22a18ede524b = function(arg0) {
        var ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_item_8eca8b8cdf63f525 = function(arg0, arg1) {
        var ret = getObject(arg0).item(arg1 >>> 0);
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_length_d2057dfdd5fdecf4 = function(arg0) {
        var ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_getPropertyValue_937a708feb88202f = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        var ret = getObject(arg1).getPropertyValue(getStringFromWasm0(arg2, arg3));
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    }, arguments) };
    imports.wbg.__wbg_item_dfcc92ceae8b4304 = function(arg0, arg1, arg2) {
        var ret = getObject(arg1).item(arg2 >>> 0);
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_setProperty_dccccce3a52c26db = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).setProperty(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_instanceof_CssStyleRule_e93e1152e50f8d9b = function(arg0) {
        var ret = getObject(arg0) instanceof CSSStyleRule;
        return ret;
    };
    imports.wbg.__wbg_selectorText_56b42d9cf7c91aa1 = function(arg0, arg1) {
        var ret = getObject(arg1).selectorText;
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_style_dbd768c92c03ab2c = function(arg0) {
        var ret = getObject(arg0).style;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_cssRules_b1206f989651c44d = function() { return handleError(function (arg0) {
        var ret = getObject(arg0).cssRules;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_3af016a292a0ea38 = function() { return handleError(function (arg0, arg1) {
        var ret = new CustomEvent(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_newwitheventinitdict_183544aa2c542424 = function() { return handleError(function (arg0, arg1, arg2) {
        var ret = new CustomEvent(getStringFromWasm0(arg0, arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_setDragImage_97e7f5b52f6e9f92 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).setDragImage(getObject(arg1), arg2, arg3);
    };
    imports.wbg.__wbg_readyState_be8f2b804adc7ff6 = function(arg0, arg1) {
        var ret = getObject(arg1).readyState;
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_body_525168d9e773c3f8 = function(arg0) {
        var ret = getObject(arg0).body;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_styleSheets_a23fea89b8b91939 = function(arg0) {
        var ret = getObject(arg0).styleSheets;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_fonts_62f407546d8daeb4 = function(arg0) {
        var ret = getObject(arg0).fonts;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_createElement_ac65a6ce60c4812c = function() { return handleError(function (arg0, arg1, arg2) {
        var ret = getObject(arg0).createElement(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_createElementNS_267edeea0c97331c = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        var ret = getObject(arg0).createElementNS(arg1 === 0 ? undefined : getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_createTextNode_442392ad92e75695 = function(arg0, arg1, arg2) {
        var ret = getObject(arg0).createTextNode(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_width_a04d387a0e0ffe94 = function(arg0) {
        var ret = getObject(arg0).width;
        return ret;
    };
    imports.wbg.__wbg_height_f7c5c956730ab37a = function(arg0) {
        var ret = getObject(arg0).height;
        return ret;
    };
    imports.wbg.__wbg_width_4a83a800a544b73a = function(arg0) {
        var ret = getObject(arg0).width;
        return ret;
    };
    imports.wbg.__wbg_height_76d64c7ff32eb400 = function(arg0) {
        var ret = getObject(arg0).height;
        return ret;
    };
    imports.wbg.__wbg_top_22e7024d271b5677 = function(arg0) {
        var ret = getObject(arg0).top;
        return ret;
    };
    imports.wbg.__wbg_left_f2f24ba3851b8295 = function(arg0) {
        var ret = getObject(arg0).left;
        return ret;
    };
    imports.wbg.__wbg_get_dc5a3f4246f4363e = function(arg0, arg1, arg2, arg3) {
        var ret = getObject(arg1)[getStringFromWasm0(arg2, arg3)];
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_set_6bc5ebabff049b08 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0)[getStringFromWasm0(arg1, arg2)] = getStringFromWasm0(arg3, arg4);
    }, arguments) };
    imports.wbg.__wbg_delete_bdb7962606ab7ffc = function(arg0, arg1, arg2) {
        delete getObject(arg0)[getStringFromWasm0(arg1, arg2)];
    };
    imports.wbg.__wbg_add_3b4cecc512643e9f = function() { return handleError(function (arg0, arg1, arg2) {
        getObject(arg0).add(getStringFromWasm0(arg1, arg2));
    }, arguments) };
    imports.wbg.__wbg_remove_c15603553c81dc31 = function() { return handleError(function (arg0, arg1, arg2) {
        getObject(arg0).remove(getStringFromWasm0(arg1, arg2));
    }, arguments) };
    imports.wbg.__wbg_dataTransfer_7916d51ea966dcb4 = function(arg0) {
        var ret = getObject(arg0).dataTransfer;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_instanceof_Element_8143882371652178 = function(arg0) {
        var ret = getObject(arg0) instanceof Element;
        return ret;
    };
    imports.wbg.__wbg_namespaceURI_f65a7a956acf4bc5 = function(arg0, arg1) {
        var ret = getObject(arg1).namespaceURI;
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_classList_bbb57a7d3cc23c85 = function(arg0) {
        var ret = getObject(arg0).classList;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_scrollTop_03d79a099b9a21e7 = function(arg0) {
        var ret = getObject(arg0).scrollTop;
        return ret;
    };
    imports.wbg.__wbg_setscrollTop_b9abc042a6938811 = function(arg0, arg1) {
        getObject(arg0).scrollTop = arg1;
    };
    imports.wbg.__wbg_clientWidth_acc83939b1545b91 = function(arg0) {
        var ret = getObject(arg0).clientWidth;
        return ret;
    };
    imports.wbg.__wbg_clientHeight_95c707ac8248c652 = function(arg0) {
        var ret = getObject(arg0).clientHeight;
        return ret;
    };
    imports.wbg.__wbg_children_283b5c3c4312d771 = function(arg0) {
        var ret = getObject(arg0).children;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_attachShadow_f0d8083616f120aa = function() { return handleError(function (arg0, arg1) {
        var ret = getObject(arg0).attachShadow(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getAttribute_0754c52f6bcda842 = function(arg0, arg1, arg2, arg3) {
        var ret = getObject(arg1).getAttribute(getStringFromWasm0(arg2, arg3));
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_getBoundingClientRect_dbd899b7c945c55d = function(arg0) {
        var ret = getObject(arg0).getBoundingClientRect();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_hasAttribute_4c5fc91198e862c3 = function(arg0, arg1, arg2) {
        var ret = getObject(arg0).hasAttribute(getStringFromWasm0(arg1, arg2));
        return ret;
    };
    imports.wbg.__wbg_matches_7e22d2c3664b9d8d = function() { return handleError(function (arg0, arg1, arg2) {
        var ret = getObject(arg0).matches(getStringFromWasm0(arg1, arg2));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_removeAttribute_16e5bf3866aa53e8 = function() { return handleError(function (arg0, arg1, arg2) {
        getObject(arg0).removeAttribute(getStringFromWasm0(arg1, arg2));
    }, arguments) };
    imports.wbg.__wbg_setAttribute_27ca65e30a1c3c4a = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).setAttribute(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_toggleAttribute_8cf952af952c2cc5 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        var ret = getObject(arg0).toggleAttribute(getStringFromWasm0(arg1, arg2), arg3 !== 0);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_target_2dfa485f32a6d005 = function(arg0) {
        var ret = getObject(arg0).target;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_cancelBubble_185bb624c1c2e4ee = function(arg0) {
        var ret = getObject(arg0).cancelBubble;
        return ret;
    };
    imports.wbg.__wbg_composedPath_85cb5c926bd8d924 = function(arg0) {
        var ret = getObject(arg0).composedPath();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_preventDefault_7c4d18eb2bb1a26a = function(arg0) {
        getObject(arg0).preventDefault();
    };
    imports.wbg.__wbg_stopPropagation_11ccdc30c46ad19a = function(arg0) {
        getObject(arg0).stopPropagation();
    };
    imports.wbg.__wbg_addEventListener_936431894dca4639 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        getObject(arg0).addEventListener(getStringFromWasm0(arg1, arg2), getObject(arg3));
    }, arguments) };
    imports.wbg.__wbg_addEventListener_6d9a78a5d277bdaf = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).addEventListener(getStringFromWasm0(arg1, arg2), getObject(arg3), getObject(arg4));
    }, arguments) };
    imports.wbg.__wbg_dispatchEvent_bacbc3eeb0d17fcd = function() { return handleError(function (arg0, arg1) {
        var ret = getObject(arg0).dispatchEvent(getObject(arg1));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_removeEventListener_6e1e9e37bdc74923 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        getObject(arg0).removeEventListener(getStringFromWasm0(arg1, arg2), getObject(arg3));
    }, arguments) };
    imports.wbg.__wbg_instanceof_FontFace_095633da5a60e4d1 = function(arg0) {
        var ret = getObject(arg0) instanceof FontFace;
        return ret;
    };
    imports.wbg.__wbg_family_8b33871beb47388b = function(arg0, arg1) {
        var ret = getObject(arg1).family;
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_weight_cb1f0ded9c3fcd29 = function(arg0, arg1) {
        var ret = getObject(arg1).weight;
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_loaded_b07b4ee5c31f9abc = function() { return handleError(function (arg0) {
        var ret = getObject(arg0).loaded;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_values_705706cce046e96c = function(arg0) {
        var ret = getObject(arg0).values();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_next_c7f69285044a0543 = function() { return handleError(function (arg0) {
        var ret = getObject(arg0).next();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_item_5a5f92bba46832d3 = function(arg0, arg1) {
        var ret = getObject(arg0).item(arg1 >>> 0);
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_dataset_7f3bc0a0cd4f7382 = function(arg0) {
        var ret = getObject(arg0).dataset;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_style_25309daade79abb3 = function(arg0) {
        var ret = getObject(arg0).style;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_offsetParent_21a2a48c194cfe05 = function(arg0) {
        var ret = getObject(arg0).offsetParent;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_offsetWidth_7dd96a3df070d552 = function(arg0) {
        var ret = getObject(arg0).offsetWidth;
        return ret;
    };
    imports.wbg.__wbg_offsetHeight_fe07e4498698e768 = function(arg0) {
        var ret = getObject(arg0).offsetHeight;
        return ret;
    };
    imports.wbg.__wbg_blur_b336d41728268f5a = function() { return handleError(function (arg0) {
        getObject(arg0).blur();
    }, arguments) };
    imports.wbg.__wbg_click_a22518ab89bfd9b8 = function(arg0) {
        getObject(arg0).click();
    };
    imports.wbg.__wbg_focus_2fac919cca20d33b = function() { return handleError(function (arg0) {
        getObject(arg0).focus();
    }, arguments) };
    imports.wbg.__wbg_checked_dc000202a8fa9328 = function(arg0) {
        var ret = getObject(arg0).checked;
        return ret;
    };
    imports.wbg.__wbg_setchecked_dc7daac77dc0e73e = function(arg0, arg1) {
        getObject(arg0).checked = arg1 !== 0;
    };
    imports.wbg.__wbg_value_f4c762446c572119 = function(arg0, arg1) {
        var ret = getObject(arg1).value;
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_setvalue_65a652cfd99c8a4a = function(arg0, arg1, arg2) {
        getObject(arg0).value = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_value_265001c20fda4531 = function(arg0, arg1) {
        var ret = getObject(arg1).value;
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_setvalue_a46eeb72562081c1 = function(arg0, arg1, arg2) {
        getObject(arg0).value = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_value_d8dfe9a459c6ea2a = function(arg0, arg1) {
        var ret = getObject(arg1).value;
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_setvalue_b1b2f2945b1cb6ef = function(arg0, arg1, arg2) {
        getObject(arg0).value = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_keyCode_218ac9c01e06b3d5 = function(arg0) {
        var ret = getObject(arg0).keyCode;
        return ret;
    };
    imports.wbg.__wbg_clientX_5bbce6c078e1510e = function(arg0) {
        var ret = getObject(arg0).clientX;
        return ret;
    };
    imports.wbg.__wbg_clientY_af6c4369507b54f0 = function(arg0) {
        var ret = getObject(arg0).clientY;
        return ret;
    };
    imports.wbg.__wbg_shiftKey_257c3f6b1ca35555 = function(arg0) {
        var ret = getObject(arg0).shiftKey;
        return ret;
    };
    imports.wbg.__wbg_relatedTarget_c63203073e65b8de = function(arg0) {
        var ret = getObject(arg0).relatedTarget;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_clipboard_a304e2b83d0400c6 = function(arg0) {
        var ret = getObject(arg0).clipboard;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_isConnected_021a4fb42a3d7537 = function(arg0) {
        var ret = getObject(arg0).isConnected;
        return ret;
    };
    imports.wbg.__wbg_parentNode_e1dd029be06cee39 = function(arg0) {
        var ret = getObject(arg0).parentNode;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_parentElement_b8943ca3eef7678d = function(arg0) {
        var ret = getObject(arg0).parentElement;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_lastChild_60bd092ff114802e = function(arg0) {
        var ret = getObject(arg0).lastChild;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_setnodeValue_ef88f21c4f2101f5 = function(arg0, arg1, arg2) {
        getObject(arg0).nodeValue = arg1 === 0 ? undefined : getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_appendChild_6ed236bb79c198df = function() { return handleError(function (arg0, arg1) {
        var ret = getObject(arg0).appendChild(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_contains_11705db278357c60 = function(arg0, arg1) {
        var ret = getObject(arg0).contains(getObject(arg1));
        return ret;
    };
    imports.wbg.__wbg_insertBefore_7159f24556965e30 = function() { return handleError(function (arg0, arg1, arg2) {
        var ret = getObject(arg0).insertBefore(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_removeChild_f633f19eb895b696 = function() { return handleError(function (arg0, arg1) {
        var ret = getObject(arg0).removeChild(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_now_44a034aa2e1d73dd = function(arg0) {
        var ret = getObject(arg0).now();
        return ret;
    };
    imports.wbg.__wbg_instanceof_ShadowRoot_17fc69013b5c44c6 = function(arg0) {
        var ret = getObject(arg0) instanceof ShadowRoot;
        return ret;
    };
    imports.wbg.__wbg_host_786667ae381479f7 = function(arg0) {
        var ret = getObject(arg0).host;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_length_568451d1cca15a65 = function(arg0) {
        var ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_item_48316bfa2c39d796 = function(arg0, arg1) {
        var ret = getObject(arg0).item(arg1 >>> 0);
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createObjectURL_a97d76bcc0a4968c = function() { return handleError(function (arg0, arg1) {
        var ret = URL.createObjectURL(getObject(arg1));
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    }, arguments) };
    imports.wbg.__wbg_instanceof_Window_11e25482011fc506 = function(arg0) {
        var ret = getObject(arg0) instanceof Window;
        return ret;
    };
    imports.wbg.__wbg_document_5aff8cd83ef968f5 = function(arg0) {
        var ret = getObject(arg0).document;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_navigator_5c90643c2a2b6cda = function(arg0) {
        var ret = getObject(arg0).navigator;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_innerWidth_8c5001da2fdd6a9e = function() { return handleError(function (arg0) {
        var ret = getObject(arg0).innerWidth;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_innerHeight_03d3f1d9eb5f7034 = function() { return handleError(function (arg0) {
        var ret = getObject(arg0).innerHeight;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_performance_9d1ecf711183e1d5 = function(arg0) {
        var ret = getObject(arg0).performance;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_getComputedStyle_344a4d9212ebf966 = function() { return handleError(function (arg0, arg1) {
        var ret = getObject(arg0).getComputedStyle(getObject(arg1));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_requestAnimationFrame_1fb079d39e1b8a26 = function() { return handleError(function (arg0, arg1) {
        var ret = getObject(arg0).requestAnimationFrame(getObject(arg1));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_setTimeout_ce28a603906ebcbb = function() { return handleError(function (arg0, arg1, arg2) {
        var ret = getObject(arg0).setTimeout(getObject(arg1), arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_error_d95afd6217cfd219 = function(arg0) {
        console.error(getObject(arg0));
    };
    imports.wbg.__wbg_error_0147c5cf9d9745cf = function(arg0, arg1, arg2) {
        console.error(getObject(arg0), getObject(arg1), getObject(arg2));
    };
    imports.wbg.__wbg_log_9a99fb1af846153b = function(arg0) {
        console.log(getObject(arg0));
    };
    imports.wbg.__wbg_warn_b39e749f1dc02058 = function(arg0) {
        console.warn(getObject(arg0));
    };
    imports.wbg.__wbg_self_bb69a836a72ec6e9 = function() { return handleError(function () {
        var ret = self.self;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_window_3304fc4b414c9693 = function() { return handleError(function () {
        var ret = window.window;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_globalThis_e0d21cabc6630763 = function() { return handleError(function () {
        var ret = globalThis.globalThis;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_global_8463719227271676 = function() { return handleError(function () {
        var ret = global.global;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_newnoargs_9fdd8f3961dd1bee = function(arg0, arg1) {
        var ret = new Function(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_515b65a8e7699d00 = function() {
        var ret = new Array();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_get_b7bbf50adcc94294 = function(arg0, arg1) {
        var ret = getObject(arg0)[arg1 >>> 0];
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_length_555f836564bf148d = function(arg0) {
        var ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_push_b7f68478f81d358b = function(arg0, arg1) {
        var ret = getObject(arg0).push(getObject(arg1));
        return ret;
    };
    imports.wbg.__wbg_instanceof_ArrayBuffer_1ae2a91a8421001f = function(arg0) {
        var ret = getObject(arg0) instanceof ArrayBuffer;
        return ret;
    };
    imports.wbg.__wbg_slice_3563f88f39165260 = function(arg0, arg1, arg2) {
        var ret = getObject(arg0).slice(arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_instanceof_Error_2ef86611e2afab04 = function(arg0) {
        var ret = getObject(arg0) instanceof Error;
        return ret;
    };
    imports.wbg.__wbg_message_e440fbd911a845a2 = function(arg0) {
        var ret = getObject(arg0).message;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_call_ba36642bd901572b = function() { return handleError(function (arg0, arg1) {
        var ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_call_3fc07b7d5fc9022d = function() { return handleError(function (arg0, arg1, arg2) {
        var ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getTimezoneOffset_baab8599eeb15f06 = function(arg0) {
        var ret = getObject(arg0).getTimezoneOffset();
        return ret;
    };
    imports.wbg.__wbg_new_f994c74215dcdb52 = function(arg0) {
        var ret = new Date(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_is_a973b4c0e9019083 = function(arg0, arg1) {
        var ret = Object.is(getObject(arg0), getObject(arg1));
        return ret;
    };
    imports.wbg.__wbg_keys_a56f3f1587eb77e9 = function(arg0) {
        var ret = Object.keys(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_edbe38a4e21329dd = function() {
        var ret = new Object();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_get_800098c980b31ea2 = function() { return handleError(function (arg0, arg1) {
        var ret = Reflect.get(getObject(arg0), getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_has_9fa0c068863afd36 = function() { return handleError(function (arg0, arg1) {
        var ret = Reflect.has(getObject(arg0), getObject(arg1));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_set_73349fc4814e0fc6 = function() { return handleError(function (arg0, arg1, arg2) {
        var ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_buffer_9e184d6f785de5ed = function(arg0) {
        var ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_stringify_08a99e601b91c4a7 = function() { return handleError(function (arg0) {
        var ret = JSON.stringify(getObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_c143a4f563f78c4e = function(arg0, arg1) {
        try {
            var state0 = {a: arg0, b: arg1};
            var cb0 = (arg0, arg1) => {
                const a = state0.a;
                state0.a = 0;
                try {
                    return __wbg_adapter_539(a, state0.b, arg0, arg1);
                } finally {
                    state0.a = a;
                }
            };
            var ret = new Promise(cb0);
            return addHeapObject(ret);
        } finally {
            state0.a = state0.b = 0;
        }
    };
    imports.wbg.__wbg_resolve_cae3d8f752f5db88 = function(arg0) {
        var ret = Promise.resolve(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_then_c2361a9d5c9a4fcb = function(arg0, arg1) {
        var ret = getObject(arg0).then(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_then_6c9a4bf55755f9b8 = function(arg0, arg1, arg2) {
        var ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_e57ad1f2ce812c03 = function(arg0, arg1, arg2) {
        var ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_e8101319e4cf95fc = function(arg0) {
        var ret = new Uint8Array(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_buffer_1c5918a4ab656ff7 = function(arg0) {
        var ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_length_2d56cb37075fcfb1 = function(arg0) {
        var ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_byteLength_e0515bc94cfc5dee = function(arg0) {
        var ret = getObject(arg0).byteLength;
        return ret;
    };
    imports.wbg.__wbg_byteOffset_77eec84716a2e737 = function(arg0) {
        var ret = getObject(arg0).byteOffset;
        return ret;
    };
    imports.wbg.__wbg_set_e8ae7b27314e8b98 = function(arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__wbindgen_number_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        var ret = typeof(obj) === 'number' ? obj : undefined;
        getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
        getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
    };
    imports.wbg.__wbindgen_is_string = function(arg0) {
        var ret = typeof(getObject(arg0)) === 'string';
        return ret;
    };
    imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        var ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbindgen_boolean_get = function(arg0) {
        const v = getObject(arg0);
        var ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
        return ret;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_rethrow = function(arg0) {
        throw takeObject(arg0);
    };
    imports.wbg.__wbindgen_memory = function() {
        var ret = wasm.memory;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper3375 = function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 30, __wbg_adapter_36);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper3377 = function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 32, __wbg_adapter_39);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper3379 = function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 38, __wbg_adapter_42);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper3381 = function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 26, __wbg_adapter_45);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper3383 = function(arg0, arg1, arg2) {
        var ret = makeClosure(arg0, arg1, 36, __wbg_adapter_48);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper3385 = function(arg0, arg1, arg2) {
        var ret = makeClosure(arg0, arg1, 28, __wbg_adapter_51);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper3387 = function(arg0, arg1, arg2) {
        var ret = makeClosure(arg0, arg1, 40, __wbg_adapter_54);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper3389 = function(arg0, arg1, arg2) {
        var ret = makeClosure(arg0, arg1, 34, __wbg_adapter_57);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper10795 = function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 2389, __wbg_adapter_60);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper10816 = function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 2393, __wbg_adapter_63);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper10897 = function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 2411, __wbg_adapter_66);
        return addHeapObject(ret);
    };

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }



    const { instance, module } = await load(await input, imports);

    wasm = instance.exports;
    init.__wbindgen_wasm_module = module;

    return wasm;
}

export default init;

