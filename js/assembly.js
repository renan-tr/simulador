const no_RAM = 100;
var code = ["leaw $1, %A"];
const commands = ["leaw","movw","addw","subw","rsubw","andw","orw", "incw", "decw", "negw", "notw", "jmp","jle", "jge", "jne", "jg", "jl", "je","nop"];
const RAM = new Uint16Array(16*1024+4800+2);
let regA = 0, regD = 0, regPC = -1;
let instruction_count = 0;
let labels = new Map();
let vars = new Map();
let line_number = [];
let line_count = 0;
const timeout_limit =  1e5;
const vars_no = 15;
var i = 0;

for(i=0;i<no_RAM;i++) {
	let tr = document.createElement('tr');
	let td1 = document.createElement('td');
	let td2 = document.createElement('td');
	var textlabel = document.createElement("label");
	textlabel.for = "RAM"+i;
	textlabel.innerText = " "+i;
	var textfield = document.createElement("input");
	textfield.type = "text";
	textfield.id = "RAM"+i;
	textfield.value = "0000000000000000";
	td1.appendChild(textlabel);
	td2.appendChild(textfield);
	tr.appendChild(td1);
	tr.appendChild(td2);
	document.getElementById('tabela').appendChild(tr);
}



function run_code(){
	regA = 0, regD = 0, regPC = 0;
	instruction_count = 0;
	//Reading
	code = document.getElementById("textarea").value.split(/\n/);
	for(i=0;i<no_RAM;i++) {
		let valor = document.getElementById("RAM"+i).value;
		RAM[i] = parseInt(valor, 2);
	}
	let SW = "000000";
	for(i=10;i>0;i--) {
		if (document.getElementById("SW"+i).checked){
			SW = SW + "1";
		} else {
			SW = SW + "0";
		}		
	}
	RAM[21185] = parseInt(SW, 2);

	//executing
	regPC = 0;
	read_code();
	while (regPC <line_count){
		instruction_count += 1;
		if (instruction_count > timeout_limit){
			break;
		}
		document.getElementById("last_line").innerText = code[line_number.indexOf(regPC)];
		execute_line(code[line_number.indexOf(regPC)]);			
	}
	//showing
	for(i=0;i<no_RAM;i++) {
		document.getElementById("RAM"+i).value = RAM[i].toString(2).padStart(16, '0');
	}
	document.getElementById("regD_value").innerText = regD.toString(2).padStart(16, '0');
	document.getElementById("regA_value").innerText = regA.toString(2).padStart(16, '0');
	let LEDs = RAM[21184].toString(2).padStart(16, '0');
	for(i=1;i<=10;i++) {
		if (LEDs.charAt(16-i) == "0"){
			document.getElementById("LED"+i).checked = false;
		} else {
			document.getElementById("LED"+i).checked = true;
		}
	}
	gen_fig();
}

function run_line(){
	if (regPC == -1){
		//Reading
		code = document.getElementById("textarea").value.split(/\n/);
		for(i=0;i<no_RAM;i++) {
			let valor = document.getElementById("RAM"+i).value;
			RAM[i] = parseInt(valor, 2);
		}
		let SW = "000000";
		for(i=10;i>0;i--) {
			if (document.getElementById("SW"+i).checked){
				SW = SW + "1";
			} else {
				SW = SW + "0";
			}		
		}
		RAM[21185] = parseInt(SW, 2);

		read_code();
		regPC = 0;
	}		

	//executing		
	if (line_number.indexOf(regPC) != -1){
		document.getElementById("last_line").innerText = code[line_number.indexOf(regPC)];
	}		
	execute_line(code[line_number.indexOf(regPC)]);			

	//showing
	for(i=0;i<no_RAM;i++) {
		document.getElementById("RAM"+i).value = RAM[i].toString(2).padStart(16, '0');
	}
	document.getElementById("regD_value").innerText = regD.toString(2).padStart(16, '0');
	document.getElementById("regA_value").innerText = regA.toString(2).padStart(16, '0');
	let LEDs = RAM[21184].toString(2).padStart(16, '0');
	for(i=1;i<=10;i++) {
		if (LEDs.charAt(16-i) == "0"){
			document.getElementById("LED"+i).checked = false;
		} else {
			document.getElementById("LED"+i).checked = true;
		}
	}
	gen_fig();
}

function reset_values(){
	regA = 0, regD = 0,	regPC = -1;
	instruction_count = 0, line_count = 0;
	labels = new Map();
	vars = new Map();
	line_number = [];

	document.getElementById("regD_value").innerText = regD.toString(2).padStart(16, '0');
	document.getElementById("regA_value").innerText = regA.toString(2).padStart(16, '0');
	document.getElementById("last_line").innerText = "";

	for(i=0;i<no_RAM;i++) {
		RAM[i] = 0;
		document.getElementById("RAM"+i).value = RAM[i].toString(2).padStart(16, '0');
		
	}
	for(i=16384;i<21184;i++) {
		RAM[i] = 0;
	}
	for(i=1;i<=10;i++) {
		document.getElementById("SW"+i).checked = false;
	}
	RAM[21184] = 0;
	for(i=1;i<=10;i++) {
		document.getElementById("LED"+i).checked = false;
	}
	gen_fig();
}

function gen_fig(){
	var ctx = document.getElementById("CanvasLCD").getContext("2d");
	var imgData=ctx.getImageData(0,0,320,240);
	var data=imgData.data;
	for(var RAM_px=16384;RAM_px<21184;RAM_px++){
		var px16 = RAM[RAM_px].toString(2).padStart(16, '0');
		var px16_list = px16.split("");
		for (var px=0;px<16;px++){
			if (px16_list[px] == 0){
				data[((RAM_px-16384)*4*16)+(px*4)+0] = 255;
				data[((RAM_px-16384)*4*16)+(px*4)+1] = 255;
				data[((RAM_px-16384)*4*16)+(px*4)+2] = 255;
				data[((RAM_px-16384)*4*16)+(px*4)+3] = 255;
			} else{
				data[((RAM_px-16384)*4*16)+(px*4)+0] = 0;
				data[((RAM_px-16384)*4*16)+(px*4)+1] = 0;
				data[((RAM_px-16384)*4*16)+(px*4)+2] = 0;
				data[((RAM_px-16384)*4*16)+(px*4)+3] = 255;
			}
		}
	}
	ctx.putImageData(imgData,0,0);
}

function checkIfStringStartsWith(str, substrs) {
	return substrs.some(substr => str.startsWith(substr));
}

function read_code(){
	line_count = 0;
	code.forEach((element) =>{
		let instruction = element.trimStart().trimEnd().split(";");
		instruction = instruction[0].trimEnd();
		if (checkIfStringStartsWith(instruction, commands)){
			line_number.push(line_count);
			line_count +=1;
		} else if (instruction.includes(":")){
			let label = instruction.split(":");
			label = label[0];
			if (labels.has(label)){
				alert("Label already exists: " + label);
			} else {
				labels.set(label,line_count);
				line_number.push('L');
			}
		} else {
			line_number.push('U');
		}
	});
}

function is_valid_instruction(line) {
	let instruction = line.trimStart().trimEnd().split(";");
	instruction = instruction[0].trimEnd();
	if (instruction.includes(":")) {
		instruction = instruction.split(":");
		instruction = instruction[0];
		if (instruction.length > 0){
			return instruction;
		} 
	} else{
		instruction = instruction.replaceAll(",", " ").split(/\s+/);
		if (instruction.length > 0){
			if ( ((instruction[0] === "leaw") && (instruction.length == 3)) ||                                     
			((instruction[0] === "movw") && (instruction.length >= 3) && (instruction.length <= 5)) ||
			((instruction[0] === "addw") && (instruction.length >= 4) && (instruction.length <= 6)) ||
			((instruction[0] === "subw") && (instruction.length >= 4) && (instruction.length <= 6)) ||
			((instruction[0] === "rsubw") && (instruction.length >= 4) && (instruction.length <= 6)) ||        
			((instruction[0] === "andw") && (instruction.length >= 4) && (instruction.length <= 6)) ||
			((instruction[0] === "orw") && (instruction.length >= 4) && (instruction.length <= 6)) ||         
			((instruction[0] === "incw") && (instruction.length == 2)) ||
			((instruction[0] === "negw") && (instruction.length == 2)) ||
			((instruction[0] === "decw") && (instruction.length == 2)) ||
			((instruction[0] === "notw") && (instruction.length == 2)) ||
			((instruction[0] === "jmp") && (instruction.length == 1)) ||
			((instruction[0] === "jne") && (instruction.length == 2)) ||
			((instruction[0] === "jle") && (instruction.length == 2)) ||
			((instruction[0] === "jge") && (instruction.length == 2)) ||
			((instruction[0] === "jl") && (instruction.length == 2)) ||
			((instruction[0] === "jg") && (instruction.length == 2)) ||
			((instruction[0] === "je") && (instruction.length == 2)) ||
			((instruction[0] === "nop") && (instruction.length == 1))
			) {
				return instruction
			} else{
				alert("Wrong instruction: " + line);
			return -1;
		}
		} else{
			alert("Wrong instruction: " + line);
			return -1;
		}
	}
}

function execute_line(line) {
	let mnemnonic = is_valid_instruction(line);
	let new_value = 0;
	let value1 = 0;
	let value2 = 0;
	if (mnemnonic != -1){
		switch (mnemnonic[0]) {
			case "leaw":
				if (mnemnonic[2] !== "%A"){
					alert("Wrong register: " + line);
				} else if (!isNaN(mnemnonic[1].substring(1))){
					if (parseInt(mnemnonic[1].substring(1)) > 65535 || parseInt(mnemnonic[1].substring(1)) < 0){
						alert("Wrong value: " + line);
					} else{							
						regA = parseInt(mnemnonic[1].substring(1));
					}
				} else {
					let text = mnemnonic[1].substring(1);
					if (labels.has(text)) {
						regA = labels.get(text);
					} else {
						if (!vars.has(text)) {
							vars.set(text,vars_no);
							vars_no += 1;
						}  else {
							regA = vars.get(text);
						}
					}
				}
				regPC += 1;
				break;
			case "movw":
				if ((mnemnonic[1] === '$1') || (mnemnonic[1] === '$0') || (mnemnonic[1] === '$-1')){
					new_value = parseInt(mnemnonic[1].substring(1));
					if (new_value == -1){
						new_value = 65535;
					}			
				} else {
					new_value = get_value(mnemnonic,1);
				}
				save_value(mnemnonic,2,new_value);
				regPC += 1;
				break;
			case "addw":
				value1 = get_value(mnemnonic, 1);
				value2 = get_value(mnemnonic, 2);
				new_value = value1 + value2;
				if (new_value > 65535){
					new_value -= 65536;
				} else if (new_value < 0){
					new_value += 65536;
				}
				save_value(mnemnonic, 3, new_value);
				regPC += 1;
				break;
			case "subw":
				value1 = get_value(mnemnonic, 1);
				value2 = get_value(mnemnonic, 2);
				new_value = value1 - value2;
				if (new_value > 65535){
					new_value -= 65536;
				} else if (new_value < 0){
					new_value += 65536;
				}
				save_value(mnemnonic, 3, new_value);
				regPC += 1;
				break;
			case "rsubw":
				value1 = get_value(mnemnonic, 2);
				value2 = get_value(mnemnonic, 1);
				new_value = value1 - value2;
				if (new_value > 65535){
					new_value -= 65536;
				} else if (new_value < 0){
					new_value += 65536;
				}
				save_value(mnemnonic, 3, new_value);
				regPC += 1;
				break;
			case "andw":
				value1 = get_value(mnemnonic, 1);
				value2 = get_value(mnemnonic, 2);
				new_value = value1 & value2;
				self.save_value(mnemnonic, 3, value)
				regPC += 1;
				break;
			case "orw":
				value1 = get_value(mnemnonic, 1);
				value2 = get_value(mnemnonic, 2);
				new_value = value1 | value2;
				self.save_value(mnemnonic, 3, value)
				regPC += 1;
				break;
			case "incw":
				if (mnemnonic[1] === "%A"){
					if (regA == 65535){
						regA = 0;
					} else {
						regA += 1;
					}
				} else if (mnemnonic[1] === "%D"){
					if (regD == 65535){
						regD = 0;
					} else {
						regD += 1;
					}
				} else {
					alert("Wrong register: " + mnemnonic[1]);
				}
				regPC += 1;
				break;
			case "decw":
				if (mnemnonic[1] === "%A"){
					if (regA == 0){
						regA = 65535;
					} else {
						regA -= 1;
					}
				} else if (mnemnonic[1] === "%D"){
					if (regD == 0){
						regD = 65535;
					} else {
						regD -= 1;
					}
				} else {
					alert("Wrong register: " + mnemnonic[1]);
				}
				regPC += 1;
				break;
			case "negw":
				if (mnemnonic[1] === "%A"){
					regA = -regA;
					regA += 65536;
				} else if (mnemnonic[1] === "%D"){
					regD = -regD;
					regD += 65536;
				} else {
					alert("Wrong register: " + mnemnonic[1]);
				}
				regPC += 1;
				break;
			case "notw":
				if (mnemnonic[1] === "%A"){
					regA = -regA -1;
					regA += 65536;
				} else if (mnemnonic[1] === "%D"){
					regD = -regD -1;
					regD += 65536;
				} else {
					alert("Wrong register: " + mnemnonic[1]);
				}
				regPC += 1;
				break;
			case "jmp":
				regPC = regA;
				break;
			case "jne":
				if (mnemnonic[1] !== "%D"){
					alert("Wrong register: " + mnemnonic[1]);
				} else {
					if (regD != 0){
						regPC = regA;
					} else {
						regPC += 1;
					}
				}
				break;
			case "jle":
				if (mnemnonic[1] !== "%D"){
					alert("Wrong register: " + mnemnonic[1]);
				} else {
					if ((regD > 32768) || (regD == 0)) {
						regPC = regA;
					} else {
						regPC += 1;
					}
				}
				break;
			case "jge":
				if (mnemnonic[1] !== "%D"){
					alert("Wrong register: " + mnemnonic[1]);
				} else {
					if (regD < 32768) {
						regPC = regA;
					} else {
						regPC += 1;
					}
				}
				break;
			case "je":
				if (mnemnonic[1] !== "%D"){
					alert("Wrong register: " + mnemnonic[1]);
				} else {
					if (regD == 0) {
						regPC = regA;
					} else {
						regPC += 1;
					}
				}
				break;
			case "jg":
				if (mnemnonic[1] !== "%D"){
					alert("Wrong register: " + mnemnonic[1]);
				} else {
					if ((regD < 32768) && (regD > 0)) {
						regPC = regA;
					} else {
						regPC += 1;
					}
				}
				break;
			case "jl":
				if (mnemnonic[1] !== "%D"){
					alert("Wrong register: " + mnemnonic[1]);
				} else {
					if (regD > 32768) {
						regPC = regA;
					} else {
						regPC += 1;
					}
				}
				break;
			default:
				regPC += 1;
		}
	}
}

function get_value(line_list, pos) {
	switch (line_list[pos]) {
		case "%A":
			return regA;
		case "%D":
			return regD;
		case "(%A)":
			return RAM[regA];
		case "$1":
			return 1;
		case "$-1":
			return 65535;
		case "$0":
			return 0;
		default:
			alert("Wrong origin: " + line_list[pos]);
	}
}

function save_value(line_list, pos_init, value) {
	for (let i = pos_init; i < line_list.length; i++) {
		switch (line_list[i]) {
			case "%A":
				regA = value;
				break;
			case "%D":
				regD = value;
				break;
			case "(%A)":
				RAM[regA] = value;
				break;
			default:
				alert("Wrong destination: " + line_list[i]);
		}
	} 		
}

