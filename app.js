import express from "express";
import fetch from "node-fetch";
import _ from "lodash"; 
const app = express();
const port = 3000; 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create a function to fetch and analyze blog stats
const fetchAndAnalyzeBlogStats = async () => {
  try {
    // Use node-fetch to make the GET request to the external API
    const response = await fetch(
      "https://intent-kit-16.hasura.app/api/rest/blogs"
    ); 

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }

    // Parse the response JSON
    const data = await response.json();

    // Perform data analysis using Lodash
    const totalBlogs = data.length;
    const longestTitleBlog = _.maxBy(data, "title.length");
    const privacyWordCount = _.filter(data, (blog) =>
      _.includes(blog.title.toLowerCase(), "privacy")
    );
    const uniqueBlogTitles = _.uniqBy(data, "title");

    // Prepare and return the analytics results
    return {
      totalBlogs,
      longestBlogTitle: longestTitleBlog.title,
      blogsWithPrivacyTitle: privacyWordCount.length,
      uniqueBlogTitles: uniqueBlogTitles.map((blog) => blog.title),
    };
  } catch (error) {
    console.error(error);
    throw new Error("Internal server error");
  }
};

// Create a memoized version of the fetchAndAnalyzeBlogStats function
// const memoizedFetchAndAnalyzeBlogStats = _.memoize(fetchAndAnalyzeBlogStats, {
const memoizedFunction = _.memoize((param) => {
  maxAge: 3600000
});

// Create a route to fetch blog stats with caching
app.get("/api/blog-stats", async (req, res) => {
  try {
    // Use the memoized function to fetch and analyze blog stats
    const analyticsResults = await memoizedFunction();

    // Send the cached or freshly computed analytics results as a JSON response
    res.json(analyticsResults);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a route for blog search
app.get("/api/blog-search", async (req, res) => {
  try {
    const query = req.query.query; 

    if (!query) {
      return res.status(400).json({ error: "Missing query parameter" });
    }

    // Use node-fetch to make the GET request to the external API
    const response = await fetch(
      "https://intent-kit-16.hasura.app/api/rest/blogs"
    );

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }

    // Parse the response JSON
    const data = await response.json();

    // Implement custom search functionality
    const searchResults = data.filter((blog) =>
      blog.title.toLowerCase().includes(query.toLowerCase())
    );

    // Send the search results as a JSON response
    res.json(searchResults);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});


app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
