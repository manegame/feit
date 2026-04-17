import sections from "../utils/sections";
import responsiveImg from "../utils/responsiveImg";
import link from "../utils/link";
import seoMetaTags from "../utils/seoMetaTags";

const basicOnlySections = `
    ... on TextImageModuleRecord {
        _modelApiKey
        id
        text
        image {
            ${responsiveImg}
        }
    }
`;

export default `
    id
    _modelApiKey
    title
    slug
    ${seoMetaTags}
    content {
        ${sections}
        ${basicOnlySections}
    }
    subnavigation {
        blocks {
            links {
                ${link}
            }
        }
    }
`;
