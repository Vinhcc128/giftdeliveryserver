//server base domain url 
const domainUrl = "https://giftdeliveryserver-25zw.onrender.com";  // if local test, pls use this 

//==================================index.html==================================//
//==================================index.js==================================//

var debug = false;
var authenticated = false;


$(document).ready(function () {

	//localStorage.removeItem("allUsers");
	//localStorage.removeItem("allOrders");

	if (!localStorage.allUsers) {

		if (debug) alert("Users not found - creating a default user!");

		var userData = { email: "admin@domain.com", password: "admin", firstName: "CQU", lastName: "User", state: "QLD", phoneNumber: "0422919919", address: "700 Yamba Road", postcode: "4701" };

		var allUsers = [];
		allUsers.push(userData);

		if (debug) alert(JSON.stringify(allUsers));
		localStorage.setItem("allUsers", JSON.stringify(allUsers));

	} else {

		if (debug) alert("Names Array found-loading..");

		var allUsers = JSON.parse(localStorage.allUsers);
		if (debug) alert(JSON.stringify(allUsers));
	}



	/**
	----------------------Event handler to process login request----------------------
	**/

	$('#loginButton').click(async function (e) {
		e.preventDefault();

		var formData = $('#loginForm').serializeArray();
		var inputData = {};

		formData.forEach(function (data) {
			inputData[data.name] = data.value;
		});

		// Save inputData to localStorage
		localStorage.setItem("userInfo", JSON.stringify(inputData));  // Save login data

		try {
			// Send request to server to verify user credentials
			const response = await fetch('https://giftdeliveryserver-25zw.onrender.com/verifyUser', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(inputData)
			});

			const message = await response.text();

			if (response.ok) {
				alert('Login successful');
				window.location.href = "#homePage";  // Redirect to home page
			} else {
				alert(message);  // Display error message from server
			}
		} catch (error) {
			console.error('Error during login:', error);
			alert('Error occurred during login. Please try again.');
		}
	});



	$("#loginForm").validate({// JQuery validation plugin
		focusInvalid: false,
		onkeyup: false,
		submitHandler: function (form) {

			var formData = $(form).serializeArray();
			var inputData = {};
			formData.forEach(function (data) {
				inputData[data.name] = data.value;
			})

			localStorage.setItem("inputData", JSON.stringify(inputData));
		},
		/* Validation rules */
		rules: {
			email: {
				required: true,
				email: true
			},
			password: {
				required: true,
				rangelength: [3, 10]
			}
		},
		/* Validation message */
		messages: {
			email: {
				required: "Please enter your email",
				email: "The email format is incorrect"
			},
			password: {
				required: "Password cannot be empty",
				rangelength: $.validator.format("Minimum Password Length:{0}, Maximum Password Length:{1}。")

			}
		},
	});
	/**
	--------------------------end--------------------------
	**/


	/**
	------------Event handler to respond to selection of gift category-------------------
	**/
	$('#itemList li').click(function () {

		var itemName = $(this).find('#itemName').html();
		var itemPrice = $(this).find('#itemPrice').html();
		var itemImage = $(this).find('#itemImage').attr('src');

		localStorage.setItem("itemName", itemName);
		localStorage.setItem("itemPrice", itemPrice);
		localStorage.setItem("itemImage", itemImage);

	})

	/**
	--------------------------end--------------------------
	**/


	/**
	--------------------Event handler to process order confirmation----------------------
	**/
	// Method to check for special characters in names
	$.validator.addMethod("validateName", function (value, element) {
		return this.optional(element) || /^[a-zA-Z\s\-]+$/.test(value);
	}, "Name can only contain letters, spaces, and hyphens.");

	// Method to check that the date is not in the past
	$.validator.addMethod("dateNotInPast", function (value, element) {
		var today = new Date().setHours(0, 0, 0, 0);
		var selectedDate = new Date(value).setHours(0, 0, 0, 0);
		return this.optional(element) || selectedDate >= today;
	}, "Date cannot be in the past.");

	$('#confirmOrderButton').click(async function (e) {
		e.preventDefault();

		// Check if the form is valid
		if ($("#orderForm").valid()) {
			// Serialize the form data into an object
			var formData = $('#orderForm').serializeArray();
			var orderInfo = {};

			// Convert form data to object
			formData.forEach(function (data) {
				orderInfo[data.name] = data.value;
			});

			// Add selected item details from localStorage
			orderInfo.item = localStorage.getItem("itemName");
			orderInfo.price = localStorage.getItem("itemPrice");
			orderInfo.img = localStorage.getItem("itemImage");

			// Add customer information from localStorage (userInfo)
			var userInfo = JSON.parse(localStorage.getItem("userInfo"));
			orderInfo.customerEmail = userInfo.email;

			// Add a randomly generated order number
			orderInfo.orderNo = Math.trunc(Math.random() * 1000000);

			// Save the order to localStorage as "orderInfo"
			localStorage.setItem("orderInfo", JSON.stringify(orderInfo));

			try {
				// Send the order data to the server to save it in MongoDB
				const response = await fetch('https://giftdeliveryserver-25zw.onrender.com/postOrderData', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(orderInfo)
				});

				const message = await response.text();

				if (response.ok) {
					// Alert the user of success
					alert('Order submitted successfully!');

					// Redirect to the confirmation page
					window.location.href = "#orderConfirmationPage";
				} else {
					// Show an error message if something went wrong
					alert('Error submitting order: ' + message);
				}
			} catch (error) {
				console.error('Error during order submission:', error);
				alert('Error occurred while submitting the order. Please try again.');
			}
		} else {
			// If the form is not valid, show a validation message
			alert('Please fill in all required fields.');
		}
	});

	// JQuery validation plugin for the form
	$("#orderForm").validate({
		focusInvalid: false,
		onkeyup: false,
		submitHandler: function (form) {
			var formData = $(form).serializeArray();
			var inputData = {};

			formData.forEach(function (data) {
				inputData[data.name] = data.value;
			});

			localStorage.setItem("inputData", JSON.stringify(inputData));
		},

		// Validation rules
		rules: {
			firstName: {
				required: true,
				rangelength: [1, 15],
				validateName: true
			},
			lastName: {
				required: true,
				rangelength: [1, 15],
				validateName: true
			},
			phoneNumber: {
				required: true,
				mobiletxt: true
			},
			address: {
				required: true,
				rangelength: [1, 25]
			},
			postcode: {
				required: true,
				posttxt: true
			},
			date: {
				required: true,
				dateNotInPast: true
			},
		},

		// Validation messages
		messages: {
			firstName: {
				required: "Please enter your firstname",
				rangelength: $.validator.format("Contains a maximum of {1} characters"),
			},
			lastName: {
				required: "Please enter your lastname",
				rangelength: $.validator.format("Contains a maximum of {1} characters"),
			},
			phoneNumber: {
				required: "Phone number required",
			},
			address: {
				required: "Delivery address required",
				rangelength: $.validator.format("Contains a maximum of {1} characters"),
			},
			postcode: {
				required: "Postcode required",
			},
			date: {
				required: "Please select a delivery date",
				dateNotInPast: "Delivery date cannot be in the past"
			},
		}
	});
	// Handle form clearing
	$('#clearOrderButton').click(function () {
		if (confirm("Are you sure you want to clear the form?")) {
			$('#SignupForm').trigger('reset');
			$("#SignupForm").validate().resetForm();
			$('#SignupForm .form-control').removeClass('error');
		}
	});

	/**
	--------------------Event handler to perform initialisation before the Login page is displayed--------------------
	**/


	$(document).on("pagebeforeshow", "#loginPage", function () {

		localStorage.removeItem("userInfo");

		authenticated = false;
	});

	/**
	--------------------------end--------------------------
	**/

	/**
	--------------------Event handler to populate the Fill Order page before it is displayed---------------------
	**/

	$(document).on("pagebeforeshow", "#fillOrderPage", function () {

		$("#itemSelected").html(localStorage.getItem("itemName"));
		$("#priceSelected").html(localStorage.getItem("itemPrice"));
		$("#imageSelected").attr('src', localStorage.getItem("itemImage"));

	});

	/**
	--------------------------end--------------------------
	**/


	/**
	--------------------Event handler to populate the Order Confirmation page before it is displayed---------------------
	**/

	$(document).on("pagebeforeshow", "#orderConfirmationPage", function () {

		$('#orderInfo').html("");

		if (localStorage.orderInfo != null) {

			var orderInfo = JSON.parse(localStorage.getItem("orderInfo"));

			$('#orderInfo').append('<br><table><tbody>');
			$('#orderInfo').append('<tr><td>Order no: </td><td><span class=\"fcolor\">' + orderInfo.orderNo + '</span></td></tr>');
			$('#orderInfo').append('<tr><td>Customer: </td><td><span class=\"fcolor\">' + orderInfo.customerEmail + '</span></td></tr>');
			$('#orderInfo').append('<tr><td>Item: </td><td><span class=\"fcolor\">' + orderInfo.item + '</span></td></tr>');
			$('#orderInfo').append('<tr><td>Price: </td><td><span class=\"fcolor\">' + orderInfo.price + '</span></td></tr>');
			$('#orderInfo').append('<tr><td>Recipient: </td><td><span class=\"fcolor\">' + orderInfo.firstName + ' ' + orderInfo.lastName + '</span></td></tr>');
			$('#orderInfo').append('<tr><td>Phone number: </td><td><span class=\"fcolor\">' + orderInfo.phoneNumber + '</span></td></tr>');
			$('#orderInfo').append('<tr><td>Address: </td><td><span class=\"fcolor\">' + orderInfo.address + ' ' + orderInfo.postcode + '</span></td></tr>');
			$('#orderInfo').append('<tr><td>Dispatch date: </td><td><span class=\"fcolor\">' + orderInfo.date + '</span></td></tr>');
			$('#orderInfo').append('</tbody></table><br>');
		}
		else {
			$('#orderInfo').append('<h3>There is no order to display<h3>');
		}
	});


	/**
	--------------------------end--------------------------
	**/


	/**
	--------------------Handle User Registration Form---------------------
	**/

	$.validator.addMethod("validateName", function (value, element) {
		return this.optional(element) || /^[a-zA-Z\s\-]+$/.test(value);
	}, "Name can only contain letters, spaces, and hyphens.");


	$('#SubmitSignUp').click(async function (e) {
		e.preventDefault();

		if ($("#SignupForm").valid()) {
			var formData = $('#SignupForm').serializeArray();
			var newUser = {};

			// Convert form data to object
			formData.forEach(function (data) {
				newUser[data.name] = data.value;
			});

			try {
				const response = await fetch('https://giftdeliveryserver-25zw.onrender.com/registerUser', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(newUser)
				});

				const message = await response.text();

				if (response.ok) {
					// Save the new user information to localStorage
					localStorage.setItem("userInfo", JSON.stringify(newUser));

					// Show success message and clear the form
					alert("Registration successful!");
					$('#SignupForm').trigger('reset');

					// Redirect to the home page
					window.location.href = "#homePage";
				} else {
					alert(message);  // Display error message from server
				}
			} catch (error) {
				console.error('Error during registration:', error);
				alert('Error occurred while registering. Please try again.');
			}
		}
	});

	// Handle form clearing
	$('#ClearSignUp').click(function () {
		if (confirm("Are you sure you want to clear the form?")) {
			$('#SignupForm').trigger('reset');
			$("#SignupForm").validate().resetForm();
			$('#SignupForm .form-control').removeClass('error');
		}
	});

	$("#SignupForm").validate({
		focusInvalid: false,
		onkeyup: false,
		submitHandler: function (form) {
			// Submit the form only if validation is successful
			var formData = $(form).serializeArray();
			var inputData = {};

			formData.forEach(function (data) {
				inputData[data.name] = data.value;
			});

			// Now inputData can be sent to the server via POST request
			localStorage.setItem("inputData", JSON.stringify(inputData));
		},
		rules: {
			firstName: { required: true, validateName: true, rangelength: [1, 15] },
			lastName: { required: true, validateName: true, rangelength: [1, 15] },
			email: { required: true, email: true },
			password: { required: true, rangelength: [3, 10] },
			phoneNumber: { required: true, mobiletxt: true },
			address: { required: true, rangelength: [1, 25] },
			postcode: { required: true, posttxt: true }
		},
		messages: {
			firstName: {
				required: "Please enter your first name",
				rangelength: $.validator.format("First name must be between {0} and {1} characters long")
			},
			lastName: {
				required: "Please enter your last name",
				rangelength: $.validator.format("Last name must be between {0} and {1} characters long")
			},
			email: {
				required: "Please enter a valid email",
				email: "Please enter a valid email address"
			},
			password: {
				required: "Please enter a password",
				rangelength: $.validator.format("Password must be between {0} and {1} characters long")
			}
		}
	});


	/**
	--------------------------end--------------------------
	**/



	/**
	--------------------Handle User Past Orders Page---------------------
	**/

	$(document).on("pagebeforeshow", "#pastOrdersPage", async function () {
		$('#orderList').html("");  // Clear the order list display

		var userInfo = JSON.parse(localStorage.getItem("userInfo"));  // Get the current user's email

		try {
			const response = await fetch('https://giftdeliveryserver-25zw.onrender.com/getUserOrders', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email: userInfo.email })
			});

			if (response.ok) {
				const orders = await response.json();

				if (orders.length > 0) {
					orders.forEach(function (order) {
						$('#orderList').append('<br><table><tbody>');
						$('#orderList').append('<tr><td>Order no: </td><td><span class="fcolor">' + order.orderNo + '</span></td></tr>');
						$('#orderList').append('<tr><td>Customer: </td><td><span class="fcolor">' + order.customerEmail + '</span></td></tr>');
						$('#orderList').append('<tr><td>Item: </td><td><span class="fcolor">' + order.item + '</span></td></tr>');
						$('#orderList').append('<tr><td>Price: </td><td><span class="fcolor">' + order.price + '</span></td></tr>');
						$('#orderList').append('<tr><td>Recipient: </td><td><span class="fcolor">' + order.firstName + ' ' + order.lastName + '</span></td></tr>');
						$('#orderList').append('<tr><td>Phone number: </td><td><span class="fcolor">' + order.phoneNumber + '</span></td></tr>');
						$('#orderList').append('<tr><td>Address: </td><td><span class="fcolor">' + order.address + ' ' + order.postcode + '</span></td></tr>');
						$('#orderList').append('<tr><td>Dispatch date: </td><td><span class="fcolor">' + order.date + '</span></td></tr>');
						$('#orderList').append('</tbody></table><br>');
					});
				} else {
					$('#orderList').append('<p>No past orders found.</p>');
					window.location.href = "#homePage";
				}
			} else {
				const message = await response.text();
				alert(message);  // Show an error message if no orders are found
				window.location.href = "#homePage";
			}
		} catch (error) {
			console.error('Error fetching orders:', error);
			alert('Error fetching past orders. Please try again.');
		}
	});


	/**
	--------------------Delete selected orders---------------------
	**/

	$('#deleteSelectedOrdersButton').click(async function () {
		var selectedOrderNos = [];

		// Collect all selected order numbers
		$('.deleteCheckbox:checked').each(function () {
			selectedOrderNos.push($(this).val().toString());  // Ensure orderNo is sent as a string
		});

		if (selectedOrderNos.length === 0) {
			alert("Please select at least one order to delete.");
			return;
		}

		try {
			const response = await fetch('https://giftdeliveryserver-25zw.onrender.com/deleteSelectedOrders', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ orderNo: selectedOrderNos })  // Send the array of orderNos
			});

			const result = await response.json();

			if (response.ok) {
				// Store the deleted count in localStorage
				localStorage.setItem("deletedCount", result.deletedCount);

				// Redirect to the Delete Confirmation page after deletion
				window.location.href = "#deleteConfirmation";
			} else {
				alert("Error deleting orders: " + result);
			}
		} catch (error) {
			console.error('Error deleting orders:', error);
			alert('Error occurred during deletion. Please try again.');
		}
	});

	/**
	--------------------------end--------------------------
	**/



	/**
--------------------Handle User Deleted Orders Page---------------------
**/

	$(document).on("pagebeforeshow", "#deleteOrdersPage", async function () {
		$('#deleteOrderList').html("");  // Clear the delete order list

		var userInfo = JSON.parse(localStorage.getItem("userInfo"));  // Get the current user's email

		try {
			const response = await fetch('https://giftdeliveryserver-25zw.onrender.com/getUserOrders', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email: userInfo.email })
			});

			if (response.ok) {
				const orders = await response.json();

				if (orders.length > 0) {
					// Loop through the orders and populate the list
					orders.forEach(function (order) {
						$('#deleteOrderList').append('<br><table><tbody>');
						$('#deleteOrderList').append('<tr><td>Order no: </td><td><span class="fcolor">' + order.orderNo + '</span></td></tr>');
						$('#deleteOrderList').append('<tr><td>Customer: </td><td><span class="fcolor">' + order.customerEmail + '</span></td></tr>');
						$('#deleteOrderList').append('<tr><td>Item: </td><td><span class="fcolor">' + order.item + '</span></td></tr>');
						$('#deleteOrderList').append('<tr><td>Price: </td><td><span class="fcolor">' + order.price + '</span></td></tr>');
						$('#deleteOrderList').append('<tr><td>Recipient: </td><td><span class="fcolor">' + order.firstName + ' ' + order.lastName + '</span></td></tr>');
						$('#deleteOrderList').append('<tr><td>Phone number: </td><td><span class="fcolor">' + order.phoneNumber + '</span></td></tr>');
						$('#deleteOrderList').append('<tr><td>Address: </td><td><span class="fcolor">' + order.address + ' ' + order.postcode + '</span></td></tr>');
						$('#deleteOrderList').append('<tr><td>Dispatch date: </td><td><span class="fcolor">' + order.date + '</span></td></tr>');
						$('#deleteOrderList').append('<tr><td>Tick this box to delete <input type="checkbox" class="deleteCheckbox" value="' + order.orderNo + '"></td></tr>');
						$('#deleteOrderList').append('</tbody></table><br>');
					});
				} else {
					// If no orders are found, redirect to homePage
					alert("No orders found for the current user.");
					window.location.href = "#homePage";
				}
			} else {
				const message = await response.text();
				alert("Error: " + message);  // Show an error message if no orders are found
				window.location.href = "#homePage";
			}
		} catch (error) {
			console.error('Error fetching orders for deletion:', error);
			alert('Error fetching orders. Please try again.');
			window.location.href = "#homePage";  // Redirect to homePage on error
		}
	});

	/**
--------------------Handle Delete Confirmation Page---------------------
**/
	$(document).on("pagebeforeshow", "#deleteConfirmation", function () {
		// Retrieve the number of deleted orders from localStorage
		var deletedCount = localStorage.getItem("deletedCount");

		// If no orders were deleted, set it to 0
		if (!deletedCount) {
			deletedCount = 0;
		}

		// Display the message based on the count of deleted orders
		if (deletedCount == 1) {
			// Singular case
			$('#deletedOrdersCount').text(deletedCount + " order deleted.");
		} else {
			// Plural case
			$('#deletedOrdersCount').text(deletedCount + " orders deleted.");
		}
resizeBy.deletedCount=0;
	});

	/**
	--------------------------end--------------------------
	**/

});







