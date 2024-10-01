function myFunction() {}
// Constants for sheet names
const PANEL_SHEET = "Panel";
const ELECTRICAL_SHEET = "Electrical";
const RESOLVED_PANEL_SHEET = "Panel Resolved";
const RESOLVED_ELECTRICAL_SHEET = "Electrical Resolved";
const TRACKER_SPREADSHEET_ID = "1LbirkFq0sw0ZNLXwhKizZ284gTIeBbzAOqWPQY8Txvw"; // Replace with your actual spreadsheet ID

function doPost(e) {
	if (e.postData.type == "application/json") {
		var jsonString = e.postData.contents;
		var jsonData = JSON.parse(jsonString);

		// Determine which sheet to use based on the data
		var sheetName =
			jsonData.installationType === "panel" ? PANEL_SHEET : ELECTRICAL_SHEET;

		processAndAppendData(jsonData, sheetName);

		return ContentService.createTextOutput("Data processed successfully");
	} else {
		return ContentService.createTextOutput("Invalid content type");
	}
}

function processAndAppendData(data, sheetName) {
	var spreadsheet = SpreadsheetApp.openById(TRACKER_SPREADSHEET_ID);
	var sheet = spreadsheet.getSheetByName(sheetName);

	if (!sheet) {
		sheet = spreadsheet.insertSheet(sheetName);
		setupInitialColumns(sheet);
	}

	var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
	var newRow = [];

	for (var key in data) {
		var columnIndex = headers.indexOf(key);
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
	var spreadsheet = SpreadsheetApp.openById(TRACKER_SPREADSHEET_ID);
	var sourceSheet = spreadsheet.getSheetByName(sourceSheetName);
	var targetSheet = spreadsheet.getSheetByName(targetSheetName);

	if (!targetSheet) {
		targetSheet = spreadsheet.insertSheet(targetSheetName);
		setupInitialColumns(targetSheet);
	}

	var data = sourceSheet.getDataRange().getValues();
	var headers = data.shift();
	var resolvedIndex = headers.indexOf("Resolved");

	if (resolvedIndex === -1) return; // No Resolved column found

	var rowsToMove = [];
	var rowsToDelete = [];

	for (var i = data.length - 1; i >= 0; i--) {
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
		for (var i = rowsToDelete.length - 1; i >= 0; i--) {
			sourceSheet.deleteRow(rowsToDelete[i]);
		}
	}
}
