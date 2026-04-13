import responsiveImg from "../utils/responsiveImg";
import sections from "../utils/sections";
import seoMetaTags from "../utils/seoMetaTags";

export default `
    id
    _modelApiKey
    title
    slug
    ${seoMetaTags}
    leftAlignedTitle
    rightAlignedTitle
    date
    category {
        category
    }
    cover {
        ${responsiveImg}
    }
    coverSize
    content {
        ${sections}
    }
`;
