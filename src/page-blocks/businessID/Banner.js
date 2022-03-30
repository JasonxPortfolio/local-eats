import React, { useCallback, useState } from "react";
import { Typography, Box, Stack, Button, Rating } from "@mui/material";
import { mix } from "../../../styles/styleMixins";
import { getRatingColor } from "../../utility-functions/search/getRatingColor";
import { useSession } from "next-auth/react";
import StarRateIcon from "@mui/icons-material/StarRate";
import StarsRoundedIcon from "@mui/icons-material/StarsRounded";
import { styled } from "@mui/material/styles";
import LayoutContainer from "../../custom-components/LayoutContainer";
import BookmarkButton from "../../custom-components/SearchResults/BookmarkButton";
import ImageViewer from "react-simple-image-viewer";

const StyledRating = styled(Rating)({
  width: 120,
  "& .MuiRating-iconFilled": { color: "#ff6d75" },
  "& .MuiRating-iconHover": { color: "#ff3d47" },
  "& .MuiRating-icon": { fontSize: "1.6rem" },
  ["@media (min-width: 550px)"]: { display: "none" },
});

export default function Banner(props) {
  // Extract data from the props
  const { name, rating, categories, photos, address } = props.bannerData; // prettier-ignore
  const { bookmarkData } = props;
  const { status } = useSession(); //hide bookmarks for non logged in users

  // Get the bgColor for the star rating component
  const ratingColor = getRatingColor(rating);

  const [currentImage, setCurrentImage] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const images = [
    photos[0] || "/images/noIMG.png",
    photos[1] || "/images/noIMG.png",
    photos[2] || "/images/noIMG.png",
  ];

  const openImageViewer = useCallback((index) => {
    setCurrentImage(index);
    setIsViewerOpen(true);
  }, []);

  const closeImageViewer = () => {
    setCurrentImage(0);
    setIsViewerOpen(false);
  };

  // Dim the brightness when you hover over an image
  const onHover = useCallback((e) => e.target.classList.add("darken"), []);
  const onLeave = useCallback((e) => e.target.classList.remove("darken"), []);

  return (
    <LayoutContainer>
      {/* Panel of restaurant images */}

      <Stack id="preview_images" sx={styles.imageContainer}>
        {images.map((src, index) => {
          let gridRow, gridColumn;
          if (index === 1) {
            (gridRow = "1/3"), (gridColumn = "1/2");
          } else if (index === 2) {
            (gridRow = "1/2"), (gridColumn = "2/3");
          }

          return (
            <Box
              component="img"
              src={src}
              // prettier-ignore
              sx={{ ...styles.zoomImage, gridRow, gridColumn }}
              onClick={() => openImageViewer(index)}
              alt=""
              onMouseEnter={onHover}
              onMouseLeave={onLeave}
            />
          );
        })}

        {isViewerOpen && (
          <ImageViewer
            src={images}
            currentIndex={currentImage}
            onClose={closeImageViewer}
            disableScroll={true}
            backgroundStyle={{
              backgroundColor: "rgba(0,0,0,0.9)",
            }}
            closeOnClickOutside={true}
          />
        )}
      </Stack>
      {/* <Box
          component="img"
          src={photo0}
          sx={{ ...styles.zoomImage, gridRow: "1/3", gridColumn: "1/2" }}
          alt=""
          onMouseEnter={onHover}
          onMouseLeave={onLeave}
        />

        <Box
          component="img"
          src={photo1}
          sx={{ ...styles.zoomImage, gridRow: "1/2", gridColumn: "2/3" }}
          alt=""
          onMouseEnter={onHover}
          onMouseLeave={onLeave}
        />

        <Box
          component="img"
          src={photo2}
          sx={{ ...styles.zoomImage }}
          alt=""
          onMouseEnter={onHover}
          onMouseLeave={onLeave}
        /> */}
      <Box sx={styles.dataContainer}>
        {/* Name, restaurant category, address */}
        <Typography variant="h3" component="h1" sx={styles.name}>
          {name}
        </Typography>
        <Box sx={styles.dataRow}>
          <StyledRating
            name="customized-color"
            defaultValue={rating}
            readOnly
            precision={0.5}
            icon={<StarsRoundedIcon fontSize="inherit" />}
            emptyIcon={<StarsRoundedIcon fontSize="inherit" />}
          />
          {status === "authenticated" && (
            <BookmarkButton viewportType="mobile" bookmarkData={bookmarkData} />
          )}
        </Box>

        {categories && (
          <Typography variant="p" sx={styles.categories}>
            {categories}
          </Typography>
        )}
        <Typography variant="p" sx={styles.address}>
          {address}
        </Typography>
        {/* Average Yelp Rating */}
        <Box sx={styles.ratingParent(ratingColor)}>
          <Typography variant="p" sx={styles.ratingText}>
            {rating ? rating : "?"}
          </Typography>
          <StarRateIcon fontSize="small" sx={{ ml: "2px", color: "white" }} />
        </Box>
        {/* Icon button for screens larger than 550px only */}
        {status === "authenticated" && (
          <BookmarkButton viewportType="desktop" bookmarkData={bookmarkData} />
        )}
      </Box>
    </LayoutContainer>
  );
}

const styles = {
  imageContainer: {
    width: "100%",
    height: "20rem",
    gap: 0.5,
    ["@media (min-width: 550px)"]: {
      height: "15rem",
      display: "grid",
      gap: 2,
      gridTemplateColumns: "repeat(2,1fr)",
    },
  },
  zoomImage: {
    borderRadius: 2,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  dataContainer: {
    mt: 2,
    ["@media (min-width: 550px)"]: {
      display: "grid",
      gridTemplateColumns: "1fr 4.75rem",
      gridTemplateRows: "repeat(3,auto)",
    },
  },
  ratingParent: (ratingColor) => ({
    ...mix.flexRow,
    justifyContent: "flex-start",
    ml: "auto",
    background: ratingColor,
    borderRadius: 1,
    px: 0.5,
    height: "2.25rem",
    ["@media (max-width: 549px)"]: {
      display: "none",
    },
  }),
  ratingText: {
    fontSize: "1.125rem",
    fontWeight: 500,
    color: "white",
    fontSize: "1.5rem",
  },
  name: {
    fontWeight: "700",
    ["@media (max-width: 549px)"]: {
      fontSize: "1.5rem",
      mb: 1,
    },
  },
  categories: {
    fontSize: "1.125rem",
    gridRow: "2/3",
    mt: 1,
    ["@media (max-width: 549px)"]: {
      display: "block",
    },
  },
  address: {
    fontSize: "1.125rem",
    gridRow: "3/4",
    ["@media (max-width: 549px)"]: {
      display: "block",
    },
  },
  dataRow: {
    ...mix.flexRow,
    width: "100%",
    justifyContent: "space-between",
    ["@media (min-width: 550px)"]: { display: "none" },
  },
};
