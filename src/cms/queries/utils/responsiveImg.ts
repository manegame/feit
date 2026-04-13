export default `
    id
    responsiveImage(imgixParams: { auto: format }) {
        src
        width
        height
        alt
        title
        base64
        sizes
    }
    focalPoint {
        x
        y
    }
`;
