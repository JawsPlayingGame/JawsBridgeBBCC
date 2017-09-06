﻿/* 기본 설정 */
configDefault = {
	numChatMax				: 20,								// html에 한꺼번에 표시될 수 있는 메세지의 최대 갯수
	personalColor			:	false,						/* 이름 색깔을 트위치 이름색과 일치시킬지
																					 theme에서 제한 가능 												*/
	badgeVisible			: false,						/* 구독, 비트 등 뱃지를 표시할지
																					 theme에서 제한 가능												*/
	theme							: "default",				// 사용할 테마. theme\테마\*의 파일을 사용
	themeName					: "",						    /* 테마의 이름
																					 theme로부터 import 												*/
	msgExistDuration	: 0,								// 메세지가 애니메이션을 빼면 얼마나 오래 표시될 지
	msgAniDuration		: 0,								/* 메세지 표시 애니메이션의 소요시간
																					 theme로부터 import 												*/
	debugLevel				:	2,								// 0:미표시, 1:console.log, 2:addChatMessage
	useDisplayName		: true,						// 한글 닉네임으로 이름을 표시할지
	loadCheerImgs			: true,						// 비트 후원채팅을 이미지로 표시할지
	loadTwitchCons		: true,						// 트위치 이모티콘과 구독콘을 불러올지
	consRealSubsOnly	: true,						/* 실제 구독자만 구독콘을 쓸 수 있게 할지
																					 로딩이 빨라짐															*/
	loadDcCons				: true,						// 디씨콘을 불러올지
	dcConsURI					: "",								/* 불러올 디씨콘 Uri.
																					 로컬 디씨콘을 이용할 경우 공백으로 둔다.		*/
	subMonthsMsg			: "☆ {months} 개월 구독! ☆",
																				// 구독 메세지를 받았을 때 추가로 출력할 텍스트
	cheersMsg					: "☆ {bits} 비트 후원 ! ☆",
																				// 비트 후원을 받았을 때 추가로 출력할 텍스트
	loadClipPreview		: true,						// 클립 미리보기를 이미지로 표시할지
	clipReplaceMsg		: "[ 클립 ]",				// 클립 미리보기를 사용하지 않을 때의 대체 텍스트
	webSocket					: "wss://irc-ws.chat.twitch.tv:443",
																				/* 접속할 웹소켓
																					 const value 																*/
	nick							: "justinfan00000",	// 트위치 IRC에서 이용할 gust nickname
	pass							: "foobar",					// 트위치 IRC에서 이용할 guest password
	channel						: "#mr_watert",			/* 접속할 채널
																					 "#id1,#id2,.."으로 여러 채널에 접속 가능		*/
	retryInterval			: 3,								// 접속에 끊겼을 때 재접속 시도 간격(초)
	allMessageHandle	: false,						// IRC로부터 받은 처리되지 않은 메세지를 html에 표시
	muteUser					: ["Nightbot"],			/* html에 표시하지 않을 유저 nickname
																					 display-name과 트위치 id를 모두 사용 가능	*/
	deleteBanMsg			: true,						// ban된 유저의 메세지를 지우기
	replaceMsgs				: []								// 봇 메세지 등을 대체
};



/* 메세지 출력 함수 정의 */
var numChat = 0;
/* addChatMessage(nick, message[, data]) */
addChatMessage = function(nick, message, data) {
	
	// DOM Element 생성
	var chatNicknameBox = document.createElement("div");
	chatNicknameBox.classList.add("chat_nickname_box");
	var chatBadgeBox = document.createElement("div");
	chatBadgeBox.classList.add("chat_badge_box");
	var chatInnerBox = document.createElement("div");
	chatInnerBox.classList.add("chat_inner_box");
	var chatMessageBox = document.createElement("div");
	chatMessageBox.classList.add("chat_msg_box");
	var chatOuterBox = document.createElement("div");
	chatOuterBox.classList.add("chat_outer_box");
	if (data.clip) { chatOuterBox.classList.add("clip_included"); }
	if (data.nick) { chatOuterBox.classList.add("user_"+data.nick); }

	
	// Element에 내용 추가
	chatNicknameBox.innerHTML = nick;
	message = message.replace(/\\\"/g, '"').replace(/\\\\/g, "\\");
	if ((data.escape == undefined) || (data.escape == true)) {
		message = message.replace(/</g,"&lt;").replace(/>/g,"&gt;");
	}
	if (typeof applyMessage != "undefined") {
		chatMessageBox.innerHTML = applyMessage(message, data);
		if (data.noDisplay) { return null; }
	}
	else { chatMessageBox.innerHTML = message; }
	
	if (data) {
		if (data.color && configData.personalColor) {
			chatNicknameBox.style.color = data.color;
		}
		if (data.badges && configData.badgeVisible) {
			data.badges.toString().split(",").forEach( function(element, index, array) {
				var chatBadge = document.createElement("img");

				if (element.search("broadcaster") == 0) {			// 스트리머(/1)
					chatBadge.src = "./images/badge/broadcaster.png";
				}
				else if (element.search("moderator") == 0) {	// 진은검(/1)
					chatBadge.src = "./images/badge/mod.png";
				}
				else if (element.search("partner") == 0) {		// 인증됨(/1)
					chatBadge.src = "./images/badge/verified.png";
				}
				else if (element.search("premium") == 0) {		// 프라임(/1)
					chatBadge.src = "./images/badge/prime.png";
				}
				else if (element.search("turbo") == 0) {			// 터보(/1)
					chatBadge.src = "./images/badge/turbo.png";
				}
				else {
					var value = element.replace(/[^1-9]*(\d)/, "$1");
					if (element.search("subscriber") == 0) {			// 구독자(/0, /3, /6, ...)
						switch (value)
						{
						case 0:		// 별
							chatBadge.src = "./images/badge/subs.png";
							break;
						default:	// 개월별 구독콘
							chatBadge.src = "./images/badge/subs" + value + ".png";
							break;
						}
					}
					else if (element.search("bits") == 0) {			// 비트 뱃지(/1, /10, /100, ...)
						var value = element.replace(/[^1-9]*(\d)/, "$1");	
						chatBadge.src = "./images/badge/bits" + value + ".png";
					}
				}
			
				chatBadgeBox.appendChild(chatBadge);
			} );
		} else {
			chatBadgeBox.classList.add("empty");
		}
		if (data.clip) {
			chatMessageBox.innerHTML = data.clip + chatMessageBox.innerHTML;
		}
		if (data.submonths) {
			chatMessageBox.innerHTML =
				'<div class="chat_subscribe_box">' +
				configData.subMonthsMsg.replace("{months}", data.submonths) +
				"</div>" + chatMessageBox.innerHTML;
		}
		if (data.cheers) {
			chatMessageBox.innerHTML = 
				'<div class="chat_cheer_box">' +
				configData.cheersMsg.replace("{bits}", data.cheers) +
				"</div>" + chatMessageBox.innerHTML;
		}
	}
	if ( chatMessageBox.innerHTML.replace(/(<[^>]*>)|\s/g,"").length == 0) {
		chatMessageBox.classList.add("image_only");
	}
	
	
	// 페이지에 Element 연결
	chatInnerBox.appendChild(chatNicknameBox);
	chatInnerBox.appendChild(chatBadgeBox);
	chatOuterBox.appendChild(chatInnerBox);
	chatOuterBox.inner = chatInnerBox;
	chatOuterBox.appendChild(chatMessageBox);
	chatOuterBox.msg = chatMessageBox;
	document.getElementById("chat_wrapper").appendChild(chatOuterBox);
	
	
	// 메세지 타임아웃 설정
	var fadeoutTime = 0;
	if (configData.msgExistDuration) { fadeoutTime += configData.msgExistDuration * 1000; }
	if (configData.msgAniDuration) { fadeoutTime += configData.msgAniDuration * 1000; }
	
	if (fadeoutTime != 0) {
		setTimeout( function() {
			chatOuterBox.remove();
			--numChat;
		}, fadeoutTime );
	}
	
	// 넘치는 메세지를 삭제
	if((++numChat > configData.numChatMax)) {
		var first = document.getElementsByClassName("chat_outer_box")[0];
		document.getElementById("chat_wrapper").removeChild(first);
		--numChat;
	}
	
	return chatOuterBox;
}

var concatChatMessage = function(nick, message, data) {
	var lChild = document.getElementById("chat_wrapper").lastChild;
	if (lChild && lChild.getElementsByClassName("chat_nickname_box")[0].innerHTML == nick) {
		if (typeof applyMessage != "undefined") { message = applyMessage(message, data); }
		with (lChild.getElementsByClassName("chat_msg_box")[0])	{
			innerHTML += "\n\n" + message;
			style.maxHeight = "none";
		}
	}
	else { addChatMessage.apply(this, arguments); }
}

var banChatMessage = function(nick) {
	var children = document.getElementsByClassName("user_"+nick);
	if (children && children.length > 0) {
	console.log(children);
		for (var index in children) {
			if(Number(index) == NaN) { continue; }
			children[index].getElementsByClassName("chat_msg_box")[0].innerHTML = 
				"&lt;message deleted&gt;";
		}
	}
}

var applyReplace = function(message, data){ return message; };
var applyCheerIcon = function(message, data){ return message; };
var applyTwitchCon = function(message, data){ return message; };
var applyDcCon = function(message, data){ return message; };
var applyMessage = function(message, data) {
	message = applyReplace(message, data);
	message = applyCheerIcon(message, data);
	message = applyTwitchCon(message, data);
	message = applyDcCon(message, data);
	
	var twipApply = require("./twip_apply.js");
	if (twipApply) { message = twipApply.apply(message, data); }
	return message;
}



/* 설정 파일 확인 및 디버그 내용 출력 함수 정의 */
var completeCount = 0;
var checkComplete = function() {
	/* CSS, 디씨콘, 이모티콘+구독콘, 후원아이콘, 설정, 그리고 서버 */
	var num = 5 + configData.channel.match(/#/g).length;
	if (++completeCount == num) {
		var chat = addChatMessage("",
			'<center><div style="' +
			"display:inline-block; white-space:pre; line-height:1em; " +
			"color:white; background:black; font-family:'굴림체'; " + 
			"text-shadow:-1px -1px 1px dodgerblue," +
									"-1px  1px 1px dodgerblue," +
									" 1px -1px 1px dodgerblue," +
									" 1px  1px 2px dodgerblue;" + '">' +
			"┌────────────┐\n" +
			"│   Ｂ ｒ ｉ ｄ ｇ ｅ    │\n" +
			"│ ■■□□     □□■■  │\n" +
			"│ ■  □  □ □  ■      │\n" +
			"│ ■■□□   □  ■      │\n" +
			"│ ■  □  □ □  ■      │\n" +
			"│ ■■□□□   □□■■。│\n" +
			"└────────────┘</div></center>",
			{ badges:[], escape:false }
		)
		if (chat != null) {
			chat.inner.style.display = "none";
			chat.msg.style.maxHeight = "none";
		}
		checkComplete = function(){};
	}
}
if (typeof configData == "undefined") { configData = {}; }
debugLog = function(dat) {};
{
	var configLoadMessage = "";
	
	if (Object.keys(configData).length < Object.keys(configDefault).length) {
		if (Object.keys(configData).length == 0) {
			configLoadMessage = "설정 파일(lib/config.js)을 로드하는 데 문제가 생겨 기본 설정을 사용합니다. ";
		}
		else { configLoadMessage = "일부 설정을 찾을 수 없어 기본값을 사용합니다. "; }
		
		Object.keys(configDefault).forEach( function(element) {
			if (configData[element] == undefined) configData[element] = configDefault[element];
		} );
	}

	if (configData.debugLevel != 0) {
		if (configData.debugLevel == 1) { debugLog = function(dat) { console.log(dat); }; }
		else {
			debugLog = function(dat, unConcat) {
				if (unConcat) {
					addChatMessage("DEBUG", dat,
						{ badges:["moderator/1"], color:"red", escape:false });
				}
				else {
					concatChatMessage("DEBUG", dat,
						{ badges:["moderator/1"], color:"red", escape:false });
				}
			};
		}
	}
	
	debugLog(configLoadMessage + "설정을 불러왔습니다.");
	checkComplete();
}



/* 특정 메세지 대체 */
if ( (configData.replaceMsgs) && (configData.replaceMsgs.length>0) ) {
	applyReplace = function(message, data) {
		for(var index in configData.replaceMsgs) {
			var msg = configData.replaceMsgs[index];
			if ( (!msg.nick) || (msg.nick == data.nick) ) {
				if ( (msg.to=="{no_display}") && (message.match(msg.orig)!=null) ) {
					data.noDisplay = true;
					return message;
				}
				
				message = message.replace(msg.orig, msg.to);
			}
		}
		return message;
	};
}



/* CSS 로드 */
{
	var loadCss = function() {
		
		document.head.appendChild( function() {
			var ret = document.createElement("link");
			ret.rel = "stylesheet";
			ret.href = "theme/" + configData.theme + "/theme.css";
			ret.onload = function() {
					debugLog(configData.themeName + " 테마를 적용했습니다.");
					checkComplete();
			};
			return ret;
		}() );
	}();
}



/* 비트 후원 메시지 아이콘으로 변경*/
var cheerList = [
	"cheer", "bday", "Kappa", "TriHard", "Kreygasm",
	"4Head", "SwiftRage", "NotLikeThis", "FailFish", "VoHiYo",
	"PJSalt", "MrDestructoid" ];
var cheerRegExp = new RegExp( function() {
	var ret = "";
	for(var index in cheerList) { ret += "(" + cheerList[index] + ")|"; }
	return ret.slice(0,-1);
}(), "g");

if (configData.loadCheerImgs) {
	applyCheerIcon = function(message, data) {
		if( (!data.cheers) && (data.cheers=="") ) { return message; }
		
		var regExp = new RegExp("(" + cheerRegExp.source + ")(\\d+) ", "ig");
		var matches = message.match(regExp);
		var newMessage = "";
		
		if(matches == null) { return message; }
		for(var index in matches) {
			message = message.split(matches[index]);
			newMessage += message.shift();
			message = message.join(matches[index]);
			
			var prefix = matches[index].replace(/\d+ $/, "");
			var amount = matches[index].split(prefix)[1].replace(" ","");
			prefix = prefix.toLowerCase();
			newMessage += 
				'<div class="chat_cheer_text"><img class="cheer_icon" src="./images/cheer/' +
				prefix +
				amount.
					replace(/^[5-9]\d\d\d$/,"%").replace(/^\d/,"!").replace(/\d/g,"0").
					replace("!", "1").replace("%", "5000")
				+ '.gif"/>' + amount + "</div> ";
		}
		
		return newMessage + message;
	};
	
	debugLog("후원 아이콘을 불러왔습니다.");
	checkComplete();
}
else {
	debugLog("설정에 의해 후원 아이콘을 불러오지 않았습니다.");
	checkComplete();
}



/* 디씨콘 및 구독콘 로드 및 적용 */
if (configData.loadTwitchCons) {
	var twitchConsUrlTemplate = "https://static-cdn.jtvnw.net/emoticons/v1/";
	
	if (configData.consRealSubsOnly) {
		applyTwitchCon = function(message, data) {
			if ( !(data && data.emotes) || (data.emotes.length==0) ) { return message; }
			
			// 받은 emotes 데이터를 가공
			var rawEmotes = data.emotes.replace(/-/g, "~").split("/");
			var emotesMap = {};
			for(var index in rawEmotes) {
				var element = rawEmotes[index];
				emotesMap[element.split(":")[0]] = element.split(":")[1].split(",");
			}
			
			var rangeIds = [];
			for(var id in emotesMap) {
				for(var range in emotesMap[id]) {
					rangeIds.push([emotesMap[id][range], id]);
				}
			}
			rangeIds.sort( function(a,b) {
				return (Number(a[0].split("~")[0]) > Number(b[0].split("~")[0])? 1: 0);
			} );
			rangeIds.unshift(["-1~-1", ""]);

			var rangeIdsLength = rangeIds.length - 1;
			for(var index=0; index<rangeIdsLength; ++index) {
				var newvalue = 
					(Number(rangeIds[2*index][0].split("~")[1]) + 1) + "~" +
					(Number(rangeIds[2*index+1][0].split("~")[0]));
				rangeIds.splice(2*index+1, 0, [newvalue, ""]);
			}
			
			// 가공된 데이터를 이용해 메세지를 변조
			var newMessage = "";
			for(var index in rangeIds)
			{
				if (rangeIds[index][1] != "") {
					newMessage = newMessage +
						'<img class="twitch_emote" src="' +
						twitchConsUrlTemplate + rangeIds[index][1] +
						'/3.0" />';
				}
				else {
					newMessage = newMessage +
						message.slice(
							Number(rangeIds[index][0].split("~")[0]),
							Number(rangeIds[index][0].split("~")[1])
						);
				}
			}
			
			return newMessage;
		}
		
		debugLog("트위치 이모티콘과 구독콘을 적용했습니다.");
		checkComplete();
	}
	else {
		var isTwitchConsCalled = { emotes:false, subs:false };
		var isTwitchConsLoaded = { emotes:false, subs:false };
		var consIdMap = {};
		
		var twitchEmoteConRequest = new window.XMLHttpRequest();
		twitchEmoteConRequest.open(
			"GET", "https://twitchemotes.com/api_cache/v3/global.json", true);
		var twitchSubsConRequest = new window.XMLHttpRequest();
		twitchSubsConRequest.open(
			"GET", "https://twitchemotes.com/api_cache/v3/subscriber.json", true);
			
		var twitchConsApply = function() {
			applyTwitchCon = function(message, data) {
				var messageArray = message.split(/(^| )([^ ]*)/g);
				while(messageArray.indexOf("") != -1) {
					messageArray.splice(messageArray.indexOf(""),1);
				}
				for(var index in messageArray) {
					if (consIdMap.hasOwnProperty(messageArray[index])) {
						for (var keyword in consIdMap) {
							if (messageArray[index] == keyword) {
								messageArray[index] =
									'<img class="twitch_emote" src="' +
									twitchConsUrlTemplate + consIdMap[keyword] +
									'/3.0" />';
							}
						}
					}
				}

				return messageArray.join("");
			};
		
			var loadMsg = "을 적용했습니다.";
			if (isTwitchConsLoaded.subs) {
				if (isTwitchConsLoaded.emotes) { loadMsg = "트위치 이모티콘과 구독콘" + loadMsg; }
				else { loadMsg = "트위치 구독콘" + loadMsg; }
			}
			else {
				if (isTwitchConsLoaded.emotes) { loadMsg = "트위치 이모티콘" + loadMsg; }
				else {
					debugLog("트위치 이모티콘과 구독콘을 적용할 수 없었습니다.");
					return;
				}
			}
			debugLog("불러온 " + loadMsg);
			if(isTwitchConsLoaded.subs && isTwitchConsLoaded.emotes) { checkComplete(); }
		};
		
		twitchEmoteConRequest.onreadystatechange = function(evt) {
			if (twitchEmoteConRequest.readyState == 4) {
				if (twitchEmoteConRequest.status == 200) {
					var data = JSON.parse(twitchEmoteConRequest.responseText);
				
					for (var keyword in data) {
						consIdMap[keyword] = data[keyword].id;
					}
					
					isTwitchConsLoaded.emotes = true;
					debugLog("트위치 이모티콘을 불러왔습니다.");
				}
				else {
					debugLog(
						"트위치 이모티콘을 불러오는 데 실패했습니다." +
						"\n에러 코드 " + twitchEmoteConRequest.status);
				}
				
				isTwitchConsCalled.emotes = true;
				if(isTwitchConsCalled.emotes && isTwitchConsCalled.subs) { twitchConsApply(); }
			}
		};
		twitchSubsConRequest.onreadystatechange = function(evt) {
			if (twitchSubsConRequest.readyState == 4) {
				if (twitchSubsConRequest.status == 200) {
					var data = JSON.parse(twitchSubsConRequest.responseText);
						
					for (var conChannel in data) {
						var targetChannel = data[conChannel]; 
						for (var index in targetChannel.emotes) {
							var con = targetChannel.emotes[index];
							consIdMap[con.code] = con.id;
						}
					}
					
					isTwitchConsLoaded.subs = true;
					debugLog("트위치 구독콘을 불러왔습니다.");
				}
				else {
					debugLog(
						"트위치 구독콘을 불러오는 데 실패했습니다." +
						"\n에러 코드 " + twitchSubsConRequest.status);
				}
				
				isTwitchConsCalled.subs = true;
				if(isTwitchConsCalled.emotes && isTwitchConsCalled.subs) { twitchConsApply(); }
			}
		};
		
		twitchEmoteConRequest.send(null);
		twitchSubsConRequest.send(null);	
	}
}
else {
	debugLog("설정에 따라 트위치 이모티콘과 구독콘을 불러오지 않았습니다.");
	checkComplete();
}

dcConsData = [];
if (configData.loadDcCons) {
	var dcConsSubURI = "images/";
	var dcConsMainURI = "";
	if (configData.dcConsURI == "") {
		configData.dcConsURI = "./";
		dcConsSubURI = "images/dccon/";
		dcConsMainURI = "lib/";
	}
	else if (configData.dcConsURI[configData.dcConsURI.length-1] != "/") {
		configData.dcConsURI += "/";
	}
	
	var dcConScript = document.createElement("script");
	dcConScript.type = "text/javascript";
	dcConScript.charset = "utf-8";
	dcConScript.src = configData.dcConsURI + dcConsMainURI + "dccon_list.js";
	document.body.appendChild(dcConScript);
	
	dcConScript.onload = function() {
		if (dcConsData.length == 0) { debugLog("디씨콘을 불러오는 데 실패했습니다."); }
		else {
			var keywords = [];
			for (var index in dcConsData) { 
				for (var index2 in dcConsData[index].keywords) {
					keywords.push(dcConsData[index].keywords[index2]);
				}
			}
			keywords.sort(function(a,b) { return a.length < b.length; } );
			
			applyDcCon = function(message, data) {
				for (var index in keywords) {
					var keyword = keywords[index];
					if (message.indexOf("~" + keyword) != -1) {
						message = message.split("~" + keyword).join(
							'<img class="dccon" src="' +
							configData.dcConsURI + dcConsSubURI +
							dcConsData.find( function(element) {
								return element.keywords.indexOf(keyword) != -1;
							} ).name +
							'" />');
					}
				}
				
				return message;
			};		
			debugLog("디씨콘을 적용했습니다.");
			checkComplete();
		}
	};
}
else {
	debugLog("설정에 따라 디씨콘을 적용하지 않았습니다.");
	checkComplete();
}



/* IRC 클라이언트 설정 */
var joinCount = 0;
defaultColors = [
	"#FF0000", "#0000FF", "#00FF00", "#B22222", "#FF7F50",
	"#9ACD32", "#FF4500", "#2E8B57", "#DAA520", "#D2691E",
	"#5F9EA0", "#1E90FF", "#FF69B4", "#8A2BE2", "#00FF7F"];
debugLog("트위치에 접속을 시도합니다.");
client = (function() {
	var ws = new WebSocket(configData.webSocket);
	ws.onopen = function() {
		ws.send("PASS " + configData.pass + "\r\n");
		ws.send("NICK " + configData.nick + "\r\n");
		ws.send('CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership' + "\r\n");
		ws.send("JOIN " + configData.channel + "\r\n");
	}
	ws.onmessage = function(evt) {
		var lines = evt.data.toString().split(/\r\n|\r|\n/);
		lines.pop();
		lines.forEach( function(element) {
			var line = JSON.stringify(element).slice(1,-1);
			var args = line.replace(/^(:|@)/m, "").split(" ");
		
			if (line[0] == ":") {
			// IRC 명령어 처리
				switch (args[1]) {
				case "421":		// 잘못된 명령어를 보냈을 때
				case "001":		// 웰컴 메세지
				case "002":		// 호스트 알림
				case "003":		// 서버 상태태
				case "004":		// 접속초기메세지 끝
				case "375":		// MOTD(공지사항) 시작
				case "372":		// MOTD
				case "376":		// MOTD 끝
				case "CAP":		// 트위치 명령어 수신 확인 메세지
				case "353":		// 접속자 목록(로드가 안된상태라 justinfan뿐이지만)
				case "366":		// 이름 목록 끝
				case "MODE":	// 관리자 권한 감지
				case "PART":	// 서버에서 유저 접속 해제
				case "HOSTTARGET":
											// 호스팅에 변화가 생겼을 때
					break;
				
				case "JOIN":	// 서버에 유저가 접속
					if(args[0].search("justinfan") != -1) {
						debugLog(
							args[2].substring(1) + "에 접속했습니다.");
					}
					if(++joinCount <= configData.channel.match(/#/g).length) {
						checkComplete();
					}
					break;
				
				default:			// 미처리 메세지
					if (configData.allMessageHandle) {
						debugLog("처리되지 않은 메세지를 수신했습니다.<br />" + line);
					}
					break;	
				}
			}
			else if (line[0] == "@") {
			// 트위치 명령어 처리
				var data = {};
				var twitchArgs = {};
				args.shift().split(";").forEach( function(element) {
					var keyval = element.split("=");
					twitchArgs[keyval[0]] = keyval[1];
				} );
			
				switch(args[1]) {
				case "ROOMSTATE":		// 방 정보
					break;
					
					
					
				case "USERNOTICE":
					if (twitchArgs.msg-param-months && twitchArgs.msg-param-months!="") {
					// 구독 메세지 수신
						data.subMonths = Number(twitchArgs.msg-param-months);
					}
					else {
						if (configData.allMessageHandle) {
							debugLog("처리되지 않은 메세지를 수신했습니다.<br />" + line);
						}
						break;
					}
					
				case "PRIVMSG":			// 채팅 수신
					// 이름 지정
					var nick = args[0].split(/[!@]/g)[1];
					var displayNick = twitchArgs["display-name"];
					var realNick = "";
					if (configData.useDisplayName) {
						if (displayNick.replace(/\s/g, "")!="") { realNick = displayNick; }
					}
					else { realNick = nick; }
					
					var message = args.slice(3).join(" ").substring(1);
					data.badges = twitchArgs.badges;
					data.color = twitchArgs.color;
					data.emotes = twitchArgs.emotes;
					data.nick = nick;
					
					// muteUser 적용
					if (configData.muteUser) {
						var match = configData.muteUser.find( function(element) {
							return (element == displayNick) || (element == nick);
						} );
						
						if (match != undefined) break;
					}
					
					// 클립 링크 파싱
					var clip = message.match(/(https?:\/\/)?clips\.[a-zA-Z./]*/g);
					if (clip!=null) {
						message = message.replace(clip[0], "");
						
						if (configData.loadClipPreview) {
							var clipRequest = new window.XMLHttpRequest();
							clipRequest.open("GET", clip[0], true);
							clipRequest.responseType = "document";
							
							var handler = function(evt) {
								if(clipRequest.readyState == 4) {
									if(clipRequest.status == 200) {
										var src, title, uploader;
										var metas = clipRequest.responseXML.getElementsByTagName("meta");
										for(var i=0; i<metas.length; ++i) {
											switch(metas[i].getAttribute("property")) {
												case "og:image":
													src = metas[i].content;
													break;
												case "og:description":
													title = metas[i].content.split(" - ")[0];
													uploader = metas[i].content.split(" - ")[1];
												default:
													break;
											}
										}
										
										data["clip"] =
											'<div class="chat_clip_box"><img src="' + src +
											'"></img><div class="chat_clip_title">' + title +
											'</div><div class="chat_clip_by">' + uploader + '</div></div>';
									}
									else {
										data["clip"] = '<div class="chat_clip_box invalid">Invalid Clip</div>';
										clipRequest.removeEventListener("readystatechange", handler);
									}
									addChatMessage(realNick, message, data);
								}
							};
							
							clipRequest.addEventListener('readystatechange', handler);
							clipRequest.send(null);
							break;
						}
						else {
							data["clip"] =
								'<div class="chat_clip_box text_only">' +
								configData.clipReplaceMsg + '</div>';
						}
					}
					
					// 유저 이름색 지정
					if (!data.color || data.color=="") {			
						var n = nick.charCodeAt(0) + nick.charCodeAt(1)*new Date().getDate();
						data.color = defaultColors[n % defaultColors.length];
					}
					
					// 비트 메세지 파싱
					if (message.match(cheerRegExp) != null) {
						var cheers = message.match(
							new RegExp("(" + cheerRegExp.source + ")\\d+ ", "ig"));
						var cheer = 0;
						for(var index in cheers) {
							cheer += Number(cheers[index].replace(cheerRegExp, ""));
						}
						data.cheers = cheer;
					}
					
					// 메세지 출력
					addChatMessage(realNick, message, data);
					break;		
					
				case "NOTICE":			// 공지 메세지
					switch(twitchArgs["msg-id"]) {
					case "host_off":	// 호스팅을 끊었을 때
					case "host_target_went_offline":
														// 호스팅이 끊겼을 때
						debugLog("호스팅이 종료되었습니다.");
						break;
						
					case "host_on":		// 호스팅되었을 때
						debugLog(
							args[5].slice(0,-1) + " 호스팅 중.\n" +
							"호스팅중인 채팅의 전송은 지원하지 않습니다.");					
						break;
						
					}
					break;
					
				case "CLEARCHAT":	// 매니저가 /clear 했을 때
					if(args.length == 4) {
						banChatMessage(args[3].substring(1));
					}
					else {
						document.getElementById("chat_wrapper").innerHTML = "";
						numChat = 0;
					}
					break;
			
				default:						// 미처리 메세지
					if (configData.allMessageHandle) {
						debugLog("처리되지 않은 메세지를 수신했습니다.<br />" + line);
					}
					break;
				}
			}
			else {
				// 서버 연결상태 확인용 ping-pong
				if (args[0] == "PING") { ws.send("PONG :tmi.witch.tv\r\n"); }
				else if (configData.allMessageHandle) {
					debugLog("처리되지 않은 메세지를 수신했습니다.<br />" + line);
				}
			}
		} );
	}
	ws.onclose = function() {
		debugLog(
			"채팅 서버와의 연결이 종료되었습니다.<br />" +
			configData.retryInterval + "초 후 재접속을 시도합니다.");
			setTimeout(
				function() { client(); },
				configData.retryInterval * 1000 );
	}
}) ();