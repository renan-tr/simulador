const no_RAM = 300;
var code = ["function Main.main 0"];
const commands = ["add","sub","neg","not","and","or","eq", "gt", "lt", "goto", "if-goto", "call", "push", "pop", "return"];
const RAM = new Uint16Array(16*1024+4);
let regPC = -1;
let instruction_count = 0;
let labels = new Map();
let functions = new Map();
let locals = new Map();
let line_number = [];
let line_count = 0;
const timeout_limit =  1e5;
var i = 0;
let ARG_new = 0;
let PC_old = 0;
let LCL_old = 0;
let ARG_old = 0;
let THIS_old = 0;
let THAT_old = 0;

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
	let GPI = "";
	for(i=16;i>0;i--) {
		if (document.getElementById("GPI"+i).checked){
			GPI = GPI + "1";
		} else {
			GPI = GPI + "0";
		}		
	}
	RAM[16385] = parseInt(SW, 2);
	RAM[16387] = parseInt(GPI, 2);
	RAM[0] = 256;
	
	//executing
	read_code();	
	regPC = functions.get("Main.main");
	
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
	let LEDs = RAM[16384].toString(2).padStart(16, '0');
	for(i=1;i<=10;i++) {
		if (LEDs.charAt(16-i) == "0"){
			document.getElementById("LED"+i).checked = false;
		} else {
			document.getElementById("LED"+i).checked = true;
		}
	}
	let GPO = RAM[16386].toString(2).padStart(16, '0');
	for(i=1;i<=16;i++) {
		if (GPO.charAt(16-i) == "0"){
			document.getElementById("GPO"+i).checked = false;
		} else {
			document.getElementById("GPO"+i).checked = true;
		}
	}
}

function run_line(){
	if (regPC == -1){
		//Reading
		code = document.getElementById("textarea").value.split(/\n/);
		for(i=0;i<no_RAM;i++) {
			let valor = document.getElementById("RAM"+i).value;
			RAM[i] = parseInt(valor, 2);
		}
		
		RAM[0] = 256;

		read_code();
		regPC = functions.get("Main.main");
	}
	let SW = "000000";
	for(i=10;i>0;i--) {
		if (document.getElementById("SW"+i).checked){
			SW = SW + "1";
		} else {
			SW = SW + "0";
		}		
	}
	let GPI = "";
	for(i=16;i>0;i--) {
		if (document.getElementById("GPI"+i).checked){
			GPI = GPI + "1";
		} else {
			GPI = GPI + "0";
		}		
	}
	RAM[16385] = parseInt(SW, 2);
	RAM[16387] = parseInt(GPI, 2);		

	//executing		
	if (line_number.indexOf(regPC) != -1){
		document.getElementById("last_line").innerText = code[line_number.indexOf(regPC)];
	}		
	execute_line(code[line_number.indexOf(regPC)]);			

	//showing
	for(i=0;i<no_RAM;i++) {
		document.getElementById("RAM"+i).value = RAM[i].toString(2).padStart(16, '0');
	}
	let LEDs = RAM[16384].toString(2).padStart(16, '0');
	for(i=1;i<=10;i++) {
		if (LEDs.charAt(16-i) == "0"){
			document.getElementById("LED"+i).checked = false;
		} else {
			document.getElementById("LED"+i).checked = true;
		}
	}
	let GPO = RAM[16386].toString(2).padStart(16, '0');
	for(i=1;i<=16;i++) {
		if (GPO.charAt(16-i) == "0"){
			document.getElementById("GPO"+i).checked = false;
		} else {
			document.getElementById("GPO"+i).checked = true;
		}
	}
}

function reset_values(){
	regPC = -1;
	instruction_count = 0, line_count = 0;
	labels = new Map();
	functions = new Map();
	locals = new Map();
	line_number = [];

	document.getElementById("last_line").innerText = "";

	for(i=0;i<no_RAM;i++) {
		RAM[i] = 0;
		document.getElementById("RAM"+i).value = RAM[i].toString(2).padStart(16, '0');
		
	}
	for(i=1;i<=10;i++) {
		document.getElementById("SW"+i).checked = false;
	}
	for(i=1;i<=16;i++) {
		document.getElementById("GPI"+i).checked = false;
	}
	RAM[16384] = 0;
	RAM[16386] = 0;
	for(i=1;i<=10;i++) {
		document.getElementById("LED"+i).checked = false;
	}
	for(i=1;i<=16;i++) {
		document.getElementById("GPO"+i).checked = false;
	}
}

function checkIfStringStartsWith(str, substrs) {
	return substrs.some(substr => str.startsWith(substr));
}

function read_code(){
	line_count = 0;
	code.forEach((element) =>{
		let instruction = element.trimStart().trimEnd().split("//");
		instruction = instruction[0].trimEnd();
		if (checkIfStringStartsWith(instruction, commands)){
			line_number.push(line_count);
			line_count +=1;
		} else if (instruction.startsWith("label")){
			let label = instruction.split(/\s+/);
			if (label.length < 2){
				alert("Label missing: " + element);
			} else {
				if (labels.has(label[1])){
					alert("Label already exists: " + element);
				} else {
					labels.set(label[1],line_count);
					line_number.push('L');
				}
			}
		} else if (instruction.startsWith("function")){
			let func = instruction.split(/\s+/);
			if (func.length < 3){
				alert("Error in function declaration: " + element);
			} else {
				if (functions.has(func[1])){
					alert("Function already exists: " + element);
				} else {
					functions.set(func[1],line_count);
					locals.set(func[1],parseInt(func[2]));
					line_number.push('F');
					
					document.getElementById("last_line").innerText = locals.get(func[1]);
				}
			} 
		} else {
			line_number.push('U');
		}
	});
}

function is_valid_instruction(line) {
	let instruction = line.trimStart().trimEnd().split("//");
	instruction = instruction[0].trimEnd();
	instruction = instruction.split(/\s+/);
	if (checkIfStringStartsWith(instruction[0], ['add','sub','neg','not','and','or','eq', 'gt', 'lt', 'return'])){
		if (instruction.length == 1){
			return instruction
		} else {
			alert("Wrong instruction: " + line);
			return -1
		}
	} else if (checkIfStringStartsWith(instruction[0], ['goto', 'if-goto'])){
		if (instruction.length == 2){
			return instruction
		} else {
			alert("Wrong instruction: " + line);
			return -1
		}
	} else if (checkIfStringStartsWith(instruction[0], ['call', 'push', 'pop'])){
		if (instruction.length == 3){
			return instruction
		} else {
			alert("Wrong instruction: " + line);
			return -1
		}
	} else {
		alert("Wrong instruction: " + line);
		return -1
	}
}

function execute_line(line) {
	let mnemnonic = is_valid_instruction(line);
	let new_value = 0;
	let value1 = 0;
	let value2 = 0;
	let SP = RAM[0];		
	let LCL = RAM[1];
	let ARG = RAM[2];
	let THIS = RAM[3];
	let THAT = RAM[4];
	if (mnemnonic != -1){
		switch (mnemnonic[0]) {
			case "add":
				value1 = RAM[SP-1];
				value2 = RAM[SP-2];
				new_value = value1 + value2;
				if (new_value > 65535){
					new_value -= 65536;
				} else if (new_value < 0){
					new_value += 65536;
				}
				RAM[SP-2] = new_value;
				RAM[0] = SP - 1;
				regPC += 1;
				break;
			case "sub":
				value1 = RAM[SP-1];
				value2 = RAM[SP-2];
				new_value = value2 - value1;
				if (new_value > 65535){
					new_value -= 65536;
				} else if (new_value < 0){
					new_value += 65536;
				}
				RAM[SP-2] = new_value;
				RAM[0] = SP - 1;
				regPC += 1;
				break;
			case "neg":
				new_value = 65536-RAM[SP-1];
				RAM[SP-1] = new_value;
				regPC += 1;
				break;
			case "not":
				new_value = 65536-RAM[SP-1]-1;
				RAM[SP-1] = new_value;
				regPC += 1;
				break;
			case "and":
				value1 = RAM[SP-1];
				value2 = RAM[SP-2];
				new_value = value1 & value2;
				RAM[SP-2] = new_value;
				RAM[0] = SP - 1;
				regPC += 1;
				break;
			case "or":
				value1 = RAM[SP-1];
				value2 = RAM[SP-2];
				new_value = value1 | value2;
				RAM[SP-2] = new_value;
				RAM[0] = SP - 1;
				regPC += 1;
				break;
			case "eq":
				if (RAM[SP-2] == RAM[SP-1]){
					RAM[SP-2] = 65535;
				} else {
					RAM[SP-2] = 0;
				}
				RAM[0] = SP - 1;
				regPC += 1;
				break;
			case "gt":
				if (((RAM[SP-2] - RAM[SP-1]) < 32768) && ((RAM[SP-2] - RAM[SP-1]) > 0)) {
					RAM[SP-2] = 65535;
				} else {
					RAM[SP-2] = 0;
				}
				RAM[0] = SP - 1;
				regPC += 1;
				break;
			case "lt":
				if ((RAM[SP-2] - RAM[SP-1]) < 0) {
					RAM[SP-2] = 65535;
				} else {
					RAM[SP-2] = 0;
				}
				RAM[0] = SP - 1;
				regPC += 1;
				break;
			case "goto":
				if (labels.has(mnemnonic[1])) {
					regPC = labels.get(mnemnonic[1]);
				}
				break;
			case "if-goto":
				if (RAM[SP-1] == 65535){
					if (labels.has(mnemnonic[1])) {
						regPC = labels.get(mnemnonic[1]);
					}
				} else {
					regPC += 1;
				}
				RAM[0] = SP - 1;
				break;
			case "push":
				if (parseInt(mnemnonic[2]) > 65535 || parseInt(mnemnonic[2]) < 0){
						alert("Wrong value: " + line);
				} else {
					if (mnemnonic[1] === "constant"){
						RAM[SP] = parseInt(mnemnonic[2]);							
					} else if (mnemnonic[1] === "argument"){
						RAM[SP] = RAM[ARG+parseInt(mnemnonic[2])];
					} else if (mnemnonic[1] === "local"){
						RAM[SP] = RAM[LCL+parseInt(mnemnonic[2])];
					} else if (mnemnonic[1] === "this"){
						RAM[SP] = RAM[THIS+parseInt(mnemnonic[2])];
					} else if (mnemnonic[1] === "that"){
						RAM[SP] = RAM[THAT+parseInt(mnemnonic[2])];
					} else if (mnemnonic[1] === "pointer"){
						if (parseInt(mnemnonic[2]) == 0){
							RAM[SP] = RAM[3];
						} else if (parseInt(mnemnonic[2]) == 1){
							RAM[SP] = RAM[4];
						} else {
							alert("Wrong pointer: " + line);
						}							
					} else if (mnemnonic[1] === "temp"){
						if (parseInt(mnemnonic[2]) <= 7){
							RAM[SP] = RAM[5+parseInt(mnemnonic[2])];
						} else {
							alert("Wrong temp: " + line);
						}	
					} else if (mnemnonic[1] === "static"){
						if (parseInt(mnemnonic[2]) <= 239){
							RAM[SP] = RAM[16+parseInt(mnemnonic[2])];
						} else {
							alert("Wrong static: " + line);
						}	
					} else {
							alert("Wrong segment: " + line);
					}	
				}
				RAM[0] = SP+1;
				regPC += 1;
				break;
			case "pop":
				if (mnemnonic[1] === "argument"){
					RAM[ARG+parseInt(mnemnonic[2])] = RAM[SP-1];
				} else if (mnemnonic[1] === "local"){
					RAM[LCL+parseInt(mnemnonic[2])] = RAM[SP-1];
				} else if (mnemnonic[1] === "this"){
					RAM[THIS+parseInt(mnemnonic[2])] = RAM[SP-1];
				} else if (mnemnonic[1] === "that"){
					RAM[THAT+parseInt(mnemnonic[2])] = RAM[SP-1];
				} else if (mnemnonic[1] === "pointer"){
					if (parseInt(mnemnonic[2]) == 0){
						RAM[3] = RAM[SP-1];
					} else if (parseInt(mnemnonic[2]) == 1){
						RAM[4] = RAM[SP-1];
					} else {
						alert("Wrong pointer: " + line);
					}							
				} else if (mnemnonic[1] === "temp"){
					if (parseInt(mnemnonic[2]) <= 7){
						RAM[5+parseInt(mnemnonic[2])] = RAM[SP-1];
					} else {
						alert("Wrong temp: " + line);
					}	
				} else if (mnemnonic[1] === "static"){
					if (parseInt(mnemnonic[2]) <= 239){
						RAM[16+parseInt(mnemnonic[2])] = RAM[SP-1];
					} else {
						alert("Wrong static: " + line);
					}	
				} else {
						alert("Wrong segment: " + line);
				}	
				RAM[0] = SP-1;
				regPC += 1;
				break;
			case "call":
				ARG_new =  SP - parseInt(mnemnonic[2]);
				//saving return
				PC_old = regPC+1;
				RAM[SP] = PC_old;
				SP += 1;
				//LCL
				LCL_old = RAM[1];
				RAM[SP] = LCL_old;
				SP += 1;
				//ARG
				ARG_old = RAM[2];
				RAM[SP] = ARG_old;
				SP += 1;
				//THIS
				THIS_old = RAM[3];
				RAM[SP] = THIS_old;
				SP += 1;
				//THAT
				THAT_old = RAM[4];
				RAM[SP] = THAT_old;
				SP += 1;
				//new values
				RAM[1] = SP;
				RAM[2] = ARG_new;
				RAM[0] = SP + parseInt(mnemnonic[2]);
				regPC = functions.get(mnemnonic[1]);
				break;
			case "return":
				//saving result
				RAM[RAM[2]] = RAM[SP-1];
				//SP
				RAM[0] = RAM[2]+1;
				//returning values
				RAM[1] = LCL_old;
				RAM[2] = ARG_old;
				RAM[3] = THIS_old;
				RAM[4] = THAT_old;
				regPC = PC_old;
				break;
		}
	}
}
