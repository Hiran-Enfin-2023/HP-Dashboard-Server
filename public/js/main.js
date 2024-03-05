async function fetchDashboardContent() {
  try {
    const response = await fetch("http://localhost:5000/dashboard", {
      headers: {
        Authorization: getToken(),
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data);
    } else {
      window.location.href = "http://localhost:5000/login";
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

function getToken() {
  return localStorage.getItem("access-token");
}

document.addEventListener("DOMContentLoaded", () => {
  fetchDashboardContent();
});

const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
const sessionId = params.id;
function onMenuSelect(menu) {
  $(".middle-sections").addClass("hide");
  $(".sidemenu").removeClass("active");
  switch (menu) {
    case "users":
      $("#users").removeClass("hide");
      $("#usermenu").addClass("active");
      loadUsers();
      break;
    case "transcripts":
      $("#transcripts").removeClass("hide");
      $("#transmenu").addClass("active");
      loadTranscripts();
      break;
    default:
      break;
  }
}
function processRespoone(data) {
  var userList = data.results;

  var userListHtml = '<table id="visiters" class="display" style="width:100%">';
  userListHtml += "<thead>";
  userListHtml += "<tr>";
  userListHtml += "<th>Name</th>";
  userListHtml += "<th>Email</th>";
  userListHtml += "<th>Product Name</th>";
  userListHtml += "<th>Date</th>";
  userListHtml += "<th>Actions</th>";
  userListHtml += "</tr>";
  userListHtml += "</thead>";
  userListHtml += "<tbody>";
  for (let key in userList) {
    const user = userList[key];
    if (!user.name) {
      user.name = "Guest";
    }
    if (!user.email) {
      user.email = "Guest";
    }
    if (!user.productName) {
      user.productName = "No product selected";
    }

    userListHtml += "<tr>";
    userListHtml +=
      "<td>" +
      (user.name.length > 20 ? user.name.substr(0, 20) + ".." : user.name) +
      "</td>";
    userListHtml +=
      "<td>" +
      (user.email.length > 20 ? user.email.substr(0, 20) + ".." : user.email) +
      "</td>";
    userListHtml +=
      "<td>" +
      (user.productName.length > 20
        ? user.productName.substr(0, 20) + ".."
        : user.productName) +
      "</td>";
    userListHtml += "<td>" + new Date(user.date).toLocaleString() + "</td>";
    userListHtml +=
      '<td><a href="?id=' +
      user._id +
      '" target="_blank"><button class="dt-button buttons-copy buttons-html5">View Transcript</button></a></td>';
    userListHtml += "</tr>";
  }
  userListHtml += "</tbody>";
  userListHtml += "</table>";
  return userListHtml;
}
function processTranscriptRespoone(data) {
  var userList = data.results;
  var userListHtml = "";
  if (data.status == "failed") {
    userListHtml +=
      '<h4  class="dash-head" style="font-weight:500 !important;margin-top:40px"><i>No Transcripts found ! </i></h4>';
  } else {
    userListHtml +=
      '<h4 class="dash-head" style="font-weight:500 !important"><i>Product Name : ' +
      userList[0].sessionId.productName +
      "</i></h4>";
    userListHtml +=
      '<h4 class="dash-head" style="font-weight:500 !important"><i>Name : ' +
      userList[0].sessionId.name +
      "</i></h4>";
    userListHtml +=
      '<h4 class="dash-head" style="font-weight:500 !important"><i>Email : ' +
      userList[0].sessionId.email +
      "</i></h4>";
    userListHtml +=
      '<table id="transtable" class="display borderless" style="width:100%">';
    userListHtml += "<thead>";
    userListHtml += '<th style="opacity:0">Trancripts</th>';
    userListHtml += "<tr>";
    userListHtml += "</tr>";
    userListHtml += "</thead>";
    userListHtml += "<tbody>";
    for (let key in userList) {
      const user = userList[key];
      userListHtml += "<tr>";
      userListHtml +=
        "<td>" +
        (user.type == 1 ? "<i>Answer </i> " : "<i>Query  </i>") +
        "[" +
        new Date(user.date).toLocaleString().split(" ")[1] +
        "] " +
        user.transcript +
        "</td>";
      userListHtml += "</tr>";
    }
    userListHtml += "</tbody>";
    userListHtml += "</table>";
  }

  return userListHtml;
}
function loadUsers() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("userList").innerHTML = processRespoone(
        JSON.parse(this.responseText)
      );
      $("#visiters").dataTable({
        order: [[3, "desc"]],
        pageLength: 10,
        dom: "lBfrtip",
        buttons: ["copyHtml5", "excelHtml5", "csvHtml5", "pdfHtml5"],
      });
    }
  };
  xhttp.open("GET", "rest/fetch-users", true);
  xhttp.send();
}

function loadTranscripts() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("transcriptList").innerHTML =
        processTranscriptRespoone(JSON.parse(this.responseText));
      $("#transtable").dataTable({
        pageLength: 50,
        dom: "lBfrtip",
        buttons: ["copyHtml5", "excelHtml5", "csvHtml5", "pdfHtml5"],
      });
    }
  };
  xhttp.open("GET", "rest/fetch-transcript/" + sessionId, true);
  xhttp.send();
}

window.onload = function (e) {
  if (sessionId) {
    onMenuSelect("transcripts");
  } else {
    onMenuSelect("users");
  }
};
