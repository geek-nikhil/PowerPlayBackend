const express = require("express");
const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");
const csvWriter = require("fast-csv");
const tempCsvFilePath = path.join(__dirname, "temp.csv");
const csvStream = csvWriter.format({ headers: true });
const writableStream = fs.createWriteStream(tempCsvFilePath);
const filePath = path.join(__dirname, "horly.csv");
const tempFilePath = path.join(__dirname, "temp.csv"); // Temporary file path is now 'temp'
const hourlyCsvFilePath = path.join(__dirname, "horly.csv");



const headers = [
  "day_of_week",
  "hour_of_day",
  "is_weekend",
  "temperature",
  "is_holiday",
  "solar_generation",
  "Previous_1_hour_demand",
  "Previous_3_hour_demand",
  "rolling_mean_3",
  "rolling_std_3",
  "electricity_demand",
  "label"
]

// // If the file already exists, skip adding headers
// if (!fs.existsSync(tempCsvFilePath)) {
//   csvStream.pipe(writableStream);
// } else {
//   writableStream.end();
//   csvStream.pipe(fs.createWriteStream(tempCsvFilePath, { flags: "a" })); // Append mode
// }

const router = express.Router();

// Sample route to read the last 5 rows of a CSV file
// router.get('/read-csv/main', (req, res) => {
//     const csvFilePath = path.join(__dirname, '../main_data.csv'); // Replace 'main_data.csv' with your CSV file path
//     const results = [];

//     // Check if the file exists
//     if (!fs.existsSync(csvFilePath)) {
//         return res.status(404).send({ message: 'CSV file not found' });
//     }

//     // Read and parse the CSV file
//     fs.createReadStream(csvFilePath)
//         .pipe(csvParser())
//         .on('data', (data) => results.push(data)) // Push each row into the results array
//         .on('end', () => {
//             // Get the last 5 rows
//             const lastFiveRows = results.slice(-5);
//             res.status(200).send({
//                 message: 'CSV file read successfully',
//                 data: lastFiveRows,
//             });
//         })
//         .on('error', (error) => {
//             res.status(500).send({
//                 message: 'Error reading CSV file',
//                 error: error.message,
//             });
//         });
// });

const solar_generations = {
  "00:00": 1.5152476821641814,
  "01:00": 7.902084718286427,
  "02:00": 7.321131802411008,
  "03:00": 6.260903543605389,
  "04:00": 2.134146977849256,
  "05:00": 7.565108765523295,
  "06:00": 106.56692643214767,
  "07:00": 131.6338236282736,
  "08:00": 196.86692877926768,
  "09:00": 249.40693366866478,
  "10:00": 192.7043133464083,
  "11:00": 88.35773980305265,
  "12:00": 234.7201362443429,
  "13:00": 179.47388642467178,
  "14:00": 204.08639649181026,
  "15:00": 101.85573889091015,
  "16:00": 299.7624226504391,
  "17:00": 102.80737065337806,
  "18:00": 266.5643425243694,
  "19:00": 8.821610607236618,
  "20:00": 2.091547672090405,
  "21:00": 4.497601763944857,
  "22:00": 6.310889805078118,
  "23:00": 1.8913412397038576,
};

function getNext24HoursArray() {
  const currentDate = new Date(); // Get the current date and time
  const hoursArray = [];

  for (let i = 0; i < 24; i++) {
    const nextHour = new Date(currentDate); // Clone the current date object
    nextHour.setHours(currentDate.getHours() + i); // Increment the hours
    hoursArray.push(formatDate(nextHour)); // Push the formatted date into the array
  }

  return hoursArray;
}

// Helper function to format the date as YYYY-MM-DD HH:00
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-based
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:00`;
}

// Example usage:
const next24Hours = getNext24HoursArray();

function isWeekend(dateInput) {
  const date = new Date(dateInput); // Create a Date object from the input
  const day = date.getDay(); // Get the day of the week (0 for Sunday, 6 for Saturday)

  console.log(day);
  const isWeekend = day == 0 || day == 6;
  const dat = {
    day: day,
    isWeekend: isWeekend,
    isHoliday: 0,
  };
  return dat;
}

// weather()
async function weather() {
  const repsonse = await fetch(
      "https://api.tomorrow.io/v4/weather/forecast?location=28.7041,77.1025&apikey=sYrvaEUlrj2otGRceud1PwDVPhGv4KzO"
  );
  const data = await repsonse.json();
  const hourlyData = data.timelines.hourly;

  const temperatures = [];
    for(let i=0;i<24;i++){
      temperatures[i] = hourlyData[i].values.temperature;
  }
  // const temperatures = [
  //   14.13, 15.32, 14.59, 13.99,
  //    13.2, 12.75, 12.36, 11.93,
  //   12.02,  14.1,  17.1, 20.13,
  //   22.27, 23.59, 24.37, 24.73,
  //   24.41, 23.59, 22.08, 20.85,
  //   19.69, 18.78, 17.91, 17.21
  // ]
  return temperatures;
}
async function readDelhi() {
  const csvFilePath = path.join(__dirname, "../hourly data(2000-2023).csv"); // Replace 'main_data.csv' with your CSV file path
  const results = [];

  // Check if the file exists
  if (!fs.existsSync(csvFilePath)) {
    return res.status(404).send({ message: "CSV file not found" });
  }

  // Read and parse the CSV file
  fs.createReadStream(csvFilePath)
    .pipe(csvParser())
    .on("data", (data) => results.push(data)) // Push each row into the results array
    .on("end", () => {
      // Get the last 5 rows
      const lastFiveRows = results.slice(-3);
      console.log(lastFiveRows);
    })
    .on("error", (error) => {
      console.log(error);
    });
}

// readDelhi();

async function consumption(data) {
  try {
    console.log("object");
    const response = await fetch(
      "https://electriciyconsumption.onrender.com/predict",
      {
        method: "POST", // Use POST for sending data
        headers: {
          "Content-Type": "application/json", // Specify JSON format
        },
        body: JSON.stringify(data), // Convert object to JSON string
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json(); // Parse the JSON response
    return result;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

//  consumption();
let temperatures = [];
temperatures = temperatures = [
  14.31, 15.88, 14.82, 13.96, 12.09, 13.94, 17.03, 19.89, 22.01, 23.14,
  24.21, 24.5, 24.25, 23.35, 21.59, 20.32, 19.28, 18.32, 17.44, 16.47,19.28, 18.32, 17.44, 16.47,
];
Promise.resolve(weather())
  .then((data) => {
    // Assign the fetched temperatures to the outer array
    temperatures = data;
    console.log('Temperatures:', temperatures);

    // Now, resolve the prevconsumption() and work with its data.
    return Promise.resolve(prevconsumption());
  })
  .then((prevconsump) => {
    // Process the previous consumption data to extract electricity demand
    const prevconsumptions = prevconsump.map((data) => data.electricity_demand);
    console.log('Previous Consumption:', prevconsumptions);

    // Now resolve getdetails() with the electricity consumption data
    return Promise.resolve(getdetails(prevconsumptions));
  })
  .then((data) => {
    console.log(data);
    // Now, you can use both temperatures and prevconsumptions as needed.
    // Example: Call the function that moves the first row to hourly.
    moveFirstRowToHourly();
  })
  .catch((error) => {
    // Handle any error that might occur
    console.error("Error occurred:", error);
  });

async function getdetails(prevconsumptions) {
  console.log(prevconsumptions)
  let dat = [];
  let rows =[];
  for (let i = 0; i < next24Hours.length; i++) {
  const rolling_mean =
    (parseInt(prevconsumptions[0]) +
      parseInt(prevconsumptions[1]) +
      parseInt(prevconsumptions[2]))/3;
  const values = [
    parseInt(prevconsumptions[0]),
    parseInt(prevconsumptions[1]),
    parseInt(prevconsumptions[2]),
  ];
  const rolling_std = calculateStandardDeviation(values);

    const date = new Date(next24Hours[i]);
    dat = isWeekend(date);
    const data = {
      day_of_week: dat.day,
      hour_of_day: parseInt(next24Hours[i].split(" ")[1]),
      is_weekend: dat.isWeekend,
      temperature: temperatures[i],
      is_holiday: dat.isHoliday,
      solar_generation: solar_generations[next24Hours[i].split(" ")[1]],
      Previous_1_hour_demand: parseInt(prevconsumptions[2]),
      Previous_3_hour_demand: parseInt(prevconsumptions[0]),
      rolling_mean_3: rolling_mean,
      rolling_std_3: rolling_std,
    };
    // console.log(data);
    const prediction = await Promise.resolve(consumption(data));
    console.log(prediction);
    const ans = prediction.prediction_demand;
    const label = prediction.prediction_label;
    rows.push({ ...data, ans,label})
    prevconsumptions.push(prediction.prediction_demand);
    prevconsumptions.shift()
    // console.log(prediction);
    // console.log(prevconsumptions)
  }
  saveToTempFile(rows);
  // appendDataToTempFile(rows);

  // console.log(rows)
}

function calculateStandardDeviation(values) {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

function saveToTempFile(rows) {
  const tempData = rows.map((row) =>
    [
      row.day_of_week,
      row.hour_of_day,
      row.is_weekend,
      row.temperature,
      row.is_holiday,
      row.solar_generation,
      row.Previous_1_hour_demand,
      row.Previous_3_hour_demand,
      row.rolling_mean_3,
      row.rolling_std_3,
      row.ans,
      row.label.join(", ")
    ].join(',')
  ).join("\n");
  const headerRow = headers.join(",") + "\n";
  fs.writeFileSync(tempCsvFilePath, headerRow + tempData, "utf8");
}

function calculateStandardDeviation(values) {
  try {
    // Ensure that the input is an array of numbers and has at least 2 values
    if (!Array.isArray(values) || values.length < 2) {
      throw new Error("Please provide an array with at least two values.");
    }

    // Calculate the mean (average)
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;

    // Calculate the variance (sum of squared differences from the mean)
    const variance =
      values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
      values.length;

    // Calculate the standard deviation (square root of variance)
    return Math.sqrt(variance);
    // console.log(`Standard Deviation: ${standardDeviation}`);
  } catch (error) {
    console.log("Error:", error.message);
  }
}

async function prevconsumption() {
  const csvFilePath = path.join(__dirname, "../hourly data(2000-2023).csv"); // Replace 'main_data.csv' with your CSV file path
  const results = [];

  return new Promise((resolve, reject) => {
    // Check if the file exists
    if (!fs.existsSync(csvFilePath)) {
      return reject(new Error("CSV file not found"));
    }

    // Read and parse the CSV file
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", (data) => results.push(data)) // Push each row into the results array
      .on("end", () => {
        // Get the last 3 rows
        const lastThreeRows = results.slice(-3);
        console.log(lastThreeRows)
        resolve(lastThreeRows); // Resolving the promise with the last 3 rows
      })
      .on("error", (error) => {
        reject(error); // Rejecting the promise if there's an error
      });
  });
}


///////////// Serve to another houly file and maintain the temp file /////////


// Function to read and remove the first row from the temp CSV
const moveFirstRowToHourly = () => {
  // Read the temp.csv file
  fs.readFile(tempFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error("Error reading temp.csv:", err);
      return;
    }

    // Split the data into rows
    const rows = data.split("\n");
    if (rows.length <= 1) {
      console.log("No rows to move.");
      return;
    }
    
    // Remove the first row
    const firstRow = rows[1];
    // If hourly CSV doesn't exist, create it and add header
    if (!fs.existsSync(hourlyCsvFilePath)) {
      const header = rows[0].split(",").join(",") + "\n"; // Assuming the first row in temp.csv is the header
      fs.writeFileSync(hourlyCsvFilePath, header, 'utf8');
    }
    
    console.log(firstRow)
    // Append the first row to hourly.csv
    fs.appendFile(hourlyCsvFilePath, firstRow + "\n", 'utf8', (err) => {
      if (err) {
        console.error("Error appending to hourly.csv:", err);
      } else {
        console.log("First row moved to hourly.csv:", firstRow);

        // Remove the first row from temp.csv
      }
    });

  });
};

// Run the function every 2 minutes (120,000 ms)

async function readLastThreeRows(filePath) {
  const results = [];

  return new Promise((resolve, reject) => {
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return reject(new Error('CSV file not found'));
    }
  // Read and parse the CSV file
    fs.createReadStream(filePath)
      .pipe(csv()) // Parse CSV into JSON objects
      .on('data', (data) => results.push(data)) // Push each row into the results array
      .on('end', () => {
        // Get the last 3 rows
        const lastThreeRows = results.slice(-3);
        resolve(lastThreeRows); // Resolve the promise with the last 3 rows
      })
      .on('error', (error) => {
        reject(error); // Reject the promise in case of an error
      });
  });
}
setInterval(async () => {
  // try {
  //   const lastThreeRows = await readLastThreeRows(hourlyCsvFilePath);
  //   // Extract 'electricity_demand' from each row
  //   const lastThreeDemands = lastThreeRows.map((row) => row.electricity_demand);
  //   Promise.resolve(getdetails(lastThreeDemands))
  //       .then((result) => {
  //           moveFirstRowToHourly();
  //     })


   Promise.resolve(weather())
  .then((data) => {
    // Assign the fetched temperatures to the outer array
    temperatures = data;
    console.log('Temperatures:', temperatures);

//     // Now, resolve the prevconsumption() and work with its data.
    return Promise.resolve(readLastThreeRows(hourlyCsvFilePath));
      })
    .then((prevconsump) => {
    // Process the previous consumption data to extract electricity demand
  console.log('Previous Consumption:', prevconsump);
    const prevconsumptions = prevconsump.map((data) => data.electricity_demand);
//     console.log('Previous Consumption:', prevconsumptions);
//     // Now resolve getdetails() with the electricity consumption data
    return Promise.resolve(getdetails(prevconsumptions));
  })
  .then((data) => {
//     console.log(data);
//     // Now, you can use both temperatures and prevconsumptions as needed.
//     // Example: Call the function that moves the first row to hourly.
    moveFirstRowToHourly();
  })
  .catch((error) => {
    // Handle any error that might occur
    console.error("Error occurred:", error);
  });

  // } catch (error) {
  //   console.error('Error fetching last three rows:', error);
  // }
}, 3600000); // Executes every 5 seconds


router.get("/temp-data", (req, res) => {
  const results = [];

  // Check if the temp.csv file exists
  if (!fs.existsSync(tempFilePath)) {
    return res.status(404).json({ error: "temp.csv file not found" });
  }

  // Read and parse the temp.csv file
  fs.createReadStream(tempFilePath)
    .pipe(csv()) // Parse CSV data into JSON objects
    .on("data", (data) => results.push(data))
    .on("end", () => {
      res.status(200).json(results); // Send all rows as JSON
    })
    .on("error", (error) => {
      console.error("Error reading temp.csv:", error);
      res.status(500).json({ error: "Failed to read temp.csv" });
    });
});





//  prevconsumption();
module.exports = router;
