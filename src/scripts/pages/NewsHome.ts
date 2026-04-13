import Page from "./Page";
import gsap from "gsap";

// @ts-ignore
import { Flip } from "gsap/Flip";
gsap.registerPlugin(Flip);

export default class NewsHome extends Page {
    abortController!: AbortController;
    categoryButtons!: NodeListOf<HTMLButtonElement>;
    newsItems!: NodeListOf<HTMLElement>;
    filtersPanel!: HTMLElement;
    filtersPanelList!: HTMLElement;
    currentCategory!: string;
    isMobile!: boolean;

    destroy() {
        this.abortController.abort();
        super.destroy();
    }

    async init() {
        if (!this.container) return;

        this.abortController = new AbortController();

        this.setupFilters();

        await super.init();
    }

    changeCategory(category: string) {
        if (category === this.currentCategory) return;

        // translate filter panel list to keep the active button in place
        const activeButton = this.filtersPanelList.querySelector(
            `button[data-category="${category}"]`,
        ) as HTMLElement;

        if (activeButton) {
            const offset = activeButton.offsetTop;

            gsap.to(this.filtersPanelList, {
                y: -offset,
                duration: 0.8,
                ease: "power3.out",
            });
        }

        // update filters panel active state
        this.categoryButtons.forEach((button) => {
            const buttonCategory = button.getAttribute("data-category");
            const isActive = buttonCategory === category;
            button.setAttribute("data-active", isActive ? "true" : "false");
        });

        // update items visibility
        this.newsItems.forEach((item) => {
            const itemCategory = item.getAttribute("data-news-category");
            const shouldShow = category === "All" || itemCategory === category;
            item.setAttribute("data-hidden", shouldShow ? "false" : "true");
        });

        // update URL params without reloading
        const url = new URL(window.location.href);
        if (category === "All") {
            url.searchParams.delete("category");
        } else {
            url.searchParams.set("category", category);
        }
        window.history.replaceState({}, "", url.toString());

        this.currentCategory = category;
    }

    onCategoryClick(button: HTMLElement) {
        const category = button.getAttribute("data-category") || "All";
        this.changeCategory(category);
    }

    setupFilters() {
        this.categoryButtons = this.container.querySelectorAll(
            "button[data-category]",
        );
        this.newsItems = this.container.querySelectorAll(".news-item");
        this.filtersPanel = this.container.querySelector("#filters-panel")!;
        this.filtersPanelList = this.container.querySelector(
            "#filters-panel-list",
        )!;

        // initial category from URL
        const urlParams = new URLSearchParams(window.location.search);
        const initialCategory = urlParams.get("category") || "All";
        this.changeCategory(initialCategory);

        this.categoryButtons.forEach((button) => {
            button.addEventListener(
                "click",
                () => {
                    this.onCategoryClick(button);
                },
                {
                    signal: this.abortController.signal,
                },
            );
        });
    }

    transitionOut({
        to,
        sourceElement,
    }: {
        to?: string;
        sourceElement: HTMLElement;
    }) {
        this.swapTl = gsap.timeline({ paused: true });

        if (to === "news_single") {
            const otherNewsItems = Array.from(
                this.container.querySelectorAll(".news-item"),
            ).filter((item) => !item.contains(sourceElement));

            const filtersNav = this.filtersPanel.querySelector(
                "nav",
            ) as HTMLElement;

            this.swapTl.to(otherNewsItems, {
                opacity: 0,
                duration: 0.4,
                ease: "power2.out",
            });
            this.swapTl.to(
                filtersNav,
                {
                    opacity: 0,
                    x: -20,
                    duration: 0.4,
                    ease: "power2.out",
                },
                "<",
            );
        } else {
            this.swapTl.to(this.container, {
                opacity: 0,
                duration: 0.4,
                ease: "power2.out",
            });
        }

        return this.swapTl.play();
    }
}
