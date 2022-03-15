import React from "react";
import RestaurantCard from "../../custom-components/SearchResults/RestaurantCard";
import { trackWindowScroll } from "react-lazy-load-image-component";
import { Typography, Box, Stack } from "@mui/material";

function Related({ relatedList, scrollPosition }) {
  // Make a Yelp API call and fetch some related locations
  return (
    <>
      <Typography sx={{ mb: 2, mt: 4, fontWeight: 600 }} variant="h4">
        Similar Places
      </Typography>
      <Box sx={styles.desktopParent}>
        {relatedList &&
          relatedList.map((r_data) => (
            <RestaurantCard
              key={r_data.storeID}
              dataObj={r_data}
              // pass scrollPosition to each resto_card (for performance's sake)
              scrollPosition={scrollPosition}
            />
          ))}
      </Box>
    </>
  );
}
export default trackWindowScroll(Related);

//!r-
const styles = {
  desktopParent: {
    // ml:2,
    gridTemplateColumns: "repeat(auto-fit, minmax(20.75rem, 1fr))",
    ["@media (min-width: 400px)"]: {
      display: "grid",
      width: "100%",
      gap: 1.5,
      justifyItems: "center",
    },
    ["@media (min-width: 1100px)"]: {
      justifyItems: "start",
    },
  },
};