import allPagesAndLayout from "./queries/allPagesAndLayout";
import pageBySlugAndLayout from "./queries/pageBySlugAndLayout";
import directorsPageAndLayout from "./queries/directorsPageAndLayout";

const excecuteQuery = async (query: string, variables = {}) => {
    const response = await fetch("https://graphql.datocms.com/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${import.meta.env.DATO_API_KEY}`,
            ...(isDraft() && { "X-Include-Drafts": "true" }),
        },
        body: JSON.stringify({
            query,
            variables,
        }),
    });

    const json = await response.json();

    if (json.errors || !json.data) {
        throw new Error(JSON.stringify(json.errors || json));
    }

    const data = json.data;

    return data;
};

export const generateStaticPaths = async () => {
    const data = await getAllPagesAndLayout();

    const slugToModelApiKeyMap = pagesSlugToModelApiKeyMap(data.pages);

    const staticPaths = Object.values(data.pages).map((page) => {
        return {
            params: { slug: page.slug },
            props: {
                slugToModelApiKeyMap,
                data: {
                    page,
                    layout: data.layout,
                },
            },
        };
    });

    return staticPaths;
};

export const getPreviewData = async (params: { slug: any }) => {
    const slug = params?.slug;

    const data = await getAllPagesAndLayout();
    const slugToModelApiKeyMap = pagesSlugToModelApiKeyMap(data.pages);

    const page = data.pages[slug] || data.pages["undefined"] || null;

    return {
        data: {
            page,
            layout: data.layout,
        },
        slugToModelApiKeyMap,
    };
};

export const isDraft = () => {
    return (
        import.meta.env.DATO_DRAFT === "true" ||
        import.meta.env.DATO_DRAFT === true
    );
};

export const getPageBySlugAndLayout = async (slug: string | undefined) => {
    const isDirectorsPage = slug === "" || slug === null || slug === undefined;

    const query = isDirectorsPage
        ? directorsPageAndLayout
        : pageBySlugAndLayout(slug);

    const data = await excecuteQuery(query, { slug });

    const { navigation, ...pageData } = data;

    let page = Object.values(pagesDataToSlugMap(pageData))[0];

    let additionalData: any = {};

    if (page._modelApiKey === "news_single") {
        const newsHomeData = await excecuteQuery(pageBySlugAndLayout("news"), {
            slug: "news",
        });
        additionalData.newsHome = newsHomeData.newsHome;
    }

    page = {
        ...page,
        ...additionalData,
    };

    return {
        page,
        layout: {
            navigation,
        },
    };
};

const updatePagesData = (pages: any) => {
    // add newsHome.news to all the newsSingles, to manage prev and next links
    if (pages.newsHome && pages.allNewsSingles) {
        const newsHome = pages.newsHome;

        pages.allNewsSingles = pages.allNewsSingles.map((newsSingle: any) => {
            return {
                ...newsSingle,
                newsHome,
            };
        });
    }

    return pages as any;
};

export const getAllPagesAndLayout = async () => {
    const data = await excecuteQuery(allPagesAndLayout);

    const { navigation, ...pages } = data;

    const updatedPages = updatePagesData(pages);

    const allPages = pagesDataToSlugMap(updatedPages);

    return {
        pages: allPages,
        layout: {
            navigation,
        },
    };
};

export const pagesSlugToModelApiKeyMap = (pagesData: any) => {
    const slugMap = Object.values(pagesData).reduce(
        (acc: { [key: string]: any }, page) => {
            if (!page) return acc;

            const pageIsSingle = !Array.isArray(page);

            if (pageIsSingle) page = [page];

            (page as any[]).forEach((p: any) => {
                acc[p.slug || "/"] = p._modelApiKey;
            });

            return acc;
        },
        {},
    );

    return slugMap;
};

export const pagesDataToSlugMap = (pagesData: any) => {
    const slugMap = Object.values(pagesData).reduce(
        (acc: { [key: string]: any }, page) => {
            if (!page) return acc;

            const pageIsSingle = !Array.isArray(page);

            if (pageIsSingle) page = [page];

            (page as any[]).forEach((p: any) => {
                acc[p.slug] = p;
            });

            return acc;
        },
        {},
    );

    return slugMap;
};
