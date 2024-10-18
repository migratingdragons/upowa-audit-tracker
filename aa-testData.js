const testDataForDoPost = {
	metadata: {
		device_id: "iPhone_3db885a157fe9769f06c2717043206c9353da78b",
		user_id: null,
		username: "Mobit",
		submitted_at: "2024-10-01 13:55:00 +01:00",
		received_at: "2024-10-01 12:55:02 +00:00",
		submission_id: "97026957",
		device_submission_identifier: "A5245B24-5D83-4221-B8AF-687142EB1270",
		submission_counter: "1",
		author_identifier: "iPhone_3db885a157fe9769f06c2717043206c9353da78b",
		form_name: "6.Audit Form",
		form_namespace:
			"http://www.devicemagic.com/xforms/752ba230-5cae-013d-8a0b-620dcf7168bf",
		form_version: "1.02",
	},
	answers: {
		Job_Type: {
			value: "Installation",
		},
		Audit_Type: {
			value: "Desk",
		},
		Forwarded_for_approval: {
			value: false,
		},
		Site: {
			value: "Test site",
		},
		Job_No: {
			value: "Test 1",
		},
		Plot_No: {
			value: "99",
		},
		Installer: {
			value: "Charlie Burley",
		},
		Install_date: {
			value: "2024-10-01",
		},
		Auditor: {
			value: "Jamie Barron",
		},
		Authorised_for_NC: {
			value: "YES",
		},
		Auditor_Company: {
			value: "Upowa",
		},
		Audit_Date: {
			value: "2024-10-01",
		},
		Compliant: {
			value: false,
			geostamp:
				"lat=52.394975270, long=-2.236413008, alt=68.850157,         hAccuracy=23.443102, vAccuracy=3.000000, timestamp=2024-10-01T12:54:11Z",
			timestamp: "2024-10-01 13:54:11",
		},
		Remedial_Required: {
			value: true,
		},
		Remedial_Details: {
			value: "Test non compliant",
		},
		Non_Compliance: {
			values: [
				{
					Severity: {
						value: "1",
					},
					Reason: {
						value: "Test 1",
					},
					Additional_Photo: {
						value:
							"https://drive.google.com/uc?id=1enTuPvLeYzkSKHvFu8LIkBBuA1nqNvzb",
					},
				},
			],
		},
		Notes: {
			value: "Notes",
		},
	},
};

const newTestData = {
	metadata: {
		form_namespace:
			"http://www.devicemagic.com/xforms/752ba230-5cae-013d-8a0b-620dcf7168bf",
		submission_id: "test-1729209009",
	},
	device: {
		identifier: "test-device",
	},
	form: {
		id: 12345,
		name: "Test Form",
	},
	answers: [
		{
			question_id: 1,
			value: "Sample Answer",
		},
	],
};

const testData18Oct = {
	"metadata": {
		"device_id": "iPad_A8093B1F-64B1-417F-BF0F-B037D262B8F2",
		"user_id": null,
		"username": "UPOWA-Jamie Barron",
		"submitted_at": "2024-10-17 16:45:38 +01:00",
		"received_at": "2024-10-17 15:45:40 +00:00",
		"submission_id": "97685176",
		"device_submission_identifier": "C7E762E9-CB89-4F93-B367-5969A1C3CC07",
		"submission_counter": "22",
		"author_identifier": "iPad_A8093B1F-64B1-417F-BF0F-B037D262B8F2",
		"form_name": "Non Compliant Installation Audit Form",
		"form_namespace": "http://www.devicemagic.com/xforms/752ba230-5cae-013d-8a0b-620dcf7168bf?8fd0b280-6d6b-013d-b51b-0edc13c680b0",
		"form_version": "1.01"
	},
	"answers": {
		"Job_Type": {
			"value": "Installation"
		},
		"Audit_Type": {
			"value": "Desk"
		},
		"Forwarded_for_approval": {
			"value": true
		},
		"Forwarded_by": {
			"value": "Mobit Graham"
		},
		"Job_No": {
			"value": "TAY-BIS-PH5"
		},
		"Plot_No": {
			"value": "71"
		},
		"Installer": {
			"value": "Jay Macgill-Patel"
		},
		"Install_date": {
			"value": "2024-10-15"
		},
		"Auditor": {
			"value": "Jamie Barron"
		},
		"Authorised_for_NC": {
			"value": "YES"
		},
		"Auditor_Company": {
			"value": "Upowa"
		},
		"Audit_Date": {
			"value": "2024-10-15"
		},
		"Compliant": {
			"value": true,
			"geostamp": "",
			"timestamp": "2024-10-17 16:45:28"
		},
		"Remedial_Required": {
			"value": false
		},
		"Notes": {
			"value": "? Are the bottom flashings installed ok,"
		},
		"Approval_Notes": {
			"value": "Will speak with installer"
		},
		"Pic_6": {
			"value": "/home/testlolasdfa/Pic_6[1].JPEG"
		}
	}
}
