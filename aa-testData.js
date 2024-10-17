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
