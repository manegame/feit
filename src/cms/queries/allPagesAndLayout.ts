// Pages
import basic from "./pages/basic";
import director from "./pages/director";
import directorsPage from "./pages/directorsPage";
import newsHome from "./pages/newsHome";
import newsSingle from "./pages/newsSingle";
import video from "./pages/video";
import works from "./pages/works";

// Layout
import navigation from "./layout/navigation";

export default `
    query AllPagesAndLayout {
        directorsPageFeit {
            ${directorsPage}
        }
        allDirectors(first: 500) {
            ${director}
        }
        allVideos(first: 500) {
            ${video}
        }
        allWorkFeits {
            ${works}
        }
        newsHome {
            ${newsHome}
        }
        allNewsSingles(first: 500) {
            ${newsSingle}
        }
        allBasics(first: 50) {
            ${basic}
        }
        
        navigation {
            ${navigation}
        }
    }
`;
