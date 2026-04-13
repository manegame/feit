import Page from "./Page";
import gsap from "gsap";

export default class Basic extends Page {
    abortController!: AbortController;
    subnavigation!: HTMLElement | null;
    content!: HTMLElement;
    prevHasSameSubnav: boolean = false;
    isMobile!: boolean;

    destroy() {
        this.abortController.abort();
        super.destroy();
    }

    async init() {
        if (!this.container) return;

        this.subnavigation = this.container.querySelector("#subnavigation");
        this.content = this.container.querySelector("#basic-content")!;
        this.abortController = new AbortController();

        this.isMobile = window.innerWidth < 1024;

        if (!this.prevHasSameSubnav) this.setupNavActive();

        await super.init();
    }

    setupNavActive() {
        if (!this.subnavigation) return;
        const currentLink = this.subnavigation.querySelector(
            ".link-exact",
        ) as HTMLElement;

        if (currentLink) {
            const offset = currentLink.offsetTop;

            gsap.set(this.subnavigation, {
                y: -offset,
            });
        }
    }

    transitionIn() {
        this.swapTl = gsap.timeline({ paused: true });

        if (this.prevHasSameSubnav) {
            this.swapTl.to(this.content, {
                opacity: 1,
                duration: 0.4,
                ease: "power2.out",
            });
        } else {
            this.swapTl.to(this.container, {
                opacity: 1,
                duration: 0.4,
                ease: "power2.out",
            });
        }

        this.updateHeaderItems();

        return this.swapTl.play();
    }

    prepareTransitionIn(sourceElement?: HTMLElement) {
        const subnavigation = this.container.querySelector("#subnavigation");

        const linkInSubnav =
            sourceElement && sourceElement.closest("#subnavigation");

        this.prevHasSameSubnav =
            (this.previousPage as Basic)?.subnavigation?.getAttribute(
                "data-subnav-id",
            ) === subnavigation?.getAttribute("data-subnav-id") &&
            !!linkInSubnav;

        const content = this.container.querySelector("#basic-content")!;

        if (this.prevHasSameSubnav) {
            gsap.set(content, { opacity: 0 });
        } else {
            gsap.set(this.container, { opacity: 0 });
        }
    }

    transitionOut({
        sourceElement,
        to,
    }: {
        sourceElement: HTMLElement;
        to?: string;
    }) {
        this.swapTl = gsap.timeline({ paused: true });

        const nextHasSameSubnav =
            to === "basic" && sourceElement.closest("#subnavigation");

        if (nextHasSameSubnav) {
            this.swapTl.to(this.subnavigation, {
                y: -sourceElement.offsetTop,
                duration: 0.6,
                ease: "power3.out",
            });

            this.swapTl.to(
                this.content,
                {
                    opacity: 0,
                    duration: 0.6,
                    ease: "power2.out",
                },
                "<",
            );
            this.updateSubnavActiveItem(sourceElement);
        } else {
            this.swapTl.to(this.container, {
                opacity: 0,
                duration: 0.4,
                ease: "power2.out",
            });
        }

        return this.swapTl.play();
    }

    updateSubnavActiveItem(sourceElement?: HTMLElement) {
        if (!this.subnavigation) return;
        const items = this.subnavigation.querySelectorAll(
            ".subnavigation-item",
        );

        items.forEach((item) => {
            const itemPath = item.getAttribute("href");
            const toPath = sourceElement?.getAttribute("href");

            if (itemPath === toPath) {
                item.classList.add("link-exact");
            } else {
                item.classList.remove("link-exact");
            }
        });
    }

    resize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth < 1024;

        if (wasMobile !== this.isMobile && !this.isMobile) {
            this.setupNavActive();
        }
    }
}
