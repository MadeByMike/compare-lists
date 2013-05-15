/* For worker enabled browsers only */
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
/* It's ok to expect that a browser that supports web workers supports the above? I think so but..meh! */

var processLists = function(data){
	var left = data.left.split('\n').filter(function(v){return v.trim() !==''} );
	var right = data.right.split('\n').filter(function(v){return v.trim() !==''});
	var differenceLeft = [];
	var differenceRight = [];
	var inBothLists = [];

	for (var i = 0; i < left.length; i++) {
		if (right.indexOf(left[i]) == -1){
			differenceLeft.push(left[i]);
		}else{
			if(inBothLists.indexOf(left[i]) == -1) {
				inBothLists.push(left[i]);
			}
		}
	}
	for (var i = 0; i < right.length; i++) {
		if (left.indexOf(right[i]) == -1){
			differenceRight.push(right[i]);
		}else{
			if(inBothLists.indexOf(right[i]) == -1) {
				inBothLists.push(right[i]);
			}
		}
	}
	self.postMessage({'cmd':'processlists','differenceLeft': differenceLeft, 'differenceRight': differenceRight, 'inBothLists':inBothLists, 'left': left, 'right':right});
}
var isUnique = function(data){
	var left = data.left;
	var right = data.right;
	var unique = [];
	for (var i = 0; i < left.length; i++) {
		if(unique.indexOf(left[i]) > -1) {
			self.postMessage({'cmd':'dupes1'});
			break;
		} else{
			unique.push(left[i]);
		}
	}
	unique = [];
	for (var i = 0; i < right.length; i++) {
		if(unique.indexOf(right[i]) > -1) {
			self.postMessage({'cmd':'dupes2'});
			break;
		} else{
			unique.push(left[i]);
		}
	}
}
self.addEventListener('message', function(e) {
	var data = e.data;
	switch (data.cmd) {
		case 'processlists':
			processLists(data);
		break;
		case 'isUnique':
			isUnique(data);
		break;
	};
}, false);