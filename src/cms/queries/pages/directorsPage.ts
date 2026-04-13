import video from "../utils/video";
import seoMetaTags from "../utils/seoMetaTags";

export default `
    id
    _modelApiKey
    title
    ${seoMetaTags}
    directors {
        _modelApiKey
        id
        name
        slug
        color {
            hex
        }
        showcaseRss   
    }
`;
