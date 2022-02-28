import { removeEmptyKVPs } from "../general/removeEmptyKVPs";

export function generateYelpString(queryObject, filterOverride = false) {
  // End this function early if Reacts prerendering gives us falsy values on mount
  if (!queryObject) return;
  if (!queryObject.term && !queryObject.price) return; //!!! maybe don't need either
  // Create an object full of query parameters extracted from our URL
  const queryParams = removeEmptyKVPs({
    radius: queryObject.radius,
    latitude: queryObject.latitude,
    longitude: queryObject.longitude,
    price: queryObject.price, // may equal undefined (could be removed)
    term: queryObject.term, // may equal undefined (could be removed)
  });
  // Return API string
  const qs = Object.keys(queryParams)
    .map((key) => `${key}=${queryParams[key]}`)
    .join("&"); // convert object to a query string
  return `https://api.yelp.com/v3/businesses/search?limit=50&${qs}`;
}

export function getSearchHeader(queryObject) {
  // Create an object full of query parameters extracted from our URL
  const queryParams = {
    price: queryObject.price, // may equal undefined (could be removed)
    term: queryObject.term, // may equal undefined (could be removed)
  };
  // Return query string
  let title;
  if (queryParams.term) {
    const titleLowercase = `${queryParams.term}`;
    title = titleLowercase[0].toUpperCase() + titleLowercase.substring(1);
  } else if (queryParams.price === "1" || queryParams.price === "2")
    title = "Affordable Restaurants";
  else if (queryParams.price === "4" || queryParams.price === "3")
    title = "Pricier Restaurants";
  return title;
}
