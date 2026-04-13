import responsiveImg from "../utils/responsiveImg";
import seoMetaTags from "../utils/seoMetaTags";

export default `
    id
    _modelApiKey
    title
    slug
    ${seoMetaTags}
    news {
        id
        _modelApiKey
        slug
        title
        leftAlignedTitle
        rightAlignedTitle
        date
        category {
            category
        }
        cover {
            ${responsiveImg}
        }
    }
`;
