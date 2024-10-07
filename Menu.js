function onOpen() {
	const ui = SpreadsheetApp.getUi();
	ui.createMenu("Audit Tools")
		.addItem("Process Resolved Audits", "processResolvedAudits")
		.addToUi();
}

function processResolvedAudits() {
	console.log("Starting to process resolved audits");
	const output = moveResolvedRows();
	console.log("Finished processing resolved audits");
	console.log(output);
	SpreadsheetApp.getUi().alert(
		"Resolved audits have been processed. Check the logs for details.",
	);
}
