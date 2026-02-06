currentLanguage = "en";

$(document).ready(function () {
  const token = location?.href.split("=")[1];

  var data = new FormData();
  
  data.append("event_code", event_code);
  data.append("registration_update_token", token);
  var xhr = new XMLHttpRequest();
  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === 4) {
      switch (this.status) {
        case 200:
          let res = JSON.parse(this.responseText);
          $('body').append(`<input type="hidden" id="category-reminder" value="${res.record_unique_data.ticket_id}"/>`)
          if (res.record_unique_data.ticket_id == '43') {
            $('#pre-header-form').html(`
              <p class="yelow_title h5 text-center mb-4">Welcome to the 2025 Global NCD Alliance Forum Delegate Registration Portal!</p>
              <p class="text-white">The Forum will take place in Kigali, Rwanda from 13-15 February 2025.</p> 
              <p class="text-white">Your invitation includes a TRAVEL GRANT to attend the Forum. Further information about your grant allocation and how to arrange travel is provided during registration. </p>
              <p class="text-white">To register, please complete this form with your details. You have until 29<sup>th</sup> November 2024 to complete this form otherwise your travel grant may be reallocated. </p>
              <p class="text-white">Please note that this is an invitation-only event. This form is not transferable and is limited to one submission only. Please do not forward the email or the link to anyone else.</p>  
            `)
          } else if (res.record_unique_data.ticket_id == '44') {
            $("#pre-header-form").html(`
              <p class="yelow_title h5 text-center mb-4">Welcome to the 2025 Global NCD Alliance Forum Delegate Registration Portal!</p> 
              <p class="text-white">The Forum will take place in Kigali, Rwanda from 13-15 February 2025.</p>
              <p class="text-white">Your entry to the Forum is free. You will need to cover your own travel, accommodation, and other expenses. Details about preferential rates for hotels can be found in the <a href=https://smartbookings.rw/Event-Hotels/65c61e2854bc4">Accommodation section</a>.</p>  
              <p class="text-white">To register please complete this form with your details as soon as possible. </p>
              <p class="text-white">Please note that this is an invitation-only event. This form is not transferable and is limited to one submission only. Please do not forward the email or the link to anyone else.</p>  
            `)
          } else if (res.record_unique_data.ticket_id == '38') {
            $("#pre-header-form").html(`
              <p class="yelow_title h5 text-center mb-4">Welcome to the 2025 Global NCD Alliance Forum Delegate Registration Portal!</p>
              <p class="text-white">The Forum will take place in Kigali, Rwanda from 13-15 February 2025.</p>
              <p class="text-white">To register please complete this form with your details as soon as possible. You will need to cover the cost of your delegate pass, travel, accommodation, and other expenses. Details about preferential rates for hotels can be found in the <a href="https://smartbookings.rw/Event-Hotels/65c61e2854bc4">Accommodation section</a>.</p> 
              <p class="text-white">Please note that this is an invitation-only event. This form is not transferable and is limited to one submission only. Please do not forward the email or the link to anyone else.</p>
            `)
          }

          $("#registration-form").addClass(
            res.category.form_type == "SINGLE" ? "single-step" : "multi-step"
          );
          let files_returned = [];
          $("#registration-form").append(`
            <input type="hidden" id="payment_token" value="">
            <input type="hidden" id="payment_session" value="">
            <input type="hidden" id="order_id" value="">
            <input type="hidden" id="acknowleadgment" value="">
          `);

          res.data.forEach((element, index) => {
            group_name = element.group.name;
            let groupInputs = "";
            element.inputs.forEach((FormData) => {
              groupInputs += inputUI(FormData);
              if (
                FormData.input.inputtype.id == 6 ||
                FormData.input.inputtype.id == 7
              ) {
                files_returned.push(FormData);
              }
              if (FormData.input.inputcode === 'input_id_75031') {
                $('body').append(`<input type="hidden" id="paymentmethod-reminder" value="${FormData.value}"/>`)
              }
            });
            const active = index === 0 ? "active" : "";
            $("#pills-tab").append(`
            <li class="nav-item my-1 text-capitalize">
              <a class="nav-link ${active} tabs-navigation-form"
                id="nav-${index}-tab"
                data-bs-toggle="pill"
                data-bs-target="#nav-${index}"
                type="button"
                role="tab"
                aria-controls="nav-${index}"
                aria-selected="true"

              >
                <span class="number mr-2">${index + 1}</span>
                ${group_name}
              </a>
            </li>`);
            $("#pills-tabContent").append(`
                <div
                class="tab-pane fade show ${active}"
                id="nav-${index}"
                role="tabpanel"
                aria-labelledby="nav-${index}-tab"
              >
              
              </div>
              `);
            if (element.group.id == 21) {
              $("#registration-form").append(`
                  <filedset class="col-lg-9 col-md-9" style="margin-top: 15px;">
                    <legend class="h4">${group_name}</legend>
                    <h6 class="legend-blue">Consent</h6>
                    <p>
                      <input id="consent-one" type="checkbox" /> <span class="text-danger">*</span>
                      I consent NCD Alliance to collect and store the personal data from this form. The information will be used only for the purpose(s) for which you have submitted this form. You can change your mind at any time by sending us an email to <a href="mailto:globalncdforum@ncdalliance.org">globalncdforum@ncdalliance.org</a>. You can find more information about our privacy policy <a href="https://ncdalliance.org/privacy-policy" target="blank">here</a>.
                    </p>
                    <p>
                      <input id="consent-two" type="checkbox" /> <span class="text-danger">*</span>
                      By registering and/or by participating at the Global NCD Alliance Forum, I acknowledge that certain sessions and/or social functions may be photographed and/or filmed and/or web streamed and that some of these photos and video recordings can be used for news, promotional purposes, future marketing materials, illustration, information and dissemination activities via NCD Alliance's own websites or inclusion on NCDA's social media pages.
                    </p>
                    <h6 class="legend-blue">Conflict of Interest</h6>
                      <p>
                        <input id="consent-three" type="checkbox" /> <span class="text-danger">*</span>
                        I declare that I am not funded, sponsored, supported, or influenced by the alcohol*, tobacco and nicotine**, ultra-processed and HFSS (high in fat, sugar, and/or salt) foods & beverages***, fossil fuel extraction or arms industries.</p>
                      <p>
                        Industries as defined in the NCD Alliance <a target="blanc" href="https://ncdalliance.org/sites/default/files/NCDA Organisational Conflict of Interest Policy_Version May_2022.pdf">Organisational Conflict of Interest Policy:</a>
                      </p>
                      <p>
                        *Alcohol industry" is defined to include manufacturers of alcoholic beverages. In addition, it includes business associations, front groups or other non-state actors representing or funded largely by any of the afore-mentioned entities. 
                      </p>
                      <p>
                        **The term “tobacco and nicotine industry” is defined to include any tobacco or nicotine product manufacturer, and any parent, affiliate, branch, or subsidiary of a tobacco manufacturer. In addition, it includes business associations, front groups or other non-state actors such as foundations representing or funded largely by any of the afore-mentioned entities.  
                      </p>
                      <p>
                        *** The term “ultra-processed and HFSS food and beverages industry” relates to manufacturers of nutrient poor foods and beverages, including high in fat, sugar, and/or salt (HFSS) including sweetened drinks, sweet or savory packaged or unpackaged snacks, infant formulas, follow-on milks and other baby food products, reconstituted meat products and pre-prepared frozen dishes, which are not modified foods but formulations made mostly or entirely from substances derived from foods and additives. In addition, it includes business associations, front groups or other non-state actors representing or funded largely by any of the afore- mentioned entities.
                      </p>
                  </filedset>
                `);
            } else if (element.group.id == 22) {
              if ($('#category-reminder').val() == 95) {
                $("#registration-form").append(`
                  <filedset class="col-lg-9 col-md-9" style="margin-top: 15px;">
                    <legend class="h4">Participant Travel Grants Terms and Conditions</legend>
                    <h6 class="legend-blue">Congratulations! You are eligible to receive a travel grant.</h6>
                    <p>Should you not require this travel grant, please let us know so we can allocate it to someone else.</p>
                    <p><strong>IMPORTANT:</strong> To access this grant, you should accept these terms and conditions by 29<sup>th</sup> November 2024. After this date, we might allocate it to someone else. Please note that once accepted, travel grants are non-transferable.</p>
                    <h6 class="legend-blue">The Forum travel grant provides:</h6>
                    <ul style="margin-left: 35px;font-size: 12px;">
                      <li>A round-trip economy class ticket from your home airport to Kigali. Deviations and extended layovers incurring additional costs will be at your own expense.</li>
                      <li>4-nights accommodation including breakfast and WiFi at an allocated hotel in Kigali. Additional nights will be entirely at your expense.</li>
                      <li>Ground transportation in Kigali between airport, hotel and Forum venue.</li>
                    </ul>
                    <h6 class="legend-blue">Flights</h6>
                    <p>Upon completion of your registration, the travel agency will be in touch with you regarding your flight options. Please work with the travel team to identify the itinerary that works well and remains within the travel guidelines listed above.</p>
                    <p><strong>PLEASE NOTE:</strong> You will have 2 weeks from the date the agent sends you the itinerary to choose a flight, otherwise the travel grant will be allocated to another participant.</p>
                    <h6 class="legend-blue">Visas</h6>
                    <p>Travellers should hold a genuine acceptable travel document such as a passport, valid not less than 6 months beyond the date of entry to Rwanda. It is your responsibility to check the Rwandan entry requirements and transit requirements of all countries you transit through to Rwanda and arrange your visa(s), as required and at your expense.</p>
                    <p>Citizens of country members to the African Union, Commonwealth and La Francophonie can get free visas upon arrival in Rwanda for a visit of 30 days. Specific visa requirements will be available after you have completed registration.</p>
                    <h6 class="legend-blue">Ground transportation</h6>
                    <p>On arrival, you will be brought to your hotel from the airport with the Forum transfer shuttle buses. These buses will also bring all participants to and from the venue each day. Please note that ground transportation in your home country is your responsibility to arrange and pay for.</p>
                    <h6 class="legend-blue">Accommodation and additional expenses</h6>
                    <p>The Forum organisers kindly ask you to note that any additional nights spent in the hotel and any personal expenses (vaccines, insurance, meals, laundry, spa services, phone calls, mini-bar, etc.) will be your responsibility. Forum organisers will not be able to reimburse any accommodation expenses at hotels other than the allocated hotel.</p>
                    <h6 class="legend-blue">Medical Care and Insurance</h6>
                    <p>The NCDA and RNCDA cannot assume responsibility for any medical expenses that you may incur during the Forum, nor can the organisers grant compensation in the event of accident, disability or death. It is, therefore, requested that you insure against these risks. It is the responsibility of the delegate to secure travel health insurance to support with any eventualities, including medical emergencies, for the duration of their trip.</p>
                    <h6 class="legend-blue">Cancellation of Participation</h6>
                    <p>Should you have to cancel your participation in the Forum, you commit to let us know as soon as possible.</p>
                    <p>
                      <input id="consent-four" type="checkbox" /> <span class="text-danger">*</span>
                      I have read, understood and accept the above Terms and Conditions and accept the Forum Travel Grant.
                    </p>
                  </filedset>
                `);
              } else if ($('#category-reminder').val() == 96) {
                $("#registration-form").append(`
                  <filedset class="col-lg-9 col-md-9" style="margin-top: 15px;">
                    <legend class="h4">Participant Travel Grants Terms and Conditions</legend>
                    <h6 class="legend-blue">Congratulations! You are eligible to receive a travel grant. Should you not require this travel grant, <a href="mailto:globalforum@ncdalliance.org" target="_blank">please let us know</a> so we can allocate it to someone else</h6>
                    <p><b>IMPORTANT: To access this grant, you should accept these terms and conditions by 29<sup>th</sup> November 2024. After this date, we might allocate it to someone else. Please note that once accepted, travel grants are non-transferable.</b></p>
                    <h6 class="legend-blue">The Forum travel grant provides:</h6>
                    <ul style="margin-left: 35px;font-size: 12px;">
                      <li>A round-trip economy class ticket from your home airport to Kigali. Deviations and extended layovers incurring additional costs will be at your own expense.</li>
                      <li>4-nights accommodation including breakfast and WiFi at an allocated hotel in Kigali. Additional nights will be entirely at your expense.</li>
                      <li>Ground transportation in Kigali between airport, hotel and Forum venue.</li>
                    </ul>
                    <h6 class="legend-blue">Flights</h6>
                    <p>Upon completion of your registration, the travel agency will be in touch with you regarding your flight options. Please fill in the details below and our travel agency will be in touch with you soon.</p>
                    <p><strong>PLEASE NOTE: You will have 2 weeks from the date the agent sends you the itinerary to choose a flight, otherwise the travel grant will be allocated to another participant.</strong></p>
                    <h6 class="legend-blue">Visas</h6>
                    <p>Travellers should hold a genuine acceptable travel document such as a passport, valid not less than 6 months beyond the date of entry to Rwanda. It is your responsibility to check the <a href="https://www.migration.gov.rw/our-services/visa-issued-under-special-arrangement" target="_blank">Rwandan entry requirements</a> and transit requirements of all countries you transit through to Rwanda and arrange your visa(s), as required.  The NCDA will transfer a flat fee of $50 to you after the Forum to help cover the costs. Specific visa requirements will be available after you have completed registration.</p>
                    <p>Citizens of country members to the African Union, Commonwealth and La Francophonie can get free visas upon arrival in Rwanda for a visit of 30 days. Specific visa requirements will be available after you have completed registration.</p>
                    <h6 class="legend-blue">Ground transportation</h6>
                    <p>On arrival, you will be brought to your hotel from the airport with the Forum transfer shuttle buses. These buses will also bring all participants to and from the venue each day. Please note that ground transportation in your home country is your responsibility to arrange and pay for.</p>
                    <h6 class="legend-blue">Accommodation and additional expenses</h6>
                    <p>The Forum organisers will pay a daily stipend to help cover your meals and incedential expenses onsite. Kindly note that any additional nights spent in the hotel and any personal expenses (vaccines, insurance, meals, laundry, spa services, phone calls, mini-bar, etc.) will be your responsibility.</p>
                    <p>Forum organisers will not be able to reimburse any accommodation expenses at hotels other than the allocated hotel.</p>
                    <h6 class="legend-blue">Medical Care and Insurance</h6>
                    <p>If you do not already have international medical insurance, the NCDA will purchase a policy for you for the duration of your travel <u>for the Forum</u>.</p>
                    <p>If you extend your travel, change your travel plans or travel outside of Kigali, the Forum policy will not cover you so you would need to purchase a distinct policy.</p>
                    <h6 class="legend-blue">Cancellation of Participation</h6>
                    <p>Should you have to cancel your participation in the Forum, you commit to let us know as soon as possible.</p>
                    <p>
                      <input id="consent-four" type="checkbox" /> <span class="text-danger">*</span>
                      I have read, understood and accept the above Terms and Conditions and accept the Forum Travel Grant.
                    </p>
                  </filedset>
                `);
              }
            } else if (element.group.id == 15) {
              $("#registration-form").append(`
                  <filedset class="col-lg-9 col-md-9" style="margin-top: 15px;">
                    <legend class="h4">${group_name}</legend>
                    <p>Please provide contact details in case of an emergency during your time at the Forum.</p>
                    <div class="row">
                      ${groupInputs}
                    </div>
                  </filedset>
            `);
            } else if (element.group.id == 17) {
              $("#registration-form").append(`
                  <filedset class="col-lg-9 col-md-9" style="margin-top: 15px;">
                    <legend class="h4">${group_name}</legend>
                     <div class="row">
                      ${groupInputs}
                    </div>
                  </filedset>
            `);
            } else {
              $("#registration-form").append(`
                  <filedset class="col-lg-9 col-md-9" style="margin-top: 15px;">
                  <legend class="h4">${group_name}</legend>
                    <div class="row">
                      ${groupInputs}
                    </div>
                  </filedset>
                `);
            }
            $(".nav-link").on("click", function () {
              let step = parseInt($(this).attr("id").split("-")[1]);

              $(".registration-step").addClass("d-none");

              $(
                `.registration-step[data-registration-step="${step}"]`
              ).removeClass("d-none");
            });
          });

          files_returned !== undefined ||
            (files_returned.length > 0 &&
              files_returned.forEach((file) => {
                const { input, value } = file;
                if (input.inputtype.id == 7) {
                  urlToFileObject(value)
                    .then(async (file) => {
                      if (file) {
                        fileSelect(input.inputcode, "image", false, file);
                      }
                    })
                    .catch((error) => {
                      console.error("Error:", error);
                    });
                }

                if (input.inputtype.id == 6) {
                  urlToFileObject(value)
                    .then(async (file) => {
                      if (file) {
                        fileSelect(input.inputcode, "file", false, file);
                      }
                    })
                    .catch((error) => {
                      console.error("Error:", error);
                    });
                }
              }));
          if ($("#registration-form").hasClass("multi-step")) {
            let stepsCount =
              $("#registration-form").children("filedset").length;

            $("#registration-form")
              .children("filedset")
              .each(function (element) {
                $(this).attr("data-registration-step", element);
                $(this).addClass("registration-step");
                $(this).children("legend");

                if (element !== 0) {
                  $(this).addClass("d-none");
                }

                if (element === stepsCount - 1) {
                  $(this).append(`
                  <div class="col-lg-12 col-md-12 mx-auto place-order d-flex justify-content-between mt-3">
                    <button type="button" class="prev_btn top-btn" onclick="prevStep(${element})">Previous</button>
                      <button type="submit" class="primary-btn top-btn">Submit</button>
                  </div>
                `);
                } else if (element === 0) {
                  $(this).append(`
                  <div class="col-lg-12 col-md-12 mx-auto place-order d-flex justify-content-start mt-3">
                      <button type="button" class="primary-btn top-btn" onclick="nextStep(${element})">Next</button>
                  </div>
                `);
                } else {
                  $(this).append(`
                  <div class="col-lg-12 col-md-12 mx-auto place-order d-flex justify-content-between mt-3">
                      <button type="button" class="prev_btn top-btn" onclick="prevStep(${element})">Previous</button>
                      <button type="button" class="primary-btn top-btn" onclick="nextStep(${element})">Next</button>
                  </div>
                `);
                }
              });
          } else {
            $("#registration-form").append(`
                <div class="col-lg-10 col-md-8 mx-auto mb-4 place-order mt-3">
                    <button type="submit" class="primary-btn top-btn">Update</button>
                </div>
              `);
          }
          $("#ticket_id").val(res.record_unique_data.ticket_id);
          $("#registration_update_token").val(
            res.record_unique_data.registration_update_token
          );
          $("#order_id").val(res.record_unique_data.badge_id);
          $("#payment_token").val();
          // $("#payment_session").val();
          $("#acknowleadgment").val();
          $("#attendence_type").val(res.record_unique_data.attendence_type);
          $("#registration-form").show();
          $(".view-detailo-containers").hide();
          $(".form-control").on("blur", function () {
            if ($(this).val() !== null && $(this).val().length > 0) {
              $(this).is("select") && $(this).select2("close");
              $(this).addClass("has-value");
            } else {
              $(this).is("select") && $(this).select2("open");
              $(this).removeClass("has-value");
            }
          });
          $("select").select2({
            minimumInputLength: 0,
          });
          $("#div-input_id_21576,#div-input_id_35129")
            .parent()
            .parent()
            .addClass("col-md-6 pr-0");
          $("#div-input_id_35129").parent().addClass("pr-0");
          $("#div-input_id_21576,#div-input_id_35129")
            .parent()
            .parent()
            .removeClass("col-12");

          $("#input_id_52307").on("keyup", function () {
            const emailInput = $(this);
            const email = emailInput.val().trim();
            const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
            if (!regex.test(email)) {
              console.log("fails");
              emailInput.addClass("error-input");
            } else {
              emailInput.removeClass("error-input");
            }
          });

          let maxWords = 250;
          $("textarea").on("input", function () {
            let id = $(this).attr("id");
            console.log(id);
            var words = this.value.match(/\S+/g).length;
            if (words > maxWords) {
              var trimmed = $(this).val().split(/\s+/, maxWords).join(" ");
              $(this).val(trimmed + " ");
            }
            console.log(maxWords - words);
            $("#" + id + "-wordCount").text(
              `${maxWords - words} remaining words`
            );
          });
          $("#input_id_75031").on("change", function () {
            if ($(this).val() !== null && $(this).val() !== "") {
              $('#paymentmethod-reminder').val($(this).val())
              $("#notification-image").attr("src", "img/payment.gif");
              $("#message-header").text("Authenticating Payment Request...");
              $("#message-description").text(
                "Authentication in progress. We are currently verifying and validating your payment request to ensure its authenticity and security."
              );
              $("#closing_modal").hide();
              $("#staticBackdrop").modal("show");
              $("#payment_action_name").html("");
              let data = getFormInputData();
              data.append("payment_method", $(this).val());
              data.append("event_code", event_code);
              data.append("appication_id", "Registration");
              var xhr = new XMLHttpRequest();
              xhr.withCredentials = true;
              xhr.addEventListener("readystatechange", function () {
                if (this.readyState === 4) {
                  $(".loading-overlay").removeClass("is-active");
                  let res = JSON.parse(this.responseText);
                  switch (this.status) {
                    case 200:
                      if (res.data.result == true) {
                        $("#notification-image").attr(
                          "src",
                          "img/accepted-payment.gif"
                        );
                        $("#message-header").text("Payment Request Accepted");
                        if (res.data.direct_payment == "true") {
                          $("#message-description").text(
                            "Click 'Pay Now' to proceed to our secure payment platform. You will not be able to exit the page or make edits to your registration after this point, so please have your card details ready."
                          );
                          $("#payment_action_name").html(`
                            <button type="button" id="closing_modal" onclick="resetPayment()" class="searchBoxToggler primary-btn top-btn style2" data-dismiss="modal">Edit</button>
                            <button type="button" onclick="callPaymentUI()" class="searchBoxToggler primary-btn top-btn style2" >Pay Now</button>
                          `);
                        } else {
                          $("#order_id").val("");
                          $("#message-description").text(
                            "Your payment request has been accepted, you will be sent a payment order to your email address with further instructions."
                          );
                          $("#payment_action_name").html(`
                            <button type="button" id="closing_modal" onclick="resetPayment()" class="searchBoxToggler primary-btn top-btn style2" data-dismiss="modal">Edit</button>
                            <button type="button" onclick="submitForm()" class="searchBoxToggler primary-btn top-btn style2" data-dismiss="modal">Continue</button>
                          `);
                        }
                      } else {
                        $("#notification-image").attr(
                          "src",
                          "img/payment-failed-error.gif"
                        );
                        $("#message-header").text(
                          "We currently do not accept this payment method"
                        );
                      }
                      break;
                    case 400:
                      if (!Array.isArray(res.message)) {
                        $("#notification-image").attr(
                          "src",
                          "img/payment-failed-error.gif"
                        );
                        $("#message-header").text(
                          "We currently do not accept this payment method"
                        );
                        $("#message-description").text(
                          "We do not currently accept this payment method. Please choose an alternative payment method during checkout."
                        );
                        $("#payment_action_name").html(`
                          <button type="button" id="closing_modal" onclick="resetPayment()" class="searchBoxToggler primary-btn top-btn style2 col-12" data-dismiss="modal">Try another method</button>
                        `);
                      } else {
                        $("#notification-image").attr(
                          "src",
                          "img/validation.gif"
                        );
                        $("#message-header").text("Validation Error");
                        $("#message-description").text(
                          "Kindly check the following errors and try again."
                        );
                        $("#payment_action_name").html(`
                          <button type="button" id="closing_modal" onclick="resetPayment()" class="searchBoxToggler primary-btn top-btn style2 col-12" data-dismiss="modal">Edit</button>
                        `);
                        displayErrors(JSON.parse(this.responseText));
                      }
                      break;
                  }
                }
              });
              xhr.open("POST", `${request_host}/Api/Validate-Payment-Method`);
              xhr.send(data);
            }
          });
          $("#div-input_id_1709559023").addClass("removed");
          $("#input_id_1709558928").on("change", function () {
            if ($(this).val() == "Yes") {
              $("#div-input_id_1709559023").removeClass("removed");
            } else {
              $("#div-input_id_1709559023").addClass("removed");
            }
          });
          $("#div-input_id_1711030600").addClass("removed");
          $("#input_id_1711030540").on("change", function () {
            if ($(this).val() == "Yes") {
              $("#div-input_id_1711030600").removeClass("removed");
            } else {
              $("#div-input_id_1711030600").addClass("removed");
            }
          });
          $("select").on("select2:open", function () {
            $(".select2-search__field").attr("placeholder", "Search");
            $(this).siblings(".select-labels").addClass("select-labels-active");
          });
          $("select").on("select2:close", function () {
            if ($(this).val() === null || $(this).val() === "") {
              $(".select-labels").removeClass("select-labels-active");
            }
          });
          $('input[type="date"]').pickadate({
            weekdaysShort: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
            showMonthsShort: true,
            selectYears: 150,
            selectMonths: true,
            // min: ($(this).attr('id') == 'input_id_1709560389') ? null : new Date(),
            onOpen: function () {
              const id = $(this)[0]["$node"][0].id;
              $(`#${id}`)
                .siblings(".select-labels")
                .addClass("select-labels-active");
            },
            onClose: function () {
              const id = $(this)[0]["$node"][0].id;
              if ($(`#${id}`).val() === "") {
                $(`#${id}`)
                  .siblings(".select-labels")
                  .removeClass("select-labels-active");
              }
            },
          });

          if ($('#input_id_1707979021').length) {
            // $('#input_id_1707979021').pickadate('picker').set('min', new Date(2008, 0, 1));
            $('#input_id_1707979021').pickadate('picker').set('max', new Date(2007, 11, 31));
          }

          $('input[type="time"]').pickatime({
            format: "HH:i",
            interval: 15,
            onOpen: function () {
              const id = $(this)[0]["$node"][0].id;
              $(`#${id}`)
                .siblings(".select-labels")
                .addClass("select-labels-active");
            },
            onClose: function () {
              const id = $(this)[0]["$node"][0].id;
              if ($(`#${id}`).val() === "") {
                $(`#${id}`)
                  .siblings(".select-labels")
                  .removeClass("select-labels-active");
              }
            },
          });
          $('input[type="number"]').on("input", function () {
            let filteredValue = $(this)
              .val()
              .replace(/[^0-9]/g, "");
            $(this).val(filteredValue);
          });

          $('select, input[type="checkbox"], input[type="radio"]').on(
            "change click",
            function () {
              let div_length =
                $(this).attr("data-input-type") == 2 ? "6" : "10";
              let name = $(this).attr('name')
              let inpId;
              // ($(this).attr("data-input-type") !== 2) ? $(`#other-${$(this).attr("data-input-code")}`).addClass('ml-4 mt-3') : null;
              if ($(this).val().toUpperCase() === "OTHER") {

                $(this)
                  .parent()
                  .parent()
                  .removeClass("col-lg-12 col-md-12")
                  .addClass(`col-lg-${div_length} col-md-${div_length}`);
                if ($(this).attr("data-input-type") == 16) {
                  if ($('input[type="checkbox"][name="' + name + '"][value="Other"]').prop('checked')) {
                    $(`#other-${$(this).attr("data-input-code")}-div`)
                      .parent()
                      .removeClass("d-none")
                      .addClass(`col-lg-${div_length} col-md-${div_length}`);
                  } else {
                    $(`#other-${$(this).attr("data-input-code")}-div`)
                      .parent()
                      .removeClass(`col-lg-${div_length} col-md-${div_length}`)
                      .addClass("d-none");
                    $(`#other-${$(this).attr("data-input-code")}`).val("");
                  }
                } else {
                  $(`#other-${$(this).attr("data-input-code")}-div`)
                    .parent()
                    .removeClass("d-none")
                    .addClass(`col-lg-${div_length} col-md-${div_length}`);
                }
              } else {
                $(this)
                  .parent()
                  .parent()
                  .removeClass(`col-lg-${div_length} col-md-${div_length}`)
                  .addClass("col-lg-9 col-md-12");
                if (
                  $(this).attr("data-input-type") == 16 ||
                  $(this).attr("data-input-type") == 15
                ) {
                  $(this).parent().parent().addClass("p-0");
                }
                if ($(this).attr("data-input-type") == 16 && !$('input[type="checkbox"][name="' + name + '"][value="Other"]').prop('checked')) {
                  $(`#other-${$(this).attr("data-input-code")}-div`)
                    .parent()
                    .removeClass(`col-lg-${div_length} col-md-${div_length}`)
                    .addClass("d-none");
                  $(`#other-${$(this).attr("data-input-code")}`).val("");
                }
              }
            }
          );

          let phone_inputs = document.querySelectorAll("input[type='tel']");
          phone_inputs.forEach(function (phone_input) {
            var iti = window.intlTelInput(phone_input, {
              initialCountry: "us",
              preferredCountries: ["us", "gb", "fr", "rw"],
              separateDialCode: true,
              placeholderNumberType: "FIXED_LINE",
              nationalMode: true,
              customPlaceholder: function () {
                return "";
              },
              formatOnDisplay: true,
              utilsScript: "intelinpt/js/utils.js",
            });

            phone_input.addEventListener("input", function () {
              let filteredValue = phone_input.value.replace(/[^0-9]/g, "");
              phone_input.style.paddingLeft = "95px";
              if (filteredValue.length > 16) {
                filteredValue = filteredValue.slice(0, 16);
              }
              phone_input.value = filteredValue;

              console.log(filteredValue);
            });
          });
          setTimeout(() => {
            initialize_payment();
          }, 1500);
          break;
        default:
          // location.href = "index.html";
          break;
      }
    }
  });

  xhr.open("POST", `${request_host}/Api/Registration-Form-Data-Retriever`);
  localStorage.getItem("token") &&
    xhr.setRequestHeader("Authorization", `${localStorage.getItem("token")}`);
  xhr.send(data);
});

function resetToken() {
  const token = location?.href.split("=")[1];
  var xhr = new XMLHttpRequest();
  var lang =
    currentLanguage === "en"
      ? "english"
      : currentLanguage === "fr"
        ? "french"
        : "unknown";
  var data = JSON.stringify({
    event_code: event_code,
    email: $("#emailToken").val(),
    registration_update_token: token,
    user_language: "english",
  });

  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === 4) {
      var res = JSON.parse(xhr.response);
      switch (this.status) {
        case 200:
          $(".loading-overlay").addClass("is-active");

          $("#registration-form").html(`
              <div class="col-12 card-boxed text-center">
                <img src="img/succes.gif" class="img-fluid">
                <h1>Thank you!</h1>
                <p>${res.message}</p>
                <button class="primary-btn top-btn mt-3 reload-button">Close</button>
              </div>
              `);

          $(".loading-overlay").removeClass("is-active");
          $("#registernow_text").hide();
          // $(".reload-button").redirect("index.html");
          break;
        case 400:
          $(".loading-overlay").addClass("is-active");
          $("#register_text").hide();
          $("#registration-form").prepend(`
              <div class="col-lg-10 mx-auto alert alert-danger alert-dismissible show row" role="alert" id="notification-draw">
                <button type="button" style="padding: 0 8px;margin-top: 4px; border: none;" class="btn btn-outline-danger float-end" data-dismiss="alert">
                  <i class="fa fa-times"></i>
                </button>
                <p class="m-0 mt-2 alert-danger text-capitalize"> ${res.message.join(
            ", "
          )}</p>
              </div>
            `);
          $(".loading-overlay").removeClass("is-active");
          $("#wentwrong").hide();

          break;
        default:
      }
    }
  });

  xhr.open("PATCH", `${request_host}/Api/Registration-Update-Link-Request`);
  xhr.send(data);
}

function getCategories(event_type) {
  $(".loading-overlay").toggleClass("is-active");
  closingreg_text =
    currentLanguage === "fr"
      ? "Clôture des inscriptions"
      : "Registrations close on";
  earlybird_text =
    currentLanguage === "fr"
      ? "L'inscription hâtive se termine le"
      : "Early bird registration ends on";

  var data = new FormData();
  data.append("event_code");
  data.append("attendence", event_type);
  var xhr = new XMLHttpRequest();
  register_btn = currentLanguage === "fr" ? "mise à jour" : "Update";
  // $("#category").append(`<option value="" selected disabled></option>`)
  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === 4 && this.status === 200) {
      $(".loading-overlay").toggleClass("is-active");
      var res = JSON.parse(xhr.response);
      $("#attendence_type").val(event_type);
      res.data.forEach((element) => {
        category_name =
          currentLanguage == "fr" ? element.name_french : element.name_english;
        $("#category").append(
          `<option value="${element.id}">${category_name}</option>`
        );
      });
    }
  });
  xhr.open("POST", `${request_host}/Api/Display-Registration-Categories`);
  xhr.send(data);
}

function initialize_payment(update_session = false) {
  let data = new FormData();
  const token = location?.href.split("=")[1];
  data.append("category", $("#ticket_id").val());
  data.append("attendence", "PHYSICAL");
  data.append("regidtration_update_token", token);
  data.append("application", "registration");
  let payment_data = new XMLHttpRequest();
  payment_data.addEventListener("readystatechange", function () {
    if (this.readyState === 4) {
      let res = JSON.parse(this.responseText);
      switch (this.status) {
        case 200:
          if (res.data.result === "SUCCESS") {
            $("#payment_token").val(res.data.token);
            $("#registration_update_token").val(token);
            $("#payment_session").val(res.data.payment_session);
            $("#order_id").val(res.data.orderId);
            if (update_session) {
              callPaymentUI();
            }
          } else {
            $("#notification-image").attr("src", "img/website-maintenance.gif");
            $("#message-header").text("Online Payment Portal Unreachable");
            $("#message-description").text(
              "We are sorry for the inconvenience, our payment gateway is unreachable at the moment, please try again later."
            );
            $("#staticBackdrop").modal("show");
            $("#payment_action_name").html(
              `<button type="button" id="closing_modal" class="searchBoxToggler primary-btn top-btn style2 col-12" data-dismiss="modal">Close</button>`
            );
          }
          break;
        default:
          $("#notification-image").attr("src", "img/website-maintenance.gif");
          $("#message-header").text("Online Payment Portal Unreachable");
          $("#message-description").text(
            "We are sorry for the inconvenience, our payment gateway is unreachable at the moment, please try again later."
          );
          $("#staticBackdrop").modal("show");
          $("#payment_action_name").html(
            `<button type="button" id="closing_modal" class="searchBoxToggler primary-btn top-btn style2 col-12" data-dismiss="modal">Close</button>`
          );
          break;
      }
    }
  });
  payment_data.open(
    "POST",
    `${request_host}/Api/Initiate-Gateway-Session`,
    true
  );
  payment_data.send(data);
}

function nextStep(currentStep) {
  let nextStep = currentStep + 1;
  $("html, body").animate(
    {
      scrollTop: $("#registration-form").offset().top - 100,
    },
    1000
  );

  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  let isEmailValid = regex.test($("#input_id_52307").val());

  if ($("#input_id_68550").val() == "") {
    $("#input_id_68550").addClass("error-input");
  }

  let inputFields = $(
    `.registration-step[data-registration-step="${currentStep}"] input, .registration-step[data-registration-step="${currentStep}"] select, .registration-step[data-registration-step="${currentStep}"] textarea`
  );

  let requiredFields = inputFields.filter(function () {
    return $(this).prop("required");
  });

  let filledFields = requiredFields.filter(function () {
    return $(this).val().trim() !== "";
  });

  if (currentStep == 3 && $("#input_id_1709560123").length) {
    isEmailValid = regex.test($("#input_id_1709560123").val());
  }

  var regexUrl = /^(http|https):\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(?:\/[^\/]*)*$/;
  let xValid = ($('#input_id_1714402245').val() == '') ? true : regexUrl.test($('#input_id_1714402245').val());
  let linked = ($('#input_id_1714402308').val() == '') ? true : regexUrl.test($('#input_id_1714402308').val());
  let insta = ($('#input_id_1714402337').val() == '') ? true : regexUrl.test($('#input_id_1714402337').val());
  let face = ($('#input_id_1714402472').val() == '') ? true : regexUrl.test($('#input_id_1714402472').val());

  if (requiredFields.length === filledFields.length && isEmailValid & xValid & linked & insta & face) {
    $(".loading-overlay").removeClass("is-active");
    $(`.registration-step[data-registration-step="${currentStep}"]`).addClass(
      "d-none"
    );
    $(`.registration-step[data-registration-step="${nextStep}"]`).removeClass(
      "d-none"
    );

    filledFields.each(function () {
      if ($(this).val().trim() !== "") {
        let inputId = $(this).attr("id");
        $("label[for='" + inputId + "']").css("color", "#442374");
        $(this).removeClass("is-invalid");
        $(this).removeClass("error-input");
        $(this).siblings(".invalid-feedback").addClass("d-none");
      }
    });

    let newNumberSpan = `<span class="number mr-2 blue_box"><i class="fa-solid fa-check text-white"></i></span> `;
    $(`#nav-${currentStep}-tab .number`).replaceWith(newNumberSpan);
  } else {
    requiredFields.each(function () {
      $(".loading-overlay").removeClass("is-active");
      if ($(this).val().trim() === "") {
        let inputId = $(this).attr("id");
        $("label[for='" + inputId + "']").css("color", "red");
        $(this).addClass("is-invalid");
        $(this).addClass("error-input");
        $(this).siblings(".invalid-feedback").removeClass("d-none");
      }
    });
  }
}

function prevStep(currentStep) {
  let previousStep = currentStep - 1;
  $("html, body").animate(
    {
      scrollTop: $("#registration-form").offset().top - 100,
    },
    1000
  );
  $(`.registration-step[data-registration-step="${currentStep}"]`).addClass(
    "d-none"
  );
  $(`.registration-step[data-registration-step="${previousStep}"]`).removeClass(
    "d-none"
  );

  $(`#nav-${previousStep}-tab`).tab("show");
}

function isItRequired(input) {
  return input.is_mandatory == "YES" ? "*" : "";
}

function setRequired(input) {
  return input.is_mandatory == "YES" ? "required" : "";
}

function has_other_input(input, inputname) {
  if (input.allow_other == "YES") {
    return `
      <div class="d-none">
        <div class="form-group" id="other-${input.inputcode}-div">
          <label class="label-form" for="other-${input.inputcode}">Please specify</label>
          <input type="text" class="form-control" data-name="Other ${inputname}" id="other-${input.inputcode}">
        </div>
      </div>
    `;
  } else {
    return "";
  }
}

function inputUI(input_obj) {
  const { input, options, value } = input_obj;
  let input_field = "";
  let option_list = "";
  input_global = currentLanguage == "en" ? input.nameEnglish : input.nameFrench;
  enter_text = currentLanguage == "en" ? "" : "";
  select_text = currentLanguage == "en" ? "" : "";
  switch (true) {
    case input.inputtype.id == 1:
      input_field = `
        <div class="form-group" id="div-${input.inputcode}">
          <label class="label-form" for="${input.inputcode
        }">${enter_text} ${input_global} ${isItRequired(input)}</label>
          <input value="${value}" type="text" class="form-control" data-name="${input_global}" id="${input.inputcode
        }" data-input-type="${input.inputtype.id}" name="${input.inputcode
        }" data-input-code="${input.inputcode}" ${setRequired(input)}></div>    
      `;
      break;
    case input.inputtype.id == 2:
      options.forEach((option) => {
        option_list += `
          <option ${option.contentEnglish == value ? "selected" : ""} value="${option.contentEnglish
          }">${option.contentEnglish}</option>
        `;
      });
      input_field = `
        <div class="form-group">
          <label class="label-form" for="${input.inputcode
        }">${enter_text} ${input_global} ${isItRequired(input)}</label>
          <select class="form-control" data-name="${input_global}" id="${input.inputcode
        }" data-input-type="${input.inputtype.id}" name="${input.inputcode
        }" data-input-code="${input.inputcode}" ${setRequired(input)}>
            <option value="">[Select]</option>
            ${option_list}
          </select>
        </div>    
      `;
      break;
    case input.inputtype.id == 3:
      input_field = `
        <div class="form-group">
            <input  value="${value}" type="color" class="form-control p-0" data-name="${input_global}" id="${input.inputcode
        }" data-input-type="${input.inputtype.id}" name="${input.inputcode
        }" data-input-code="${input.inputcode}" value="#ffffff">
            <label class="custom-button-selector" for="${input.inputcode
        }">click here to select a color</label>
            <label class="form-custom-label" for="${input.inputcode
        }">${enter_text} ${input_global}  ${isItRequired(input)}</label>
        </div>    
      `;
      break;
    case input.inputtype.id == 4:
      input_field = `
        <div class="form-group">
          <label class="label-form" for="${input.inputcode
        }">${enter_text} ${input_global} ${isItRequired(input)}</label>
          <input  value="${value}" type="date" class="form-control" data-name="${input_global}" id="${input.inputcode
        }" data-input-type="${input.inputtype.id}" name="${input.inputcode
        }" data-input-code="${input.inputcode}" ${setRequired(input)}>
        </div>    
      `;
      break;
    case input.inputtype.id == 5:
      input_field = `
        <div class="form-group">
          <label class="label-form" for="${input.inputcode
        }">${enter_text} ${input_global} ${isItRequired(input)}</label>
          <input  value="${value}" type="email" class="form-control" data-name="${input_global}" id="${input.inputcode
        }" data-input-type="${input.inputtype.id}" name="${input.inputcode
        }" data-input-code="${input.inputcode}" ${setRequired(input)}>
        </div>
      `;
      break;
    case input.inputtype.id == 6:
      const filename = "file";
      input_field = `
        <div class="file-upload mb-4 row">
          <label class="label-form px-3" for="${input.inputcode
        }">${enter_text} ${input_global}  ${isItRequired(input)}</label>
          <div class="file-upload-select col-12" id="file-${input.inputcode
        }" onclick="fileSelect('${input.inputcode}', 'file')">
            <div class="file-select-button" >Choose File</div>
            <div class="file-select-name" id="file-${input.inputcode}-name">${filename ? `Uploaded: ${filename}` : `${input_global}...`
        }</div>
            <textarea class="d-none" id="${input.inputcode}-base64"></textarea>
            <input type="file" id="${input.inputcode}" data-input-type="${input.inputtype.id
        }" name="${input.inputcode}" data-name="${input_global}" id="${input.inputcode
        }" data-input-type="${input.inputtype.id}" name="${input.inputcode
        }" data-input-code="${input.inputcode}" ${setRequired(input)} accept="application/pdf">
          </div>
          <div class="col-12 position-relative d-none border text-center m-3 widt-96" id="preview-box-${input.inputcode
        }">
            <span class="pdf-sliders-left btn btn-info text-white" id="prev-page-${input.inputcode
        }"><i class="fas fa-chevron-left"></i></span>
            <span class="pdf-sliders-right btn btn-info text-white" id="next-page-${input.inputcode
        }"><i class="fas fa-chevron-right"></i></span>
            <canvas id="preview-${input.inputcode}"></canvas>
          </div>
        </div>
      `;
      break;
    case input.inputtype.id == 7:
      input_field = `
        <div class="file-upload mb-4 row">
          <label class="label-form col-12" for="${input.inputcode
        }">${input_global}  ${isItRequired(input)}</label>
          <div class="file-upload-select col-12" id="file-${input.inputcode
        }" onclick="fileSelect('${input.inputcode}', 'image')">
            <div class="file-select-button" >Choose File</div>
            <div class="file-select-name" id="file-${input.inputcode
        }-name">${input_global}...</div>
            <textarea class="d-none" id="${input.inputcode}-base64"></textarea>
            <input type="file" id="${input.inputcode}" data-input-type="${input.inputtype.id
        }" name="${input.inputcode}" data-name="${input_global}" id="${input.inputcode
        }" data-input-type="${input.inputtype.id}" name="${input.inputcode
        }" data-input-code="${input.inputcode}" ${setRequired(input)} accept="image/*">
          </div>
          <div class="col-12 border m-3 widt-96 d-none" id="parent-${input.inputcode
        }">
            <img id="preview-${input.inputcode
        }" src="" class="image-previewer-form d-none">
          </div>
        </div>
      `;
      break;
    case input.inputtype.id == 8:
      input_field = `
        <div class="form-group">
          <label class="label-form" for="${input.inputcode
        }">${enter_text} ${input_global} ${isItRequired(input)}</label>
          <input  value="${value}" type="number" class="form-control" data-name="${input_global}" id="${input.inputcode
        }" data-input-type="${input.inputtype.id}" name="${input.inputcode
        }" data-input-code="${input.inputcode}" ${setRequired(input)}>
        </div> 
      `;
      break;
    case input.inputtype.id == 9:
      input_field = `
        <div class="form-group">
          <label class="label-form" for="${input.inputcode
        }">${enter_text} ${input_global} ${isItRequired(input)}</label>
          <input value="${value}" type="password" class="form-control" data-name="${input_global}" id="${input.inputcode
        }" data-input-type="${input.inputtype.id}" name="${input.inputcode
        }" data-input-code="${input.inputcode}" ${setRequired(input)}>
        </div>    
      `;
      break;
    case input.inputtype.id == 10:
      options.forEach((option, index) => {
        option_list += `
          <div class="form-check">
            <label class="label-form" for="${input.inputcode
          }">${enter_text} ${input_global} ${isItRequired(input)}</label>
            <input class="form-check-input"  type="radio" name="${input.inputcode
          }" value="${option.contentEnglish}" data-input-type="${input.inputtype.id
          }" data-name="${input_global}" data-input-code="${input.inputcode
          }" id="checkbox-${option.id}" ${option.contentEnglish == value ? "checked" : ""
          }>
          </div>
        `;
      });
      input_field = `
        <div class="form-group"><label class="form-checkboxes text-capitalize">${input_global}  ${isItRequired(
        input
      )} </label>
            ${option_list}
        </div>
      `;
      break;
    case input.inputtype.id == 12:
      input_field = `
        <div class="form-group">
          <label class="label-form" for="${input.inputcode
        }">${enter_text} ${input_global}  ${isItRequired(input)}</label>
          <input type="tel" class="form-control" data-name="${input_global}" value="${value}" id="${input.inputcode
        }" data-input-type="${input.inputtype.id}" value="${value}" name="${input.inputcode
        }" data-input-code="${input.inputcode}" ${setRequired(input)}>
        </div>    
      `;
      break;
    case input.inputtype.id == 13:
      input_field = `
        <div class="form-group">
          <label class="label-form" for="${input.inputcode
        }">${enter_text} ${input_global} ${isItRequired(input)}</label>
          <input  value="${value}" type="time" class="form-control" data-name="${input_global}" id="${input.inputcode
        }" value="${value}" data-input-type="${input.inputtype.id}" name="${input.inputcode
        }" data-input-code="${input.inputcode}" ${setRequired(input)}>
        </div>    
      `;
      break;
    case input.inputtype.id == 14:
      input_field = `
        <div class="form-group" id="div-${input.inputcode}">
          <label class="label-form" for="${input.inputcode
        }">${enter_text} ${input_global} ${isItRequired(input)}</label>
          <input value="${value}" type="url" value="${value}" class="form-control" data-name="${input_global}" id="${input.inputcode
        }" data-input-type="${input.inputtype.id}" name="${input.inputcode
        }" data-input-code="${input.inputcode}" ${setRequired(input)}>
        </div>    
      `;
      break;
    case input.inputtype.id == 15:
      input_field = `
      <div class="form-group">
        <label class="label-form" for="${input.inputcode
        }">${enter_text} ${input_global} ${isItRequired(
          input
        )} <span class="push-to-left" id="${input.inputcode
        }-wordCount"></span></label>
        <textarea class="form-control" data-name="${input_global}" id="${input.inputcode
        }" data-input-type="${input.inputtype.id}" name="${input.inputcode
        }" data-input-code="${input.inputcode}" ${setRequired(input)}>${value}</textarea>
      </div>
    `;
      break;
    case input.inputtype.id == 16:
      options.forEach((option, index) => {
        if (option.contentEnglish.toUpperCase() != "None of the above") {
          option_list += `
            <div class="form-check">
              <input class="form-check-input"  name="${input.inputcode
            }" type="checkbox" data-input-type="${input.inputtype.id}" ${option.contentEnglish == value ? "checked" : ""
            } value="${option.contentEnglish
            }" data-name="${input_global}" data-input-code="${input.inputcode
            }" id="checkbox-${option.id}">
            <label  class="label-form text-dark" for="checkbox-${option.id
            }">${enter_text} ${option.contentEnglish}</label>
            </div>
          `;
        }

        if (
          input.inputcode == "input_id_1709555701" &&
          option.contentEnglish === "Youth"
        ) {
          option_list += `
            <div class="form-check">
              <input class="form-check-input"  name="${input.inputcode}" type="checkbox" data-input-type="${input.inputtype.id}" value="None of the Above" data-name="${input_global}" data-input-code="${input.inputcode}" id="checkbox-${option.id}-other">
            <label class="label-form text-dark" for="checkbox-${option.id}-other">${enter_text} None of the Above</label>
            </div>
          `;
        }
      });
      input_field = `
        <div class="form-group">
          <label class="label-form mb-3">${input_global}  ${isItRequired(
        input
      )} </label>
          ${option_list}
        </div>
      `;
      break;
    case input.inputtype.id == 17:
      input_field = `
        <div class="form-group">
          <p class="form-control h-auto" id="${input.inputcode}">${input_global}</p>
        </div>    
      `;
      break;
  }
  return `
    <div class="row col-12 my-1">
      <div class="col-lg-12 col-md-12">
        ${input_field}
      </div>      
      ${has_other_input(input, input_global)}
    </div>
  `;
}

function fileSelect(id, type) {
  let fileInput = document.getElementById(id);
  let base64EncodedInput = document.getElementById(id + "-base64");
  let fileSelect = document.getElementById("file-" + id);
  let preview = document.getElementById("preview-" + id);
  let prevButton = document.getElementById("prev-page-" + id);
  let nextButton = document.getElementById("next-page-" + id);
  let pdfDoc = null;
  let pageNum = 1;
  let pageRendering = false;
  let pageNumPending = null;
  fileInput.click();
  fileInput.onchange = async function () {
    $(".loading-overlay").addClass("is-active");
    let file = fileInput.files[0];
    if (file) {
      let selectNameId = "file-" + id + "-name";
      let selectName = document.getElementById(selectNameId);
      selectName.innerText = file.name;
      const reader = new FileReader();
      switch (type) {
        case "image":
          compressImage(file, 1024, 1024, 0.5).then(function (result) {
            preview.setAttribute("src", result);
            base64EncodedInput.value = result;
            preview.classList.remove("d-none");
            document.getElementById("parent-" + id).classList.remove("d-none");
            $(".loading-overlay").removeClass("is-active");
          });
          break;
        case "file":
          base64EncodedInput.value = await pdfToBase64(file);
          reader.onload = function () {
            let typedarray = new Uint8Array(this.result);
            pdfjsLib.getDocument(typedarray).promise.then(function (pdfDoc_) {
              pdfDoc = pdfDoc_;
              renderPage(pageNum);
              document
                .getElementById("preview-box-" + id)
                .classList.remove("d-none");
              $(".loading-overlay").removeClass("is-active");
            });
          };
          reader.readAsArrayBuffer(file);
          break;
      }
    }
  };

  function pdfToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        let base64String = reader.result
          .replace("data:", "")
          .replace(/^.+,/, "");
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  }

  function renderPage(num) {
    pageRendering = true;
    pdfDoc.getPage(num).then(function (page) {
      let ctx = preview.getContext("2d");
      let viewport = page.getViewport({
        scale: 1,
      });

      preview.height = viewport.height;
      preview.width = viewport.width;

      let renderContext = {
        canvasContext: ctx,
        viewport: viewport,
      };
      let renderTask = page.render(renderContext);
      renderTask.promise.then(function () {
        pageRendering = false;
        if (pageNumPending !== null) {
          renderPage(pageNumPending);
          pageNumPending = null;
        }
      });
    });
  }

  function queueRenderPage(num) {
    if (pageRendering) {
      pageNumPending = num;
    } else {
      renderPage(num);
    }
  }

  function onPrevPage() {
    if (pageNum <= 1) {
      prevButton.classList.add("disabled-btn");
      return;
    }
    prevButton.classList.remove("disabled-btn");
    pageNum--;
    queueRenderPage(pageNum);
  }

  function onNextPage() {
    if (pdfDoc == null || pageNum >= pdfDoc.numPages) {
      nextButton.classList.add("disabled-btn");
      return;
    }
    nextButton.classList.remove("disabled-btn");
    pageNum++;
    queueRenderPage(pageNum);
  }

  if (
    typeof prevButton !== "undefined" &&
    prevButton !== null &&
    typeof nextButton !== "undefined" &&
    nextButton !== null
  ) {
    prevButton.addEventListener("click", onPrevPage);
    nextButton.addEventListener("click", onNextPage);
  }
}

function getFormInputData() {
  const token = location?.href.split("=")[1];
  let data = new FormData();
  const delegate_data = [];
  const inputs = $("[name^=input_id_]");

  inputs.each(function (index, input) {
    let value_recorded = "";
    if (input.type == "file") {
      value_recorded =
        input.files[0] != undefined
          ? $(`#${$(input).attr("data-input-code")}-base64`).val()
          : "";
    } else if (input.type == "checkbox" || input.type == "radio") {
      if (input.checked) {
        value_recorded = input.value;
      }
    } else {
      let flag = $(input).siblings('.iti__flag-container').children('.iti__selected-flag').text()
      value_recorded = (flag !== '') ? flag + ' ' + input.value : input.value;
    }

    // if (value_recorded != "") {
    delegate_data.push({
      input_code: $(input).attr("data-input-code"),
      input_type: $(input).attr("data-input-type"),
      input_value: value_recorded,
      input_name: $(input).attr("data-name"),
    });
    // }

  });

  data.append("registration_email", $('#input_id_52307').val());
  data.append("first_name", $('#input_id_21576').val());
  data.append("last_name", $('#input_id_35129').val());

  data.append("delegate_data", JSON.stringify(delegate_data));
  data.append("event_code", event_code);
  data.append("ticket_id", $("#ticket_id").val());
  // data.append("order_id", $("#order_id").val().replace("REG-", ""));
  data.append("payment_token", $("#payment_token").val());
  data.append("registration_update_token", token);
  data.append("payment_session", $("#payment_session").val());
  data.append("acknowleadgment", $("#acknowleadgment").val());
  data.append("attendence_type", $("#attendence_type").val());
  data.append(
    "user_language", 'english');
  data.append("accompanied", "NO");
  return data;
}

function submitForm() {
  if (
    $("#consent-one").is(":checked") &&
    $("#consent-two").is(":checked") &&
    $("#consent-three").is(":checked")
  ) {
    console.log(' right access :>> here');
    $(".loading-overlay").addClass("is-active");
    let data = getFormInputData();
    const xhr = new XMLHttpRequest();
    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        setTimeout(() => {
          $(".loading-overlay").removeClass("is-active");
        }, 500);
        $('#staticBackdrop').modal('hide');
        let res = JSON.parse(xhr.response);
        switch (this.status) {
          case 200:
            $(".sidebar, #banner-remove").addClass("d-none");
            console.log('-------+++++++++++++ SUCCESS ++++++++------')
            if ($('#category-reminder').val() == '95' || $('#category-reminder').val() == '96') {
              $("#registration-form").html(`
                <div class="col-lg-12 purple_pg p-5 mb-5 text-center">
                  <p class="text-white">Thank you for registering for the 2025 Global NCD Alliance Forum.</p>
                  <p class="text-white">Your accommodation in one of the partner hotels will also be secured as soon as your flight ticket is booked. You will receive your booking confirmation via email.</p>
                  <p class="yellow_col h6">We look forward to welcoming you to Kigali!  </p>
                  <p><a class="text-white" href="travel.html">For now, discover more:</a></p>
                  <div>
                    <ul class="no-bullet">
                      <li class="my-4"><a style="color: #a91451 !important;" class="yellow_bg_button" href="https://forum.ncdalliance.smartevent.rw/travel.html">Practical information about Rwanda and Kigali</a></li>
                      <li class="my-4"><a style="color: #a91451 !important;" class="yellow_bg_button" href="https://forum.ncdalliance.org/">Back to the Forum website</a></li>
                    </ul>
                  </div>
                </div>
              `);
            } else if ($('#category-reminder').val() == '89' || $('#category-reminder').val() == '143') {
              $("#registration-form").html(`
                <div class="col-lg-12 purple_pg p-5 mb-5 text-center">
                  <p class="text-white">Thank you for registering for the 2025 Global NCD Alliance forum.</p>
                  <p class="yellow_col h6">We look forward to welcoming you to Kigali!  </p>
                  <p><a class="text-white" href="travel.html">For now, discover more:</a></p>
                  <div>
                    <ul class="no-bullet">
                      <li class="my-4"><a style="color: #a91451 !important;" class="yellow_bg_button" href="https://forum.ncdalliance.smartevent.rw/travel.html">Practical information about Rwanda and Kigali</a></li>
                      <li class="my-4"><a style="color: #a91451 !important;" class="yellow_bg_button" href="https://smartbookings.rw/Event-Hotels/65c61e2854bc4">Book your accommodation </a></li>
                      <li class="my-4"><a style="color: #a91451 !important;" class="yellow_bg_button" href="https://forum.ncdalliance.org/">Back to the Forum website</a></li>
                    </ul>
                  </div>
                </div>
              `);
            } else if ($('#category-reminder').val() == '92' && $('#paymentmethod-reminder').val() == 'Online Payment') {
              $("#registration-form").html(`
                <div class="col-lg-12 purple_pg p-5 mb-5 text-center">2025
                <p class="text-white">Thank you for completing your secure online payment and registering for the 2025 Global NCD Alliance forum.</p>
                <p class="yellow_col h6">We look forward to welcoming you to Kigali!  </p>
                <p><a class="text-white" href="travel.html">For now, discover more:</a></p>
                  <div>
                    <ul class="no-bullet">
                      <li class="my-4"><a style="color: #a91451 !important;" class="yellow_bg_button" href="https://forum.ncdalliance.smartevent.rw/travel.html">Practical information about Rwanda and Kigali</a></li>
                      <li class="my-4"><a style="color: #a91451 !important;" class="yellow_bg_button" href="https://smartbookings.rw/Event-Hotels/65c61e2854bc4">Book your accommodation </a></li>
                      <li class="my-4"><a style="color: #a91451 !important;" class="yellow_bg_button" href="https://forum.ncdalliance.org/">Back to the Forum website</a></li>
                    </ul>
                  </div>
                </div>
              `);
            } else if ($('#category-reminder').val() == '92' && $('#paymentmethod-reminder').val() == 'Bank Transfer') {
              $("#registration-form").html(`
                <div class="col-lg-12 purple_pg p-5 mb-5 text-center">
                  <p class="text-white">Thank you for submitting your details and selecting the option to pay by bank transfer. You will be sent a payment order to your email address with further instructions, after which your registration will be complete. </p>
                  <p class="text-white">Please  <a href="https://smartbookings.rw/Event-Hotels/65c61e2854bc4">click here</a> to book your accommodation at one of the conference hotels. All delegates staying at official conference hotels will have free daily transportation to and from the Forum venue.</p>
                  <p class="yellow_col h6">We look forward to welcoming you to Kigali!  </p>
                  <p><a class="text-white" href="travel.html">For now, discover more:</a></p>
                  <div>
                    <ul class="no-bullet">
                      <li class="my-4"><a style="color: #a91451 !important;" class="yellow_bg_button" href="https://forum.ncdalliance.smartevent.rw/travel.html">Practical information about Rwanda and Kigali</a></li>
                      <li class="my-4"><a style="color: #a91451 !important;" class="yellow_bg_button" href="https://smartbookings.rw/Event-Hotels/65c61e2854bc4">Book your accommodation</a></li>
                      <li class="my-4"><a style="color: #a91451 !important;" class="yellow_bg_button" href="https://forum.ncdalliance.org/">Back to the Forum website</a></li>
                    </ul>
                  </div>
                </div>
              `);
            } else if ($('#category-reminder').val() == '150' && $('#paymentmethod-reminder').val() == 'Bank Transfer') {
              $("#registration-form").html(`
                <div class="col-lg-12 purple_pg p-5 mb-5 text-center">
                  <p class="text-white">Thank you for submitting your details and selecting the option to pay by bank transfer. You will be sent a payment order to your email address with further instructions, after which your registration will be complete. </p>
                  <p class="text-white">Please  <a href="https://smartbookings.rw/Event-Hotels/65c61e2854bc4">click here</a> to book your accommodation at one of the conference hotels. All delegates staying at official conference hotels will have free daily transportation to and from the Forum venue.</p>
                  <p class="yellow_col h6">We look forward to welcoming you to Kigali!  </p>
                  <p><a class="text-white" href="travel.html">For now, discover more:</a></p>
                  <div>
                    <ul class="no-bullet">
                      <li class="my-4"><a style="color: #a91451 !important;" class="yellow_bg_button" href="https://forum.ncdalliance.smartevent.rw/travel.html">Practical information about Rwanda and Kigali</a></li>
                      <li class="my-4"><a style="color: #a91451 !important;" class="yellow_bg_button" href="https://smartbookings.rw/Event-Hotels/65c61e2854bc4">Book your accommodation</a></li>
                      <li class="my-4"><a style="color: #a91451 !important;" class="yellow_bg_button" href="https://forum.ncdalliance.org/">Back to the Forum website</a></li>
                    </ul>
                  </div>
                </div>
              `);
            }

            $("html, body").animate(
              {
                scrollTop: $("#registration-form").offset().top - 15,
              },
              500
            );
            $("#registernow_text, #registerUpdate-title").hide();

            break;
          case 400:
            displayErrors(res);
            break;
          case 500:
            $("#registration-form").prepend(`
            <div class="col-lg-10 col-sm-12 col-xs-12 mx-auto alert alert-danger alert-dismissible fade show" role="alert" id="notification-draw">
              <strong>Error!</strong> Internal Server Error
              <button type="button" class="btn-close" data-dismiss="alert" aria-label="Close">
                <i class="fa fa-times"></i>
              </button>
            </div>
            `);
            $("html, body").animate(
              {
                scrollTop: $("#notification-draw").offset().top - 15,
              },
              500
            );
            break;
        }
      }
    });
    xhr.open("POST", `${request_host}/Api/Update-Delegate`);
    xhr.send(data);
  } else {
    displayErrors([
      "Accept the consent and confirm that you have no Conflict of Interest to submit your application. If unable to complete both, we will be unable to accept your application.",
    ]);
    $("html, body").animate(
      {
        scrollTop: $("#notification-draw").offset().top - 15,
      },
      500
    );
  }
}

$("#registration-form").submit(function (e) {
  e.preventDefault();
  if ($("[name^=input_id_]").length > 0) {
    console.log('Sumitttt ---------> ')
    submitForm();
  }
});

function compressImage(file, maxWidth, maxHeight, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };
      img.onerror = (err) => {
        reject(err);
      };
    };
    reader.onerror = (err) => {
      reject(err);
    };
  });
}

function resetPayment() {
  $("#input_id_75031").val("").trigger("change");
  $("#input_id_75031").siblings("label").removeClass("select-labels-active");
  $("#staticBackdrop").modal("hide");
  $("html, body").animate(
    {
      scrollTop: $("#registration-form").offset().top - 15,
    },
    500
  );
}

function callPaymentUI() {
  $("#notification-row").addClass("d-none");
  Checkout.configure({
    session: {
      id: $("#payment_session").val(),
    },
  });
  Checkout.showEmbeddedPage("#payment-target");
  $("#payment-target").css("max-height", "initial");
}

function errorCallback(error) {
  $("#notification-image").attr("src", "img/icons8-cancel.gif");
  $("#message-header").text("Unable to process payment");
  $("#message-description").text(error["error.explanation"]);
  $("#staticBackdrop").modal("show");
  $("#payment_action_name").html(
    `<button type="button" class="searchBoxToggler primary-btn top-btn style2 col-12" onclick="reactualize_session()">Retry</button>`
  );
  $("#payment-target").css("max-height", "initial");
  $("#notification-row").removeClass("d-none");
}

function cancelCallback() {
  $("#notification-image").attr("src", "img/icons8-cancel.gif");
  $("#message-header").text("Payment Cancelled");
  $("#message-description").text(
    "We are sorry for the inconvenience, your payment was cancelled"
  );
  $("#staticBackdrop").modal("show");
  $("#payment_action_name").html(
    `<button type="button" id="closing_modal" class="searchBoxToggler primary-btn top-btn style2 col-12" data-dismiss="modal">Close</button>`
  );
  $("#payment-target").css("max-height", "initial");
  $("#notification-row").removeClass("d-none");
}

function completeCallback(result) {
  if (result.resultIndicator === $("#payment_token").val()) {
    $("#notification-row").removeClass("d-none");
    $("#notification-row").html(`
  <div class="col-12 text-center">
    <img src="img/registration.gif" class="img-fluid" style="height: 20vh;">
    <h6 class="mt-5 text-primary">Do not close or refresh this page, your payment is being processed</h6>
  </div>
  `);
    $("#acknowleadgment").val(result.resultIndicator);
    $("#hc-comms-layer-iframe").remove();
    submitForm();
  } else {
    $("#notification-row").removeClass("d-none");
    $("#notification-row").html(`
      <div class="col-12 text-center">
        <img src="img/registration.gif" class="img-fluid" style="height: 20vh;">
        <h6 class="mt-5">Payement failed, please try again</h6>
      </div>
    `);
    $("#hc-comms-layer-iframe").remove();
  }
}

function reactualize_session() {
  $("#notification-image").attr("src", "img/loading.gif");
  $("#message-header").text("Reactualizing Payment Session");
  $("#message-description").text(
    "Please wait while we reactualize your payment session"
  );
  $("#payment_action_name").html("");
  initialize_payment(true);
}

function displayErrors(res) {
  let errors = "";
  errors += `<li>${res.message}</li>`;
  $("#notification-draw").remove();
  $("#registration-form").prepend(`
  <div class="col-lg-10 mx-auto alert alert-danger alert-dismissible show" role="alert" id="notification-draw">
    <strong>Error!</strong> Kindly fix the erros below and try again
    <button type="button" class="btn bg-transparent" data-dismiss="alert" aria-label="Close">
      <i class="fa fa-times"></i>
    </button>
    <div class="mt-2">
      <ul class="mb-0 list-unstyled">
        ${errors}
      </ul>
    </div>
  </div>
  `);
  $("html, body").animate(
    {
      scrollTop: $("#notification-draw").offset().top - 15,
    },
    500
  );
}
