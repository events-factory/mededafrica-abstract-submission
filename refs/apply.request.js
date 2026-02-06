$(document).ready(function () {
  $('.nturl').on('click', function () {
    const hrefValue = $(this).attr('data-gt-lang');
    if (hrefValue == 'fr') {
      $('#current_language').val('french')
    } else {
      $('#current_language').val('english')
    }
  })

  if($('.gt-lang-code').text() == 'fr') {
    $('#current_language').val('french')
  } else {
    $('#current_language').val('english')
  }

  let progress_submit = false;
  initializeForm();
});
function deactivateLoader() {
  $('body').removeClass('no-scroll');
  $('.overlay').addClass('d-none');
}

function activateLoader() {
  $('body').addClass('no-scroll');
  $('.overlay').removeClass('d-none');
}

let order_id = '';
currentLanguage = 'en';
function initializeForm() {
  activateLoader();
  let xhr = new XMLHttpRequest();
  xhr.addEventListener('readystatechange', function () {
    deactivateLoader();
    if (this.readyState === 4 && this.status === 200) {
      let res = JSON.parse(xhr.response);
      description =
        currentLanguage == 'en'
          ? res.about.english_description
          : res.about.french_description;
      attendance_text =
        currentLanguage == 'en'
          ? 'Select your attendance type'
          : 'Sélectionnez votre type de présence';
      physical_text =
        currentLanguage == 'en' ? 'Physical Attendance' : 'Présence physique';
      physical_desc =
        currentLanguage === 'en'
          ? 'By selecting this, you agree to be present at the event venue.'
          : "En le sélectionnant, vous acceptez d'être présent sur le lieu de l'événement.";
      select_button = currentLanguage === 'en' ? 'Select' : 'sélectionner';
      virtual_text =
        currentLanguage === 'en'
          ? 'By selecting this you can only attend the event online.'
          : "En sélectionnant cette option, vous ne pouvez assister à l'événement qu'en ligne.";
      virtual_desc =
        currentLanguage === 'en' ? 'Virtual Attendance' : 'Présence virtuelle';
      $('#registration-banner').attr('data-bg-src', res.about.banner);
      if (res.event_description.event_type === 'HYBRID') {
        $('#registration-form').html(`
          <h4 class="text-center">${attendance_text}</h4>
          <div class="col-sm-6">
              <div class="card">
                  <div class="card-body text-center py-5">
                      <h5 class="card-title">${physical_text}</h5>
                      <p class="card-text">
                          ${physical_desc}
                      </p>
                      <button onclick="getCategories('PHYSICAL')" type="button" class="searchBoxToggler button steps-btn style2 py-3">
                          ${select_button}
                      </button>
                  </div>
              </div>
          </div>
          <div class="col-sm-6">
              <div class="card">
                  <div class="card-body text-center py-5">
                      <h5 class="card-title">${virtual_desc}</h5>
                      <p class="card-text">
                      ${virtual_text}
                      </p>
                      <button onclick="getCategories('VIRTUAL')" type="button" class="searchBoxToggler button steps-btn style2 py-3">
                            ${select_button}
                      </button>
                  </div>
              </div>
          </div>
        `);
      } else {
        getCategories(res.event_description.event_type);
      }
    }
  });
  xhr.open('GET', `${request_host}/Api/Registration-Page-Api`);
  xhr.setRequestHeader('Authorization', event_code);
  xhr.send();
}

function getCategories(event_type) {
  activateLoader();
  closingreg_text =
    currentLanguage === 'en'
      ? 'Registrations close on'
      : 'Clôture des inscriptions';
  earlybird_text =
    currentLanguage === 'en'
      ? 'Early bird registration ends on'
      : "L'inscription hâtive se termine le";
  let data = new FormData();
  data.append('event_code', event_code);
  data.append('attendence', event_type);
  data.append('operation', 'get-categories');
  let xhr = new XMLHttpRequest();
  register_btn = currentLanguage === 'en' ? 'Register' : "S'inscrire";
  xhr.addEventListener('readystatechange', function () {
    if (this.readyState === 4 && this.status === 200) {
      activateLoader();
      let res = JSON.parse(xhr.response);
      $('#registration-form').html('');
      $('#attendence_type').val(event_type);
      if (category_code_id != null) {
        displayForm(category_code_id);
      } else {
        res.data.forEach((element) => {
          category_name =
            currentLanguage == 'en'
              ? element.name_english
              : element.name_french;
          $('#registration-form').append(`
            <div class="col-lg-4 col-md-6">
                <div class="price-card shadow-lg">
                    <h3 class="price-card_title">${category_name}</h3>
                    <span class="h1 price-card_price">${element.fee}</span>
                    <ul class="price-card_list">
                        <li>
                            <span class="list-title">${element.early_payment_date == ''
              ? closingreg_text
              : earlybird_text
            }</span>
                            <span class="list-text">${element.early_payment_date == ''
              ? element.end_date
              : element.early_payment_date
            }</span>
                        </li>
                    </ul>
                    <button class="button steps-btn" onclick="displayForm(${element.id
            })">${register_btn}</button>
                </div>
            </div>
          `);
        });
      }
    }
  });
  xhr.open('POST', `${request_host}/Api/Display-Registration-Categories`);
  xhr.send(data);
}

function displayForm(category_id) {
  activateLoader();
  let data = new FormData();
  data.append('category', category_id);
  data.append('attendence', $('#attendence_type').val());
  data.append('event_code', event_code);
  data.append('operation', 'get-form-inputs');
  let xhr = new XMLHttpRequest();
  xhr.addEventListener('readystatechange', function () {
    apply_as = currentLanguage == 'en' ? 'Apply as' : 'Appliquer en tant que';
    ticket_fee_text =
      currentLanguage == 'en' ? 'the ticket fee  is' : 'le prix du billet est';
    if (this.readyState === 4 && this.status === 200) {
      deactivateLoader();
      let res = JSON.parse(xhr.response);
      $('#registration-form').html('');
      $('#registration-form').addClass(
        res.category.form_type == 'SINGLE' ? 'single-step' : 'multi-step'
      );

      $('#membership').addClass('d-none');
      $('#registration-form').append(`
        <input type="hidden" id="payment_token" value="">
        <input type="hidden" id="payment_session" value="">
        <input type="hidden" id="order_id" value="">
        <input type="hidden" id="acknowleadgment" value="">
        <input type="hidden" id="pay_id" value="">
        <ul class="nav nav-pills mb-3" id="form-steps" role="tablist"></ul>
        <div class="tab-content" id="form-steps-tabContent"></div>
      `);
      res.data.forEach((element, index) => {
        group_name =
          currentLanguage == 'en'
            ? element.group.name
            : element.group.nameFrench;
        let groupInputs = '';
        element.inputs.forEach((FormData) => {
          groupInputs += inputUI(FormData);
        });
        $('#ticket_id').val(category_id);
        const active = index === 0 ? 'active' : '';

        $('#form-steps').append(`
          <li class="nav-item" role="presentation">
            <button class="nav-link ${active}" onclick="nextStep(${index - 1
          })" id="tab-${index}" data-bs-toggle="pill" data-bs-target="#pills-${index}" type="button" role="tab" aria-controls="pills-${index}" aria-selected="true">${group_name}</button>
          </li>
        `);

        $('#form-steps-tabContent').append(`
          <section class="fade show ${active}" id="pills-${index}" role="tabpanel" aria-labelledby="pills-${index}-tab">
          ${groupInputs}
          </section>
        `);
      });

      if ($('#registration-form').hasClass('multi-step')) {
        let stepsCount = $('#form-steps-tabContent').children('section').length;
        $('#form-steps-tabContent')
          .children('section')
          .each(function (element) {
            $(this).attr('data-registration-step', element);
            $(this).addClass('registration-step');
            if (element !== 0) {
              $(this).addClass('d-none');
            }

            if (element === stepsCount - 1) {
              $(this).append(`
              <div class="col-lg-12 col-md-12 place-order d-flex justify-content-between mt-3">
                <button type="button" class="button steps-btn" onclick="prevStep(${element})">Previous</button>
                <button type="submit" class="button steps-btn">Submit</button>
              </div>
            `);
            } else if (element === 0) {
              $(this).append(`
              <div class="col-lg-12 col-md-12 place-order d-flex justify-content-start mt-3">
                <button type="button" class="button steps-btn" onclick="nextStep(${element})">Next</button>
              </div>
            `);
            } else {
              $(this).append(`
              <div class="col-lg-12 col-md-12 place-order d-flex justify-content-between mt-3">
                <button type="button" class="button steps-btn" onclick="prevStep(${element})">Previous</button>
                <button type="button" class="button steps-btn" onclick="nextStep(${element})">Next</button>
              </div>
            `);
            }
          });
      } else {
        $('#form-steps-tabContent').append(`
          <div class="col-lg-10 col-md-8 mx-auto mb-4 place-order mt-3">
              <button type="submit" class="button">Apply</button>
          </div>
        `);
      }

      if (res.category.is_free == 'YES') {
        $('#register_delegates').css('display', 'block');
      }

      $('select').select2({
        minimumInputLength: 0,
      });

      $('.form-control').on('blur', function () {
        if ($(this).val() !== null && $(this).val().length > 0) {
          $(this).is('select') && $(this).select2('close');
          $(this).addClass('has-value');
        } else {
          $(this).is('select') && $(this).select2('open');
          $(this).removeClass('has-value');
        }
      });
      $('select').on('select2:open', function () {
        $('.select2-search__field').attr('placeholder', 'Search');
        $(this).siblings('.select-labels').addClass('select-labels-active');
      });
      $('select').on('select2:close', function () {
        if ($(this).val() === null || $(this).val() === '') {
          $('.select-labels').removeClass('select-labels-active');
        }
      });

      $('input[type="date"]').pickadate({
        weekdaysShort: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
        showMonthsShort: true,
        selectYears: 250,
        selectMonths: true,
        min: new Date(),
        onOpen: function () {
          const id = $(this)[0]['$node'][0].id;
          $(`#${id}`)
            .siblings('.select-labels')
            .addClass('select-labels-active');
        },
        onClose: function () {
          const id = $(this)[0]['$node'][0].id;
          if ($(`#${id}`).val() === '') {
            $(`#${id}`)
              .siblings('.select-labels')
              .removeClass('select-labels-active');
          }
        },
      });

      if ($('#input_id_1707979021').length) {
        $('#input_id_1707979021')
          .pickadate('picker')
          .set('min', new Date(1800, 1, 1));
      }

      // $('input[type="time"]').pickatime({
      //   format: 'HH:i',
      //   interval: 15,
      //   onOpen: function () {
      //     const id = $(this)[0]['$node'][0].id;
      //     $(`#${id}`)
      //       .siblings('.select-labels')
      //       .addClass('select-labels-active');
      //   },
      //   onClose: function () {
      //     const id = $(this)[0]['$node'][0].id;
      //     if ($(`#${id}`).val() === '') {
      //       $(`#${id}`)
      //         .siblings('.select-labels')
      //         .removeClass('select-labels-active');
      //     }
      //   },
      // });
      $('input[type="number"]').on('input', function () {
        let filteredValue = $(this)
          .val()
          .replace(/[^0-9]/g, '');
        $(this).val(filteredValue);
      });
      let phone_inputs = document.querySelectorAll("input[type='tel']");
      phone_inputs.forEach(function (phone_input) {
        window.intlTelInput(phone_input, {
          initialCountry: 'us',
          preferredCountries: ['us', 'gb', 'fr'],
          separateDialCode: true,
          placeholderNumberType: 'FIXED_LINE',
          nationalMode: true,
          customPlaceholder: function () {
            return '';
          },
          formatOnDisplay: true,
          utilsScript: 'intelinpt/js/utils.js',
        });

        phone_input.addEventListener('focus', function () {
          phone_input.style.paddingLeft = '95px';
          $('.phone-label').addClass('focused-label');
        });

        phone_input.addEventListener('blur', function () {
          if (phone_input.value == '') {
            $('.phone-label').removeClass('focused-label');
          }
        });

        phone_input.addEventListener('input', function () {
          let filteredValue = phone_input.value.replace(/[^0-9]/g, '');
          phone_input.style.paddingLeft = '95px';
          if (filteredValue.length > 15) {
            filteredValue = filteredValue.slice(0, 15);
          }
          phone_input.value = filteredValue;
        });
      });

      $('select, input[type="checkbox"], input[type="radio"]').on(
        'change click',
        function () {
          let div_length =
            $(this).attr('data-input-type') == 2 ? '6' : '10';
          let name = $(this).attr('name');
          let inpId;
          // ($(this).attr("data-input-type") !== 2) ? $(`#other-${$(this).attr("data-input-code")}`).addClass('ml-4 mt-3') : null;
          if ($(this).val().toUpperCase() === 'OTHER') {
            $(this)
              .parent()
              .parent()
              .removeClass('col-lg-12 col-md-12')
              .addClass(`col-lg-${div_length} col-md-${div_length}`);
            if ($(this).attr('data-input-type') == 16) {
              if (
                $(
                  'input[type="checkbox"][name="' +
                  name +
                  '"][value="Other"]'
                ).prop('checked')
              ) {
                $(`#other-${$(this).attr('data-input-code')}-div`)
                  .parent()
                  .removeClass('d-none')
                // .addClass(`col-lg-${div_length} col-md-${div_length}`);
              } else {
                $(`#other-${$(this).attr('data-input-code')}-div`)
                  .parent()
                  .removeClass(
                    `col-lg-${div_length} col-md-${div_length}`
                  )
                  .addClass('d-none');
                $(`#other-${$(this).attr('data-input-code')}`).val('');
              }
            } else {
              $(`#other-${$(this).attr('data-input-code')}-div`)
                .parent()
                .removeClass('d-none')
              // .addClass(`col-lg-${div_length} col-md-${div_length}`);
            }
          } else {
            console.log("--------------- remove auther -------------------");
            console.log($(`#other-${$(this).attr('data-input-code')}-div`))
            $(`#other-${$(this).attr('data-input-code')}-div`).parent().addClass('d-none');
            $(this)
              .parent()
              .parent()
              .removeClass(`col-lg-${div_length} col-md-${div_length}`)
              .addClass('col-lg-9 col-md-12');
            if (
              $(this).attr('data-input-type') == 16 ||
              $(this).attr('data-input-type') == 15
            ) {
              $(this).parent().parent().addClass('p-0');
            }
            if (
              $(this).attr('data-input-type') == 16 &&
              !$(
                'input[type="checkbox"][name="' +
                name +
                '"][value="Other"]'
              ).prop('checked')
            ) {
              $(`#other-${$(this).attr('data-input-code')}-div`)
                .parent()
                // .removeClass(`col-lg-${div_length} col-md-${div_length}`)
                .addClass('d-none');
              $(`#other-${$(this).attr('data-input-code')}`).val('');
            }
          }
        }
      );

      setTimeout(() => {
        // initialize_payment();
      }, 1500);
    }
  });
  xhr.open('POST', `${request_host}/Api/Display-Categories-Form-Inputs`);
  xhr.send(data);
}

function nextStep(currentStep) {
  let nextStep = currentStep + 1;
  $('html, body').animate(
    {
      scrollTop: $('#registration-form').offset().top - 100,
    },
    1000
  );

const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  let isEmailValid = regex.test($('#input_id_52307').val());

  if ($('#input_id_68550').val() == '') {
    $('#input_id_68550').addClass('error-input');
  }

  let inputFields = $(
    `.registration-step[data-registration-step="${currentStep}"] input, .registration-step[data-registration-step="${currentStep}"] select, .registration-step[data-registration-step="${currentStep}"] textarea`
  );

  let requiredFields = inputFields.filter(function () {
    return $(this).prop('required');
  });

  let filledFields = requiredFields.filter(function () {
    return $(this).val().trim() !== '';
  });

  if (
    requiredFields.length === filledFields.length &&
    $('#input_id_68550').val() !== '' &&
    isEmailValid
  ) {
    $(`.registration-step[data-registration-step="${currentStep}"]`).addClass(
      'd-none'
    );
    $(`.registration-step[data-registration-step="${nextStep}"]`).removeClass(
      'd-none'
    );

    $(`#tab-${currentStep}`).removeClass('active');
    $(`#tab-${nextStep}`).addClass('active');

    filledFields.each(function () {
      if ($(this).val().trim() !== '') {
        let inputId = $(this).attr('id');
        $("label[for='" + inputId + "']").css('color', '#442374');
        $(this).removeClass('is-invalid');
        $(this).removeClass('error-input');
        $(this).siblings('.invalid-feedback').addClass('d-none');
      }
    });

    let newNumberSpan = `<span class="number mr-2 blue_box"><i class="fa-solid fa-check text-white"></i></span> `;
    $(`#nav-${currentStep}-tab .number`).replaceWith(newNumberSpan);
  } else {
    requiredFields.each(function () {
      if ($(this).val().trim() === '') {
        let inputId = $(this).attr('id');
        $("label[for='" + inputId + "']").css('color', 'red');
        $(this).addClass('is-invalid');
        $(this).addClass('error-input');
        $(this).siblings('.invalid-feedback').removeClass('d-none');
      }
    });
  }
}

function thisStep(stepId) {
  $(`.registration-step`).addClass('d-none');
  $(`.registration-step[data-registration-step="${stepId}"]`).removeClass(
    'd-none'
  );
}

function prevStep(currentStep) {
  let previousStep = currentStep - 1;
  $('html, body').animate(
    {
      scrollTop: $('#registration-form').offset().top - 100,
    },
    1000
  );
  $(`.registration-step[data-registration-step="${currentStep}"]`).addClass(
    'd-none'
  );
  $(`.registration-step[data-registration-step="${previousStep}"]`).removeClass(
    'd-none'
  );
  $(`.registration-step[data-registration-step="${previousStep}"]`).addClass(
    'show'
  );
  $(`#tab-${currentStep}`).removeClass('active');
  $(`#tab-${previousStep}`).addClass('active');
}

function isItRequired(input) {
  return input.is_mandatory == 'YES'
    ? " <span class='text-danger'>*</span>"
    : '';
}

function setRequired(input) {
  return input.is_mandatory == 'YES' ? 'required' : '';
}

function has_other_input(input, inputname) {
  if (input.allow_other == 'YES') {
    return `
      <div class="d-none">
        <div class="form-group mb-1" id="other-${input.inputcode}-div">
          <label class="label-form" for="other-${input.inputcode}">Please specify</label>
          <input type="text" class="form-control" data-name="Other ${inputname}" id="other-${input.inputcode}">
        </div>
      </div>
    `;
  } else {
    return '';
  }
}

function inputUI(input_obj) {
  const { input, options, value } = input_obj;
  let input_field = '';
  let option_list = '';
  input_global = currentLanguage == 'en' ? input.nameEnglish : input.nameFrench;
  enter_text = currentLanguage == 'en' ? '' : '';
  select_text = currentLanguage == 'en' ? '' : '';
  switch (true) {
    case input.inputtype.id == 1:
      input_field = `
        <div class="form-group mb-1" id="div-${input.inputcode}">
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
          <option ${option.contentEnglish == value ? 'selected' : ''} value="${option.contentEnglish
          }">${option.contentEnglish}</option>
        `;
      });
      input_field = `
        <div class="form-group mb-1">
          <label class="label-form select-labels" for="${input.inputcode
        }">${enter_text} ${input_global} ${isItRequired(input)}</label>
          <select class="form-control col-12" data-name="${input_global}" id="${input.inputcode
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
        <div class="form-group mb-1">
            <input  value="${value}" type="color" class="form-control p-0" data-name="${input_global}" id="${input.inputcode
        }" data-input-type="${input.inputtype.id}" name="${input.inputcode
        }" data-input-code="${input.inputcode}" value="#ffffff">
            <label class="custom-button-selector" for="${input.inputcode
        }">Click Here to select a color</label>
            <label class="form-custom-label" for="${input.inputcode
        }">${enter_text} ${input_global}  ${isItRequired(input)}</label>
        </div>    
      `;
      break;
    case input.inputtype.id == 4:
      input_field = `
        <div class="form-group mb-1">
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
        <div class="form-group mb-1">
          <label class="label-form" for="${input.inputcode
        }">${enter_text} ${input_global} ${isItRequired(input)}</label>
          <input  value="${value}" type="email" class="form-control" data-name="${input_global}" id="${input.inputcode
        }" data-input-type="${input.inputtype.id}" name="${input.inputcode
        }" data-input-code="${input.inputcode}" ${setRequired(input)}>
        </div>
      `;
      break;
    case input.inputtype.id == 6:
      const filename = 'file';
      input_field = `
        <div class="file-upload mb-1">
          <label class="label-form" for="${input.inputcode
        }">${enter_text} ${input_global}  ${isItRequired(input)}</label>
          <div class="file-upload-select col-12" id="file-${input.inputcode
        }" onclick="fileSelect('${input.inputcode}', 'file')">
          <div class="file-select-button" >Choose File</div>
            <div class="file-select-name" id="file-${input.inputcode}-name">
            ${filename ? `Uploaded: ${filename}` : `${input_global}...`}</div>
            <textarea class="d-none" id="${input.inputcode}-base64"></textarea>
            <input type="file" id="${input.inputcode}" data-input-type="${input.inputtype.id
        }" name="${input.inputcode}" data-name="${input_global}" id="${input.inputcode
        }" data-input-type="${input.inputtype.id}" name="${input.inputcode
        }" data-input-code="${input.inputcode}" ${setRequired(
          input
        )} accept="application/pdf">
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
        <div class="file-upload mb-1">
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
        }" data-input-code="${input.inputcode}" ${setRequired(
          input
        )} accept="image/*">
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
        <div class="form-group mb-1">
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
        <div class="form-group mb-1">
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
          }" id="checkbox-${option.id}" ${option.contentEnglish == value ? 'checked' : ''
          }>
          </div>
        `;
      });
      input_field = `
        <div class="form-group mb-1"><label class="form-checkboxes text-capitalize">${input_global}  ${isItRequired(
        input
      )} </label>
            ${option_list}
        </div>
      `;
      break;
    case input.inputtype.id == 12:
      input_field = `
        <div class="form-group mb-1">
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
        <div class="form-group mb-1">
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
        <div class="form-group mb-1" id="div-${input.inputcode}">
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
      <div class="form-group mb-1">
        <label class="label-form" for="${input.inputcode
        }">${enter_text} ${input_global} ${isItRequired(
          input
        )} <span class="push-to-left" id="${input.inputcode
        }-wordCount"></span></label>
        <textarea class="form-control" data-name="${input_global}" id="${input.inputcode
        }" data-input-type="${input.inputtype.id}" name="${input.inputcode
        }" data-input-code="${input.inputcode}" ${setRequired(
          input
        )}>${value}</textarea>
      </div>
    `;
      break;
    case input.inputtype.id == 16:
      options.forEach((option, index) => {
        if (option.contentEnglish.toUpperCase() != 'None of the above') {
          option_list += `
            <div class="form-check">
              <input class="form-check-input"  name="${input.inputcode
            }" type="checkbox" data-input-type="${input.inputtype.id}" ${option.contentEnglish == value ? 'checked' : ''
            } value="${option.contentEnglish
            }" data-name="${input_global}" data-input-code="${input.inputcode
            }" id="checkbox-${option.id}">
            <label  class="label-form text-dark" for="checkbox-${option.id
            }">${enter_text} ${option.contentEnglish}</label>
            </div>
          `;
        }

        if (
          input.inputcode == 'input_id_1709555701' &&
          option.contentEnglish === 'Youth'
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
        <div class="form-group mb-1">
          <label class="label-form mb-3">${input_global}  ${isItRequired(
        input
      )} </label>
          ${option_list}
        </div>
      `;
      break;
    case input.inputtype.id == 17:
      input_field = `
        <div class="form-group mb-1">
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
  let base64EncodedInput = document.getElementById(id + '-base64');
  let fileSelect = document.getElementById('file-' + id);
  let preview = document.getElementById('preview-' + id);
  let prevButton = document.getElementById('prev-page-' + id);
  let nextButton = document.getElementById('next-page-' + id);
  let pdfDoc = null;
  let pageNum = 1;
  let pageRendering = false;
  let pageNumPending = null;
  fileInput.click();
  fileInput.onchange = async function () {
    activateLoader();
    let file = fileInput.files[0];
    if (file) {
      let selectNameId = 'file-' + id + '-name';
      let selectName = document.getElementById(selectNameId);
      selectName.innerText = file.name;
      const reader = new FileReader();
      switch (type) {
        case 'image':
          compressImage(file, 1024, 1024, 0.5).then(function (result) {
            preview.setAttribute('src', result);
            base64EncodedInput.value = result;
            preview.classList.remove('d-none');
            document.getElementById('parent-' + id).classList.remove('d-none');
            deactivateLoader();
          });
          break;
        case 'file':
          base64EncodedInput.value = await pdfToBase64(file);
          reader.onload = function () {
            let typedarray = new Uint8Array(this.result);
            pdfjsLib.getDocument(typedarray).promise.then(function (pdfDoc_) {
              pdfDoc = pdfDoc_;
              renderPage(pageNum);
              document
                .getElementById('preview-box-' + id)
                .classList.remove('d-none');
              deactivateLoader();
            });
          };
          reader.readAsArrayBuffer(file);
          break;
      }
      deactivateLoader();
    }
  };

  function pdfToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        let base64String = reader.result
          .replace('data:', '')
          .replace(/^.+,/, '');
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  }

  function renderPage(num) {
    pageRendering = true;
    pdfDoc.getPage(num).then(function (page) {
      let ctx = preview.getContext('2d');
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
      prevButton.classList.add('disabled-btn');
      return;
    }
    prevButton.classList.remove('disabled-btn');
    pageNum--;
    queueRenderPage(pageNum);
  }

  function onNextPage() {
    if (pdfDoc == null || pageNum >= pdfDoc.numPages) {
      nextButton.classList.add('disabled-btn');
      return;
    }
    nextButton.classList.remove('disabled-btn');
    pageNum++;
    queueRenderPage(pageNum);
  }

  if (
    typeof prevButton !== 'undefined' &&
    prevButton !== null &&
    typeof nextButton !== 'undefined' &&
    nextButton !== null
  ) {
    prevButton.addEventListener('click', onPrevPage);
    nextButton.addEventListener('click', onNextPage);
  }
}

function getFormInputData() {
  let data = new FormData();
  activateLoader();
  const delegate_data = [];
  const inputs = $('[name^=input_id_]');
  inputs.each(function (index, input) {
    let value_recorded = '';
    if (input.type == 'file') {
      value_recorded =
        input.files[0] != undefined
          ? $(`#${$(input).attr('data-input-code')}-base64`).val()
          : '';
    } else if (input.type == 'checkbox' || input.type == 'radio') {
      if (input.checked) {
        value_recorded = input.value;
      }
    } else {
      value_recorded = input.value;
    }
    if (value_recorded != '') {
      if ($(input).attr('data-input-code') == 'input_id_52307') {
        data.append('registration_email', value_recorded);
      }
      if ($(input).attr('data-input-code') == 'input_id_21576') {
        data.append('first_name', value_recorded);
      }
      if ($(input).attr('data-input-code') == 'input_id_35129') {
        data.append('last_name', value_recorded);
      }
      delegate_data.push({
        input_code: $(input).attr('data-input-code'),
        input_type: $(input).attr('data-input-type'),
        input_value: value_recorded,
        input_name: $(input).attr('data-name'),
      });
    }
  });
  data.append('delegate_data', JSON.stringify(delegate_data));
  data.append('event_code', event_code);
  data.append('ticket_id', category_code_id);
  data.append('order_id', $('#order_id').val());
  data.append('payment_token', $('#payment_token').val());
  data.append('payment_session', $('#payment_session').val());
  data.append('acknowleadgment', $('#acknowleadgment').val());
  data.append('attendence_type', 'PHYSICAL');
  data.append(
    'user_language',
    $('#current_language').val()
  );
  data.append('accompanied', 'NO');
  return data;
}

function submitForm() {
  console.log('submitting');
  activateLoader();
  let data = getFormInputData();
  const xhr = new XMLHttpRequest();
  xhr.addEventListener('readystatechange', function () {
    if (this.readyState === 4) {
      deactivateLoader();
      let res = JSON.parse(xhr.response);
      switch (this.status) {
        case 200:
          $('#registration-form').html(`
                <div class="row dark-blue p-5 mb-5" id="banner-remove">
            <div class="text-white" id="pre-header-form">
              Thank you for applying to the SUN Movement Global Gathering 2024,
              your application has been successfully submitted. You will receive
              an email confirmation shortly.
            </div>
            <p class="text-white">
              If you have questions or technical difficulties, write to
              <a href="mailto:sun@eventsfactory.rw" class="yellow"
                >sun@eventsfactory.rw</a
              >.
            </p>
          </div>
           `);
          $('html, body').animate(
            {
              scrollTop: $('#registration-form').offset().top - 15,
            },
            500
          );

          break;
        case 400:
          displayErrors(res);
          break;
        case 500:
          $('#registration-form').prepend(`
              <div class="col-8 mx-auto alert alert-danger alert-dismissible fade show" role="alert" id="notification-draw">
                <strong>Error!</strong> Internal Server Error
                <button onclick="$('#notification-draw').remove();" type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close">
                    <i class="fas fa-times"></i>
                </button>
              </div>
            `);
          $('html, body').animate(
            {
              scrollTop: $('#notification-draw').offset().top - 15,
            },
            500
          );
          break;
      }
    }
  });
  xhr.open('POST', `${request_host}/Api/Register-Delegate`);
  xhr.send(data);
}

$('#registration-form').submit(function (e) {
  e.preventDefault();
  if ($('[name^=input_id_]').length > 0) {
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
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
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

function displayErrors(res) {
  let errors = '';
  res.message.forEach((error) => {
    errors += `<li>${error}</li>`;
  });
  $('#notification-draw').remove();
  $('#registration-form').prepend(`
    <div class="col-8 mx-auto alert alert-danger alert-dismissible fade show" role="alert" id="notification-draw">
      <strong>Error!</strong> Kindly fix the erros below and try again
      <button onclick="$('#notification-draw').remove();" type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close">
          <i class="fas fa-times"></i>
      </button>
      <div>
          <ul class="mb-0">
              ${errors}
          </ul>
      </div>
    </div>
  `);
  $('html, body').animate(
    {
      scrollTop: $('#notification-draw').offset().top - 15,
    },
    500
  );
}
