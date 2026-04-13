import sections from "../utils/sections";
import link from "../utils/link";
import seoMetaTags from "../utils/seoMetaTags";

export default `
    id
    _modelApiKey    
    title
    slug
    ${seoMetaTags}
    content {
        ${sections}
    }
    subnavigation {
        blocks {
            links {
                ${link}
            }
        }
    }
`;
