// Constants for sheet names and string values
const CONSTANTS = {
	PANEL_SHEET: "Non-compliant Panel Installations",
	ELECTRICAL_SHEET: "Non-compliant Electrical Installations",
	RESOLVED_PANEL_SHEET: "Resolved Non-compliant Panel Installations",
	RESOLVED_ELECTRICAL_SHEET: "Resolved Non-compliant Electrical Installations",
	TRACKER_SPREADSHEET_ID: "1LbirkFq0sw0ZNLXwhKizZ284gTIeBbzAOqWPQY8Txvw", // Replace with your actual spreadsheet ID
	DEBUG_EMAIL: "test-debug@tdobson.net", // Replace with your debug email
	JOB_TYPE: {
		INSTALLATION: "Installation",
	},
	COLUMN_NAMES: {
		RESOLVED: "Resolved",
		COMMENT: "Comment",
		TIMESTAMP: "Timestamp",
		JOB_TYPE: "answers.Job_Type.value",
	},
};

// Debug and testing constants
const DEBUG_MODE = true;
const TESTING_MODE = true;
const TESTING_DATA = testDataForDoPost;

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
			jsonData.installationType === "panel"
				? CONSTANTS.PANEL_SHEET
				: CONSTANTS.ELECTRICAL_SHEET;

		processAndAppendData(jsonData);

		return ContentService.createTextOutput(
			"Data processed successfully",
		).setMimeType(ContentService.MimeType.TEXT);
	} catch (error) {
		console.error(`Error in doPost: ${error.message}`);
		return ContentService.createTextOutput(
			`Error: ${error.message}`,
		).setMimeType(ContentService.MimeType.TEXT);
	}
}

function sendDebugEmail(jsonData) {
	const subject = "Debug Output: Non-compliant Audit Data";
	let body = "JSON Data for non-compliant audit:\n\n";
	body += JSON.stringify(jsonData, null, 2); // Pretty print JSON

	MailApp.sendEmail({
		to: CONSTANTS.DEBUG_EMAIL,
		subject: subject,
		body: body,
	});

	console.log("Debug email sent");
}

function processAndAppendData(data) {
	const spreadsheet = SpreadsheetApp.openById(CONSTANTS.TRACKER_SPREADSHEET_ID);

	// Determine the correct sheet based on Job_Type
	const jobType = data.answers.Job_Type.value;
	const sheetName =
		jobType === CONSTANTS.JOB_TYPE.INSTALLATION
			? CONSTANTS.PANEL_SHEET
			: CONSTANTS.ELECTRICAL_SHEET;

	let sheet = spreadsheet.getSheetByName(sheetName);

	if (!sheet) {
		sheet = spreadsheet.insertSheet(sheetName);
		setupInitialColumns(sheet);
	}

	const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
	const newRow = [];

	// Process metadata
	processObject(data.metadata, headers, newRow, "metadata", sheet);

	// Process answers
	processObject(data.answers, headers, newRow, "answers", sheet);

	// Add Timestamp column if it doesn't exist
	if (!headers.includes(CONSTANTS.COLUMN_NAMES.TIMESTAMP)) {
		headers.push(CONSTANTS.COLUMN_NAMES.TIMESTAMP);
		sheet
			.getRange(1, headers.length)
			.setValue(CONSTANTS.COLUMN_NAMES.TIMESTAMP);
	}

	// Add current timestamp to the new row
	newRow[headers.indexOf(CONSTANTS.COLUMN_NAMES.TIMESTAMP)] = new Date();

	// Ensure "Resolved" and "Comment" columns exist
	ensureColumnExists(headers, sheet, CONSTANTS.COLUMN_NAMES.RESOLVED);
	ensureColumnExists(headers, sheet, CONSTANTS.COLUMN_NAMES.COMMENT);

	// Append the new row
	sheet.appendRow(newRow);
}

function processObject(obj, headers, newRow, prefix, sheet) {
	for (const key in obj) {
		const value = obj[key];
		if (typeof value === "object" && value !== null) {
			processObject(value, headers, newRow, `${prefix}.${key}`, sheet);
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
	sheet
		.getRange(1, 1, 1, 3)
		.setValues([
			[
				CONSTANTS.COLUMN_NAMES.RESOLVED,
				CONSTANTS.COLUMN_NAMES.COMMENT,
				CONSTANTS.COLUMN_NAMES.TIMESTAMP,
			],
		]);
}

function moveResolvedRows() {
	moveResolvedRowsForSheet(CONSTANTS.PANEL_SHEET);
	moveResolvedRowsForSheet(CONSTANTS.ELECTRICAL_SHEET);
}

function moveResolvedRowsForSheet(sourceSheetName) {
	const spreadsheet = SpreadsheetApp.openById(CONSTANTS.TRACKER_SPREADSHEET_ID);
	const sourceSheet = spreadsheet.getSheetByName(sourceSheetName);

	const data = sourceSheet.getDataRange().getValues();
	const headers = data.shift();
	const resolvedIndex = headers.indexOf(CONSTANTS.COLUMN_NAMES.RESOLVED);
	const jobTypeIndex = headers.indexOf(CONSTANTS.COLUMN_NAMES.JOB_TYPE);

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
	return jobType === CONSTANTS.JOB_TYPE.INSTALLATION
		? CONSTANTS.RESOLVED_PANEL_SHEET
		: CONSTANTS.RESOLVED_ELECTRICAL_SHEET;
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
