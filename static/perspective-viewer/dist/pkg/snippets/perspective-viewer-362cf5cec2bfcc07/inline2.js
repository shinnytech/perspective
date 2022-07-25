
    export async function monaco_module() {
        return await import(
            /* webpackChunkName: "monaco" */
            'monaco-editor/esm/vs/editor/edcore.main.js'
        ); 
    }
