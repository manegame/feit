import Page from "./Page";
import gsap from "gsap";

export default class Work extends Page {
    abortController!: AbortController;
    wrapper!: HTMLElement | null;
    items!: NodeListOf<HTMLElement>;
    initialScroll!: number;
    centerVideo!: HTMLElement | null;
    isMobile!: boolean;
    isLowPowerMode: boolean = false;
    shouldLoadVideosOnInit!: boolean;
    enableCenterVideoTransition: boolean = false;

    constructor(...args: ConstructorParameters<typeof Page>) {
        super(...args);
        this.shouldLoadVideosOnInit = true;
    }

    destroy() {
        this.abortController.abort();
        super.destroy();
    }

    async init() {
        if (!this.container) return;

        this.wrapper = this.container.querySelector("#work-wrapper");
        this.items = this.container?.querySelectorAll(".video-item");
        this.abortController = new AbortController();

        this.isMobile = window.innerWidth < 1024;

        if (this.shouldLoadVideosOnInit) this.loadVideos();

        await super.init();
    }

    setupInitialScroll() {
        if (!this.centerVideo) {
            this.centerVideo = this.getVideoOnCenter(this.items);
        }
        if (!this.initialScroll) {
            this.initialScroll = this.getInitialScroll();
        }

        if (this.initialScroll && this.wrapper) {
            this.wrapper.style.scrollBehavior = "auto";
            this.wrapper.scrollTop = this.initialScroll;
            this.wrapper.style.scrollBehavior = "";
        }
    }

    getVideoOnCenter(items: NodeListOf<HTMLElement>) {
        const dataCenter =
            this.container
                ?.querySelector("#work")
                ?.getAttribute("data-center") || "0";

        return Array.from(items)[parseInt(dataCenter)];
    }

    getInitialScroll() {
        if (!this.centerVideo) return 0;

        const videoRect = this.centerVideo.getBoundingClientRect();

        const initialScroll =
            videoRect.top + videoRect.height / 2 - window.innerHeight / 2;

        return initialScroll;
    }

    loadVideos() {
        const videos = this.container?.querySelectorAll(
            ".work-video",
        ) as NodeListOf<HTMLVideoElement>;
        videos?.forEach((video) => {
            const src = video.getAttribute("data-src");
            if (src) video.setAttribute("src", src);
            video.load();
            video.play().catch((error) => {
                if (error.name === "NotAllowedError" && !this.isLowPowerMode) {
                    this.enableLowPowerFallback(videos);
                }
            });
        });
    }

    enableLowPowerFallback(videos: NodeListOf<HTMLVideoElement>) {
        if (this.isLowPowerMode) return;
        this.isLowPowerMode = true;

        videos?.forEach((video) => {
            video.style.display = "none";
        });
    }

    saveWorkPlaylist() {
        const videos = this.container?.querySelectorAll(".video-item");
        const playlist = Array.from(videos || []).map((video) => {
            const href = video.getAttribute("href");
            return href || "";
        });

        this.app.store.workPlaylist = {
            urls: playlist,
            source: window.location.pathname,
        };
    }

    setRetractedState(items?: NodeListOf<HTMLElement>) {
        if (!items) return;
        const centerRowIndex = this.centerVideo?.getAttribute("data-row-index");
        items.forEach((item, index) => {
            const rowIndex = item.getAttribute("data-row-index");
            if (!rowIndex || !centerRowIndex) return;

            const relativeRowIndex =
                parseInt(rowIndex) - parseInt(centerRowIndex);

            gsap.set(item, {
                y: -relativeRowIndex * 195,
            });
        });
    }

    prepareTransitionIn(sourceElement?: HTMLElement): void {
        if (
            this.previousPage?.template !== "directors_page" ||
            window.innerWidth < 1024
        ) {
            // remove posters
            const videos = this.container?.querySelectorAll(".work-video");
            videos?.forEach((video) => {
                video.removeAttribute("poster");
            });
            gsap.set(this.container, { opacity: 0 });
        } else {
            this.shouldLoadVideosOnInit = false;
        }
    }

    transitionOut({ to }: { to: string }) {
        if (to === "video") {
            this.saveWorkPlaylist();
        }

        this.swapTl = gsap.timeline({ paused: true });

        this.swapTl.to(this.container, {
            opacity: 0,
            duration: 0.4,
            ease: "power2.out",
        });

        return this.swapTl.play();
    }

    transitionIn() {
        this.initialScroll = this.getInitialScroll();
        this.swapTl = gsap.timeline({
            paused: true,
        });

        if (
            this.enableCenterVideoTransition &&
            this.previousPage?.template === "directors_page" &&
            window.innerWidth >= 1024
        ) {
            this.setupInitialScroll();

            this.swapTl.eventCallback("onComplete", () => {
                this.loadVideos();
            });

            const wrapper = this.container?.querySelector("#work-wrapper");
            const items = this.container?.querySelectorAll(
                ".video-item",
            ) as NodeListOf<HTMLElement>;
            const scale = window.innerHeight / this.centerVideo!.offsetHeight;

            gsap.set(wrapper, {
                scale: scale,
            });

            gsap.set(items, {
                pointerEvents: "none",
            });

            this.setRetractedState(items);

            this.swapTl
                .to(wrapper, {
                    scale: 1,
                    duration: 1,
                    ease: "power3.out",
                })
                .to(
                    items,
                    {
                        y: 0,
                        duration: 1,
                        ease: "power2.inOut",
                    },
                    "<",
                )
                .set(items, { pointerEvents: "auto" });
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

    resize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth < 1024;

        if (wasMobile !== this.isMobile) {
            if (!this.isMobile) {
                this.setupInitialScroll();
            } else {
                this.app.scroll.reset();
            }
        }
    }
}
