import React from "react";
import { Typography, Divider } from "@mui/material";
import { breakBefore } from "../../ConditionalBreak";
import { useSelector } from "react-redux";
import PredeterminedModalWrapper from "../PredeterminedModalWrapper";

export default function LocationDenialModal(props) {
  //@ Import redux variables that determine the visibility of our entire component
  const permissionsDenied= useSelector((state) => state.homepageModals.showLocationDenial); // prettier-ignore
  if (!permissionsDenied) return ""; // if falsy, don't render this component

  return (
    <PredeterminedModalWrapper
      headerText="Location Permissions Denied"
      omitSubmit="true"
    >
      <Typography variant="h6" component="p">
        This site requires a location to operate, but we understand you may wish
        to keep yours a secret
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h5" component="p" sx={{ fontWeight: "600" }}>
        OPTION 1:
      </Typography>
      <Typography variant="h6" component="p">
        Search for restaurants in{breakBefore(490)} predetermined locations
      </Typography>
      <Typography variant="h5" component="p" sx={{ fontWeight: "600", mt: 2 }}>
        OPTION 2:
      </Typography>
      <Typography variant="h6" component="p">
        Specify any location in Canada or the US
      </Typography>
      <Typography variant="h5" component="p" sx={{ fontWeight: "600", mt: 2 }}>
        OPTION 3:
      </Typography>
      <Typography variant="h6" component="p">
        Edit browser settings and allow the site to access your location
      </Typography>
    </PredeterminedModalWrapper>
  );
}
