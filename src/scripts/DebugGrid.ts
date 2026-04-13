export default class DebugGrid {
    element: HTMLElement | null;
    enabled!: boolean;

    constructor() {
        this.element = document.getElementById("debug-grid");
    }
    init() {
        if (!this.element) return;
        this.enabled = this.element.getAttribute("data-enabled") === "true";

        window.addEventListener("keydown", (e) => {
            if (e.key.toLowerCase() === "g") {
                this.enabled = !this.enabled;
                this.element?.setAttribute(
                    "data-enabled",
                    this.enabled.toString(),
                );
            }
        });
    }
}
