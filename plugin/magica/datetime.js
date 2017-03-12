if(this.mg == undefined) {
	mg = {};
}

(function() {
	var INVALID_MESSAGE = "Invalid Date Format";
	
	var checkDigit = function(str)
	{
		if(!/^[0-9]+$/.test(str)) {
			throw new Error(INVALID_MESSAGE);
		}
		return parseInt(str);
	}

	// ‰[”N”»’è
	var isLeap = function(year) 
	{
		if(year % 400 == 0)
			return true;
		if(year % 100 == 0)
			return false;
		return year % 4 == 0;
	};
	
	var DAY_OF_MONTH_TABLE = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	
	var CalendarDateTime = function()
	{
	};

	CalendarDateTime.prototype =
	{
		year: 0,
		month: 1,
		day: 1,
		hour: 0,
		minute: 0,
		second: 0,
		milliSecond: 0,
		microSecond: 0,
		nanoSecond: 0,
		timeZone: 0,

		toString: function()
		{
			return "object CalendarDateTime";
		},
	};
	
	var checkDate = function(dateTime) 
	{
		var year = dateTime.year;
		var month = dateTime.month;
		var day = dateTime.day;
		var hour = dateTime.hour;
		var minute = dateTime.minute;
		var second = dateTime.second;
		var milliSecond = dateTime.milliSecond;
		var microSecond = dateTime.microSecond;
		var nanoSecond = dateTime.nanoSecond;
		
		if(!(1 <= month && month <= 12)) {
			throw new Error(INVALID_MESSAGE);
		}

		if(!(1 <= day && day <= 31)) {
			throw new Error(INVALID_MESSAGE);
		}
		if(day > DAY_OF_MONTH_TABLE[dateTime.month - 1]) {
			throw new Error(INVALID_MESSAGE);
		}
		if(month == 2 && !isLeap(year)) {
			if(day > 28) {
				throw new Error(INVALID_MESSAGE);
			}
		}
		
		if(!(0 <= hour && hour <= 23)) {
			throw new Error(INVALID_MESSAGE);
		}
		if(!(0 <= minute && minute <= 59)) {
			throw new Error(INVALID_MESSAGE);
		}
		if(!(0 <= second && second < 60)) {
			throw new Error(INVALID_MESSAGE);
		}
		
		if(!(0 <= milliSecond && milliSecond < 1000)) {
			throw new Error(INVALID_MESSAGE);
		}
		if(!(0 <= milliSecond && milliSecond < 1000)) {
			throw new Error(INVALID_MESSAGE);
		}
		if(!(0 <= nanoSecond && nanoSecond < 1000)) {
			throw new Error(INVALID_MESSAGE);
		}
	}
	
	var DateFormat_parse = function(str) 
	{
		var index = 0;
		var matched = null;
		
		str = str.trim();
		
		var readStr = function(pattern) 
		{
			pattern.lastIndex = index;
			
			var m = pattern.exec(str);
			if(m == null) {
				var s = str.substr(index);
				matched = null;
				index = str.length;
				
				return s;
			}

			var s = str.substr(index, m.index - index);
			matched = m[0];
			index = pattern.lastIndex;
			
			return s;
		};
		var readDigit = function(pattern) 
		{
			return checkDigit(readStr(pattern));
		};
		var skipSpace = function() 
		{
			while(index < str.length) {
				if(str.charAt(index) != " ")
					return;
				index++;
			}
		};
		
		var obj = new CalendarDateTime();
		
		var m = /[\/\-:]/.exec(str);
		if(m == null || m[0] != ":") {
			obj.year = readDigit(/[\/\-]/g);
			if(index < str.length) {
				obj.month = readDigit(/[\/\-]/g);
				if(index < str.length) {
					obj.day = readDigit(/[ T]/g);
					skipSpace();
				}
			}
		}
		
		if(index < str.length) {
			obj.hour = readDigit(/:/g);
			if(matched == null)
				throw new Error(INVALID_MESSAGE);
			if(index < str.length) {
				obj.minute = readDigit(/[:+\-Z]/g);
				if(index < str.length) {
					if(matched == ":") {
						// •b
						obj.second = readDigit(/[.+\-Z]/g);
						if(index < str.length) {
							// ¬”“_ˆÈ‰º
							if(matched == ".") {
								var ticksStr = readStr(/[+\-Z]/g);
								// Å‘å¸“xnano•b‚Ü‚ÅŽc‚·
								if(ticksStr.length > 9) {
									ticksStr = ticksStr.substr(0, 9);
								}
								var ticks = checkDigit(ticksStr);
								for(var i = 9; i > ticksStr.length; i--) {
									ticks *= 10;
								}
								obj.milliSecond = Math.floor(ticks / 1000000);
								obj.microSecond = Math.floor(ticks / 1000) % 1000;
								obj.nanoSecond = ticks % 1000;
							}
						}
					}
					
					// TimeZone
					if(matched == "+" || matched == "-" || matched == "Z") {
						if(matched == "Z" && index >= str.length) {
							obj.timeZone = 0;
						} else {
							var tzFlag = matched == "-" ? -1: 1;
							var tzHour = readDigit(/:/g);
							var tzMinute = checkDigit(str.substr(index));
							obj.timeZone = tzFlag * (tzHour * 60 + tzMinute);
						}
					}
				}
			}
		}
		
		checkDate(obj);
		
		return obj;
	};
	
	var formatDigit = function(outbuf, value, digits)
	{
		if(value < 0) {
			outbuf.push("-");
			value = -value;
		}
		
		var str = value.toString();
		
		console.log(value, str);
		
		if(str.length < digits) {
			switch(digits - str.length) {
			case 1:
				outbuf.push("0");
				break;
			case 2:
				outbuf.push("00");
				break;
			case 3:
				outbuf.push("000");
				break;
			case 4:
				outbuf.push("0000");
				break;
			default:
				for(var i = str.length; i < digits; i++) {
					outbuf.push("0");
				}
				break;
			}
		}
		outbuf.push(str);
	};
	
	var appendPadRight = function(outbuf, str, length, appendChar)
	{
		if(str.length >= length)
			return str;
		
		outbuf.push(str);
		
		for(var i = str.length; i < length; i++) {
			outbuf.push(appendChar);
		}
	};
	
	var formatSecondDegimal = function(outbuf, date, precision)
	{
		var buf = [];
		var length;
		
		if(date.nanoSecond == 0) {
			if(date.microSecond == 0) {
				if(date.milliSecond == 0) {
					formatDigit(outbuf, 0, precision);
					return;
				} else {
					formatDigit(buf, date.milliSecond, 3);
				}
			} else {
				formatDigit(buf, date.milliSecond * 1000 + date.microSecond, 6);
			}
		} else {
			formatDigit(buf, date.milliSecond * 1000000 + date.microSecond * 1000 + date.nanoSecond, 9);
		}
		
		var str = buf.join("");
		
		if(str.length == precision) {
			outbuf.push(str);
		} else if(str.length > precision) {
			outbuf.push(str.substr(0, precision));
		} else {
			appendPadRight(outbuf, str, precision, "0");
		}
	};
	
	var formatTimeZone = function(outbuf, tz, tzType)
	{
		if(tz == 0) {
			outbuf.push("Z");
			return;
		} else if(tz > 0) {
			outbuf.push("+");
		} else {
			outbuf.push("-");
			tz = -tz;
		}
		
		switch(tzType) {
		case "z":
			formatDigit(outbuf, Math.floor(tz / 60), 1);
			break;
		case "zz":
			formatDigit(outbuf, Math.floor(tz / 60), 2);
			break;
		case "zzz":
			formatDigit(outbuf, Math.floor(tz / 60), 2);
			outbuf.push(":");
			formatDigit(outbuf, tz % 60, 2);
			break;
		}
	};
	
	var DateFormat_format = function(formatString, date)
	{
		var text = formatString;
		
		var buf = [];
		
		var regexp = /(y{1,4}|M{1,2}|d{1,2}|H{1,2}|m{1,2}|s{1,2}|f+|z{1,3})/g;
		var index = 0;
		for(;;) {
			var m = regexp.exec(formatString);
			if(m == null) {
				buf.push(formatString.substr(index));
				break;
			}
			buf.push(formatString.substr(index, m.index - index));
			
			var pattern = m[0];
			switch(pattern) {
			case "y":
				buf.push(date.year % 10);
				break;
			case "yy":
				buf.push(date.year % 100);
				break;
			case "yyy":
			case "yyyy":
				formatDigit(buf, date.year, 4);
				break;
			case "M":
				buf.push(date.month);
				break;
			case "MM":
				formatDigit(buf, date.month, 2);
				break;
			case "d":
				buf.push(date.day);
				break;
			case "dd":
				formatDigit(buf, date.day, 2);
				break;
			case "H":
				buf.push(date.hour);
				break;
			case "HH":
				formatDigit(buf, date.hour, 2);
				break;
			case "m":
				buf.push(date.minute.toString());
				break;
			case "mm":
				formatDigit(buf, date.minute, 2);
				break;
			case "s":
				buf.push(date.second.toString());
				break;
			case "ss":
				formatDigit(buf, date.second, 2);
				break;
			case "z":
			case "zz":
			case "zzz":
				formatTimeZone(buf, date.timeZone, pattern);
				break;
			default:
				if(pattern.charAt(0) == "f") {
					formatSecondDegimal(buf, date, pattern.length);
				} else {
					throw new Error("INVALID PATTERN");
				}
				break;
			}
			index = regexp.lastIndex;
		}
		return buf.join("");
	};
	
	mg.DateFormat = {
		parse: DateFormat_parse,
		format: DateFormat_format,
	};
})();
