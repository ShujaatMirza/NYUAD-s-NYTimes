
//----------CLIENT-SIDE SOCKET CODE----------//
//Init socket object
var socket = io();
//Receive data from the server using .on()
socket.on('message', function (data) {
	//console.log(data);
	handleNotifications(data);
});

//initialize the like/dislike buttons
var quantityLikes = [];
var quantityDislikes = [];
var netRating = [];
for(i=0;i<12; i++){
	quantityLikes[i]=0;
	quantityDislikes[i]=0;
	netRating[i] = 0;
}

var makeHTML = function (data) {
	//template += new Date(data.created_at);
	var template = '<div id="newsBlock">';
	for(i=0;i<12; i++){
		template += '<div id ="newsItem-'+i+'">';
		template += '<div id ="newsTitle-'+i+'">'+data.results[i].title+'</div>';
		if (data.results[i].multimedia[3]){
			imgSrc= data.results[i].multimedia[3].url;
		}else{
			imgSrc='http://www.coanews.org/liies/2014/11/01.jpg';
		}
		console.log(imgSrc);
		template += '<a target="_blank" href="'+data.results[i].url+'"><div class ="coverPhoto"><img src="'+imgSrc+'"/></div></a>';
		template += '<br><a target="_blank" href="'+data.results[i].url+'">Read More<a/>';
		template += '<br><button type="button" value="Like" id="LikeButton-'+ i + '">Important</button>';
		template += '<br><button type="button" value="Dislike" id="DislikeButton-' + i + '">Not So Important</button>';
		template += '<div class="rating-'+i+'"><em>Rating:'+ netRating[i] +'</em></div>';
		template += '</div>';
	}

	template +='</div>';
	console.log(data);
	return template;
};


function updateLocation(data){
	for(i=0;i<12; i++){
		netRating[i] = quantityLikes[i] - quantityDislikes[i];
	}
	console.log(netRating);
	var orderList={};
	for(i=0;i<12; i++){
		orderList[i] =netRating[i];
	}
	//console.log(orderList);
	var keysSorted=[];
	keysSorted = Object.keys(orderList).sort(function(a,b){return orderList[b]-orderList[a]});
	//console.log(keysSorted);

	$.each(keysSorted, function(index, value){
		$('#newsBlock').append($('#newsItem-'+value));
		$('.rating-'+value).replaceWith('<div class="rating-'+value+'"><em>Rating:'+ netRating[value] +'</em></div>');

	});
}

function showNotification(notificationData){

	var newsTitle = $('#newsTitle-'+notificationData.news).text();
	var lobibox;
	Lobibox.notify('info', {
		title: 'Notification',
		img: 'http://www.coanews.org/liies/2014/11/01.jpg',
		msg:'"'+newsTitle+'" received a '+notificationData.value,
		position: 'bottom right',
		showClass: 'fadeInDown',
		hideClass: 'fadeUpDown',
		delay: 3000,
		sound:'dist/sounds/sound1.ogg',
		width: 300});
}

function handleNotifications(notificationData){
	var Notification= notificationData.news;
	if (notificationData.value =='like'){
		quantityLikes[Notification]+=1;
		//socket.emit('NoOfLikes',quantityLikes[theIDVal]);
		//console.log('NoOfLikes',quantityLikes[Notification]);
	}else{
		quantityDislikes[Notification]+=1;
		//console.log('NoOfDislikes',quantityDislikes[Notification]);
	}
	updateLocation(notificationData);
	showNotification(notificationData);
}


function setClickEvent(theIDVal){
	var idLike = "#LikeButton-" + theIDVal;
	$(idLike).click(function(e){
		//console.log(e.target);
		socket.emit('like',theIDVal);

	});
	var idDisLike = "#DislikeButton-" + theIDVal;
	$(idDisLike).click(function(e){
		//console.log(e.target);
		socket.emit('Dislike',theIDVal);
	});
}

function loadNews() {
	$.ajax({
		url: "/api",
		type: "GET",
		data: JSON,
		error: function(resp){
			console.log(resp);
		},
		success: function (resp) {
			console.log(resp);
			$("#posts").empty();

			if (resp.noData){
				return;
			}

			// Use Underscore's sort method to sort our records by date.
			var sorted = _.sortBy(resp, function (row) { return row.doc.created_at;});

			// Now that the notes are sorted, add them to the page
			sorted.forEach(function (row) {
				var htmlString = makeHTML(row.doc);
				$('#posts').append(htmlString);
			});
			for (var i=0; i<12;i++){
				setClickEvent(i);
			}
		}
	});
}
$(document).ready(function(){
	console.log('In Index');
	loadNews();
	
	var array = _.sortBy([2, 3, 1], function(num) {
		return num;
    });
    console.log(array);
    setTimeout(function(){
	},delay);
});





