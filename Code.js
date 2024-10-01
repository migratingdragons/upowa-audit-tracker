// Constants for sheet names
const PANEL_SHEET = "Panel";
const ELECTRICAL_SHEET = "Electrical";
const RESOLVED_PANEL_SHEET = "Panel Resolved";
const RESOLVED_ELECTRICAL_SHEET = "Electrical Resolved";
const TRACKER_SPREADSHEET_ID = "1LbirkFq0sw0ZNLXwhKizZ284gTIeBbzAOqWPQY8Txvw"; // Replace with your actual spreadsheet ID

function doPost(e) {
	const jsonString = e.postData.contents;
	const jsonData = JSON.parse(jsonString);
	const sheetName =
		jsonData.installationType === "panel" ? PANEL_SHEET : ELECTRICAL_SHEET;

	if (e.postData.type === "application/json") {
		processAndAppendData(jsonData, sheetName);
		return ContentService.createTextOutput("Data processed successfully");
	}
	return ContentService.createTextOutput("Invalid content type");
}

function processAndAppendData(data, sheetName) {
	const spreadsheet = SpreadsheetApp.openById(TRACKER_SPREADSHEET_ID);
	let sheet = spreadsheet.getSheetByName(sheetName);

	if (!sheet) {
		sheet = spreadsheet.insertSheet(sheetName);
		setupInitialColumns(sheet);
	}

	const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
	const newRow = [];

	for (const key in data) {
		let columnIndex = headers.indexOf(key);
		if (columnIndex === -1) {
			// Add new column if it doesn't exist
			headers.push(key);
			sheet.getRange(1, headers.length).setValue(key);
			columnIndex = headers.length - 1;
		}
		newRow[columnIndex] = data[key];
	}

	// Add Resolved checkbox and Comment columns if they don't exist
	if (!headers.includes("Resolved")) {
		headers.push("Resolved");
		sheet.getRange(1, headers.length).setValue("Resolved");
	}
	if (!headers.includes("Comment")) {
		headers.push("Comment");
		sheet.getRange(1, headers.length).setValue("Comment");
	}

	// Append the new row
	sheet.appendRow(newRow);
}

function setupInitialColumns(sheet) {
	sheet.getRange(1, 1, 1, 3).setValues([["Resolved", "Comment", "Timestamp"]]);
}

function moveResolvedRows() {
	moveResolvedRowsForSheet(PANEL_SHEET, RESOLVED_PANEL_SHEET);
	moveResolvedRowsForSheet(ELECTRICAL_SHEET, RESOLVED_ELECTRICAL_SHEET);
}

function moveResolvedRowsForSheet(sourceSheetName, targetSheetName) {
	const spreadsheet = SpreadsheetApp.openById(TRACKER_SPREADSHEET_ID);
	const sourceSheet = spreadsheet.getSheetByName(sourceSheetName);
	let targetSheet = spreadsheet.getSheetByName(targetSheetName);

	if (!targetSheet) {
		targetSheet = spreadsheet.insertSheet(targetSheetName);
		setupInitialColumns(targetSheet);
	}

	const data = sourceSheet.getDataRange().getValues();
	const headers = data.shift();
	const resolvedIndex = headers.indexOf("Resolved");

	if (resolvedIndex === -1) return; // No Resolved column found

	const rowsToMove = [];
	const rowsToDelete = [];

	for (let i = data.length - 1; i >= 0; i--) {
		if (data[i][resolvedIndex] === true) {
			rowsToMove.push(data[i]);
			rowsToDelete.push(i + 2); // +2 because of 0-indexing and header row
		}
	}

	if (rowsToMove.length > 0) {
		targetSheet
			.getRange(
				targetSheet.getLastRow() + 1,
				1,
				rowsToMove.length,
				headers.length,
			)
			.setValues(rowsToMove);
		for (let i = rowsToDelete.length - 1; i >= 0; i--) {
			sourceSheet.deleteRow(rowsToDelete[i]);
		}
	}
}
