import React from "react";
import { Typography, Box, Stack, Container, Button } from "@mui/material"; // prettier-ignore
import EqualizerIcon from "@mui/icons-material/Equalizer";
import SocialDistanceIcon from "@mui/icons-material/SocialDistance";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { useSelector, useDispatch } from "react-redux";
import { filterActions } from "../../../state-management/store/search/filters";

export default function RestauarantFilters() {
  const getFilterValues = {
    distance: () => {
      const meters = useSelector((r) => r.searchFilters.distance);
      return String(meters / 1000) + "km";
    },
    price: () => {
      const priceNumber = useSelector((r) => r.searchFilters.price); // 1 2 3 4
      if (priceNumber === "any") return "any";
      else return `${priceNumber} of 4`;
    },
    rating: () => {
      const numberStars = useSelector((r) => r.searchFilters.rating);
      if (numberStars === "any") return "any";
      else if (numberStars == "1") return "1 star";
      else return `${numberStars} stars`;
    },
    hours: () => useSelector((r) => r.searchFilters.hours),
  };

  // Function that opens the filters modal which affects your search results
  const dispatch = useDispatch();
  const openFilterModal = () => dispatch(filterActions.openModal());

  return (
    <Box sx={styles.container}>
      <Button
        sx={styles.adjustFilters}
        size="large"
        variant="outlined"
        fullWidth
        startIcon={<EqualizerIcon />}
        onClick={openFilterModal}
      >
        Adjust Filters
      </Button>

      <Button
        sx={styles.distance}
        size="large"
        startIcon={<SocialDistanceIcon />}
        disabled
      >
        Max Distance: {getFilterValues.distance()}
      </Button>
      <Button
        sx={styles.price}
        size="large"
        startIcon={<AttachMoneyIcon />}
        disabled
      >
        Max Price Lvl: {getFilterValues.price()}
      </Button>
      <Button
        sx={styles.rating}
        size="large"
        startIcon={<LockOpenIcon />}
        disabled
      >
        Min Rating: {getFilterValues.rating()}
      </Button>
      <Button
        sx={styles.hours}
        size="large"
        startIcon={<LockOpenIcon />}
        disabled
      >
        Hours: {getFilterValues.hours()}
      </Button>
    </Box>
  );
}

const styles = {
  container: {
    px: 4,
    mt: 2,
    mb: "1.625rem",
    display: "grid",
    gridTemplateColumns: "1fr",
    ["@media (min-width: 525px)"]: {
      gridTemplateColumns: "repeat(2, 1fr)",
    },
    ["@media (min-width: 750px)"]: {
      gridTemplateColumns: "repeat(3, 1fr)",
      mt: 4,
    },
    ["@media (min-width: 1200px)"]: {
      gridTemplateColumns: "repeat(5, 1fr)",
    },
  },
};
