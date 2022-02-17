import React from "react";
// Component building block imports
import MissionStatement from "../src/page-blocks/home/MissionStatement";
import SearchOptionsRow1 from "../src/page-blocks/home/PremadeSearches1";
import LayoutContainer from "../src/custom-components/LayoutContainer";
import Cuisines from "../src/page-blocks/home/Cuisines";
import RestaurantTypes from "../src/page-blocks/home/RestaurantTypes";
import Footer from "../src/custom-components/Footer";
import SearchbarModals from "../src/custom-components/Searchbar/SearchbarModals";
import Navbar from "../src/custom-components/Navbar/Navbar";

// Use Static Generation to render the HTML during build (speeds up page load times)
export async function getStaticProps() {
  return {
    props: { pg: "home" },
  };
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <MissionStatement />
      <LayoutContainer marginAbove="2.25rem">
        <SearchOptionsRow1 />
      </LayoutContainer>
      <LayoutContainer marginAbove="4.5rem">
        <Cuisines />
      </LayoutContainer>
      <LayoutContainer marginAbove="4.5rem">
        <RestaurantTypes />
      </LayoutContainer>
      <LayoutContainer marginAbove="4.5rem" bg="#fffbf7">
        <Footer />
      </LayoutContainer>
      {/* These fixed position Modals are on standby and will pop up depending on Redux state values */}
      <SearchbarModals/>
    </>
  );
}
