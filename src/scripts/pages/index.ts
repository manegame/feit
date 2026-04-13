import DirectorsPage from "./Directors";
import Director from "./Director";
import Page from "./Page";
import Video from "./Video";
import NewsHome from "./NewsHome";
import NewsSingle from "./NewsSingle";
import Basic from "./Basic";
import Work from "./Work";

const DEFAULT_PAGE = Page;

const PAGE_BY_TEMPLATE: Record<string, typeof Page> = {
    directors_page: DirectorsPage,
    director: Director,
    video: Video,
    news_home: NewsHome,
    news_single: NewsSingle,
    basic: Basic,
    work: Work,
};

export const getPageClass = (template: string) => {
    const PageClass = PAGE_BY_TEMPLATE[template || ""] || DEFAULT_PAGE;
    return PageClass;
};

export const getPage = (
    template: string,
    doc?: Document,
    previousUrl: string = "/",
    previousPage?: Page,
) => {
    const PageClass = getPageClass(template);
    return new PageClass(template, doc, previousUrl, previousPage);
};
