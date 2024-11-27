const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const cors = require("cors");
app.use(cors());

const appId = "74507d62-96a9-4f84-a3a5-a3dc3368bcc8";
const tableName = "Estimate Details";
const apiKey = "V2-MaYGp-UQKIP-8wVBA-DX1BR-7kLJS-Um6FE-5106S-xt0Tb";
const apiUrl = `https://api.appsheet.com/api/v2/apps/${appId}/tables/${tableName}/Add`;

app.post("/process-data", async (req, res) => {
  try {
    console.log("Incoming request body:", req.body);

    const { ItemsList, Project, Createby, TimeStamp } = req.body;

    if (!ItemsList || !Project || !Createby || !TimeStamp) {
      console.error("Validation Error: Missing required fields.");
      return res.status(400).json({
        status: "error",
        message: "Missing required fields",
        requiredFields: ["ItemsList", "Project", "Createby", "TimeStamp"],
        receivedFields: req.body,
      });
    }

    const items = ItemsList.split(",").map((item) => item.trim());

    const payload = {
      Action: "Add",
      Properties: {},
      Rows: items.map((item) => ({
        "Project #": Project,
        "Line Item": item,
      })),
    };

    console.log("Payload being sent to AppSheet API:", payload);

    const response = await axios.post(apiUrl, payload, {
      headers: {
        "Content-Type": "application/json",
        ApplicationAccessKey: apiKey,
      },
    });

    if (response.status >= 200 && response.status < 300) {
      console.log("AppSheet API response success:", response.data);
      res.json({ status: "success", details: response.data });
    } else {
      console.error("AppSheet API error response:", response.data);
      res.status(500).json({
        status: "error",
        message: "Failed to add rows",
        details: response.data,
      });
    }
  } catch (error) {
    console.error(
      "Internal Server Error:",
      error.message,
      error.response?.data
    );
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      details: error.response?.data || error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
