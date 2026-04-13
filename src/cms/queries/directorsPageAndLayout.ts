// Pages
import directorsPage from "./pages/directorsPage";

// Layout
import navigation from "./layout/navigation";

export default `
    query directorsPageAndLayout {
        directorsPage {
            ${directorsPage}
        }
        navigation {
            ${navigation}
        }
    }
`;
