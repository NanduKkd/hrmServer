"use strict";
let notifier, notifierForm, notifierSubmit;
function initNotifier() {
    notifier = document.getElementById('notifierForm');
    notifier.style.display = "block";
    notifierForm = notifier.children[0];
    notifierSubmit = notifierForm.querySelector('button');
}
initNotifier();
function submitNotifier() {
    const subject = notifierForm.subject.value;
    const message = notifierForm.body.value;
    notifierSubmit.disabled = true;
    notifierForm.subject.disabled = true;
    notifierForm.body.disabled = true;
    fetch("/api/dashboard", {
        method: "POST",
        body: JSON.stringify({ subject, message }),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + auth,
        },
    }).then((res) => {
        if (res.status < 300)
            location.href = "/dashboard.html";
        else
            throw new Error("Server responded with status " + res.status);
    }).catch(e => {
        notifierSubmit.disabled = false;
        notifierForm.subject.disabled = false;
        notifierForm.body.disabled = false;
        alert("Error occurred, please try again.");
        console.error(e);
    });
}
