let x_value = 0, y_value = 0, zx_out = 0, zy_out = 0, nx_out = 0, ny_out = 0, and_out = 0, add_out = 0, mux_out = 0, no_out = 0;
let zx = 0, zy = 0, nx = 0, ny = 0, f = 0, no = 0, zr = 0, ng = 0;

function update_values(){			
	x_value = parseInt(document.getElementById("X").value,2);
	y_value = parseInt(document.getElementById("Y").value,2);

	if (document.getElementById("zx").checked){
		zx_out = 0;
	} else {
		zx_out = x_value;
	}
	if (document.getElementById("zy").checked){
		zy_out = 0;
	} else {
		zy_out = y_value;
	}
	if (document.getElementById("nx").checked){
		nx_out = 65536 - zx_out -1;
	} else {
		nx_out = zx_out;
	}
	if (document.getElementById("ny").checked){
		ny_out = 65536 - zy_out -1;
	} else {
		ny_out = zy_out;
	}
	add_out = nx_out + ny_out;
	if (add_out > 65535){
		add_out -= 65536;
	}
	and_out = nx_out & ny_out;
	if (document.getElementById("f").checked){
		mux_out = add_out;
	} else {
		mux_out = and_out;
	}
	if (document.getElementById("no").checked){
		no_out = 65536 - mux_out -1;
	} else {
		no_out = mux_out;
	}
	if (no_out > 32768){
		ng = 1;
	} else {
		ng = 0;
	}			
	if (no_out == 0){
		zr = 1;
	} else {
		zr = 0;
	}
	
	//Exibindo
	document.getElementById("X_input").innerText = "X\n" + x_value.toString(2).padStart(16, '0') + "\n0x" + x_value.toString(16).padStart(4, '0');
	document.getElementById("Y_input").innerText = "Y\n" + y_value.toString(2).padStart(16, '0') + "\n0x" + y_value.toString(16).padStart(4, '0');
	document.getElementById("zx_out").innerText = "0x" + zx_out.toString(16).padStart(4, '0');
	document.getElementById("zy_out").innerText = "0x" + zy_out.toString(16).padStart(4, '0');
	document.getElementById("nx_out").innerText = "0x" + nx_out.toString(16).padStart(4, '0');
	document.getElementById("ny_out").innerText = "0x" + ny_out.toString(16).padStart(4, '0');
	document.getElementById("add_out").innerText = "0x" + add_out.toString(16).padStart(4, '0');
	document.getElementById("and_out").innerText = "0x" + and_out.toString(16).padStart(4, '0');
	document.getElementById("mux_out").innerText = "0x" + mux_out.toString(16).padStart(4, '0');
	document.getElementById("no_out").innerText = "0x" + no_out.toString(16).padStart(4, '0');
	document.getElementById("nx_in").innerText = nx;
	document.getElementById("ny_in").innerText = ny;
	document.getElementById("zx_in").innerText = zx;
	document.getElementById("zy_in").innerText = zy;
	document.getElementById("f_in").innerText = f;
	document.getElementById("no_in").innerText = no;
	document.getElementById("zr_out").innerText = "zr = " + zr;
	document.getElementById("ng_out").innerText = "ng = " + ng;
	if (zr == 1){
		document.getElementById("zr").checked = true;
	} else {
		document.getElementById("zr").checked = false;
	}
	if (ng == 1){
		document.getElementById("ng").checked = true;
	} else {
		document.getElementById("ng").checked = false;
	}
}
