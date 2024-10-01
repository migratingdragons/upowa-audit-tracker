function onOpen() {
	var ui = SpreadsheetApp.getUi();
	ui.createMenu("Audit Tools")
		.addItem("Process Resolved Audits", "processResolvedAudits")
		.addToUi();
}

function processResolvedAudits() {
	moveResolvedRows();
	SpreadsheetApp.getUi().alert("Resolved audits have been processed.");
}
