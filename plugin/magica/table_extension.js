/**
 * t.hada 2017/02/18
 *
 * table grid plugin.
 */
function MgTableExtension(table)
{
	function toPxStr(value)
	{
		return value.toString() + "px";
	}

	function removeAndGetNode(node) 
	{
		node.parentNode.removeChild(node);
		return node;
	}
	
	function addClass(elem, className)
	{
		if(elem.className == null || elem.className.length <= 0) {
			elem.className = className;
		} else {
			elem.className = elem.className + " " + className;
		}
	}
	
	function calcTableWidth(bodyElem)
	{
		if(bodyElem.rows.length <= 0)
			return 0;
		var rowSample = bodyElem.rows[0];
		var cellsLength = rowSample.cells.length;
		var tableWidth = 0;
		for(var i = 0; i < cellsLength; i++) {
			tableWidth += rowSample.cells[i].offsetWidth;
		}
		return tableWidth;
	}

	function filterFixCell(rows)
	{
		var rowsLength = rows.length;
		for(var i = 0; i < rowsLength; i++) {
			for (var j = rows[i].cells.length; j > 0; j--) {
				var item = rows[i].cells[j-1];
				if(item.getAttribute("fix") != "true") {
	 				item.parentNode.removeChild(item);
				}
	 		}
		}
	}

	function filterNotFixCell(rows)
	{
		var rowsLength = rows.length;
		for(var i = 0; i < rowsLength; i++) {
			for (var j = rows[i].cells.length; j > 0; j--) {
				var item = rows[i].cells[j-1];
				if(item.getAttribute("fix") == "true") {
	 				item.parentNode.removeChild(item);
				}
	 		}
		}
	}
	
	var parent = table.parentNode;
	var next = table.nextSibling;
	
	// 行高さを取得して各行へ設定
	var rows = [];
	var rowHeights = [];
	
	if(table.tHead != null) {
		var section = table.tHead;
		var rowsLength = section.rows.length;
		for(var i = 0; i < rowsLength; i++) {
			var row = section.rows[i];
			rows.push(row);
			rowHeights.push(toPxStr(row.offsetHeight + 1));
		}
	}
	
	var bodiesLength = table.tBodies.length;
	for(var i = 0; i < bodiesLength; i++) {
		var section = table.tBodies[i];
		var rowsLength = section.rows.length;
		for(var j = 0; j < rowsLength; j++) {
			var row = section.rows[j];
			rows.push(row);
			rowHeights.push(toPxStr(row.offsetHeight + 1));
		}
	}
	
	// 行高さの設定はテーブル要素を
	// documentツリーから切り離してから(reflow抑制)
	table.parentNode.removeChild(table);

	var rowsLength = rows.length;
	for(var i = 0; i < rowsLength; i++) {
		rows[i].style.height = rowHeights[i];
	}
	
	// 偶数行、奇数行のクラス指定
	bodiesLength = table.tBodies.length;
	for(var i = 0; i < bodiesLength; i++) {
		var section = table.tBodies[i];
		addClass(section, (i % 2 == 0) ? "even": "odd");
	}
	
	var head1Table = table.cloneNode(false);
	var head2Table = table.cloneNode(false);
	var body1Table = table.cloneNode(false);
	var body2Table = table;
	
	// ヘッダテーブルの生成
	var thead = removeAndGetNode(table.tHead);
	var thead1 = thead.cloneNode(true);
	filterFixCell(thead1.rows);
	var thead2 = thead;
	filterNotFixCell(thead2.rows);
	
	head1Table.appendChild(thead1);
	head2Table.appendChild(thead2);
	
	// ボディテーブルの生成
	for(var i = 0; i < table.tBodies.length; i++) {
		var tbody1 = table.tBodies[i].cloneNode(true);
		filterFixCell(tbody1.rows);
		var tbody2 = table.tBodies[i];
		filterNotFixCell(tbody2.rows);

		body1Table.appendChild(tbody1);
	}
	
	var gridDiv = document.createElement("div");
	gridDiv.className = "mg_grid";
	
	var head1Div = document.createElement("div");
	head1Div.className = "mg_grid_head";
	head1Div.appendChild(head1Table);
	gridDiv.appendChild(head1Div);
	
	var head2Div = document.createElement("div");
	head2Div.className = "mg_grid_head";
	head2Div.appendChild(head2Table);
	gridDiv.appendChild(head2Div);
	
	var body1Div = document.createElement("div");
	body1Div.className = "mg_grid_body";
	body1Div.appendChild(body1Table);
	gridDiv.appendChild(body1Div);
	
	var body2Div = document.createElement("div");
	body2Div.className = "mg_grid_body";
	body2Div.appendChild(body2Table);
	gridDiv.appendChild(body2Div);
	
	parent.insertBefore(gridDiv, next);
	
	// 要素の再配置
	var gridStyle = table.getAttribute("grid-style");
	if(gridStyle != null)
		gridDiv.setAttribute("style", gridStyle);
	var gridClass = table.getAttribute("grid-class");
	if(gridClass != null)
		addClass(grid, gridClass);
	
	var head1Width = calcTableWidth(head1Table.tHead);
	var head2Width = calcTableWidth(head2Table.tHead);

	head1Table.style.width = toPxStr(head1Width);
	body1Table.style.width = toPxStr(head1Width);
	head2Table.style.width = toPxStr(head2Width);
	body2Table.style.width = toPxStr(head2Width);

	gridDiv.style.position = "relative";

	head1Div.style.position = "absolute";
	head2Div.style.position = "absolute";
	body1Div.style.position = "absolute";
	body2Div.style.position = "absolute";
	
	head1Div.style.overflow = "hidden";
	head2Div.style.overflow = "hidden";
	body1Div.style.overflow = "hidden";
	body2Div.style.overflow = "scroll";
	
	head1Div.style.top = "0px";
	head2Div.style.top = "0px";
	head1Div.style.left = "0px";
	body1Div.style.left = "0px";
	
	var offsetHeight = Math.max(head1Div.offsetHeight, head2Div.offsetHeight);
	var offsetWidth = Math.max(head1Div.offsetWidth, body1Div.offsetWidth);
	
	head2Div.style.left = toPxStr(offsetWidth);
	head2Div.style.right = "16px";
	
	body1Div.style.top = toPxStr(offsetHeight);
	body1Div.style.bottom = "16px";
	
	body2Div.style.top = toPxStr(offsetHeight);
	body2Div.style.left = toPxStr(offsetWidth);
	body2Div.style.right = "0px";
	body2Div.style.bottom = "0px";
	gridDiv.style.height = toPxStr(body2Div.offsetTop + body2Div.offsetHeight - 1);

	body2Div.addEventListener('scroll', function() {
		body1Div.scrollTop = 
			body1Table.offsetHeight * body2Div.scrollTop / body2Table.offsetHeight;
		head2Div.scrollLeft = 
			head2Table.offsetWidth * body2Div.scrollLeft / body2Table.offsetWidth;
	});
}
