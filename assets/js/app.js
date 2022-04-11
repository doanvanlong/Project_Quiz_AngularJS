let app = angular.module("myapp", ["ngRoute", "ngSanitize"]);
//requice template header

app.config(function ($routeProvider) {
  $routeProvider
    .when("/", {
      templateUrl: "pages/home.html",
      controller: "accountController",
      controller: "subjectController",
      controller: "redirectQuizController`",
    })
    .when("/subjects", {
      templateUrl: "pages/subjects.html",
      controller: "accountController",
      controller: "redirectQuizController",
      controller: "subjectController",
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
    .when("/forgot", {
      templateUrl: "pages/forgot.html",
      controller: "accountController",
    })
    .when("/profile", {
      templateUrl: "pages/profile.html",
      controller: "accountController",
    })
    .when("/quiz/:id/:name/:img", {
      templateUrl: "pages/quizApp.html",
      // controller: "accountController",
      controller: "quizApp", //
    })
    .when("/history", {
      templateUrl: "pages/history.html",
      // controller: "accountController",
      controller: "quizsHistory",
    });
});

//
app.controller("quizsHistory", function ($scope, $http) {
  // nếu có
  if (checkLogin()) {
    $scope.login = JSON.parse(localStorage.getItem("login"));
    $scope.email = $scope.login.email;
  }
  $http
    .get(`http://localhost:3000/quizsHistory?email=${$scope.email}`)
    .then(function (response) {
      $scope.quizsHistory = response.data;
    });
});
// teamplate quiz

app.directive("quizapp", function (quizFactory, $timeout, $routeParams, $http) {
  return {
    restrict: "AE",
    scope: {},
    templateUrl: "pages/template-quiz.html",
    link: function (scope, element, attrs) {
      scope.start = function () {
        quizFactory.getQuestions().then(function () {
          scope.subjectName = $routeParams.name;
          scope.subjectImg = $routeParams.img;
          scope.check = true;
          scope.id = 0;
          scope.score = 0;
          scope.quizOver = false; //chauw hoàn thành
          //khi start thì gọi hàm lấy câu hỏi
          scope.getQuestion();
          scope.counter = 10;
          function secondsToHms(d) {
            d = Number(d);
            var h = Math.floor(d / 3600);
            var m = Math.floor((d % 3600) / 60);
            var s = Math.floor((d % 3600) % 60);

            var hDisplay = h > 0 ? h + (h == 1 ? ":" : ":") : "";
            var mDisplay = m > 0 ? m + (m == 1 ? " phút :" : " phút :") : "";
            var sDisplay = s > 0 ? s + (s == 1 ? "  giây " : "  giây") : "";
            return hDisplay + mDisplay + sDisplay;
          }
          // đổi số thành ngày giờ
          scope.countDownView = secondsToHms(scope.counter);

          //
          var stopped;
          scope.countdown = function () {
            stopped = $timeout(function () {
              if (scope.counter > 0) {
                scope.counter--;
                scope.countdown();
                scope.countDownView = secondsToHms(scope.counter);
              } else {
                scope.quizOver = true; // hoàn thành
              }
            }, 1000);
          };
          //gọi hàm countdown
          scope.countdown();
        });
      };
      scope.reset = function () {
        scope.check = false;
        scope.score = 0;
        scope.id = 0;
      };

      scope.save = function () {
        //lưu kết quả
        if (checkLogin) {
          scope.login = JSON.parse(localStorage.getItem("login"));
          scope.history = {
            email: scope.login.email,
            idSubject: $routeParams.id,
            name: $routeParams.name,
            score: scope.score,
            img: $routeParams.img,
          };
          $http
            .post("http://localhost:3000/quizsHistory", scope.history)
            .then(function (response) {
              location.href = "#!history";
            });
        }
      };
      // câu hỏi
      scope.getQuestion = function () {
        let quiz = quizFactory.getQuestionDb(scope.id);

        if (quiz) {
          scope.question = quiz.Text;
          scope.options = quiz.Answers;
          scope.answer = quiz.AnswerId;
          scope.nextAns = true; // xử lý nút next
        }
        if (scope.id == 10) {
          scope.quizOver = true; // hoàn thành
        }
      };
      scope.checkAnswer = function () {
        if (!$("input[name = answer]:checked".length)) {
          return;
        } else {
          let answer = $("input[name = answer]:checked").val();
          answer = new Number(answer);
          if (answer == scope.answer) {
            // alert("đúng")
            // tăng điểm ;
            scope.score++;
            scope.correctAns = true;
            let label = $("input[name = answer]:checked").next("span");
            label[0].style.color = "#40e0d0";
          } else {
            // alert("sai");
            scope.correctAns = false;
            $("input[name = answer]:checked").css("background-color", "red");
            let label = $("input[name = answer]:checked").next("span");
            label[0].style.color = "red";
          }
        }
        scope.nextAns = false; // xử lý nút next
      };
      scope.nextQuestion = function () {
        if (scope.id < 10) {
          scope.id++;
          scope.getQuestion();
        }
      };
    },
  };
});
//controller quizApp.'
// mỗi lần click vào môn học thì chạy Controller này và hiển thị ra môn hc phù hợp
// chạy đc thì factory questions chưa nhận đc dữ liệu > factory phải return kq
app.controller("quizApp", function ($scope, $http, $routeParams, quizFactory) {
  $http.get("db/Quizs/" + $routeParams.id + ".js").then(function (response) {
    quizFactory.questions = response.data;
    // gọi factory.questions ở factorry
  });
});
// factory câu Hỏi
app.factory("quizFactory", function ($http, $routeParams) {
  return {
    getQuestions: function () {
      return $http
        .get("db/Quizs/" + $routeParams.id + ".js")
        .then(function (response) {
          questions = response.data;
        });
    },
    getQuestionDb: function (id) {
      var questionRand =
        questions[Math.floor(Math.random() * questions.length)];
      var count = questions.length;
      if (count > 10) {
        count = 10;
      }
      if (id < count) {
        return questionRand;
      } else {
        return false;
      }
    },
  };
});
app.controller("subjectController", function ($scope, $http) {
  $scope.subjects = [];
  $scope.search = "";
  $http.get("db/Subjects.js").then(function (res) {
    //xáo trộn
    res.data.sort(function () {
      return Math.random() - 0.5;
    });
    $scope.subjects = res.data;
  });
});

// xử lý tài khoản
app.controller("accountController", function ($scope, $http) {
  $scope.accountv = handleAccount();
  $scope.logout = function () {
    localStorage.removeItem("login");
    location.href = "#!";
    location.reload();
  };
  //đăng ký
  $scope.register = function () {
    $scope.userRegister = {
      name: $scope.nameRegister,
      email: $scope.emailRegister,
      pass: $scope.passRegister,
      avt: "",
      birthday: $scope.birthdayRegister,
      gender: $scope.genderRegister,
    };
    // check xem có tồn tại email chuaư
    $http
      .get(`http://localhost:3000/users?email=${$scope.emailRegister}`)
      .then(function (rs) {
        if (rs.data.length > 0) {
          $(".error-emailRegister").text("Email đã tồn tại");
        } else {
          $(".error-emailRegister").text("");
          //
          $http.post("http://localhost:3000/users", $scope.userRegister).then(
            function (response) {
              Swal.fire({
                title: "Đăng ký thành công!",
                showDenyButton: false,
                showCancelButton: false,
                confirmButtonText: "Đăng nhập",
                denyButtonText: `Không`,
              }).then((result) => {
                location.href = "#!login";
              });
              location.href = "#!login";
            },
            function (error) {
              alert("Error");
            }
          );
        }
      });
  };
  //đăng Nhập
  $scope.login = function () {
    $http
      .get(`http://localhost:3000/users?email=${$scope.emailLogin}`)
      .then(function (rs) {
        if (rs.data.length > 0) {
          // $(".error-emailRegister").text("Email đã tồn tại");
          //check mật khẩu
          if (rs.data[0].pass == $scope.passLogin) {
            // alert('ok')
            let data = {
              name: rs.data[0].name,
              email: rs.data[0].email,
              pass: rs.data[0].pass,
              avt: rs.data[0].avt,
              gender: rs.data[0].gender,
              birthday: rs.data[0].birthday,
            };
            localStorage.setItem("login", JSON.stringify(data));
            Swal.fire({
              title: "Đăng nhập thành công!",
              showDenyButton: false,
              showCancelButton: false,
              confirmButtonText: "Trang chủ",
              denyButtonText: `Không`,
            }).then((result) => {
              location.href = "#!";
              location.reload();
            });
          } else {
            // alert('sai')
            $(".errorPassLogin").text("Mật khẩu không đúng!");
          }
        } else {
          // $(".error-emailRegister").text("");
          $(".errorEmailLogin").text("Tài khoản không tồn tại!");
        }
      });
  };

  //check đã login
  if (localStorage.getItem("login")) {
    let login = JSON.parse(localStorage.getItem("login"));

    $http
      .get(`http://localhost:3000/users?email=${login.email}`)
      .then(function (response) {
        // console.log(response.data);
        $scope.profile = {
          name: response.data[0].name,
          avt: response.data[0].avt,
          email: response.data[0].email,
          gender: response.data[0].gender,
          birthday: response.data[0].birthday,
        };
        if ($scope.profile.avt == "") {
          $scope.checkAvt = true;
        } else {
          $scope.checkAvt = false;
        }
      });
    // đổi mật khẩu
    //
    $scope.recoverPass = function () {
      $http
        .get(`http://localhost:3000/users?email=${$scope.profile.email}`)
        .then(function (res) {
          $scope.id_user = res.data[0].id;
          $scope.data = {
            name: $scope.profile.name,
            email: $scope.profile.email,
            avt: res.data[0].avt,
            pass: $scope.passNew,
            gender: $scope.profile.gender,
            birthday: $scope.profile.birthday,
          };
          // //update profile
          Swal.fire({
            title: "Cập nhật mật khẩu  thành công!",
            showDenyButton: false,
            showCancelButton: false,
            confirmButtonText: "Ok",
            denyButtonText: `Không`,
          });
          $http
            .put(
              `http://localhost:3000/users/${$scope.id_user}`,
              JSON.stringify($scope.data)
            )
            .then(function (response) {
              Swal.fire({
                title: "Cập nhật mật khẩu  thành công!",
                showDenyButton: false,
                showCancelButton: false,
                confirmButtonText: "Ok",
                denyButtonText: `Không`,
              });
            });
        });
    };
    //tìm mật khẩu
    $scope.forgotPasss = function () {
      $http.get(`http://localhost:3000/users?email=${$scope.profile.email}`).then(function (rs) {
        $scope.pass=(rs.data[0].pass);
        Swal.fire({
          title: "Mật khẩu của bạn là:",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: $scope.pass,
          denyButtonText: `Không`,
        });
      });
    };
  }
});
//check đổi mật khẩu
app.directive("checkPass", function ($http) {
  let login = JSON.parse(localStorage.getItem("login"));
  let kq;
  $http.get("http://localhost:3000/users").then(function (rs) {
    let rss=rs.data;
    let r=rss.find(function (val){
      return val.email==login.email;
    })
    kq=r.pass;

  });
  return {
    require: "ngModel",
    link: function (scope, element, att, mCtrl) {
      function xuly(pass) {
        let check = 0;
        
        if(kq==pass){
          check=1;
        }
        return check;
      }
      function validate(value) {
        // value = parseInt(value);

        if (xuly(value)) {
          mCtrl.$setValidity("charE", true);
        } else {
          mCtrl.$setValidity("charE", false);
        }
        return value;
      }
      mCtrl.$parsers.push(validate);
      //update lại login
    },
  };
});
//check quên mật khẩu
app.directive("forgotPass", function ($http) {
  let rss;
  $http.get("http://localhost:3000/users").then(function (rs) {
    rss=rs.data;
  });
  return {
    require: "ngModel",
    link: function (scope, element, att, mCtrl) {
      function xuly(a) {
        let check = 0;
        let tinh=rss.find(function (val){
          return val.email==a;
        })
        if(tinh){
          check=1;
        }
        return check;
      }
      function validate(value) {
        if (xuly(value)) {
          // alert(1)
          mCtrl.$setValidity("charE", true);
        } else {
          // alert(2)
          mCtrl.$setValidity("charE", false);
        }

        return value;
      }
      mCtrl.$parsers.push(validate);
    },
  };
});
app.directive("fileUpload", function ($parse, $http) {
  return {
    link: function ($scope, element, attrs) {
      element.on("change", function (e) {
        let reader = new FileReader();
        reader.onload = function (event) {
          // console.log(event.target.result);
          // console.log($('.imgUpload'));
          let r = $(".imgUpload");
          console.log(r[0]);
          $(".imgUpload").attr("src", event.target.result);
          $("#chooseImg").hide();
        };
        reader.readAsDataURL(element[0].files[0]);
      });
      //

      $scope.updateProfile = function () {
        let r = $(".imgUpload")[0];
        let img = r.getAttribute("src");
        if (img == "assets/img/notfound.png") {
          img = "";
        }
        $http
          .get(`http://localhost:3000/users?email=${$scope.profile.email}`)
          .then(function (res) {
            $scope.id_user = res.data[0].id;
            //update profile
            $scope.data = {
              name: $scope.profile.name,
              email: $scope.profile.email,
              avt: img,
              gender: $scope.profile.gender,
              birthday: $scope.profile.birthday,
            };
            $http
              .put(
                `http://localhost:3000/users/${$scope.id_user}`,
                JSON.stringify($scope.data)
              )
              .then(function (response) {
                // console.log(response.data);
                Swal.fire({
                  title: "Cập nhật thành công!",
                  showDenyButton: false,
                  showCancelButton: false,
                  confirmButtonText: "Ok",
                  denyButtonText: `Không`,
                });
              });
          });
      };
    },
  };
});
// app.controller('updateProfile',function($scope){
//   $scope.updateProfile = function(){
//     alert(1)
//   }
// })
//xử lý click vào làm ngay ở trang khóa học
app.controller("redirectQuizController", function ($scope) {
  $scope.redirectQuiz = function (param, name, img) {
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
    } else {
      location.href = `#!quiz/${param}/${name}/${img}`;
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
        <a class="dropdown-item" href="#!forgot">Quên mật khẩu</a>
        <a class="dropdown-item" href="#!recover">Đổi mật khẩu</a>
        <div class="dropdown-divider"></div>
        <a class="dropdown-item" href="#!history">Lịch sử Quiz</a>

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
