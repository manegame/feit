const MOBILE_QUERY = "(max-width: 1023px)";
const MIN_DISTANCE = 60;
const MAX_OFF_AXIS_RATIO = 0.6;
const MAX_DURATION_MS = 600;

type SwipeDirection = "left" | "right" | "up" | "down";

type SwipeOptions = {
    target?: HTMLElement | Document;
    mobileOnly?: boolean;
    onSwipe: (direction: SwipeDirection, event: PointerEvent) => void;
    shouldIgnore?: (event: PointerEvent) => boolean;
};

export function attachSwipe(options: SwipeOptions): () => void {
    const target = options.target ?? document;
    const mobileOnly = options.mobileOnly ?? true;

    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let tracking = false;
    let startTarget: EventTarget | null = null;

    const onDown = (event: Event) => {
        const e = event as PointerEvent;
        if (e.pointerType === "mouse") return;
        if (mobileOnly && !window.matchMedia(MOBILE_QUERY).matches) return;
        if (options.shouldIgnore?.(e)) return;
        tracking = true;
        startX = e.clientX;
        startY = e.clientY;
        startTime = performance.now();
        startTarget = e.target;
    };

    const onUp = (event: Event) => {
        if (!tracking) return;
        tracking = false;
        const e = event as PointerEvent;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const dt = performance.now() - startTime;
        if (dt > MAX_DURATION_MS) return;

        const absX = Math.abs(dx);
        const absY = Math.abs(dy);
        if (absX < MIN_DISTANCE && absY < MIN_DISTANCE) return;

        let direction: SwipeDirection;
        if (absX >= absY) {
            if (absY / absX > MAX_OFF_AXIS_RATIO) return;
            direction = dx < 0 ? "left" : "right";
        } else {
            if (absX / absY > MAX_OFF_AXIS_RATIO) return;
            direction = dy < 0 ? "up" : "down";
        }

        const original = e.target;
        Object.defineProperty(e, "target", {
            configurable: true,
            value: startTarget ?? original,
        });
        options.onSwipe(direction, e);
    };

    target.addEventListener("pointerdown", onDown, { passive: true });
    target.addEventListener("pointerup", onUp, { passive: true });
    target.addEventListener("pointercancel", () => {
        tracking = false;
    }, { passive: true });

    return () => {
        target.removeEventListener("pointerdown", onDown);
        target.removeEventListener("pointerup", onUp);
    };
}

export function initPageSwipeNavigation() {
    attachSwipe({
        onSwipe: (direction, event) => {
            if (direction !== "left" && direction !== "right") return;

            const startEl = event.target as HTMLElement | null;
            if (startEl?.closest("[data-lenis-prevent]")) return;
            if (startEl?.closest("[data-no-swipe]")) return;
            if (startEl?.closest("input, textarea, select, button")) return;

            const items = Array.from(
                document.querySelectorAll<HTMLAnchorElement>(
                    "#navigation .navigation-item",
                ),
            ).filter(
                (el) => !el.closest(".max-lg\\:hidden") &&
                    window.getComputedStyle(el).display !== "none",
            );
            if (items.length < 2) return;

            let currentPath = window.location.pathname;
            if (currentPath !== "/" && currentPath.endsWith("/")) {
                currentPath = currentPath.slice(0, -1);
            }

            const currentIdx = items.findIndex((item) => {
                const href = item.getAttribute("href") ?? "";
                return href === currentPath;
            });

            let targetIdx: number;
            if (currentIdx === -1) {
                targetIdx = direction === "left" ? 0 : items.length - 1;
            } else {
                const delta = direction === "left" ? 1 : -1;
                targetIdx = (currentIdx + delta + items.length) % items.length;
            }

            const targetHref = items[targetIdx].getAttribute("href");
            if (!targetHref) return;
            window.location.href = targetHref;
        },
    });
}
