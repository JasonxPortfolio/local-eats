import React from "react";
import { Container, Box } from "@mui/material";
import { mix } from "../../styles/styleMixins";

function LayoutContainer(props) {
  // This will have 16px inline padding on mobile screens
  // On desktop screens, the main content will max out at 1200px (padding will still be there but not affect much)
  // The point of having a parent Box set to 100vw is so we can apply a background color across the entire viewport
  return (
    <Box
      sx={{
        width: 'calc(100vw - (100vw - 100%))',
        background: props.bg || "white",
      }}
    >
      <Box
      id="responsive_container"
        sx={{
          ...mix.responsiveLayout,
          marginTop: props.marginAbove || "0px",
          px: 2,
        }}
      >
        {props.children}
      </Box>
    </Box>
  );
}

export default LayoutContainer;
