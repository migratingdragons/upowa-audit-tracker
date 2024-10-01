// Constants for sheet names
const PANEL_SHEET = "Non-compliant Panel Installations";
const ELECTRICAL_SHEET = "Non-compliant Electrical Installations";
const RESOLVED_PANEL_SHEET = "Resolved Non-compliant Panel Installations";
const RESOLVED_ELECTRICAL_SHEET =
	"Resolved Non-compliant Electrical Installations";
const TRACKER_SPREADSHEET_ID = "1LbirkFq0sw0ZNLXwhKizZ284gTIeBbzAOqWPQY8Txvw"; // Replace with your actual spreadsheet ID

// Debug and testing constants
const DEBUG_MODE = true;
const DEBUG_EMAIL = "test-debug@tdobson.net"; // Replace with your debug email
const TESTING_MODE = false;
const TESTING_DATA = {}; // Replace with your test data object

function doPost(e) {
	try {
		let jsonData;

		if (TESTING_MODE && !e) {
			jsonData = TESTING_DATA;
			console.log("Using testing data");
		} else {
			jsonData = JSON.parse(e.postData.contents);
		}

		// Debug mode: send email with jsonData
		if (DEBUG_MODE) {
			sendDebugEmail(jsonData);
		}

		// Determine which sheet to use based on the data
		const sheetName =
			jsonData.installationType === "panel" ? PANEL_SHEET : ELECTRICAL_SHEET;

		processAndAppendData(jsonData);

		return ContentService.createTextOutput(
			"Data processed successfully",
		).setMimeType(ContentService.MimeType.TEXT);
	} catch (error) {
		console.error("Error in doPost: " + error.message);
		return ContentService.createTextOutput(
			"Error: " + error.message,
		).setMimeType(ContentService.MimeType.TEXT);
	}
}

function sendDebugEmail(jsonData) {
	const subject = "Debug Output: Non-compliant Audit Data";
	let body = "JSON Data for non-compliant audit:\n\n";
	body += JSON.stringify(jsonData, null, 2); // Pretty print JSON

	MailApp.sendEmail({
		to: DEBUG_EMAIL,
		subject: subject,
		body: body,
	});

	console.log("Debug email sent");
}

function processAndAppendData(data) {
  const spreadsheet = SpreadsheetApp.openById(TRACKER_SPREADSHEET_ID);
  
  // Determine the correct sheet based on Job_Type
  const jobType = data.answers.Job_Type.value;
  const sheetName = jobType === "Installation" ? PANEL_SHEET : ELECTRICAL_SHEET;
  
  let sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    setupInitialColumns(sheet);
  }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const newRow = [];

  // Process metadata
  processObject(data.metadata, headers, newRow, "metadata");

  // Process answers
  processObject(data.answers, headers, newRow, "answers");

  // Add Timestamp column if it doesn't exist
  if (!headers.includes("Timestamp")) {
    headers.push("Timestamp");
    sheet.getRange(1, headers.length).setValue("Timestamp");
  }

  // Add current timestamp to the new row
  newRow[headers.indexOf("Timestamp")] = new Date();

  // Ensure "Resolved" and "Comment" columns exist
  ensureColumnExists(headers, sheet, "Resolved");
  ensureColumnExists(headers, sheet, "Comment");

  // Append the new row
  sheet.appendRow(newRow);
}

function processObject(obj, headers, newRow, prefix) {
  for (const key in obj) {
    const value = obj[key];
    if (typeof value === 'object' && value !== null) {
      processObject(value, headers, newRow, `${prefix}.${key}`);
    } else {
      const columnName = `${prefix}.${key}`;
      let columnIndex = headers.indexOf(columnName);
      if (columnIndex === -1) {
        headers.push(columnName);
        columnIndex = headers.length - 1;
        sheet.getRange(1, columnIndex + 1).setValue(columnName);
      }
      newRow[columnIndex] = value;
    }
  }
}

function ensureColumnExists(headers, sheet, columnName) {
  if (!headers.includes(columnName)) {
    headers.push(columnName);
    sheet.getRange(1, headers.length).setValue(columnName);
  }
}

function setupInitialColumns(sheet) {
	sheet.getRange(1, 1, 1, 3).setValues([["Resolved", "Comment", "Timestamp"]]);
}

function moveResolvedRows() {
  moveResolvedRowsForSheet(PANEL_SHEET);
  moveResolvedRowsForSheet(ELECTRICAL_SHEET);
}

function moveResolvedRowsForSheet(sourceSheetName) {
  const spreadsheet = SpreadsheetApp.openById(TRACKER_SPREADSHEET_ID);
  const sourceSheet = spreadsheet.getSheetByName(sourceSheetName);
  
  const data = sourceSheet.getDataRange().getValues();
  const headers = data.shift();
  const resolvedIndex = headers.indexOf("Resolved");
  const jobTypeIndex = headers.indexOf("answers.Job_Type.value");

  if (resolvedIndex === -1 || jobTypeIndex === -1) return; // Required columns not found

  const rowsToDelete = [];

  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i][resolvedIndex] === true) {
      const jobType = data[i][jobTypeIndex];
      const targetSheetName = getResolvedSheetName(jobType);
      let targetSheet = spreadsheet.getSheetByName(targetSheetName);

      if (!targetSheet) {
        targetSheet = spreadsheet.insertSheet(targetSheetName);
        setupInitialColumns(targetSheet);
      }

      targetSheet.appendRow(data[i]);
      rowsToDelete.push(i + 2); // +2 because of 0-indexing and header row
    }
  }

  for (let i = rowsToDelete.length - 1; i >= 0; i--) {
    sourceSheet.deleteRow(rowsToDelete[i]);
  }
}

function getResolvedSheetName(jobType) {
  return jobType === "Installation" ? RESOLVED_PANEL_SHEET : RESOLVED_ELECTRICAL_SHEET;
}

function testDoPost() {
	if (TESTING_MODE) {
		console.log("Starting test execution of doPost");
		doPost();
		console.log("Test execution of doPost completed");
	} else {
		console.log(
			"Testing mode is not enabled. Please enable TESTING_MODE to run this function.",
		);
	}
}

function createTimeDrivenTrigger() {
	ScriptApp.newTrigger("moveResolvedRows").timeBased().everyHours(1).create();
}
