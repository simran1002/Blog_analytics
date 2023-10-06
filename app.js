import express from "express";
import fetch from "node-fetch";
import _ from "lodash"; 
const app = express();
const port = 8000; 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to fetch and analyze blog stats
app.get("/api/blog-stats", async (req, res) => {
  try {
    // Use fetch to get blog data from the third-party API
    const response = await fetch(
      "https://intent-kit-16.hasura.app/api/rest/blogs",
      {
        headers: {
          'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6'
        }
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }

    const data = await response.json();

    // Perform data analysis using Lodash
    const totalBlogs = data.length;
    const longestTitleBlog = _.maxBy(data, "title.length");
    const privacyWordCount = _.filter(data, (blog) =>
      _.includes(blog.title.toLowerCase(), "privacy")
    );
    const uniqueBlogTitles = _.uniqBy(data, "title");

    // Prepare and return the analytics results as JSON response
    const analyticsResults = {
      totalBlogs,
      longestBlogTitle: longestTitleBlog.title,
      blogsWithPrivacyTitle: privacyWordCount.length,
      uniqueBlogTitles: uniqueBlogTitles.map((blog) => blog.title),
    };

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
