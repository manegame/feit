import Page from "./Page";
import gsap from "gsap";

export default class Video extends Page {
    abortController!: AbortController;
    video!: HTMLVideoElement | null;
    controls!: HTMLElement | null;
    navItems!: NodeListOf<HTMLElement>;
    btnSound!: HTMLElement | null;
    btnPlay!: HTMLElement | null;
    timeline!: HTMLElement | null;
    overlay!: HTMLElement | null;
    infos!: NodeListOf<HTMLElement>;
    overlayTimeout!: ReturnType<typeof setTimeout>;
    overlayTl!: gsap.core.Timeline;
    muted!: boolean;
    play!: boolean;
    isSetup!: boolean;
    prevVideoLink!: string | null;
    nextVideoLink!: string | null;
    OVERLAY_TIME!: number;
    showOverlay!: boolean;
    onProgressUpdate = () => {};

    destroy() {
        this.abortController.abort();
        gsap.ticker.remove(this.onProgressUpdate);
        super.destroy();
    }

    async init() {
        if (!this.container) return;

        this.video = this.container.querySelector("#video-video video")!;
        this.abortController = new AbortController();
        this.muted = true;
        this.play = true;
        this.isSetup = false;
        this.showOverlay = true;
        this.OVERLAY_TIME = 1000;

        if (this.video?.readyState >= 1) this.setupVideoControls();

        if (this.app.store.workPlaylist) {
            this.setClosePrevNextVideosLinks();
        }

        this.video.addEventListener(
            "loadedmetadata",
            () => {
                this.setupVideoControls();
            },
            {
                signal: this.abortController.signal,
            },
        );

        this.video.load();

        await super.init();
    }

    onTimeUpdate() {
        const timeEl = this.container.querySelector("#video-controls-time");
        if (!timeEl) return;

        const currentTime = this.video!.currentTime;

        const minutes = Math.round(currentTime / 60)
            .toString()
            .padStart(2, "0");
        const seconds = Math.round(currentTime % 60)
            .toString()
            .padStart(2, "0");
        timeEl.textContent = `${minutes}:${seconds}`;
    }

    async toggleSound() {
        if (!this.video) return;

        try {
            this.video.muted = !this.video.muted;
            if (!this.video.muted) {
                await this.video.play();
            }
        } catch (error: any) {
            this.video.muted = !this.video.muted;

            if (this.video.muted) {
                this.video.play();
            }

            if (error.name === "NotAllowedError") {
                console.error(
                    "Autoplay policy blocked audio. User interaction is required to enable sound.",
                );
            } else if (error.name === "AbortError") {
                console.error("Play request was aborted.");
            } else {
                console.error("Error toggling sound:", error.message);
            }
        }

        this.muted = this.video.muted;

        if (this.btnSound) {
            this.btnSound.setAttribute(
                "data-muted",
                this.muted ? "true" : "false",
            );
        }
    }

    onPlayClick() {
        if (!this.video) return;
        this.play = !this.play;
        if (this.play) {
            this.video.play();
        } else {
            this.video.pause();
        }

        if (this.btnPlay) {
            this.btnPlay.setAttribute(
                "data-play",
                this.play ? "true" : "false",
            );
        }
    }

    checkPlayState() {
        if (!this.video) return;

        const videoIsPlaying = !!(
            !this.video.paused &&
            !this.video.ended &&
            this.video.readyState >= 2
        );

        if (videoIsPlaying !== this.play) {
            this.play = videoIsPlaying;
            if (this.btnPlay) {
                this.btnPlay.setAttribute(
                    "data-play",
                    this.play ? "true" : "false",
                );
            }
        }
    }

    setupTimeline() {
        if (!this.video || !this.controls) return;

        // Not clean, but only way to manage the 'this' context in the gsap ticker callback.
        // We need to remove it on destroy, so we can't use an arrow function directly in the ticker.add
        this.onProgressUpdate = () => {
            if (!this.video || !this.controls) return;
            const progress = this.video.currentTime / this.video.duration;
            this.controls.style.setProperty(
                "--video-progress",
                progress.toString(),
            );
        };

        gsap.ticker.add(this.onProgressUpdate);

        this.video.addEventListener(
            "timeupdate",
            () => {
                this.onTimeUpdate();
            },
            { signal: this.abortController.signal },
        );
    }

    onTimelineClick(e: MouseEvent) {
        if (!this.video || !this.timeline) return;

        const rect = this.timeline.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickRatio = clickX / rect.width;
        const newTime = this.video.duration * clickRatio;

        this.video.currentTime = newTime;
        this.onTimeUpdate();
    }

    setupButtons() {
        if (!this.video) return;

        this.btnSound = this.container.querySelector("#btn-sound");
        this.btnPlay = this.container.querySelector("#btn-play");
        this.timeline = this.container.querySelector("#video-timeline");

        this.timeline?.addEventListener(
            "click",
            (e) => {
                this.onTimelineClick(e);
            },
            { signal: this.abortController.signal },
        );

        this.btnSound?.addEventListener(
            "click",
            () => {
                this.toggleSound();
            },
            { signal: this.abortController.signal },
        );
        this.btnPlay?.addEventListener(
            "click",
            () => {
                this.onPlayClick();
            },
            { signal: this.abortController.signal },
        );
    }

    async setupVideoControls() {
        if (!this.video || this.isSetup) return;
        this.isSetup = true;
        this.controls = this.container.querySelector("#video-controls");

        this.setupTimeline();
        this.setupButtons();
        this.setupOverlay();

        this.video?.play();
        // Try unmuting the video by default
        await this.toggleSound();

        // With sound autoplay or low power mode, the video might still not be playing. We ensure play state in aligned with the actual play state of the video element.
        this.checkPlayState();
    }

    setupOverlay() {
        this.overlay = this.container.querySelector("#overlay");
        this.infos = this.container.querySelectorAll(".video-info");
        this.navItems = this.container.querySelectorAll(
            "#video-controls .controls-item",
        );
        if (!this.overlay) return;

        // 3 seconds for the inital load
        this.overlayTimeout = setTimeout(() => {
            this.toggleOverlay(false);
        }, 3000);

        this.container.addEventListener(
            "mousemove",
            () => {
                clearTimeout(this.overlayTimeout);
                this.toggleOverlay(true);
                this.overlayTimeout = setTimeout(() => {
                    this.toggleOverlay(false);
                }, this.OVERLAY_TIME);
            },
            { signal: this.abortController.signal },
        );
    }

    toggleOverlay(show: boolean) {
        if (show === this.showOverlay) return;
        this.showOverlay = show;

        if (this.overlayTl) this.overlayTl.kill();

        this.overlayTl = gsap.timeline();

        this.overlayTl
            .to([this.infos, this.navItems], {
                yPercent: show ? 0 : 100,
                stagger: 0.03,
                duration: 0.4,
                ease: "power2.inOut",
            })
            .to(
                this.overlay,
                {
                    opacity: show ? 0.4 : 0,
                    duration: 0.4,
                    ease: "power2.out",
                },
                "<",
            );
    }

    setClosePrevNextVideosLinks() {
        this.prevVideoLink = null;
        this.nextVideoLink = null;

        const nextLinkEl = this.container.querySelector("#next-video-link");
        const prevLinkEl = this.container.querySelector("#prev-video-link");
        const closeLinkEl = this.container.querySelector("#close-video-link");

        const playlist = this.app.store.workPlaylist?.urls || [];

        const currentIndex = playlist.findIndex(
            (link: string) => link === window.location.pathname,
        );

        if (currentIndex !== -1) {
            const prevIndex =
                (currentIndex - 1 + playlist.length) % playlist.length;
            const nextIndex = (currentIndex + 1) % playlist.length;
            this.prevVideoLink = playlist[prevIndex];
            this.nextVideoLink = playlist[nextIndex];
        }

        if (closeLinkEl) {
            closeLinkEl.setAttribute(
                "href",
                this.app.store.workPlaylist?.source || "/",
            );
        }

        if (nextLinkEl && this.nextVideoLink) {
            nextLinkEl.setAttribute("href", this.nextVideoLink);
        }

        if (prevLinkEl && this.prevVideoLink) {
            prevLinkEl.setAttribute("href", this.prevVideoLink);
        }
    }

    transitionOut({ to }: { to: string }) {
        clearTimeout(this.overlayTimeout);
        this.swapTl = gsap.timeline({ paused: true });

        const videosInfos = this.container.querySelectorAll(".video-info");
        const videoPlayer = this.container.querySelectorAll("#video-player");
        const controlsItems = this.container.querySelectorAll(
            "#video-controls .controls-item",
        );
        const video = this.container.querySelector("#video-video");

        if (to === "director") {
            this.swapTl
                .to(videosInfos, {
                    yPercent: 100,
                    stagger: 0.05,
                    duration: 0.4,
                    ease: "power2.inOut",
                })
                .to(
                    controlsItems,
                    {
                        yPercent: 100,
                        duration: 0.4,
                        ease: "power2.out",
                    },
                    "<",
                )
                .to(
                    videoPlayer,
                    {
                        opacity: 0,
                        duration: 0.4,
                        ease: "power2.out",
                    },
                    "<",
                );
        } else if (to === "video") {
            this.video?.pause();
            this.swapTl
                .to(videosInfos, {
                    yPercent: 100,
                    stagger: 0.05,
                    duration: 0.4,
                    ease: "power2.inOut",
                })
                .to(
                    videoPlayer,
                    {
                        opacity: 0,
                        duration: 0.4,
                        ease: "power2.out",
                    },
                    "<",
                )
                .to(
                    video,
                    {
                        opacity: 0,
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

        if (to !== "video" && this.app.store.workPlaylist) {
            this.app.store.workPlaylist = null;
        }

        return this.swapTl.play();
    }

    transitionIn() {
        const videosInfos = this.container.querySelectorAll(".video-info");
        const videoPlayer = this.container.querySelectorAll("#video-player");
        const controlsItems = this.container.querySelectorAll(
            "#video-controls .controls-item",
        );

        const video = this.container.querySelector("#video-video");

        this.swapTl = gsap.timeline({ paused: true });

        if (this.previousPage?.template !== "director") {
            this.swapTl.to(video, {
                opacity: 1,
                duration: 0.4,
                ease: "power2.out",
            });
        }

        this.swapTl
            .to(
                videosInfos,
                {
                    yPercent: 0,
                    stagger: 0.05,
                    duration: 0.8,
                    ease: "power2.inOut",
                },
                "<",
            )

            .to(
                videoPlayer,
                {
                    opacity: 1,
                    duration: 0.5,
                    ease: "power3.out",
                },
                "<",
            );

        if (this.previousPage?.template !== "video") {
            this.swapTl.to(
                controlsItems,
                {
                    yPercent: 0,
                    duration: 0.4,
                    ease: "power3.inOut",
                },
                "<+=0.2",
            );
        }

        this.updateHeaderItems();

        return this.swapTl.play();
    }

    prepareTransitionIn(sourceElement: HTMLElement) {
        const videosInfos = this.container.querySelectorAll(".video-info");
        const videoPlayer = this.container.querySelectorAll("#video-player");
        const controlsItems = this.container.querySelectorAll(
            "#video-controls .controls-item",
        );
        const video = this.container.querySelector("#video-video");

        if (this.previousPage?.template !== "director") {
            gsap.set(video, { opacity: 0 });
        }
        if (this.previousPage?.template !== "video") {
            gsap.set(controlsItems, { yPercent: 100 });
        }

        gsap.set(videoPlayer, { opacity: 0 });
        gsap.set(videosInfos, { yPercent: 100 });
    }
}
