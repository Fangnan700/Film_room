let player = document.getElementById("player");
let room_id_input = document.getElementById("room_id");
let room_pwd_input = document.getElementById("room_pwd");
let video_url_input = document.getElementById("video_url");
let join_id_input = document.getElementById("join_room_id");
let join_pwd_input = document.getElementById("join_room_pwd");
let room_info = document.getElementById("room_info");

let this_id = "";
let this_pwd = "";
let this_type = "";
let this_behavior = "";
let this_cur_time = "";


let ws;
ws = new ReconnectingWebSocket("ws://" + window.location.host + "/synchronize");
ws.onopen = function () {

}
ws.onmessage = function (event) {
    let data = JSON.parse(event.data);
    if(this_type === "main" && data["room_id"] === this_id && data["behavior"] === "sub_synchronize") {
        main_synchronize();
    }
    if(this_type === "sub" && data["room_id"] === this_id && data["behavior"] === "main_synchronize") {
        player.currentTime = data["cur_time"];
        player.play();
    }
    if(data["room_id"] === this_id && data["behavior"] === "pause") {
        player.pause();
    }
    if(data["room_id"] === this_id && data["behavior"] === "play") {
        player.currentTime = data["cur_time"];
        player.play();
    }
    console.log("广播消息：" + data["heart"]);
}

ws.onclose = function () {

}

ws.onerror = function () {

}



$(document).ready(function() {
    $('#help_Modal').modal('show');
});


// 开始播放
player.addEventListener("play", function () {
    this_behavior = "play";
    this_cur_time = player.currentTime;

    let syn_data = {
        "room_id": this_id,
        "room_type": this_type,
        "behavior": this_behavior,
        "cur_time": this_cur_time
    };
    let jsonString = JSON.stringify(syn_data);
    ws.send(jsonString);
})

// 暂停播放
player.addEventListener("pause", function () {
    this_behavior = "pause"

    let syn_data = {
        "room_id": this_id,
        "room_type": this_type,
        "behavior": this_behavior,
        "cur_time": this_cur_time
    };
    let jsonString = JSON.stringify(syn_data);
    ws.send(jsonString);
})



// 设置播放器属性

player.setAttribute("poster", "../img/poster.jpg");

function set_player(src) {
    player.setAttribute("src", src);
    player.setAttribute("type", "video/mp4");
    player.setAttribute("preload", "auto");
}



// 创建房间
function create_room() {
    let room_id = room_id_input.value;
    let room_pwd = room_pwd_input.value;
    let video_url = video_url_input.value;
    let create_data = {
        "room_id": room_id,
        "room_pwd": room_pwd,
        "video_url": video_url
    };
    let url = "/create_room";
    let settings = {
        type: "post",
        dataType: "json",
        data: create_data,
        success: function (result) {
            if(result["code"] === 1) {
                this_id = result["room_id"];
                this_pwd = result["room_pwd"];
                this_type = "main";
                set_player(result["video_url"]);
                room_info.innerText = "[房间信息] 房间号：" + result["room_id"] + " 房间密码：" + result["room_pwd"];
                alert("视频已就绪～开始享受吧！");
            } else if(result["code"] === 0) {
                alert("房间号已存在，请重试");
            } else {
                alert("填写信息有误，请检查");
            }
        }
    }
    $.ajax(url, settings);
}


// 加入房间
function join_room() {
    let join_room_id = join_id_input.value;
    let join_room_pwd = join_pwd_input.value;
    let create_data = {
        "join_room_id": join_room_id,
        "join_room_pwd": join_room_pwd
    };
    let url = "/join_room";
    let settings = {
        type: "post",
        dataType: "json",
        data: create_data,
        success: function (result) {
            if(result["code"] === 1) {
                this_id = result["room_id"]
                this_type = "sub";
                set_player(result["video_url"]);
                room_info.innerText = "[房间信息] 房间号：" + result["room_id"] + " 房间密码：" + result["room_pwd"];
                alert("视频已就绪～开始享受吧！");
                sub_synchronize();
            } else {
                alert("房间号或密码错误，请重试");
            }
        }
    }
    $.ajax(url, settings);
}


// 主号发送同步信息
function main_synchronize() {
    this_behavior = "main_synchronize";
    this_cur_time = player.currentTime;
    let syn_data = {
        "room_id": this_id,
        "room_type": this_type,
        "behavior": this_behavior,
        "cur_time": this_cur_time
    };
    let jsonString = JSON.stringify(syn_data);
    ws.send(jsonString);
}

// 次号请求同步信息
function sub_synchronize() {
    this_behavior = "sub_synchronize"
    let syn_data = {
        "room_id": this_id,
        "room_type": this_type,
        "behavior": this_behavior
    };
    let jsonString = JSON.stringify(syn_data);
    ws.send(jsonString);
}


// 定时同步
setInterval(sub_synchronize, 5*60*1000);

// 设置心跳
function heart() {
    let syn_data = {
        "heart": "ping",
    };
    let jsonString = JSON.stringify(syn_data);
    ws.send(jsonString);
}
setInterval(heart, 30000);



