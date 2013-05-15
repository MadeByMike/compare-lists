
	$(function(){
		var left = [];
		var right = [];
		var differenceLeft = [];
		var differenceRight = [];
		var inBothLists = [];

		var updateResults = function(){
			$('#loading-indicator').show();
			$('#compareResult textarea').val('');
			var compareType = $('input[name=compareType]:checked').val();
			var resultList = [];
			switch (compareType) { 
				case 'left':
					resultList = differenceLeft;
					break
				case 'right':
					resultList = differenceRight;
					break
				case 'either':
					resultList = $.merge( $.merge([],differenceLeft), differenceRight);
					break
				case 'both':
					resultList = inBothLists;
					break
			}
			$.each(resultList, function(i){
				$('#compareResult textarea').val($('#compareResult textarea').val() + resultList[i] +"\n"); 
			});
			$('#compareLeft .count').html(left.length);
			$('#compareRight .count').html(right.length);
			$('#compareResult .count').html(resultList.length);
			$('#loading-indicator').hide();
		}

		/* For non-worker enabled browsers */
		if (!Array.prototype.filter){
			Array.prototype.filter = function(fun /*, thisp*/){
				"use strict";
				if (this == null)
				  throw new TypeError();

				var t = Object(this);
				var len = t.length >>> 0;
				if (typeof fun != "function")
				  throw new TypeError();

				var res = [];
				var thisp = arguments[1];
				for (var i = 0; i < len; i++){
				  if (i in t)
				  {
					var val = t[i]; // in case fun mutates this
					if (fun.call(thisp, val, i, t))
					  res.push(val);
				  }
				}
				return res;
			};
		}
		if (!Array.prototype.indexOf) {
			Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
				"use strict";
				if (this == null) {
					throw new TypeError();
				}
				var t = Object(this);
				var len = t.length >>> 0;
				if (len === 0) {
					return -1;
				}
				var n = 0;
				if (arguments.length > 1) {
					n = Number(arguments[1]);
					if (n != n) { // shortcut for verifying if it's NaN
						n = 0;
					} else if (n != 0 && n != Infinity && n != -Infinity) {
						n = (n > 0 || -1) * Math.floor(Math.abs(n));
					}
				}
				if (n >= len) {
					return -1;
				}
				var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
				for (; k < len; k++) {
					if (k in t && t[k] === searchElement) {
						return k;
					}
				}
				return -1;
			}
		}
		if(!String.prototype.trim) {
			String.prototype.trim = function () {
				return this.replace(/^\s+|\s+$/g,'');
			};
		}
		var isUnique = function(){
			var unique = [];
			for (var i = 0; i < left.length; i++) {
				$('.text-error').html('');
				$('#compareLeft .control-group,#compareRight .control-group').removeClass('error');
				if(unique.indexOf(left[i]) > -1) {
						$('#compareLeft .control-group').addClass('error');
						$('#compareLeft .text-error').html('This list contains duplicates.');
					break;
				} else{
					unique.push(left[i]);
				}
			}
			unique = [];
			for (var i = 0; i < right.length; i++) {
				if(unique.indexOf(right[i]) > -1) {
						$('#compareRight .control-group').addClass('error');
						$('#compareRight .text-error').html('This list contains duplicates.');
					break;
				} else{
					unique.push(right[i]);
				}
			}
		}
		var processLists = function(){
			left = $('#compareLeft textarea').val().split('\n').filter(function(v){return v.trim() !==''} );
			right = $('#compareRight textarea').val().split('\n').filter(function(v){return v.trim() !==''} );
			inBothLists = [];
			differenceLeft = [];
			differenceRight = [];
			for (var i = 0; i < left.length; i++) {
				console.log(right.indexOf(left[i]));
				if (right.indexOf(left[i]) == -1){
					if(differenceLeft.indexOf(left[i]) == -1) {
						differenceLeft.push(left[i]);
					}
				}else{
					if(inBothLists.indexOf(left[i]) == -1) {
						inBothLists.push(left[i]);
					}
				}
			}
			for (var i = 0; i < right.length; i++) {
				if (left.indexOf(right[i]) == -1){
					if(differenceRight.indexOf(right[i]) == -1) {
						differenceRight.push(right[i]);
					}
				}else{
					if(inBothLists.indexOf(right[i]) == -1) {
						inBothLists.push(right[i]);
					}
				}
			}
			isUnique();
			updateResults();
		}
		/* End for non-worker enabled browsers */

		if(window.Worker){
			$('h1').after('<p class="text-success">Yay! You\'re using a modern web browser. We should be able to process large lists quickly.</p>');
			var worker = new Worker('javascripts/worker.js');
			var processListsNowWithWorkers = function(){
				worker.onmessage = function(e) {
					var data = e.data;
					switch (data.cmd) {
						case 'db':
							console.log(data);
						break;
						case 'processlists':
							differenceLeft = data.differenceLeft;
							differenceRight = data.differenceRight;
							inBothLists = data.inBothLists;
							left = data.left;
							right = data.right;
							$('#compareLeft .control-group,#compareRight .control-group').removeClass('error');
							$('.text-error').html('');
							worker.postMessage({'cmd': 'isUnique', 'left': left, 'right': right});
							updateResults();
						break;
						case 'dupes1':
							$('#compareLeft .control-group').addClass('error');
							$('#compareLeft .text-error').html('This list contains duplicates.');
						break;
						case 'dupes2':
							$('#compareRight .control-group').addClass('error');
							$('#compareRight .text-error').html('This list contains duplicates.');
						break;
					}
				}
				left = $('#compareLeft textarea').val();
				right = $('#compareRight textarea').val();
				worker.postMessage({'cmd': 'processlists', 'left': left, 'right': right});
			}
			$('#compareLeft textarea,#compareRight textarea').change(processListsNowWithWorkers);
		}else{
			$('h1').after('<p class="text-warning">Your web browser is not be capable of comparing large lists efficiently. :( </p>');
			$('#compareLeft textarea,#compareRight textarea').change(processLists);
		}
		$('input[name=compareType]').change(updateResults);
	});