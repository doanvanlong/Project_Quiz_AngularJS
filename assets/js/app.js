let app = angular.module("myapp", ["ngRoute", "ngSanitize"]);
//requice template header

app.config(function ($routeProvider) {
  $routeProvider
    .when("/", {
      templateUrl: "pages/home.html",
      controller: "accountController",
    })
    .when("/subjects", {
      templateUrl: "pages/subjects.html",
      controller: "accountController",
      controller: "redirectQuizController",
    })
    .when("/about", {
      templateUrl: "pages/about.html",
      controller: "accountController",
    })
    .when("/contact", {
      templateUrl: "pages/contact.html",
      controller: "accountController",
    })
    .when("/qa", {
      templateUrl: "pages/qa.html",
      controller: "accountController",
    })
    .when("/register", {
      templateUrl: "pages/register.html",
      controller: "accountController",
    })
    .when("/login", {
      templateUrl: "pages/login.html",
      controller: "accountController",
    })
    .when("/logout", {
      templateUrl: "pages/logout.html",
      controller: "accountController",
    })
    .when("/recover", {
      templateUrl: "pages/recover.html",
      controller: "accountController",
    })
    .when("/profile", {
      templateUrl: "pages/profile.html",
      controller: "accountController",
    })
    .when("/quiz", {
      templateUrl: "pages/quizApp.html",
      controller: "accountController",
    });

});



// xử lý tài khoản
app.controller("accountController", function ($scope) {
  $scope.accountv = handleAccount();
  $scope.logout = function () {
    localStorage.removeItem("login");
    location.href = "#!";
    location.reload();
  };
  //check đã login
  if (localStorage.getItem("login")) {
    let login = JSON.parse(localStorage.getItem("login"));
    $scope.profile = {
      name: login.user_name,
      avt: login.user_avt,
    };
  }
});
//xử lý click vào làm ngay ở trang khó học
app.controller("redirectQuizController", function ($scope) {
  $scope.redirectQuiz = function (param) {
    //check login
    if (!checkLogin()) {
      Swal.fire({
        title: "Vui lòng đăng nhập để làm Quiz!",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: "Đăng nhập",
        denyButtonText: `Không`,
      }).then((result) => {
        if (result.isConfirmed) {
          //login
          location.href = "#!login";
        } else if (result.isDenied) {
        }
      });
    }else{
        location.href=`#!quiz?${param}`;
    }
  };
});

// ----

// check login
function checkLogin() {
  let check = false;
  if (localStorage.getItem("login")) {
    check = true;
  }
  return check;
}
//Xữ lý tài khoản trên thanh menu
function handleAccount() {
  let html = "";
  if (checkLogin()) {
    //View html dropdown account
    html = `
        <a class="dropdown-item"  href="#!profile">Thông tin</a>
        <a class="dropdown-item" href="#!">Quên mật khẩu</a>
        <a class="dropdown-item" href="#!recover">Đổi mật khẩu</a>
        <div class="dropdown-divider"></div>
        <a class="dropdown-item" href="#!logout">Đăng xuất</a>

        `;
  } else {
    //View html dropdown account ,chưa login
    html = `
        <a class="dropdown-item" href="#!register">Đăng ký</a>
        <div class="dropdown-divider"></div>
        <a class="dropdown-item" href="#!login">Đăng nhập</a>
        `;
  }
  return html;
}
//xử lý login
// let data={
//     user_name:'Long',
//     user_email:'longdv.dev@gmail.com',
//     user_pass:123,
//     user_avt:'assets/img/php.jpg'
// }
// localStorage.setItem('login',JSON.stringify(data));
