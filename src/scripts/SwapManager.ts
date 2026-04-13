import type {
    TransitionBeforePreparationEvent,
    TransitionBeforeSwapEvent,
} from "astro/virtual-modules/transitions-events.js";
import Zauberberg from "./Zauberberg";
import type Page from "./pages/Page";

import { getPage } from "./pages";

export default class SwapManager {
    app: Zauberberg;
    page!: Page;
    newPage!: Page;

    constructor() {
        this.app = new Zauberberg();
    }

    transfertStates(newDoc: Document) {
        const loaderEl = newDoc.getElementById("loader");
        if (loaderEl) loaderEl.setAttribute("data-finished", "true");
    }

    onBeforePreparationEvent(event: TransitionBeforePreparationEvent) {
        console.log("[SWAP MANAGER] - Before preparation");
        const originalLoader = event.loader;

        let toSlug: string = "/";

        if (event.to.pathname !== "/") {
            toSlug = event.to.pathname.replace(/^\/+/, "");
        }

        const to = this.app.store.slugToModelApiKeyMap[toSlug];

        event.loader = async () => {
            await this.page.beforeTransitionOut();
            await this.page.transitionOut({
                to,
                sourceElement: event.sourceElement as HTMLElement,
            });
            await originalLoader();
        };
    }

    onBeforeSwapEvent(event: TransitionBeforeSwapEvent) {
        console.log("[SWAP MANAGER] - Before swap");

        const newTemplate =
            event.newDocument.querySelector<HTMLElement>("#page")!.dataset
                .template || "";

        this.newPage = getPage(
            newTemplate,
            event.newDocument,
            window.location.pathname,
            this.page,
        )!;

        this.transfertStates(event.newDocument);

        const scrollTop = this.app.scroll.getScroll();

        this.app.scroll.lenis.stop();

        this.page.container.style.position = "fixed";
        this.page.container.style.top = `-${scrollTop}px`;
        this.page.container.style.width = "100%";
        this.page.container.style.zIndex = "1000";

        this.newPage.prepareTransitionIn(event.sourceElement as HTMLElement);

        this.page.container.style.position = "";
        this.page.container.style.top = "";
        this.page.container.style.width = "";
        this.page.container.style.zIndex = "";
    }

    async onAfterSwapEvent(event: Event) {
        // if (!this.newPage) return;
        console.log("[SWAP MANAGER] - After swap");
        this.page.destroy();
        this.page = this.newPage;
        this.newPage = undefined as any;
        this.app.setCurrentPage(this.page);
        this.app.scroll.lenis.start();

        await this.page.init();

        this.page.transitionIn();
    }

    init() {
        this.page = this.app.page!;

        document.addEventListener("astro:before-preparation", (event) => {
            this.onBeforePreparationEvent(event);
        });

        document.addEventListener("astro:after-swap", (event) => {
            this.onAfterSwapEvent(event);
        });

        // document.addEventListener("astro:page-load", (event) => {
        //     this.onAfterSwapEvent(event);
        // });

        document.addEventListener("astro:before-swap", (event) => {
            this.onBeforeSwapEvent(event);
        });
    }
}
