import gsap from "gsap";
import Zauberberg from "../Zauberberg";

export default class Page {
    container!: HTMLElement;
    initialized: boolean;
    destroyed: boolean;
    app: Zauberberg;
    template: string;
    previousUrl: string;
    previousPage?: Page;

    swapTl: gsap.core.Timeline | null;

    constructor(
        template: string,
        doc: Document = window.document,
        previousUrl: string = "/",
        previousPage?: Page,
    ) {
        this.app = new Zauberberg();
        this.template = template;
        this.container = doc.getElementById("page") as HTMLElement;
        this.swapTl = null;
        this.initialized = false;
        this.destroyed = false;
        this.previousUrl = previousUrl;
        this.previousPage = previousPage;
    }

    async init() {
        this.initialized = true;
    }

    destroy() {
        this.destroyed = true;
    }

    // Trigger after loader animation, on initial page load
    reveal() {}

    beforeTransitionOut(): Promise<any> | gsap.core.Timeline {
        return Promise.resolve();
    }

    prepareTransitionIn(sourceElement?: HTMLElement): void {
        gsap.set(this.container, { opacity: 0 });
    }

    transitionIn(): Promise<any> | gsap.core.Timeline {
        this.swapTl = gsap.timeline({ paused: true });

        this.swapTl.to(this.container, {
            opacity: 1,
            duration: 0.4,
            ease: "power2.out",
        });

        this.updateHeaderItems();

        return this.swapTl.play();
    }

    transitionOut({
        sourceElement,
        to,
    }: {
        sourceElement: HTMLElement;
        to: string;
    }): Promise<any> | gsap.core.Timeline {
        this.swapTl = gsap.timeline({ paused: true });

        this.swapTl.to(this.container, {
            opacity: 0,
            duration: 0.4,
            ease: "power2.out",
        });

        return this.swapTl.play();
    }

    resize() {}

    updateHeaderItemsVisibility(navigation: HTMLElement) {
        const items = navigation.querySelectorAll(".navigation-item");
        const itemWrapper = navigation.querySelector(
            ".navigation-items-wrapper",
        ) as HTMLElement;

        const hideOn =
            navigation.getAttribute("data-hide-on")?.split(",") || [];

        if (hideOn.includes(this.template)) {
            gsap.to(items, {
                y: "-100%",
                duration: 0.4,
                ease: "power3.out",
            });
            if (itemWrapper) itemWrapper.style.pointerEvents = "none";
        } else {
            gsap.to(items, {
                y: "0%",
                duration: 0.4,
                ease: "power3.out",
            });
            if (itemWrapper) itemWrapper.style.pointerEvents = "auto";
        }
    }

    updateHeaderActiveItem(navigation: HTMLElement) {
        const items = navigation.querySelectorAll(".navigation-item");

        items.forEach((item) => {
            const src = item.getAttribute("href");
            const subslugs =
                item.getAttribute("data-subslugs")?.split(",") || [];
            const currentPath = window.location.pathname;

            const isCurrent = src === currentPath;
            const isSubslugCurrent = subslugs.some(
                (slug) => slug === currentPath,
            );

            if (isCurrent || isSubslugCurrent) {
                item.classList.add("link-current");
            } else {
                item.classList.remove("link-current");
            }
        });
    }

    updateHeaderItems() {
        const navigation = document.getElementById("navigation");
        if (!navigation) return;

        this.updateHeaderItemsVisibility(navigation);
        this.updateHeaderActiveItem(navigation);
    }
}
