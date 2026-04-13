export default function isProd() {
    return import.meta.env.CONTEXT === "production";
}
