import link from "../utils/link";
import img from "../utils/img";
import responsiveImg from "../utils/responsiveImg";

export default `
    ... on BlockquoteModuleRecord {
        _modelApiKey
        id
        text
        credits
    }
    ... on ImagesModuleRecord {
        _modelApiKey
        id
        displayTrueSize
        images {
            ${responsiveImg}
        }
    }
    ... on IndentedTextModuleRecord {
        _modelApiKey
        id
        text
    }
    ... on LinksModuleRecord {
        _modelApiKey
        id
        links {
            ${link}
        }
    }
    ... on TitleContentModuleRecord {
        _modelApiKey
        id
        items {
            __typename
            ... on TitleContentItemRecord {
                _modelApiKey
                id
                title
                content
            }
            ... on TitleContentItemImageRecord {
                _modelApiKey
                id
                title
                content
                image {
                    ${responsiveImg}
                }
            }
        }
    }
    ... on TwoColsModuleRecord {
        _modelApiKey
        id
        items {
            title
            lines {
                leftColText
                rightColText
            }
        }
    }
    ... on WysiwygModuleRecord {
        _modelApiKey
        id
        content
    }
    ... on EmbedVideoRecord {
        _modelApiKey
        id
        wiredriveEmbedSrc
        externalVideo {
            height
            provider
            providerUid
            thumbnailUrl
            title
            url
            width
        }
    }
`;
