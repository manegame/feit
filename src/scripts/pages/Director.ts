import Page from "./Page";
import gsap from "gsap";
// @ts-ignore
import { Observer } from "gsap/Observer";

gsap.registerPlugin(Observer);

import { navigate } from "astro:transitions/client";

export default class Director extends Page {
    banner!: HTMLElement;
    overlay!: HTMLElement;
    wrapper!: HTMLElement;
    slider!: HTMLElement;
    sliderParent!: HTMLElement;
    sliderXTo!: any;
    sliderClamp!: (value: number) => number;
    sliderX!: number;
    abortController!: AbortController;

    destroy() {
        this.abortController.abort();
        super.destroy();
    }

    async init() {
        if (!this.container) return;

        this.wrapper = this.container.querySelector("#director")!;
        this.banner = this.container.querySelector("#director-banner")!;
        this.overlay = this.container.querySelector("#director-overlay")!;

        this.abortController = new AbortController();

        if (this.banner) {
            this.setupMobileTabs();
            this.setupClose();
            this.setupSlider();
        }

        await super.init();
    }

    computeSliderClamp() {
        if (!this.slider || !this.sliderParent) return;
        const distanceMax =
            Math.max(this.slider.offsetWidth, this.sliderParent.offsetWidth) -
            this.sliderParent.offsetWidth;
        this.sliderClamp = gsap.utils.clamp(-distanceMax, 0);
    }

    setupSlider() {
        this.slider = this.banner.querySelector(
            "#director-slider",
        )! as HTMLElement;
        this.sliderParent = this.banner.querySelector(
            "#director-slider-parent",
        )! as HTMLElement;

        this.computeSliderClamp();

        this.sliderXTo = gsap.quickTo(this.slider, "x", {
            duration: 0.2,
            ease: "power2.out",
        });
        this.sliderX = 0;

        Observer.create({
            target: this.sliderParent,
            type: "wheel,touch,pointer",
            wheelSpeed: -1,
            preventDefault: true,
            onDragStart: () => {
                this.slider.setAttribute("data-dragging", "true");
            },
            onDragEnd: () => {
                this.slider.setAttribute("data-dragging", "false");
            },
            onChangeX: (self) => {
                this.sliderX = this.sliderClamp(this.sliderX + self.deltaX);
                this.sliderXTo(this.sliderX);
            },
        });
    }

    setupClose() {
        const closeBtn = this.banner.querySelector(
            "#director-close-btn",
        ) as HTMLButtonElement;

        const overlay = document.querySelector(
            "#director-overlay",
        ) as HTMLDivElement;

        overlay.addEventListener(
            "click",
            () => {
                this.close();
            },
            { signal: this.abortController.signal },
        );

        closeBtn.addEventListener(
            "click",
            () => {
                this.close();
            },
            { signal: this.abortController.signal },
        );
    }

    close() {
        navigate(this.previousUrl);
    }

    setupMobileTabs() {
        const workBtn = this.banner.querySelector(
            "#director-work-btn",
        ) as HTMLButtonElement;
        const bioBtn = this.banner.querySelector(
            "#director-bio-btn",
        ) as HTMLButtonElement;

        workBtn.addEventListener(
            "click",
            () => {
                this.banner!.dataset.selected = "work";
            },
            { signal: this.abortController.signal },
        );

        bioBtn.addEventListener(
            "click",
            () => {
                this.banner!.dataset.selected = "bio";
            },
            { signal: this.abortController.signal },
        );
    }

    resize() {
        this.computeSliderClamp();
        this.sliderX = this.sliderClamp(this.sliderX);
        this.sliderXTo(this.sliderX);
    }

    transitionIn() {
        const overlay = this.container.querySelector(
            "#director-overlay",
        ) as HTMLDivElement;

        const banner = this.container.querySelector(
            "#director-banner",
        ) as HTMLElement;

        this.swapTl = gsap.timeline({ paused: true });

        this.swapTl.to(overlay, {
            opacity: 0.85,
            duration: 0.4,
            ease: "power3.out",
        });
        this.swapTl.to(
            banner,
            { yPercent: 0, duration: 0.4, ease: "power3.out" },
            "<",
        );

        this.updateHeaderItems();

        return this.swapTl.play();
    }

    transitionOut({ to }: { to: string }) {
        this.swapTl = gsap.timeline({ paused: true });

        if (to === "directors_page" || to === "video") {
            this.swapTl.to(this.overlay, {
                opacity: 0.4,
                duration: 0.4,
                ease: "power3.out",
            });
        } else {
            this.swapTl.to(this.overlay, {
                opacity: 1,
                duration: 0.4,
                ease: "power3.out",
            });
        }

        this.swapTl.to(
            this.banner,
            { yPercent: -100, duration: 0.4, ease: "power3.out" },
            "<",
        );

        return this.swapTl.play();
    }

    prepareTransitionIn() {
        const overlay = this.container.querySelector(
            "#director-overlay",
        ) as HTMLDivElement;

        const banner = this.container.querySelector(
            "#director-banner",
        ) as HTMLElement;

        if (
            this.previousPage?.template === "directors_page" ||
            this.previousPage?.template === "video"
        ) {
            gsap.set(overlay, { opacity: 0.4 });
        } else {
            gsap.set(overlay, { opacity: 1 });
        }

        gsap.set(banner, { yPercent: -100 });
    }
}
