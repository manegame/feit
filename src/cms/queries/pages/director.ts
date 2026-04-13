import responsiveImg from "../utils/responsiveImg";
import seoMetaTags from "../utils/seoMetaTags";
import img from "../utils/img";

export default `
    id
    _modelApiKey
    name
    slug
    ${seoMetaTags}
    introduction
    biography
    color {
        hex
    }
    sidebar {
        id
        title
        items {
            ... on SidebarLinkRecord {
                id
                label
                link
            }
            ... on SidebarPdfRecord {
                id
                pdf {
                    id
                    url
                    title
                    filename
                }
            }
        }
    }
    photo {
        ${responsiveImg}
    }
    showcaseRss
    videos {
        _modelApiKey
        id
        slug
        name
        client
        previewRss
        awardIcon {
            ${img}
        }
    }
`;
