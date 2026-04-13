interface Window {
    dataLayer: Record<string, any>[];
}

interface ImportMetaEnv {
    readonly DATO_API_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
