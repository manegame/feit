export default `
    id
    label
    externalLink
    internalLink {
        ... on DirectorsPageRecord {
            _modelApiKey
        }
        ... on BasicRecord {
            _modelApiKey
            slug
            subnavigation {
                id
                blocks {
                    links {
                        id
                        label
                        externalLink
                        internalLink {
                            ... on BasicRecord {
                                _modelApiKey
                                slug
                            }
                        }
                    }
                }
            }
        }
        ... on DirectorRecord {
            _modelApiKey
            slug
        }
        ... on NewsHomeRecord {
            _modelApiKey
            slug
        }
        ... on NewsSingleRecord {
            _modelApiKey
            slug
        }
        ... on VideoRecord {
            _modelApiKey
            slug
        }
        ... on WorkRecord {
            _modelApiKey
            slug
        }
    }
`;
