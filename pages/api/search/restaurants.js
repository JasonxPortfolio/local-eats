import axios from "axios";

export default async function handler(req, res) {
  // Grab data from .env.local and the request body
  const { apiString } = req.body;
  const authKey = process.env.YELP_API_KEY;

  // Make a GET request to Yelp Fusion and return the data
  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `bearer ${authKey}`,
    };
    const response = await axios.get(apiString, { headers });
    const rawResults = response.data.businesses; // array full of restaurant objects
    const numberOfHits = response.data.total; // number of matches for the search

    // If we get zero hits, throw an error
    if (!numberOfHits) throw new Error("No results found");

    // If we do have matches...query the each restauarant object for data needed on Restauarant Cards
    const editedResults = rawResults.map((value, index) => {
      // Calculate distance in km
      const meterDistance = value.distance; 
      const kmDistance = (meterDistance / 1000).toFixed(1); // rounded to 1 decimal place
      // Concatenate strings to form a list of categories
      const listOfCategories = value.categories.map((obj) => obj.title); // array
      const categoryString = listOfCategories.join(", ");
      const relevantData = {
        searchIndex: index,
        storeID: value.id,
        image: value.image_url,
        storeName: value.name,
        category: categoryString,
        distance: `${kmDistance} km away`,
        rating: value.rating,
        priceLevel: value.price.length,
        hours: value.is_closed ? "Closed for now" : "Open now",
      };
      console.log("RETURNNNN", relevantData);
      return relevantData;
    });

    res
      .status(201)
      .json({ message: "Data fetched", results: editedResults, numberOfHits });
    return;
  } catch (err) {
    res.status(422).json({ message: "No results found" });
    return;
  }
}