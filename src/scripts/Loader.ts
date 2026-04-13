import gsap from "gsap";

export default class Loader {
    element: HTMLElement;
    letters: NodeListOf<Element>;
    startAnimation: gsap.core.Timeline | Promise<void> | null;
    finished: boolean;

    constructor() {
        this.element = document.getElementById("loader")!;
        this.letters = this.element?.querySelectorAll(".loader-path");

        this.startAnimation = null;
        this.finished = false;
    }

    start() {
        if (!this.element || !this.letters) {
            this.startAnimation = Promise.resolve();
            return;
        }

        const startTl = gsap.timeline({ paused: true });

        startTl.to(this.letters, {
            y: 0,
            stagger: 0.03,
            duration: 1.2,
            ease: "power4.out",
        });

        this.startAnimation = startTl.play();
    }
    async end() {
        if (!this.element || !this.letters) return Promise.resolve();
        await this.startAnimation;

        const endTl = gsap.timeline({
            paused: true,
            onComplete: () => {
                this.finished = true;
                this.element.setAttribute("data-finished", "true");
            },
        });

        endTl
            .to(this.element, {
                clipPath: "inset(0% 0% 100% 0%)",
                duration: 1.2,
                ease: "power4.inOut",
            })
            .to(
                [...this.letters].reverse(),
                {
                    y: "-100%",
                    stagger: 0.03,
                    duration: 0.6,
                    ease: "power3.in",
                },
                "<",
            );

        endTl.play();

        return Promise.resolve();
    }
}
