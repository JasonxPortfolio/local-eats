import React from "react";
import Pagination from "@mui/material/Pagination";
import { Typography, Box } from "@mui/material";
import OutlinedInput from "@mui/material/OutlinedInput";
import { blurInputField } from "../../../utility-functions/general/blurInputField";
import DoubleArrowIcon from "@mui/icons-material/DoubleArrow";
import IconButton from "@mui/material/IconButton";
import { mix } from "../../../../styles/styleMixins";
import useVisitSearchPage from "../../../utility-functions/search/useVisitSearchPage";
import useGetFilters from "../../../utility-functions/search/useGetFilters";

export default function PaginationRow({ numberOfHits }) {
  const filters = useGetFilters()
  const navToSearchPage = useVisitSearchPage(); // function that updates search results for pagination

  // States and functions to control the pagination components
  const inputRef = React.useRef(); // for input field
  const [error, setError] = React.useState(false); // to render error visuals on the input field
  const [pageNumber, setPageNumber] = React.useState(1); // pg user is currently viewing

  // Decide how many pages are required to showcase your search results
  let requiredPages = calcPgRequirements(numberOfHits);

  // 2 functions that update the search page when we use the pagination feature
  // Visit a new webpage with an offset parameter in the URL to make a bumped Yelp API call
  // If offset=50, we pull a list of data objects for restauarants who were 50-99th in the array of all of them
  const resetPaginationField = () => {
    setError(false); // remove the error visuals
    if (inputRef.current) inputRef.current.value = ""; // erase the field text
  };
  const paginationButtonHandler = function (e, page) {
    setPageNumber(page);
    navToSearchPage({ offset: (page - 1) * 50, term: filters.term, sort_by: filters.sort_by }); // prettier-ignore
    resetPaginationField();
  };
  const pageJumpHandler = function () {
    // If the user inputs a non-number, this validation FN returns a falsy which renders a red input field
    const inputVal = validateJumpNumber(requiredPages, inputRef.current.value); // false, null, or an integer
    if (!inputVal) return setError(true);
    // If the user submits something valid, our search page gets updated
    setPageNumber(inputVal); // update page # state as well
    navToSearchPage({ offset: (inputVal - 1) * 50, term: filters.term, sort_by: filters.sort_by }); // prettier-ignore
    resetPaginationField();
  };

  // Render no pagination btns if we only have 1 pg of results
  if (requiredPages < 2) return null;
  return (
    <>
      <Pagination
        count={requiredPages}
        variant="outlined"
        color="secondary"
        size="large"
        defaultPage={1} // which page we start on
        siblingCount={0} // how many buttons surround the pg we're on currently
        boundaryCount={0} // how many pages shown at start and end
        page={pageNumber}
        onChange={paginationButtonHandler}
        sx={{ mx: "auto" }}
      />

      {requiredPages > 2 && (
        <Typography variant="h6" component="p" sx={{ mt: 4 }}>
          Jump to page __ out of {requiredPages}
        </Typography>
      )}
      {requiredPages > 2 && (
        <Box sx={{ ...mix.flexRow, alignItems: "center" }}>
          <OutlinedInput
            placeholder="page #"
            sx={{ width: 80, mt: 2, height: 42 }}
            inputRef={inputRef}
            error={error}
            inputProps={blurInputField}
          />
          <IconButton
            aria-label="jump to page"
            sx={{ mt: 2, ml: 2.5, border: "1px solid rgba(0, 0, 0, 0.23)" }}
            onClick={pageJumpHandler}
          >
            <DoubleArrowIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </>
  );
}

// Calc the total number of dedicated pages we'll need for our restaurant card results
function calcPgRequirements(numberOfHits) {
  let requiredPages;
  let divisbleBy50 = numberOfHits % 50 === 0; // Bool
  if (divisbleBy50) requiredPages = Math.trunc(numberOfHits / 50);
  else requiredPages = Math.trunc(numberOfHits / 50) + 1;
  return requiredPages;
}

// Return a Boolean that tells if the user submitted a valid page # to jump to
function validateJumpNumber(totalPages, userInput) {
  // Check if the user submitted a number
  const numericInput = !isNaN(+userInput); // true if user submitted a #, false if not
  if (!numericInput) return false; // return false if user didn't submit a number
  // Return a positive integer from the function
  // Truncate any decimals and remove the negative if the user tries to mess around
  const roundedInput = Math.abs(Math.trunc(+userInput));
  if (roundedInput === 0) return 1;
  if (roundedInput > totalPages) return null;
  return roundedInput;
}
