import DebugGrid from "./DebugGrid";
import Loader from "./Loader";
import SwapManager from "./SwapManager";
import Scroll from "./Scroll";

import { getPage } from "./pages";

import type Page from "./pages/Page";

export default class Zauberberg {
    private static instance: Zauberberg;
    swapManager!: SwapManager;
    initialized!: boolean;
    loader!: Loader;
    scroll!: Scroll;
    page!: null | Page;
    debugGrid!: DebugGrid;
    store: Record<string, any> = {};

    constructor() {
        if (Zauberberg.instance) return Zauberberg.instance;
        Zauberberg.instance = this;

        this.initialized = false;

        this.scroll = new Scroll();
        this.swapManager = new SwapManager();
        this.loader = new Loader();
        this.debugGrid = new DebugGrid();

        this.store = this.getDataFromServer();

        const initialTemplate =
            document.querySelector<HTMLElement>("#page")!.dataset.template ||
            "";

        const currentPage = getPage(initialTemplate);
        this.setCurrentPage(currentPage!);
    }

    setCurrentPage(page: Page) {
        this.page = page;
    }

    getDataFromServer() {
        const dataElement = document.getElementById("data");
        const data = JSON.parse(dataElement?.dataset.data || "{}");
        return data;
    }

    async init() {
        this.loader.start();

        this.scroll.init();
        this.swapManager.init();
        this.page?.init();
        this.debugGrid.init();
        this.setupResize();
        this.initialized = true;

        await this.loader.end();

        this.page?.reveal();
    }

    setupResize() {
        window.addEventListener("resize", () => {
            this.page?.resize();
        });
    }
}
