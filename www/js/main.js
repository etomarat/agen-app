var debug = false;
var BASE_URL = 'http://178.62.105.65:8000/';
var vk_available = false;

function saveLocal(data){
  console.log(data);
  var _id = localStorage.length+1;
  localStorage.setItem(_id, data);
  console.log(localStorage);
}


function do_sync(){
  //var _all = localStorage.length;
  var _all = 0;
  var _c = 0;
  var _l = localStorage.length;
  var _keys = Object.keys(localStorage);
  if (_keys.length <= 1) {
    //navigator.notification.alert('Нет записей для синхронизации.', function(){}, 'A-GEN');
    alert('Нет записей для синхронизации.')
  }
  $.each(_keys, function(index, key){
    console.log(key, index, 1, 'key');
    if (key!='city') {
      $.ajax({
        type: 'POST',
        url: BASE_URL+'update_user/',
        data: localStorage.getItem(key),
        success: function(data){
          console.log(data.data, 'status');
          if(data.data == true) {
            console.log(key, 2, 'key');
            localStorage.removeItem(key);
            _c = _c+1;
            if (_c == _l-1) {
              //navigator.notification.alert('Синхронизировано '+_c+' записей.', function(){}, 'Red Race');
              alert('Синхронизировано '+_c+' записей.');
            }
          }
        }
      });
    }
  })
  /*for (var key in localStorage){

    if (key!='city') {
      $.ajax({
        type: 'POST',
        url: 'http://common.dev.grapheme.ru/admin/marlboro/get_info',
        data: localStorage.getItem(key),
        success: function(data){
          console.log(data.status, 'status');
          if(data.status == true) {
            console.log(key, 2, 'key');
            localStorage.removeItem(key);
            _c = _c+1;
            if (_c == _l-1) {
              alert('Синхронизировано '+_c+' записей.');
            }
          }
        }
      });
    }
  }*/
  //alert('Синхронизировано '+_all+' записей.');
}

function showFrame(name){
  var video = $('#video video')[0];
  video.pause();
  if (name == 'video') {
    video.play();
    video.onended = function() {
      showFrame('are-you-ready');
    };
  }
  if (name == 'pre-video') {
    setTimeout(function(){
      showFrame('video');
    }, 4000)
  }
  if (name == 'req') {
    captureVideo()
  }
  if (name == 'id-vk') {
    //if (debug==false) is_vk_available();
    if (vk_available == false) {
      name = 'id-email'
    }
  }

  $('.frame').removeClass('active');
  $('#'+name).addClass('active');
}


function getAllVideos(callback) {
  navigator.assetslib.getAllPhotos(
    function(data){
      console.log(data)
      callback(data);
    }, 
    function(data){
      console.log(data)
    }
  )
}

function getVideosUrl(videos){
  var videos_urls = [];
  $.each(videos, function(index, value){
    videos_urls.push(value.url);
  });
  return videos_urls
}

function parseRawTimestamp(raw){
  raw = raw.split('T');
  var date = raw[0];
  var time = raw[1].split('+')[0];

  var raw_date = date.split('-');

  var year = raw_date[0];
  var month = raw_date[1];
  var day = raw_date[2];

  var raw_time = time.split(':');

  var hours = raw_time[0];
  var minutes = raw_time[1];
  var seconds = raw_time[2];

  //console.log(year, month, day, hours, minutes, seconds);
  dateObj = new Date(year, month, day, hours, minutes, seconds )
  //console.log(dateObj);

  return {
    dateObj: dateObj,
    year: year,
    month: month,
    day: day,
    hours: hours,
    minutes: minutes,
    seconds: seconds
  }
}

function sortByDate(array){
  array.sort(function(a,b){
    return b.dateObj - a.dateObj;
  });
  return array;
}

function generateYandexDiskName(date) {
  s = date.year+'-'+date.month+'-'+date.day+' '+
    date.hours+'-'+date.minutes+'-'+date.seconds+'.MOV';
  return s
}

function getVideosInfo(callback){
  getAllVideos(function(data){
    var videos = data;
    var url_list = getVideosUrl(videos);
    navigator.assetslib.getPhotoMetadata(url_list, function(data){
      date_arr = [];
      //console.log(data, 1)

      $.each(data, function(index, value){
        //console.log(value.date, 2);
        date_arr.push(parseRawTimestamp(value.date));
      });

      //console.log(sortByDate(date_arr), 'sorted')
      var sorted_arr = sortByDate(date_arr);
      var last_date = sorted_arr[0];
      //alert(last_date.dateObj);
      console.log(last_date, 'final');
      var yad_name = generateYandexDiskName(last_date);
      console.log(yad_name);
      callback(yad_name);
    }, function(data){
      console.log(data, 3);
    })
  });
}

function captureSuccess() {
  //alert('успех');
  showFrame('preloader');
  setTimeout(function(){
    getVideosInfo(function(yad_name){
      console.log('FINAL!!')
      console.log(yad_name, $('.main-form').serialize()+'&'+$.param({
        yad_name: yad_name
      }));
      serialized = $('.main-form').serialize()+'&'+$.param({
        yad_name: yad_name
      });
      /*_t = setTimeout(function(){
        saveLocal(serialized)
        showFrame('real-end');
      }, 5000);*/
      if (vk_available == false) {
        saveLocal(serialized)
        showFrame('end');
      } else {
        $.ajax({
          type: 'POST',
          url: BASE_URL+'update_user/',
          data: serialized,
          success: function(data){
            console.log(data);
            if (data.data == true) {
              //clearTimeout(_t);
            } else {
              saveLocal(serialized)
            }
            //showFrame('real-end');
            showFrame('end');
          },
          error: function(data){
            console.log(data);
            alert('ошибка. Видео не было отправлено.');
            saveLocal(serialized);
            showFrame('end');
          }
        });
      }
    });
  }, 1000)
}

function captureError() {
  //alert('ошибка');
}

function captureVideo() {
  // Launch device video recording application,
  // allowing user to capture up to 2 video clips
  navigator.device.capture.captureVideo(captureSuccess, captureError, {
    limit: 2,
    duration: 30,
    destinationType : Camera.DestinationType.FILE_URI,
    cameraDirection:Camera.Direction.FRONT,
    sourceType: Camera.PictureSourceType.CAMERA,
    mediaType: Camera.MediaType.VIDEO,
    saveToPhotoAlbum: true
  });
}

function is_vk_available(callback){
  callback = callback || function(){}
  is_available('https://vk.com', function(status){
    console.log(status)
    if (status == true || debug == true) {
      //startFrame = 'id-vk';
      vk_available = true;
    } else {
      vk_available = false;
      //startFrame = 'id-email';
    }
    console.log(vk_available);
    callback(vk_available);
    //showFrame(startFrame);
  })
}

function is_available(url, callback) {
  _t = setTimeout(function(){
    callback(false);
    console.log(1);
  }, 2000)
  $.ajax({
    type: 'GET',
    contentType: "application/json",
    async: true,
    url: url,
    success: function() {
      console.log(2)
      callback(true);
      clearTimeout(_t);
      //location.href=redirect_url;
    },
    error: function(data) {
      clearTimeout(_t);
      callback(false);
      //console.log(data)
      console.log(3)
      //callback(false);
      //location.href=redirect_local;
    }
  });
}

function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}

function setDisabled($inputs, $btn){
  var $inputs = $inputs || $btn.closest('.frame').find('input');
  var $btn = $btn || $inputs.closest('.frame').find('button');
  
  $inputs.on('keyup change', function(){
    var all_input = true;
    $inputs.each(function(){
      if (!$(this).is('[type="checkbox"]') && $(this).val()=='' && typeof attr !== typeof $(this).attr('required') && $(this).attr('required') !== false ){
        all_input = false;
      }
      
      //console.log($(this).is('[type="checkbox"]'))
      //console.log($(this).prop('checked'))
      
      if ($(this).is('[type="checkbox"]') && !$(this).prop('checked')) {
        all_input = false;
      }
    });
    $inputs.each(function(){
      if ($(this).is('[name="email"]') && !validateEmail($(this).val())) {
        all_input = false;
      }
    });
    if (all_input == true) {
      $btn.removeAttr('disabled');
    } else {
      $btn.attr('disabled', 'disabled');
    }
  })
  
}

var getCaptcha_clear = function(login){
  var path = BASE_URL+'get_captcha/';
  console.log(login)
  $.ajax({
    type: 'POST',
    url: path,
    data: {
      login: login
    },
    success: function(data){
      console.log(data)
      if (data.status == false) {
        showFrame('captcha');
        console.log(data.captcha_url);
        $('input[name="captcha"]').val('');
        $('frame#captcha input[name="login"]').val(login);
        $('frame#captcha').attr('src', data.captcha_url);
      } else {
        setTimeout(function(){
          getCaptcha(login);
        }, 3000);
      }
    },
    error: function(data){
      setTimeout(function(){
        getCaptcha(login);
      }, 3000);
    }
  })
}

var getCaptcha = getCaptcha_clear;

function isEmail(email) {
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
}

function phoneCheck(first, prelast, last) {
  var $frame = $('.frame#phone_check');
  $frame.find('.sample_phone').text('+'+first+'(xxx) xxx-xx'+prelast+''+last);
  showFrame('phone_check');
}

$('.frame#phone_check button').click(function(e){
  e.preventDefault();
  
  var raw_phone = $('.frame#phone_check input[name="phone_check"]').val();
  $('input[name="phone"]').val(raw_phone);
  var phone = raw_phone.match(/\d/g).join('');
  vk_send_auth(phone)
});

function vk_send_auth(phone){
  phone = phone || undefined;
  var action = BASE_URL;
  var $form = $('#id-vk .form-vk');
  
  var $inputs = $form.find('input');
  
  var serializd = $inputs.serialize();
  if (phone) {
    serializd = serializd + '&' + $.param({
      phone: phone
    })
  }
  console.log(serializd);
  
  showFrame('preloader');
  //getCaptcha = getCaptcha_clear;
  getCaptcha($form.find('input[name="login"]').val());
  $.ajax({
    type: 'POST',
    url: action,
    data: serializd,
    success: function(data){
      //$("#mess_ar").val("");
      console.log(data);
      getCaptcha = function(){};
      if (data.error == 'Bad password') {
        //formError($form, 'Неправильное имя пользователя или пароль.');
        //showFrame('main');
        alert('Неправильное имя пользователя или пароль. Попробуйте ещё раз!')
        showFrame('id-vk');
      } else if(data.error){
        console.log(data);
        
        var error = data.error.split(':');
        console.log(error);
        if (error[0]=="Security check. Enter number") {
          var _l = error[1].length
          var first_dig = error[1][1];
          var last_dig = error[1][_l-1];
          var pre_dig = error[1][_l-2];
          console.log(first_dig, pre_dig, last_dig);
          phoneCheck(first_dig, pre_dig, last_dig);
        }
        //alert(data.error);
        //showFrame('id-vk');
      } else {
        console.log(data);
        
        var vk_id = data.vk_id;
        var first_name = data.first_name;
        var last_name = data.last_name;
        var email = '';
        var phone = '';
        if (isEmail(data.login)) {
          email = data.login;
        } else {
          phone = data.login;
        }
        $('#id-email input[name="firstname"]').val(first_name);
        $('#id-email input[name="lastname"]').val(last_name).change();
        
        if (phone == ''){
          phone = $('input[name="phone_check"]').val();
        }
        $('#id-email input[name="phone"]').val(phone);
        $('#id-email input[name="email"]').val(email).change();
        
        vk_id = String(vk_id);
        if(vk_id.match(/^\d+$/)) {
          vk_id = 'id'+vk_id
        }
        $('#id-email-2 input[name="vk_id"]').val('http://vk.com/'+vk_id).change();
        
        showFrame('id-email');
        
        /*preloadImage(data.photo, function(){
          $('#rfid-read img').attr('src', data.photo);
          $('#rfid-read h6').text(data.first_name+' '+data.last_name);
          showFrame('rfid-read');
        })*/
      }
    },
    error: function(data){
      console.log(data);
      $('html').html(data.responseText)
    }
  });
}

$(function() {  
  //var startFrame = 'city-chose';
  var startFrame = 'preloader';
  
  //startFrame = 'end';
  
  $('input').keypress(function(e) {
      var code = (e.keyCode ? e.keyCode : e.which);
      if ( (code==13) || (code==10)) {
          $(this).blur();
          return false;
      }
  });
  
  $('a.sync').click(function(){
    do_sync();
  });
  
  $('frame#captcha button').click(function(e){
    e.preventDefault();
    showFrame('preloader');
    var href = 'get_captcha/'
    $.ajax({
      type: 'POST',
      url: BASE_URL+href,
      data: $('#captcha input').serialize(),
      success: function(data){
        //$("#mess_ar").val("");
        console.log(data);
        if (data.status == true) {
          var login = $form.find('input[name="login"]').val();
          setTimeout(function(){
            getCaptcha(login);
          }, 3000);
        }
      },
      error: function(data){
        console.log(data);
        //$('html').html(data.responseText)
      }
    });
  })
  
  $('#city-chose button').click(function(){
    var city_id = $('#city-chose-selector').val();
    localStorage.setItem('city', city_id);
  });
  
  $('#id-vk .form-vk button.vk').click(function(e){
    e.preventDefault();
    setTimeout(function(){
      showFrame('preloader');      
    }, 300);
    
    setTimeout(function(){
      vk_send_auth();      
    }, 500);
  })
  
  setDisabled($('#id-email input'));
  setDisabled($('#id-email-2 input'));
  
  
  $('button, .btn, .link-btn').click(function(e){
    e.preventDefault();
    var href = $(this).attr('data-href');
    showFrame(href);
  });
  
  $('#city-chose button').click(function(){
    var city_id = $('#city-chose-selector').val();
    localStorage.setItem('city', city_id);
  });
  
  $('.chose-city').click(function(e){
    e.preventDefault();
    showFrame('city-chose');
  });

  showFrame(startFrame);
  
  is_vk_available(function(status){
    if (status == true) {
      showFrame('id-vk');      
    } else {
      showFrame('id-email');      
    }
  });
  
  if (localStorage.getItem('city')) {
    //startFrame = 'id-vk';
    var city_id = localStorage.getItem('city');
    $('#city-chose-selector').val(city_id);
    //is_vk_available();
  } else {
    showFrame('city-chose')
  }
  
  $('input[name="phone"], input[name="phone_check"]').mask("+7(999) 999-9999");
  $('input[name="age"]').mask("99");
});
/*
var list;
navigator.assetslib.getAllPhotos(function(data){console.log(data);list=data}, function(data){console.log(data)})

navigator.assetslib.getPhotoMetadata([list[0].url], function(data){console.log(data)}, function(data){console.log(data)})*/