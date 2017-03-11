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
	
	var W3CDTF_parse = function(str) {
	
	};
	var W3CDTF_format = function(value) {
	
	};
	
	var SimpleDateTime_parse = function(str) 
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
		
		obj.year = readDigit(/[\/\-]/g);
		if(index < str.length) {
			obj.month = readDigit(/[\/\-]/g);
			if(index < str.length) {
				obj.day = readDigit(/[ T]/g);
				skipSpace();
				
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
			}
		}
		
		checkDate(obj);
		
		return obj;
	};
	
	var DateFormat_format = function(format, date) 
	{
		checkDate(date);
		
		
		
		return obj;
	};
	
	mg.DateFormat = {
		parse: SimpleDateTime_parse,
	};
})();
