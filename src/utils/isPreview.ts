export default function isPreview() {
    // Netlify load it as a Boolean
    return (
        import.meta.env.DATO_PREVIEW === "true" ||
        import.meta.env.DATO_PREVIEW === true
    );
}
