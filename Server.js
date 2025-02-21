const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();

// Set up EJS and static files
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

const port = 3001;

app.use(express.json());
app.use(cors());

// ✅ Use createPool for better performance and connection management
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "SumaySQL@123", // ⚠️ Use environment variables in production!
  database: "mobile",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ✅ Check database connection
// Only runs once when the app starts
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1); // Exit process if connection fails
  }
  console.log("✅ Connected to MySQL Database");
  connection.release(); // Release connection back to pool
});

// Search endpoint
app.get("/search", async (req, res) => {
  const searchQuery = req.query.q;
  
  if (!searchQuery) {
    return res.render("search", { searchQuery: "", results: [] });
  }

  // Tables to search in
  const tables = ['iphone', 'samsung', 'motorola', 'oppo', 'oneplus', 'redmi'];
  
  try {
    // Execute search across multiple tables
    const searchPromises = tables.map(table => {
      return new Promise((resolve, reject) => {
        const query = `
          SELECT Amazon_Link, Image, Title, Rating, Amazon_Price, Flipkart_Link, Flipkart_Price
          FROM ${table} 
          WHERE Title LIKE ? 
          OR Amazon_Price LIKE ? 
          OR Flipkart_Price LIKE ?
        `; // No \n issues

        const searchPattern = `%${searchQuery}%`;
        
        db.query(query, [searchPattern, searchPattern, searchPattern], (err, results) => {
          if (err) {
            console.error(`❌ SQL Error in table ${table}:`, err);
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
    });

    // Wait for all queries to complete
    const results = await Promise.all(searchPromises);
    const combinedResults = results.flat();

    // Render search.ejs with results
    res.render("search.ejs", { searchQuery, results: combinedResults });

  } catch (error) {
    console.error("❌ Error executing search:", error);
    res.status(500).send("Internal Server Error");
  }
});



// Home route
app.get("/", (req, res) => {
  res.render("home.ejs");
});

// iPhone route
app.get("/iPhone", (req, res) => {
  const query = " SELECT Amazon_Link, Image, Title, Rating, Amazon_Price, Flipkart_Link, Flipkart_Price FROM iphone";

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error executing query:", err);
      return res.status(500).send("Internal Server Error");
    }

    // ✅ Log results for debugging
    console.log("📊 Fetched data:", results);

    res.render("iphone.ejs", { iphones: results });
  });
});

app.get("/samsung", (req, res) => {
    const query = " SELECT Amazon_Link, Image, Title, Rating, Amazon_Price, Flipkart_Link, Flipkart_Price FROM samsung";
  
    db.query(query, (err, results) => {
      if (err) {
        console.error("❌ Error executing query:", err);
        return res.status(500).send("Internal Server Error");
      }
  
      // ✅ Log results for debugging
      console.log("📊 Fetched data:", results);
  
      res.render("samsung.ejs", { samsungs: results });
    });
  });

  app.get("/motorola", (req, res) => {
    const query = " SELECT Amazon_Link, Image, Title, Rating, Amazon_Price, Flipkart_Link, Flipkart_Price FROM motorola";
  
    db.query(query, (err, results) => {
      if (err) {
        console.error("❌ Error executing query:", err);
        return res.status(500).send("Internal Server Error");
      }
  
      // ✅ Log results for debugging
      console.log("📊 Fetched data:", results);
  
      res.render("motorola.ejs", { motorolas: results });
    });
  });

  app.get("/oppo", (req, res) => {
    const query = " SELECT Amazon_Link, Image, Title, Rating, Amazon_Price, Flipkart_Link, Flipkart_Price FROM oppo";
  
    db.query(query, (err, results) => {
      if (err) {
        console.error("❌ Error executing query:", err);
        return res.status(500).send("Internal Server Error");
      }
  
      // ✅ Log results for debugging
      console.log("📊 Fetched data:", results);
  
      res.render("oppo.ejs", { oppos: results });
    });
  });

  app.get("/oneplus", (req, res) => {
    const query = " SELECT Amazon_Link, Image, Title, Rating, Amazon_Price, Flipkart_Link, Flipkart_Price FROM oneplus";
  
    db.query(query, (err, results) => {
      if (err) {
        console.error("❌ Error executing query:", err);
        return res.status(500).send("Internal Server Error");
      }
  
      // ✅ Log results for debugging
      console.log("📊 Fetched data:", results);
  
      res.render("oneplus.ejs", { onepluss: results });
    });
  });

  app.get("/redmi", (req, res) => {
    const query = " SELECT Amazon_Link, Image, Title, Rating, Amazon_Price, Flipkart_Link, Flipkart_Price FROM redmi";
  
    db.query(query, (err, results) => {
      if (err) {
        console.error("❌ Error executing query:", err);
        return res.status(500).send("Internal Server Error");
      }
  
      // ✅ Log results for debugging
      console.log("📊 Fetched data:", results);
  
      res.render("redmi.ejs", { redmis: results });
    });
  });

// ✅ Start server
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
