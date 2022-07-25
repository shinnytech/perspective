/* tslint:disable */
/* eslint-disable */
/**
* @param {string} name
*/
export function register_plugin(name: string): void;
/**
* @returns {any[]}
*/
export function get_exprtk_commands(): any[];
/**
*/
export class CopyDropDownMenuElement {
  free(): void;
/**
* @param {HTMLElement} elem
*/
  constructor(elem: HTMLElement);
/**
* @param {HTMLElement} target
*/
  open(target: HTMLElement): void;
/**
*/
  hide(): void;
/**
* @param {number} ptr
*/
  unsafe_set_model(ptr: number): void;
/**
*/
  connected_callback(): void;
}
/**
*/
export class ExportDropDownMenuElement {
  free(): void;
/**
* @param {HTMLElement} elem
*/
  constructor(elem: HTMLElement);
/**
* @param {HTMLElement} target
*/
  open(target: HTMLElement): void;
/**
*/
  hide(): void;
/**
* @param {number} ptr
*/
  unsafe_set_model(ptr: number): void;
/**
*/
  connected_callback(): void;
}
/**
*/
export class ExpressionEditorElement {
  free(): void;
}
/**
*/
export class FilterDropDownElement {
  free(): void;
}
/**
*/
export class PerspectiveNumberColumnStyleElement {
  free(): void;
/**
* @param {HTMLElement} elem
* @param {any} js_config
* @param {any} js_def_config
*/
  constructor(elem: HTMLElement, js_config: any, js_def_config: any);
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
  reset(config: any, default_config: any): void;
/**
* Dispatches to `ModalElement::open(target)`
*
* # Arguments
* `target` - the relative target to pin this `ModalElement` to.
* @param {HTMLElement} target
*/
  open(target: HTMLElement): void;
/**
* Remove this `ModalElement` from the DOM.
*/
  close(): void;
/**
*/
  destroy(): void;
/**
* DOM lifecycle method when connected.  We don't use this, as it can fire
* during innocuous events like re-parenting.
*/
  connected_callback(): void;
}
/**
*/
export class PerspectiveStringColumnStyleElement {
  free(): void;
/**
* @param {HTMLElement} elem
* @param {any} js_config
* @param {any} js_default_config
*/
  constructor(elem: HTMLElement, js_config: any, js_default_config: any);
/**
* Reset to a provided JSON config, to be used in place of `new()` when
* re-using this component.
*
* # Arguments
* * `config` - a `ColumnStyle` config in JSON form.
* @param {any} config
*/
  reset(config: any): void;
/**
* Dispatches to `ModalElement::open(target)`
*
* # Arguments
* `target` - the relative target to pin this `ModalElement` to.
* @param {HTMLElement} target
*/
  open(target: HTMLElement): void;
/**
* Remove this `ModalElement` from the DOM.
*/
  close(): void;
/**
*/
  destroy(): void;
/**
* DOM lifecycle method when connected.  We don't use this, as it can fire
* during innocuous events like re-parenting.
*/
  connected_callback(): void;
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
  free(): void;
/**
* @param {HTMLElement} elem
*/
  constructor(elem: HTMLElement);
/**
*/
  connected_callback(): void;
/**
* Loads a promise to a `JsPerspectiveTable` in this viewer.
* @param {Promise<any>} table
* @returns {Promise<any>}
*/
  js_load(table: Promise<any>): Promise<any>;
/**
* Delete the `View` and all associated state, rendering this
* `<perspective-viewer>` unusable and freeing all associated resources.
* Does not delete the supplied `Table` (as this is constructed by the
* callee).  Allowing a `<perspective-viewer>` to be garbage-collected
* without calling `delete()` will leak WASM memory.
* @returns {Promise<any>}
*/
  js_delete(): Promise<any>;
/**
* Get the underlying `View` for thie viewer.
* @returns {Promise<any>}
*/
  js_get_view(): Promise<any>;
/**
* Get the underlying `Table` for this viewer.
*
* # Arguments
* - `wait_for_table` whether to wait for `load()` to be called, or fail
*   immediately if `load()` has not yet been called.
* @param {boolean} wait_for_table
* @returns {Promise<any>}
*/
  js_get_table(wait_for_table: boolean): Promise<any>;
/**
* @returns {Promise<any>}
*/
  js_flush(): Promise<any>;
/**
* Restores this element from a full/partial `JsPerspectiveViewConfig`.
*
* # Arguments
* - `update` The config to restore to, as returned by `.save()` in either
*   "json", "string" or "arraybuffer" format.
* @param {any} update
* @returns {Promise<any>}
*/
  js_restore(update: any): Promise<any>;
/**
* Save this element to serialized state object, one which can be restored
* via the `.restore()` method.
*
* # Arguments
* - `format` Supports "json" (default), "arraybuffer" or "string".
* @param {string | undefined} format
* @returns {Promise<any>}
*/
  js_save(format?: string): Promise<any>;
/**
* Download this viewer's `View` or `Table` data as a `.csv` file.
*
* # Arguments
* - `flat` Whether to use the current `ViewConfig` to generate this data,
*   or use the default.
* @param {boolean} flat
* @returns {Promise<any>}
*/
  js_download(flat: boolean): Promise<any>;
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
  js_copy(flat: boolean): Promise<any>;
/**
* Reset the viewer's `ViewerConfig` to the default.
*
* # Arguments
* - `all` Whether to clear `expressions` also.
* @param {any} reset_expressions
* @returns {Promise<any>}
*/
  js_reset(reset_expressions: any): Promise<any>;
/**
* Recalculate the viewer's dimensions and redraw.
* @param {boolean} force
* @returns {Promise<any>}
*/
  js_resize(force: boolean): Promise<any>;
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
  js_set_auto_size(autosize: boolean): void;
/**
* Get this viewer's edit port for the currently loaded `Table`.
* @returns {number}
*/
  js_get_edit_port(): number;
/**
* Restyle all plugins from current document.
* @returns {Promise<any>}
*/
  js_restyle_element(): Promise<any>;
/**
* Set the available theme names available in the status bar UI.
* @param {any[] | undefined} themes
* @returns {Promise<any>}
*/
  js_reset_themes(themes?: any[]): Promise<any>;
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
  js_set_throttle(val?: number): void;
/**
* Toggle (or force) the config panel open/closed.
*
* # Arguments
* - `force` Force the state of the panel open or closed, or `None` to
*   toggle.
* @param {boolean | undefined} force
* @returns {Promise<any>}
*/
  js_toggle_config(force?: boolean): Promise<any>;
/**
* Get an `Array` of all of the plugin custom elements registered for this
* element. This may not include plugins which called
* `registerPlugin()` after the host has rendered for the first time.
* @returns {Array<any>}
*/
  js_get_all_plugins(): Array<any>;
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
  js_get_plugin(name?: string): any;
/**
* Internal Only.
*
* Get this custom element model's raw pointer.
* @returns {number}
*/
  js_unsafe_get_model(): number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_copydropdownmenuelement_free: (a: number) => void;
  readonly copydropdownmenuelement_new: (a: number) => number;
  readonly copydropdownmenuelement_open: (a: number, b: number) => void;
  readonly copydropdownmenuelement_hide: (a: number) => void;
  readonly copydropdownmenuelement_unsafe_set_model: (a: number, b: number) => void;
  readonly copydropdownmenuelement_connected_callback: (a: number) => void;
  readonly __wbg_exportdropdownmenuelement_free: (a: number) => void;
  readonly exportdropdownmenuelement_new: (a: number) => number;
  readonly exportdropdownmenuelement_open: (a: number, b: number) => void;
  readonly exportdropdownmenuelement_hide: (a: number) => void;
  readonly exportdropdownmenuelement_unsafe_set_model: (a: number, b: number) => void;
  readonly exportdropdownmenuelement_connected_callback: (a: number) => void;
  readonly __wbg_expressioneditorelement_free: (a: number) => void;
  readonly __wbg_filterdropdownelement_free: (a: number) => void;
  readonly __wbg_perspectivenumbercolumnstyleelement_free: (a: number) => void;
  readonly perspectivenumbercolumnstyleelement_new: (a: number, b: number, c: number) => number;
  readonly perspectivenumbercolumnstyleelement_reset: (a: number, b: number, c: number) => void;
  readonly perspectivenumbercolumnstyleelement_open: (a: number, b: number) => void;
  readonly perspectivenumbercolumnstyleelement_close: (a: number) => void;
  readonly perspectivenumbercolumnstyleelement_destroy: (a: number) => void;
  readonly perspectivenumbercolumnstyleelement_connected_callback: (a: number) => void;
  readonly __wbg_perspectivestringcolumnstyleelement_free: (a: number) => void;
  readonly perspectivestringcolumnstyleelement_new: (a: number, b: number, c: number) => number;
  readonly perspectivestringcolumnstyleelement_reset: (a: number, b: number) => void;
  readonly perspectivestringcolumnstyleelement_open: (a: number, b: number) => void;
  readonly perspectivestringcolumnstyleelement_close: (a: number) => void;
  readonly perspectivestringcolumnstyleelement_destroy: (a: number) => void;
  readonly perspectivestringcolumnstyleelement_connected_callback: (a: number) => void;
  readonly __wbg_perspectiveviewerelement_free: (a: number) => void;
  readonly perspectiveviewerelement_new: (a: number) => number;
  readonly perspectiveviewerelement_connected_callback: (a: number) => void;
  readonly perspectiveviewerelement_js_load: (a: number, b: number) => number;
  readonly perspectiveviewerelement_js_delete: (a: number) => number;
  readonly perspectiveviewerelement_js_get_view: (a: number) => number;
  readonly perspectiveviewerelement_js_get_table: (a: number, b: number) => number;
  readonly perspectiveviewerelement_js_flush: (a: number) => number;
  readonly perspectiveviewerelement_js_restore: (a: number, b: number) => number;
  readonly perspectiveviewerelement_js_save: (a: number, b: number, c: number) => number;
  readonly perspectiveviewerelement_js_download: (a: number, b: number) => number;
  readonly perspectiveviewerelement_js_copy: (a: number, b: number) => number;
  readonly perspectiveviewerelement_js_reset: (a: number, b: number) => number;
  readonly perspectiveviewerelement_js_resize: (a: number, b: number) => number;
  readonly perspectiveviewerelement_js_set_auto_size: (a: number, b: number) => void;
  readonly perspectiveviewerelement_js_get_edit_port: (a: number) => number;
  readonly perspectiveviewerelement_js_restyle_element: (a: number) => number;
  readonly perspectiveviewerelement_js_reset_themes: (a: number, b: number, c: number) => number;
  readonly perspectiveviewerelement_js_set_throttle: (a: number, b: number, c: number) => void;
  readonly perspectiveviewerelement_js_toggle_config: (a: number, b: number) => number;
  readonly perspectiveviewerelement_js_get_all_plugins: (a: number) => number;
  readonly perspectiveviewerelement_js_get_plugin: (a: number, b: number, c: number) => number;
  readonly perspectiveviewerelement_js_unsafe_get_model: (a: number) => number;
  readonly register_plugin: (a: number, b: number) => void;
  readonly get_exprtk_commands: (a: number) => void;
  readonly __wbindgen_export_0: (a: number) => number;
  readonly __wbindgen_export_1: (a: number, b: number, c: number) => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __wbindgen_export_3: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export_4: (a: number, b: number, c: number) => number;
  readonly __wbindgen_export_5: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export_6: (a: number, b: number) => void;
  readonly __wbindgen_export_7: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export_8: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export_9: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly __wbindgen_export_10: (a: number, b: number, c: number) => number;
  readonly __wbindgen_export_11: (a: number, b: number) => void;
  readonly __wbindgen_export_12: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export_13: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export_14: (a: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_export_15: (a: number, b: number) => void;
  readonly __wbindgen_export_16: (a: number, b: number, c: number, d: number) => void;
}

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
