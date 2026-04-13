// Pages
import basic from "./pages/basic";
import director from "./pages/director";
import newsHome from "./pages/newsHome";
import newsSingle from "./pages/newsSingle";
import video from "./pages/video";
import works from "./pages/works";

// Layout
import navigation from "./layout/navigation";

export default function (slug: string): string {
    if (slug === "" || slug === null) {
        console.warn("No slug provided for PageBySlugAndLayout query.");
        return ``;
    }

    return `
        query PageBySlugAndLayout($slug: String) {
            allDirectors(first: 500, filter: { slug: { eq: $slug }}) {
                ${director}
            }
            allVideos(first: 500, filter: { slug: { eq: $slug }}) {
                ${video}
            }
            allWorks(filter: { slug: { eq: $slug }}) {
                ${works}
            }
            newsHome(filter: { slug: { eq: $slug }}) {
                ${newsHome}
            }
            allNewsSingles(first: 500, filter: { slug: { eq: $slug }}) {
                ${newsSingle}
            }
            allBasics(first: 50, filter: { slug: { eq: $slug }}) {
                ${basic}
            }
            
            navigation {
                ${navigation}
            }
        }
    `;
}
