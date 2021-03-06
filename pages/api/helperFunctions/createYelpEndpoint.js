import { removeEmptyKVPs } from "../../../src/utility-functions/general/removeEmptyKVPs";

export function createYelpEndpoint(queryObject) {
  // Create an object full of query parameters extracted from our URL
  // We have to change a few values to create a valid endpoint for Yelp Fusion's API
  let price = queryObject.price;
  if (price == "false" || price == false) price = undefined;
  const queryParams = removeEmptyKVPs({
    radius: queryObject.radius,
    offset: queryObject.offset,
    latitude: queryObject.latitude,
    longitude: queryObject.longitude,
    open_now: queryObject.hours,
    sort_by: queryObject.sort_by,
    price,
    term: queryObject.term, // may equal undefined (would get removed)
  });
  // Return API string
  const qs = Object.keys(queryParams)
    .map((key) => `${key}=${queryParams[key]}`)
    .join("&"); // convert object to a query string
  const str = `https://api.yelp.com/v3/businesses/search?limit=50&${qs}`.replace(" ", "_"); // prettier-ignore
  return str;
}
