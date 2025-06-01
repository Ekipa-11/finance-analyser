const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  console.log("Request for: " + req.url);
  
  /* Serve index.html */
  if (req.url === "/") {
    fs.readFile("./src/index.html", (err, content) => {
      if (err) {
        if (err.code === "ENOENT") {
          res.writeHead(404, { "Content-Type": "text/html" });
          res.end("404 Index file not found");
          return;
        } else {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Internal Server Error");
          return;
        }
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(content, "utf-8");
    });
    return;
  }

  /* Serve files */

  // Get the plain name of the requested file 
  // (deeper paths do not currently exist so they don't work)
  
  const baseName = req.url.split("/")[1]; 
  if (!baseName) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("Invalid request");
    return;
  }

  // Serve files only from 'src' dir
  const srcDir = path.join(__dirname, "src");
  fs.readdir(srcDir, (err, files) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
      return;
    }

    // Find a file that matches (without or with extension)
    const matchingFile = files.find(
      (file) => path.parse(file).name === baseName || file === baseName
    );
    if (!matchingFile) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 File not found");
      return;
    }

    const filePath = path.join(srcDir, matchingFile);
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
      ".html": "text/html",
      ".txt": "text/plain; charset=utf-8",

      // not rlly needed atm
      ".css": "text/css",
      ".png": "image/png",
      ".jpg": "image/jpg",
      ".json": "application/json",
      ".js": "text/javascript",
      ".svg": "image/svg+xml",
      ".ico": "image/x-icon",
    };

    const contentType = mimeTypes[extname] || "application/octet-stream";

    // Read the file and serve it
    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === "ENOENT") {
          res.writeHead(404, { "Content-Type": "text/html" });
          res.end("404 Not Found");
        } else {
          res.writeHead(500);
          res.end("Server Error: " + err.code);
        }
      } else {
        res.writeHead(200, { "Content-Type": contentType });
        res.end(content, "utf-8");
      }
    });
  });
});


server.listen(PORT, () => {
  console.log("Server currently running on http://localhost:" + PORT);
});
