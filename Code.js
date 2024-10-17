/**
 * Constants for sheet names and string values.
 */
const CONSTANTS = {
	PANEL_SHEET: "Non-compliant Panel Installations",
	ELECTRICAL_SHEET: "Non-compliant Electrical Installations",
	RESOLVED_PANEL_SHEET: "Resolved Non-compliant Panel Installations",
	RESOLVED_ELECTRICAL_SHEET: "Resolved Non-compliant Electrical Installations",
	SUMMARY_SHEET: "Summary",
	TRACKER_SPREADSHEET_ID: "1LbirkFq0sw0ZNLXwhKizZ284gTIeBbzAOqWPQY8Txvw",
	DEBUG_EMAIL: "test-debug@tdobson.net",
	JOB_TYPE: {
		INSTALLATION: "Installation",
		ELECTRICAL: "Electrical",
	},
	COLUMN_NAMES: {
		RESOLVED: "Resolved",
		COMMENT: "Comment",
		TIMESTAMP: "Timestamp",
		JOB_TYPE: "answers.Job_Type.value",
	},
	SUMMARY_COLUMNS: [
		"Audit_Date",
		"Install_date",
		"Auditor",
		"Job_Type",
		"Installer",
		"Compliant",
		"Non_Compliance.Reason",
		"Non_Compliance.Severity",
		"Site",
		"Job_No",
		"Plot_No",
		"Team",
		"Audit_Type",
		"Authorised_for_NC",
		"Remedial_Required",
		"Remedial_Details",
		"Notes",
		"submissionid",
	],
	DATA_MAP: {
		Audit_Date: "answers.Audit_Date.value",
		Install_date: "answers.Install_date.value",
		Auditor: "answers.Auditor.value",
		Job_Type: "answers.Job_Type.value",
		Installer: "answers.Installer.value",
		Compliant: "answers.Compliant.value",
		"Non_Compliance.Reason": "answers.Non_Compliance.values[0].Reason.value",
		"Non_Compliance.Severity":
			"answers.Non_Compliance.values[0].Severity.value",
		Site: "answers.Site.value",
		Job_No: "answers.Job_No.value",
		Plot_No: "answers.Plot_No.value",
		Team: null,
		Audit_Type: "answers.Audit_Type.value",
		Authorised_for_NC: "answers.Authorised_for_NC.value",
		Remedial_Required: "answers.Remedial_Required.value",
		Remedial_Details: "answers.Remedial_Details.value",
		Notes: "answers.Notes.value",
		submissionid: "metadata.submission_id",
	},
};

/**
 * Debug and testing constants.
 */
const DEBUG_MODE = true;
const TESTING_MODE = false;
const TESTING_DATA = testDataForDoPost;

/**
 * Handles POST requests to process incoming data.
 * If in testing mode, uses predefined testing data.
 * Sends debug email if in debug mode.
 * Determines the appropriate sheet based on the installation type.
 * Processes and appends the data to the appropriate sheet.
 * Returns a success message or an error message.
 */
function doPost(e) {
	if (acquireLock()) {
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

			processAndAppendData(jsonData);
			appendToSummarySheet(jsonData);

			// Return a proper HTTP response with 200 status code
			return ContentService.createTextOutput(
				JSON.stringify({
					status: "success",
					message: "Data processed successfully",
				}),
			)
				.setMimeType(ContentService.MimeType.JSON)
				.setStatusCode(200);
		} catch (error) {
			console.error(`Error in doPost: ${error.message}`);

			// Return a proper HTTP response with 400 status code for errors
			return ContentService.createTextOutput(
				JSON.stringify({
					status: "error",
					message: `Error: ${error.message}`,
				}),
			)
				.setMimeType(ContentService.MimeType.JSON)
				.setStatusCode(400);
		} finally {
			releaseLock(); // Ensure the lock is released even if an error occurs
		}
	} else {
		console.log("Could not acquire lock. Another process may be running.");
		return ContentService.createTextOutput(
			JSON.stringify({
				status: "error",
				message: "Could not acquire lock. Please try again later.",
			}),
		)
			.setMimeType(ContentService.MimeType.JSON)
			.setStatusCode(503); // 503 Service Unavailable
	}
}

function appendToSummarySheet(data) {
	const spreadsheet = SpreadsheetApp.openById(CONSTANTS.TRACKER_SPREADSHEET_ID);
	let summarySheet = spreadsheet.getSheetByName(CONSTANTS.SUMMARY_SHEET);

	if (!summarySheet) {
		summarySheet = spreadsheet.insertSheet(CONSTANTS.SUMMARY_SHEET);
		summarySheet.appendRow(CONSTANTS.SUMMARY_COLUMNS);
	}

	const newRow = CONSTANTS.SUMMARY_COLUMNS.map((column) => {
		const path = CONSTANTS.DATA_MAP[column];
		if (!path) return "";

		const value = path.split(".").reduce((obj, key) => {
			if (obj && key.includes("[")) {
				const [arrayName, index] = key.split(/[\[\]]/);
				return obj[arrayName]?.[Number.parseInt(index)];
			}
			return obj?.[key];
		}, data);

		if (column === "Compliant" || column === "Remedial_Required") {
			return value ? "yes" : "no";
		}

		return value || "";
	});

	summarySheet.appendRow(newRow);
}

/**
 * Sends a debug email containing the JSON data of a non-compliant audit.
 * The email includes a pretty-printed version of the JSON data.
 */
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

/**
 * Processes and appends incoming data to the appropriate sheet.
 * Determines the correct sheet based on the job type.
 * Sets up initial columns if the sheet does not exist.
 * Processes metadata and answers, ensuring necessary columns exist.
 * Appends the new row with the processed data and adds a checkbox to the "Resolved" column.
 */
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

	// Add checkbox to the "Resolved" column
	const resolvedColumnIndex =
		headers.indexOf(CONSTANTS.COLUMN_NAMES.RESOLVED) + 1;
	if (resolvedColumnIndex > 0) {
		const lastRow = sheet.getLastRow();
		sheet.getRange(lastRow, resolvedColumnIndex).insertCheckboxes();
	}
}

/**
 * Recursively processes an object and appends its key-value pairs to the new row.
 * Ensures that all necessary columns exist in the sheet.
 */
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

/**
 * Ensures that a specific column exists in the sheet.
 * If the column does not exist, it is added to the headers and the sheet.
 */
function ensureColumnExists(headers, sheet, columnName) {
	if (!headers.includes(columnName)) {
		headers.push(columnName);
		sheet.getRange(1, headers.length).setValue(columnName);
	}
}

/**
 * Sets up the initial columns in a new sheet.
 * Adds the "Resolved", "Comment", and "Timestamp" columns.
 */
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

/**
 * Moves resolved rows from the source sheets to the resolved sheets.
 * Uses a document lock to ensure no conflicts with other processes.
 * Moves resolved rows for both panel and electrical sheets.
 */
function moveResolvedRows() {
	const lock = LockService.getDocumentLock();
	try {
		lock.waitLock(30000); // wait 30 seconds for other processes to finish.

		if (lock.hasLock()) {
			moveResolvedRowsForSheet(CONSTANTS.PANEL_SHEET);
			moveResolvedRowsForSheet(CONSTANTS.ELECTRICAL_SHEET);
		} else {
			console.log("Could not obtain lock after 30 seconds.");
		}
	} catch (e) {
		console.error(`Error in moveResolvedRows: ${e.toString()}`);
	} finally {
		if (lock.hasLock()) {
			lock.releaseLock();
		}
	}
}

/**
 * Moves resolved rows from a source sheet to the corresponding resolved sheet.
 * Determines the target sheet based on the job type.
 * Appends resolved rows to the target sheet and deletes them from the source sheet.
 * Sorts the target sheet by timestamp after moving rows.
 */
function moveResolvedRowsForSheet(sourceSheetName) {
	const spreadsheet = SpreadsheetApp.openById(CONSTANTS.TRACKER_SPREADSHEET_ID);
	const sourceSheet = spreadsheet.getSheetByName(sourceSheetName);

	const data = sourceSheet.getDataRange().getValues();
	const headers = data.shift();
	const resolvedIndex = headers.indexOf(CONSTANTS.COLUMN_NAMES.RESOLVED);
	const jobTypeIndex = headers.indexOf(CONSTANTS.COLUMN_NAMES.JOB_TYPE);
	const timestampIndex = headers.indexOf(CONSTANTS.COLUMN_NAMES.TIMESTAMP);

	if (resolvedIndex === -1 || jobTypeIndex === -1 || timestampIndex === -1) {
		console.log("Required columns not found. Exiting function.");
		return;
	}

	// Process rows in reverse order to avoid issues with changing indices
	for (let i = data.length - 1; i >= 0; i--) {
		if (data[i][resolvedIndex] === true) {
			const rowIndex = i + 2; // +2 because of 0-indexing and header row
			const jobType = data[i][jobTypeIndex];
			const targetSheetName = getResolvedSheetName(jobType);

			let targetSheet = spreadsheet.getSheetByName(targetSheetName);
			if (!targetSheet) {
				targetSheet = spreadsheet.insertSheet(targetSheetName);
				setupInitialColumns(targetSheet);
			}

			// Insert at the top of the target sheet (after headers)
			targetSheet.insertRowAfter(1);
			targetSheet.getRange(2, 1, 1, data[i].length).setValues([data[i]]);

			// Delete from source sheet
			sourceSheet.deleteRow(rowIndex);
		}
	}

	// Sort the target sheets
	sortResolvedSheet(getResolvedSheetName(CONSTANTS.JOB_TYPE.INSTALLATION));
	sortResolvedSheet(CONSTANTS.RESOLVED_ELECTRICAL_SHEET);
}

/**
 * Sorts a resolved sheet by timestamp in descending order (most recent first).
 */
function sortResolvedSheet(sheetName) {
	const spreadsheet = SpreadsheetApp.openById(CONSTANTS.TRACKER_SPREADSHEET_ID);
	const sheet = spreadsheet.getSheetByName(sheetName);
	if (!sheet) return;

	const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
	const timestampIndex = headers.indexOf(CONSTANTS.COLUMN_NAMES.TIMESTAMP) + 1;

	if (timestampIndex > 0) {
		const range = sheet.getRange(
			2,
			1,
			sheet.getLastRow() - 1,
			sheet.getLastColumn(),
		);
		range.sort({ column: timestampIndex, ascending: false });
	}
}

/**
 * Determines the name of the resolved sheet based on the job type.
 * Returns the appropriate resolved sheet name.
 */
function getResolvedSheetName(jobType) {
	return jobType === CONSTANTS.JOB_TYPE.INSTALLATION
		? CONSTANTS.RESOLVED_PANEL_SHEET
		: CONSTANTS.RESOLVED_ELECTRICAL_SHEET;
}

/**
 * Tests the doPost function by executing it with predefined testing data.
 * Logs the start and completion of the test execution.
 */
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
/**
 * Attempts to acquire a script lock and returns a boolean indicating whether the lock was successfully acquired.
 * @returns {boolean} True if the lock was successfully acquired, false otherwise.
 */
function acquireLock() {
	const lock = LockService.getScriptLock();
	try {
		console.log("Getting lock");
		// Wait up to 30 seconds to acquire the lock
		lock.waitLock(30000);
		console.log("Successfully got lock");
		return true;
	} catch (e) {
		console.log("Could not acquire lock");
		return false;
	}
}

/**
 * Releases the script lock.
 * This should be called after the completion of the task that required the lock.
 */
function releaseLock() {
	const lock = LockService.getScriptLock();
	console.log("Releasing lock");
	lock.releaseLock();
}
