import React, { useEffect, useState } from "react";
import { useLocationContext } from "../../state-management/locationContext";
import LayoutContainer from "../../src/custom-components/LayoutContainer";
import HeaderSection from "../../src/page-blocks/search/HeaderSection";
import SearchbarModals from "../../src/custom-components/Searchbar/SearchbarModals";
import RestaurantCard from "../../src/custom-components/SearchResults/RestaurantCard";
import RestaurantFilters from "../../src/page-blocks/search/RestaurantFilters";
import FiltersModal from "../../src/custom-components/Modals/SearchFilter/FiltersModal";
import NoResults from "../../src/page-blocks/search/NoResults";
import TabTitle from "../../src/custom-components/TabTitle";
import PaddedBlock from "../../src/custom-components/PaddedBlock";
import useBookmarks from "../api/helperFunctions/useBookmarks";
import { trackWindowScroll } from "react-lazy-load-image-component";
import PaginationRow from "../../src/page-blocks/search/sub/PaginationRow";
import Footer from "../../src/custom-components/Footer";
import { makeSearchHeader } from "../../src/utility-functions/search/makeSearchHeader";
import { createYelpEndpoint } from "../api/helperFunctions/createYelpEndpoint";
import { useSelector } from "react-redux";
import { Typography, Box } from "@mui/material";
import { mix } from "../../styles/styleMixins";
import { useYelpFetch } from "../api/helperFunctions/useYelpFetch";
import OffsetFromTop from "../../src/custom-components/LoadingVisuals/OffsetFromTop";
import { wait } from "../../src/utility-functions/general/wait";
import useLocationSwap from "../../src/utility-functions/search/useLocationSwap";

export async function getServerSideProps(context) {
  const queryParams = context.query;
  // Make a Header title using the query params
  let partialHeaderTitle = makeSearchHeader(queryParams);
  if (!partialHeaderTitle) partialHeaderTitle = null;
  const endpoint = createYelpEndpoint(queryParams); // create an API string
  return { props: { queryParams, endpoint, partialHeaderTitle } }; // prettier-ignore
}

function Restaurants(props) {
  // Declare the functions that fetch Yelp data and eestablish previously saved bookmarks
  const fetchYelpData = useYelpFetch();
  const locationSwap = useLocationSwap();
  const initializeBookmarks = useBookmarks();
  const [loading, setLoading] = React.useState(true);

  // Extract prop values from getServerSideProps
  const [searchHeader, setSearchHeader] = useState(undefined); // "Ex. Ramen near Toronto"
  const { queryParams, endpoint, partialHeaderTitle, scrollPosition } = props; // prettier-ignore
  const { locationObject } = useLocationContext();

  // On startup, fetch Yelp data and create the header text (Ex. "Pizza in New York")
  const [onMount, setOnMount] = useState(true);
  useEffect(async () => {
    if (!locationObject) return;
    setLoading(true);
    // Create the header text and fetch the restaurant data
    if (!partialHeaderTitle) {
      setSearchHeader(""); // make it so we have no search header
    } else {
      setSearchHeader(`${partialHeaderTitle} ${locationObject.locationString}`);
    }

    fetchYelpData(endpoint);
    if (onMount) {
      initializeBookmarks(); // Set the bookmarks on startup
      setOnMount(false);
    }
    // await wait(2);
    setLoading(false); // end loading animation
  }, [queryParams, endpoint]);

  // If the location changes, jump to another page
  useEffect(async () => {
    locationSwap();
  }, [locationObject]);

  // Redux state values that directly determine what JSX/messages get rendered
  const restaurantList = useSelector((rs) => rs.searchResults.restaurantList); // prettier-ignore
  const showError = useSelector((rs) => rs.searchResults.showError); // bool
  const numberOfHits = useSelector((rs) => rs.searchResults.numberOfHits);
  if (loading) {
    return (
      <PaddedBlock>
        <TabTitle title="Search | Local Eats" />
        <HeaderSection parent={"searchPage"} breakpoint={725} />
        <OffsetFromTop />
        {/* Still need our modals on standby */}
        <SearchbarModals />
        <FiltersModal />
      </PaddedBlock>
    );
  } else if (!locationObject || showError || !numberOfHits) {
    // There are 3 instances where the Yelp API call does not return any restaurant data
    let errorMsg;
    if (!locationObject) errorMsg = "No location specified!";
    else if (!numberOfHits) errorMsg= "No results found! Try searching something else"
    else if (showError) errorMsg= "Something's gone wrong! Reload the page or search for something else" // prettier-ignore
    return (
      <PaddedBlock>
        <TabTitle title="Search | Local Eats" />
        <HeaderSection parent={"searchPage"} breakpoint={725} />
        <Typography variant="h3" component="h2" sx={{ mb: 4, mt: 5, mx: 2 }}>
          {searchHeader}
        </Typography>
        <NoResults msg={errorMsg} delay={0} />
        {/* Still need our modals on standby */}
        <SearchbarModals />
        <FiltersModal />
      </PaddedBlock>
    );
  }
  // If we have search results and a location object, render the following
  return (
    <PaddedBlock>
      <TabTitle title="Search | Local Eats" />
      <HeaderSection parent={"searchPage"} breakpoint={725} />
      <RestaurantFilters />
      <Typography variant="h3" component="h2" sx={{ mb: 4, mt: 5, mx: 2 }}>
        {searchHeader}
      </Typography>
      <LayoutContainer>
        <Box sx={mix.cards_container_search}>
          {restaurantList &&
            restaurantList.map((r_data) => (
              <RestaurantCard
                key={r_data.storeID}
                dataObj={r_data}
                // pass scrollPosition to each resto_card (for performance's sake)
                scrollPosition={scrollPosition}
              />
            ))}
        </Box>
        {numberOfHits && (
          <>
            <Box sx={{ ...mix.flexColumn }}>
              <PaginationRow numberOfHits={numberOfHits} />
            </Box>
            <Footer />
          </>
        )}
      </LayoutContainer>

      {/* These fixed position Modals are on standby and will pop up depending on (Redux) state values */}
      <FiltersModal />
      <SearchbarModals />
    </PaddedBlock>
  );
}
export default trackWindowScroll(Restaurants);
