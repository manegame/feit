import Lenis from "lenis";
import { gsap } from "gsap";

export default class Scroll {
    lenis: Lenis;

    constructor() {
        this.lenis = new Lenis();
    }

    init() {
        gsap.ticker.add((time) => {
            this.lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
    }

    getScroll() {
        return this.lenis.scroll;
    }

    reset() {
        this.lenis.scrollTo(0, { duration: 0, immediate: true });
    }
}
