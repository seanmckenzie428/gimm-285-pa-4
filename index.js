$(document).ready(function () {

    let submissionsTable = $('#submissions-table');
    let submissionsTableBody = submissionsTable.find('tbody');


// get current submissions to fill table on page load
fetch('http://localhost:3000/submissions', {
    method: 'post'
})
    .then(response => response.json())
    .then((data) => {
        if (data['submissions'].length === 0) {
            submissionsTable.hide();
            submissionsTable.after('<p id="no-submissions">No Submissions</p>');
        }
        submissionsTableBody.empty();
        for (let submission of data['submissions']) {
            let rowsToAdd = '<tr>';
            rowsToAdd += '<td>'+submission['name']+'</td>';
            rowsToAdd += '<td>'+submission['email']+'</td>';
            rowsToAdd += '<td>'+submission['languages-used']+'</td>';
            rowsToAdd += '<td>'+submission['favorite-language']+'</td>';
            rowsToAdd += '<td>'+submission['why-favorite']+'</td>';
            rowsToAdd += '<td>'+submission['programming-types']+'</td>';
            rowsToAdd += '<td>'+submission['visual-coding-thoughts']+'</td>';
            rowsToAdd += '<td>'+submission['file-name']+'</td>';
            rowsToAdd += '</tr>';
            submissionsTableBody.append(rowsToAdd);
        }
    })

$('#languages-used').select2({
    tags: true,
    width: 'element'
});

$('#programming-types').select2({
    tags: true,
    width: 'element'
});

// BEGIN: handle form submission

$('#programming-languages-survey').submit(function (event) {
    event.preventDefault();
    let formStatus = $('#programming-languages-survey .form-submit-status');
    let submitBtn = $('#submit');
    submitBtn.prop('disabled', true);
    submitBtn.text('Submitting...');
    let formData = new FormData();
    formData.append('name', $('#name').val());
    formData.append('email', $('#email').val());
    formData.append('languages-used', $('#languages-used').val());
    formData.append('favorite-language', $('#favorite-language').val());
    formData.append('why-favorite', $('#why-favorite').val());
    formData.append('programming-types', $('#programming-types').val());
    formData.append('visual-coding-thoughts', $('#visual-coding-thoughts').val());
    formData.append('hello-world-upload', $('#hello-world-upload')[0].files[0]);

    fetch('http://localhost:3000', {
        body: formData,
        method: 'POST'
    })
        .then((response) => {
            return new Promise((resolve) => response.json()
                .then((json) => resolve({
                        status: response.status,
                        json,
                    })
                ));
        })
        // displaying results
        .then(({status, json}) => {

            console.log(json);
            $('div[id*="-error"]').hide();

            switch (status) {
                case 400: // error with the submission
                    formStatus.text('Form has errors. Please correct them and resubmit.');
                    formStatus.addClass('error-message');
                    formStatus.removeClass('success-message');
                    submitBtn.text('Try Again');
                    for (let error of json.errors) {
                        let errorId = error.param + '-error';
                        let errorMessageBox;
                        let $errorMessageBox = $('#'+errorId);

                        if ($errorMessageBox.length) {
                            console.log('length')
                            errorMessageBox = $errorMessageBox;
                        } else {
                            console.log('no length')
                            errorMessageBox = document.createElement('div');
                            $('#'+error.param).closest('div.row').after(errorMessageBox);
                        }
                        errorMessageBox.id = errorId;
                        errorMessageBox.innerText = error.msg;
                        errorMessageBox.className = 'row error-message';
                        $(errorMessageBox).show();
                    }
                    break;
                case 200: // submission was a success
                    submitBtn.text('Submit Another')
                    formStatus.text('Submitted successfully! Submit another?');
                    formStatus.removeClass('error-message');
                    formStatus.addClass('success-message');

                    // clear submissions table and fill with new data
                    submissionsTable.show();
                    submissionsTableBody.empty();
                    $('#no-submissions').hide();
                    for (let submission of json['submissions']) {
                        let rowsToAdd = '<tr>';
                        rowsToAdd += '<td>'+submission['name']+'</td>';
                        rowsToAdd += '<td>'+submission['email']+'</td>';
                        rowsToAdd += '<td>'+submission['languages-used']+'</td>';
                        rowsToAdd += '<td>'+submission['favorite-language']+'</td>';
                        rowsToAdd += '<td>'+submission['why-favorite']+'</td>';
                        rowsToAdd += '<td>'+submission['programming-types']+'</td>';
                        rowsToAdd += '<td>'+submission['visual-coding-thoughts']+'</td>';
                        rowsToAdd += '<td>'+submission['file-name']+'</td>';
                        rowsToAdd += '</tr>';
                        submissionsTableBody.append(rowsToAdd);
                    }



                    break;
            }
            formStatus.show();

            submitBtn.prop('disabled', false);


        })
        .catch(function (error) {
            formStatus.text('There was an error submitting the form. Please refresh the page and try again');
            formStatus.addClass('error-message');
            formStatus.removeClass('success-message');
            submitBtn.text('Try Again');
            submitBtn.prop('disabled', false);
            console.log(error);
        });
});

// END: handle form submission

});