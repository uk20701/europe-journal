// api/entries.js

let entries = [];
let nextId = 1;

module.exports = (req, res) => {
  const { method } = req;

  res.setHeader("Content-Type", "application/json");

  if (method === "GET") {
    // Return all entries
    return res.status(200).json({
      success: true,
      data: entries,
    });
  }

  if (method === "POST") {
    const { date, country, city, title, content, imageUrl } = req.body || {};

    const missing = [];
    if (!country) missing.push("country");
    if (!title) missing.push("title");
    if (!content) missing.push("content");

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        missingFields: missing,
      });
    }

    const entry = {
      id: nextId++,
      date: date || new Date().toISOString().slice(0, 10),
      country,
      city: city || "",
      title,
      content,
      imageUrl: imageUrl || "",
      createdAt: new Date().toISOString(),
    };

    entries.push(entry);

    return res.status(201).json({
      success: true,
      data: entry,
    });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({
    success: false,
    error: `Method ${method} not allowed`,
  });
};
