import Page from "./Page";
import { gsap } from "gsap";

export default class DirectorsGridPage extends Page {
    previewEl!: HTMLElement;
    previewVideoEl!: HTMLVideoElement;
    previewPosterEl!: HTMLImageElement;
    directors!: HTMLElement[];
    abortController!: AbortController;
    isLowPowerMode: boolean = false;
    currentDirector: HTMLElement | null = null;

    destroy() {
        this.abortController.abort();
        super.destroy();
    }

    async init() {
        if (!this.container) return;

        this.abortController = new AbortController();

        this.previewEl = this.container.querySelector(
            "#directors-grid-preview",
        ) as HTMLElement;
        this.previewVideoEl = this.container.querySelector(
            "#directors-grid-preview-video",
        ) as HTMLVideoElement;
        this.previewPosterEl = this.container.querySelector(
            "#directors-grid-preview-poster",
        ) as HTMLImageElement;

        this.directors = Array.from(
            this.container.querySelectorAll(".directors-grid-item"),
        );

        this.setupInteractions();

        await super.init();
    }

    setupInteractions() {
        this.directors.forEach((director) => {
            director.addEventListener(
                "mouseenter",
                () => this.onDirectorEnter(director),
                { signal: this.abortController.signal },
            );
            director.addEventListener(
                "mousemove",
                (e: MouseEvent) => this.onDirectorMove(e),
                { signal: this.abortController.signal },
            );
            director.addEventListener(
                "mouseleave",
                () => this.onDirectorLeave(),
                { signal: this.abortController.signal },
            );
        });
    }

    onDirectorEnter(director: HTMLElement) {
        this.currentDirector = director;
        const videoUrl = director.dataset.video;
        const posterUrl = director.dataset.poster;

        if (posterUrl) {
            this.previewPosterEl.src = posterUrl;
            this.previewPosterEl.style.display = "block";
        }

        if (videoUrl) {
            this.previewVideoEl.src = videoUrl;
            this.previewVideoEl.load();
            this.previewVideoEl.play().catch((error) => {
                if (error.name === "NotAllowedError") {
                    this.isLowPowerMode = true;
                }
            });
            this.previewVideoEl.addEventListener(
                "loadeddata",
                () => {
                    this.previewPosterEl.style.display = "none";
                },
                { once: true },
            );
        }

        this.previewEl.classList.remove("hidden");
    }

    onDirectorMove(e: MouseEvent) {
        const offsetX = 16;
        const offsetY = 16;
        this.previewEl.style.left = `${e.clientX + offsetX}px`;
        this.previewEl.style.top = `${e.clientY + offsetY}px`;
    }

    onDirectorLeave() {
        this.currentDirector = null;
        this.previewEl.classList.add("hidden");
        this.previewVideoEl.pause();
        this.previewVideoEl.removeAttribute("src");
        this.previewPosterEl.removeAttribute("src");
        this.previewPosterEl.style.display = "block";
    }

    reveal() {
        gsap.from(
            this.container.querySelector(".flex.w-full")!,
            {
                opacity: 0,
                y: 40,
                duration: 0.8,
                delay: 0.3,
                ease: "power2.out",
            },
        );
    }
}
