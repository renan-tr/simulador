const no_RAM = 100;
const instructio_length = 18;
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

draw_cpu("-1",0,0,0,0);

function run_code(){
	regA = 0, regD = 0, regPC = 0;
	instruction_count = 0;
	//Reading
	code = document.getElementById("textarea").value.split(/\n/);
	for(i=0;i<no_RAM;i++) {
		let valor = document.getElementById("RAM"+i).value;
		RAM[i] = parseInt(valor, 2);
	}

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
}

function run_line(){
	if (regPC == -1){
		//Reading
		code = document.getElementById("textarea").value.split(/\n/);
		for(i=0;i<no_RAM;i++) {
			let valor = document.getElementById("RAM"+i).value;
			RAM[i] = parseInt(valor, 2);
		}
		
		read_code();
		regPC = 0;
	}		

	//executing		
	if (line_number.indexOf(regPC) != -1){
		execute_line(code[line_number.indexOf(regPC)]);	
	}		
			
	//showing
	for(i=0;i<no_RAM;i++) {
		document.getElementById("RAM"+i).value = RAM[i].toString(2).padStart(16, '0');
	}
}

function reset_values(){
	regA = 0, regD = 0,	regPC = -1;
	instruction_count = 0, line_count = 0;
	labels = new Map();
	vars = new Map();
	line_number = [];

	document.getElementById("last_line").innerText = "";
	document.getElementById("alu_op").innerText = "";

	for(i=0;i<no_RAM;i++) {
		RAM[i] = 0;
		document.getElementById("RAM"+i).value = RAM[i].toString(2).padStart(16, '0');		
	}
	draw_cpu("-1",0,0,0,0);
}

function checkIfStringStartsWith(str, substrs) {
	return substrs.some(substr => str.startsWith(substr));
}

function read_code(){
	line_count = 0;
	code.forEach((element) =>{
		let instruction = element.trimStart().trimEnd().split(";");
		instruction = instruction[0].trimEnd();
		if (is_valid_instruction(instruction)){
			line_number.push(line_count);
			line_count +=1;
		} 
	});
}

function isBinaryStringRegex(str) {
  return /^[01]+$/.test(str);
}

function is_valid_instruction(line) {
	if (isBinaryStringRegex(line)){
		if (line.length == instructio_length){
			return true
		} else{
			alert("Wrong instruction: " + line);
			return false;
		}
	} else{
		alert("Wrong instruction: " + line);
		return false;
	}
}

function execute_line(line) {
	if (is_valid_instruction(line)){
		let tipo = line.substring(0, 1);
		let output_alu = 0;

		if (tipo === "0"){
			let value = parseInt(line.substring(2), 2);
			regA = value;
			regPC += 1;
			document.getElementById("alu_op").innerText = "";
		} else if (tipo === "1"){
			let operation = line.substring(4 ,11);
			let destination = line.substring(12, 15);
			let jump = line.substring(15);		

			document.getElementById("last_line").innerText = line;

			switch (operation) {
				case "0101010":
					output_alu = 0;
					document.getElementById("alu_op").innerText = operation + " -> '0' ";
					break;
				case "0111111":
					output_alu = 1;
					document.getElementById("alu_op").innerText = operation + " -> '1' ";
					break;
				case "0111010":
					output_alu = -1;
					document.getElementById("alu_op").innerText = operation + " -> '-1' ";
					break;
				case "0001100":
					output_alu = regD;
					document.getElementById("alu_op").innerText = operation + " -> D ";
					break;
				case "0110000":
					output_alu = regA;
					document.getElementById("alu_op").innerText = operation + " -> A ";
					break;
				case "1110000":
					output_alu = RAM[regA];
					document.getElementById("alu_op").innerText = operation + " -> RAM[A] ";
					break;
				case "0001101":
					output_alu = -regD -1;
					output_alu += 65536;
					document.getElementById("alu_op").innerText = operation + " -> not D ";
					break;
				case "0110001":
					output_alu = -regA -1;
					output_alu += 65536;
					document.getElementById("alu_op").innerText = operation + " -> not A ";
					break;
				case "1110001":
					output_alu = -RAM[regA] -1;
					output_alu += 65536;
					document.getElementById("alu_op").innerText = operation + " -> not RAM[A] ";
					break;
				case "0001111":
					output_alu = -regD;
					output_alu += 65536;
					document.getElementById("alu_op").innerText = operation + " -> -D ";
					break;
				case "0110011":
					output_alu = -regA;
					output_alu += 65536;
					document.getElementById("alu_op").innerText = operation + " -> -A ";
					break;
				case "1110011":
					output_alu = -RAM[regA];
					output_alu += 65536;
					document.getElementById("alu_op").innerText = operation + " -> -RAM[A] ";
					break;
				case "0011111":
					if (regD == 65535){
						output_alu = 0;
					} else {
						output_alu = regD+1;
					}
					document.getElementById("alu_op").innerText = operation + " -> D+1 ";
					break;
				case "0110111":
					if (regA == 65535){
						output_alu = 0;
					} else {
						output_alu = regA+1;
					}
					document.getElementById("alu_op").innerText = operation + " -> A+1 ";
					break;
				case "1110111":
					if (RAM[regA] == 65535){
						output_alu = 0;
					} else {
						output_alu = RAM[regA]+1;
					}
					document.getElementById("alu_op").innerText = operation + " -> RAM[A]+1 ";
					break;
				case "0001110":
					if (regD == 0){
						output_alu = 65535;
					} else {
						output_alu = regD-1;
					}
					document.getElementById("alu_op").innerText = operation + " -> D-1 ";
					break;
				case "0110010":
					if (regA == 0){
						output_alu = 65535;
					} else {
						output_alu = regA-1;
					}
					document.getElementById("alu_op").innerText = operation + " -> A-1 ";
					break;
				case "1110010":
					if (RAM[regA] == 0){
						output_alu = 65535;
					} else {
						output_alu = RAM[regA]-1;
					}
					document.getElementById("alu_op").innerText = operation + " -> RAM[A]-1 ";
					break;
				case "0000010":
					output_alu = regD + regA;
					if (output_alu > 65535){
						output_alu -= 65536;
					} else if (output_alu < 0){
						output_alu += 65536;
					}
					document.getElementById("alu_op").innerText = operation + " -> D+A ";
					break;
				case "1000010":
					output_alu = regD + RAM[regA];
					if (output_alu > 65535){
						output_alu -= 65536;
					} else if (output_alu < 0){
						output_alu += 65536;
					}
					document.getElementById("alu_op").innerText = operation + " -> D+RAM[A] ";
					break;
				case "0010011":
					output_alu = regD - regA;
					if (output_alu > 65535){
						output_alu -= 65536;
					} else if (output_alu < 0){
						output_alu += 65536;
					}
					document.getElementById("alu_op").innerText = operation + " -> D-A ";
					break;
				case "1010011":
					output_alu = regD - RAM[regA];
					if (output_alu > 65535){
						output_alu -= 65536;
					} else if (output_alu < 0){
						output_alu += 65536;
					}
					document.getElementById("alu_op").innerText = operation + " -> D-RAM[A] ";
					break;
				case "0000111":
					output_alu = regA - regD;
					if (output_alu > 65535){
						output_alu -= 65536;
					} else if (output_alu < 0){
						output_alu += 65536;
					}
					document.getElementById("alu_op").innerText = operation + " -> A-D ";
					break;
				case "1000111":
					output_alu = RAM[regA] - regD;
					if (output_alu > 65535){
						output_alu -= 65536;
					} else if (output_alu < 0){
						output_alu += 65536;
					}
					document.getElementById("alu_op").innerText = operation + " -> RAM[A]-D ";
					break;
				case "0000000":
					output_alu = regA & regD;
					document.getElementById("alu_op").innerText = operation + " -> A and D ";
					break;
				case "1000000":
					output_alu = RAM[regA] & regD;
					document.getElementById("alu_op").innerText = operation + " -> RAM[A] and D ";
					break;
				case "0010101":
					output_alu = regA | regD;
					document.getElementById("alu_op").innerText = operation + " -> A or D ";
					break;
				case "1010101":
					output_alu = RAM[regA] | regD;
					document.getElementById("alu_op").innerText = operation + " -> RAM[A] or D ";
					break;
				default:
					document.getElementById("alu_op").innerText = operation;
			}

			if (destination[0] === '1'){
				RAM[regA] = output_alu;
			}
			if (destination[1] === '1'){
				regD = output_alu;
			}
			if (destination[2] === '1'){
				regA = output_alu;
			}

			switch (jump) {
				case "001":
					if ((output_alu < 32768) && (output_alu > 0)){
						regPC = regA;
					} else {
						regPC += 1;
					}
					break;
				case "010":
					if ((output_alu == 0)){
						regPC = regA;
					} else {
						regPC += 1;
					}
					break;
				case "011":
					if ((output_alu < 32768) && (output_alu >= 0)){
						regPC = regA;
					} else {
						regPC += 1;
					}
					break;
				case "100":
					if (output_alu > 32768){
						regPC = regA;
					} else {
						regPC += 1;
					}
					break;
				case "101":
					if (output_alu != 0){
						regPC = regA;
					} else {
						regPC += 1;
					}
					break;
				case "110":
					if ((output_alu > 32768) || (output_alu == 0)){
						regPC = regA;
					} else {
						regPC += 1;
					}
					break;
				case "111":
					regPC = regA;
					break;
				default:					
					regPC += 1;					
			}
		}
		draw_cpu(line,output_alu,regA,regD,regPC);
	}	
}

function draw_cpu(line,output_alu,regA,regD,regPC){	
	const canvas = document.getElementById("DiagramaCanvas");
	const ctx = canvas.getContext("2d");

	ctx.fillStyle = "darkgray";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	/*RegD*/
	draw_reg(ctx, 200, 50, 100, 20, "darkgreen", 2, "lightgreen", "Reg %D");

	/*RegA*/
	draw_reg(ctx, 200, 120, 100, 20, "darkgreen", 2, "lightgreen", "Reg %A");
			
	/*PC*/
	draw_reg(ctx, 450, 220, 100, 20, "darkgreen", 2, "lightgreen", "PC");

	/*ALU*/
	draw_alu(ctx, 450, 30, 60, 140, 60, 20, "black", 2, "purple");

	/*MUXALUI*/
	draw_mux(ctx, 100, 100, 20, 60, 26, 'black', 2, "purple");

	/*MUXAM*/
	draw_mux(ctx, 370, 115, 20, 60, 26, 'black', 2, "purple");

	/*Linha ROM-MUXALUI*/
	draw_arrow(ctx, 0, 145, 100, 145, 14, 'black', 2);
	/*Linha MUXALUI-RegA*/
	draw_arrow(ctx, 120, 130, 200, 130, 14, 'black', 2);
	/*Linha RegA-MUXAM*/
	draw_arrow(ctx, 300, 130, 370, 130, 14, 'black', 2);
	/*Linha MUXAM-ALU*/
	draw_arrow(ctx, 390, 145, 450, 145, 14, 'black', 2);	
	/*Linha RegD-ALU*/
	draw_arrow(ctx, 300, 60, 450, 60, 14, 'black', 2);
	/*Linha ALU-RAM-Regs*/
	draw_line(ctx, 510, 100, 550, 100, 'black', 2);
	draw_arrow(ctx, 550, 100, 600, 100, 14, 'black', 2);
	draw_dot(ctx, 550, 100, 'black', 5);
	draw_line(ctx, 550, 100, 550, 15, 'black', 2);
	draw_line(ctx, 70, 15, 550, 15, 'black', 2);
	draw_line(ctx, 70, 15, 70, 115, 'black', 2);
	draw_arrow(ctx, 70, 115, 100, 115, 14, 'black', 2);
	draw_dot(ctx, 70, 60, 'black', 5);
	draw_arrow(ctx, 70, 60, 200, 60, 14, 'black', 2);
	/*Linha RegA-RAM-PC*/
	draw_dot(ctx, 310, 130, 'black', 5);
	draw_line(ctx, 310, 130, 310, 230, 'black', 2);
	draw_arrow(ctx, 310, 230, 450, 230, 14, 'black', 2);
	draw_dot(ctx, 310, 190, 'black', 5);
	draw_arrow(ctx, 310, 190, 600, 190, 14, 'black', 2);
	/*Linha PC-ROM*/
	draw_line(ctx, 550, 230, 570, 230, 'black', 2);
	draw_line(ctx, 570, 230, 570, 250, 'black', 2);
	draw_arrow(ctx, 570, 250, 0, 250, 14, 'black', 2);
	/*Linha RAM-MUXAM*/
	draw_line(ctx, 600, 270, 230, 270, 'black', 2);
	draw_line(ctx, 230, 270, 230, 160, 'black', 2);
	draw_arrow(ctx, 230, 160, 370, 160, 14, 'black', 2);
	
	if (line !== "-1"){
		if (line[0] === '0'){
			//Insctruction A
			/*Linha ROM-MUXALUI*/
			draw_arrow(ctx, 0, 145, 100, 145, 14, 'blue', 2);
			/*Linha MUXALUI-RegA*/
			draw_arrow(ctx, 120, 130, 200, 130, 14, 'blue', 2);
		} else{
			let operation = line.substring(4 ,11);
			let destination = line.substring(12, 15);
			let jump = line.substring(15);

			switch (operation) {
				case "0001100":
				case "0001101":
				case "0001111":
				case "0011111":
				case "0001110":
					/*Linha RegD-ALU*/
					draw_arrow(ctx, 300, 60, 450, 60, 14, 'blue', 2);
					break;
				case "1110000":
				case "1110001":
				case "1110011":
				case "1110111":
				case "1110010":
					draw_line(ctx, 600, 270, 230, 270, 'blue', 2);
					draw_line(ctx, 230, 270, 230, 160, 'blue', 2);
					draw_arrow(ctx, 230, 160, 370, 160, 14, 'blue', 2);
					/*Linha MUXAM-ALU*/
					draw_arrow(ctx, 390, 145, 450, 145, 14, 'blue', 2);
					break;
				case "0110000":
				case "0110001":
				case "0110011":
				case "0110111":
				case "0110010":
					/*Linha RegA-MUXAM*/
					draw_arrow(ctx, 300, 130, 370, 130, 14, 'blue', 2);
					/*Linha MUXAM-ALU*/
					draw_arrow(ctx, 390, 145, 450, 145, 14, 'blue', 2);
					break;
				case "1000010":
				case "1010011":
				case "1000111":
				case "1000000":
				case "1010101":
					draw_line(ctx, 600, 270, 230, 270, 'blue', 2);
					draw_line(ctx, 230, 270, 230, 160, 'blue', 2);
					draw_arrow(ctx, 230, 160, 370, 160, 14, 'blue', 2);
					/*Linha MUXAM-ALU*/
					draw_arrow(ctx, 390, 145, 450, 145, 14, 'blue', 2);
					break;
				case "0000010":
				case "0010011":
				case "0000111":
				case "0000000":
				case "0010101":
					/*Linha RegD-ALU*/
					draw_arrow(ctx, 300, 60, 450, 60, 14, 'blue', 2);
					/*Linha RegA-MUXAM*/
					draw_arrow(ctx, 300, 130, 370, 130, 14, 'blue', 2);
					/*Linha MUXAM-ALU*/
					draw_arrow(ctx, 390, 145, 450, 145, 14, 'blue', 2);
					break;
			}

			if (destination[2] === '1'){
				/*Linha ALU-RAM-Regs*/
				draw_line(ctx, 510, 100, 550, 100, 'blue', 2);
				draw_dot(ctx, 550, 100, 'blue', 5);
				draw_line(ctx, 550, 100, 550, 15, 'blue', 2);
				draw_line(ctx, 70, 15, 550, 15, 'blue', 2);
				draw_line(ctx, 70, 15, 70, 115, 'blue', 2);
				draw_arrow(ctx, 70, 115, 100, 115, 14, 'blue', 2);
				/*Linha MUXALUI-RegA*/
				draw_arrow(ctx, 120, 130, 200, 130, 14, 'blue', 2);
			}
			if (destination[1] === '1'){
				/*Linha ALU-RAM-Regs*/
				draw_line(ctx, 510, 100, 550, 100, 'blue', 2);
				draw_dot(ctx, 550, 100, 'blue', 5);
				draw_line(ctx, 550, 100, 550, 15, 'blue', 2);
				draw_line(ctx, 70, 15, 550, 15, 'blue', 2);
				draw_line(ctx, 70, 15, 70, 60, 'blue', 2);
				draw_dot(ctx, 70, 60, 'blue', 5);
				draw_arrow(ctx, 70, 60, 200, 60, 14, 'blue', 2);
			}
			if (destination[0] === '1'){
				/*Linha ALU-RAM-Regs*/
				draw_line(ctx, 510, 100, 550, 100, 'blue', 2);
				draw_arrow(ctx, 550, 100, 600, 100, 14, 'blue', 2);
				/*Linha RegA-RAM-PC*/
				draw_dot(ctx, 310, 130, 'blue', 5);
				draw_line(ctx, 310, 130, 310, 190, 'blue', 2);
				draw_dot(ctx, 310, 190, 'blue', 5);
				draw_arrow(ctx, 310, 190, 600, 190, 14, 'blue', 2);
			}

			switch (jump) {
				case "001":
					if ((output_alu < 32768) && (output_alu > 0)){
						/*Linha RegA-RAM-PC*/
						draw_dot(ctx, 310, 130, 'blue', 5);
						draw_line(ctx, 310, 130, 310, 230, 'blue', 2);
						draw_arrow(ctx, 310, 230, 450, 230, 14, 'blue', 2);
					}
					break;
				case "010":
					if ((output_alu == 0)){
						/*Linha RegA-RAM-PC*/
						draw_dot(ctx, 310, 130, 'blue', 5);
						draw_line(ctx, 310, 130, 310, 230, 'blue', 2);
						draw_arrow(ctx, 310, 230, 450, 230, 14, 'blue', 2);
					}
					break;
				case "011":
					if ((output_alu < 32768) && (output_alu >= 0)){
						/*Linha RegA-RAM-PC*/
						draw_dot(ctx, 310, 130, 'blue', 5);
						draw_line(ctx, 310, 130, 310, 230, 'blue', 2);
						draw_arrow(ctx, 310, 230, 450, 230, 14, 'blue', 2);
					}
					break;
				case "100":
					if (output_alu > 32768){
						/*Linha RegA-RAM-PC*/
						draw_dot(ctx, 310, 130, 'blue', 5);
						draw_line(ctx, 310, 130, 310, 230, 'blue', 2);
						draw_arrow(ctx, 310, 230, 450, 230, 14, 'blue', 2);
					}
					break;
				case "101":
					if (output_alu != 0){
						/*Linha RegA-RAM-PC*/
						draw_dot(ctx, 310, 130, 'blue', 5);
						draw_line(ctx, 310, 130, 310, 230, 'blue', 2);
						draw_arrow(ctx, 310, 230, 450, 230, 14, 'blue', 2);
					}
					break;
				case "110":
					if ((output_alu > 32768) || (output_alu == 0)){
						/*Linha RegA-RAM-PC*/
						draw_dot(ctx, 310, 130, 'blue', 5);
						draw_line(ctx, 310, 130, 310, 230, 'blue', 2);
						draw_arrow(ctx, 310, 230, 450, 230, 14, 'blue', 2);
					}
					break;
				case "111":
					/*Linha RegA-RAM-PC*/
					draw_dot(ctx, 310, 130, 'blue', 5);
					draw_line(ctx, 310, 130, 310, 230, 'blue', 2);
					draw_arrow(ctx, 310, 230, 450, 230, 14, 'blue', 2);
					break;
			}
		}

		/*Writing values*/
		ctx.fillStyle = "black";
		ctx.font = '14px serif';
		ctx.textAlign = 'center';
		ctx.fillText(output_alu.toString(16).padStart(4, '0'), 550, 120);
		ctx.fillText(regD.toString(16).padStart(4, '0'), 250, 65);
		ctx.fillText(regA.toString(16).padStart(4, '0'), 250, 135);
		ctx.fillText(regPC.toString(16).padStart(4, '0'), 500, 235);
		ctx.fillText(RAM[regA].toString(16).padStart(4, '0'), 250, 175);
		ctx.fillText( parseInt(line,2).toString(16).padStart(5, '0'), 30, 160);
	} else{
		/*Writing values*/
		ctx.fillStyle = "black";
		ctx.font = '14px serif';
		ctx.textAlign = 'center';
		ctx.fillText(regPC.toString(16).padStart(4, '0'), 500, 235);
	}	
}

function draw_line(ctx, fromX, fromY, toX, toY, color, lineWidth){
	// Save the current drawing state
	ctx.save();

	// Set styling properties
	ctx.strokeStyle = color || 'black';
	ctx.lineWidth = lineWidth || 2;
	ctx.fillStyle = color || 'black';

	// Draw the main line of the arrow
	ctx.beginPath();
	ctx.moveTo(fromX, fromY);
	ctx.lineTo(toX, toY);
	ctx.stroke();

	// Restore the saved drawing state
	ctx.restore();
}

function draw_dot(ctx, X, Y, color, size){
	// Save the current drawing state
	ctx.save();

	ctx.strokeStyle = color || 'black';
	ctx.fillStyle = color || 'black';

	ctx.beginPath();
    ctx.arc(X, Y, size, 0, 2 * Math.PI); 
    ctx.lineWidth = 1
    ctx.stroke();
	ctx.fill();

	// Restore the saved drawing state
	ctx.restore();	
}

function draw_arrow(ctx, fromX, fromY, toX, toY, arrowHeadSize, color, lineWidth){
	// Save the current drawing state
	ctx.save();

	// Set styling properties
	ctx.strokeStyle = color || 'black';
	ctx.lineWidth = lineWidth || 2;
	ctx.fillStyle = color || 'black';

	// Draw the main line of the arrow
	ctx.beginPath();
	ctx.moveTo(fromX, fromY);
	ctx.lineTo(toX, toY);
	ctx.stroke();

	// Calculate the angle of the line
	const angle = Math.atan2(toY - fromY, toX - fromX);

	// Draw the arrowhead
	ctx.beginPath();
					ctx.moveTo(toX, toY);
	ctx.lineTo(
		toX - arrowHeadSize * Math.cos(angle - Math.PI / 6),
		toY - arrowHeadSize * Math.sin(angle - Math.PI / 6)
	);
	ctx.lineTo(
		toX - arrowHeadSize * Math.cos(angle + Math.PI / 6),
		toY - arrowHeadSize * Math.sin(angle + Math.PI / 6)
	);
	ctx.closePath();
	ctx.fill();

	// Restore the saved drawing state
	ctx.restore();	
}	

function draw_mux(ctx, fromX, fromY, width, heigth, heigth2, linecolor, lineWidth, fillcolor){
	// Save the current drawing state
	ctx.save();

	// Set styling properties
	ctx.strokeStyle = linecolor || 'black';
	ctx.lineWidth = lineWidth || 2;
	ctx.fillStyle = fillcolor || 'black';

	// Drawing
	ctx.beginPath();
	ctx.moveTo(fromX, fromY);
	ctx.lineTo(fromX, fromY+heigth);
	ctx.lineTo(fromX+width, fromY+(heigth+heigth2)/2);
	ctx.lineTo(fromX+width, fromY+(heigth-heigth2)/2);
	ctx.closePath();

	ctx.fill();
	ctx.stroke();

	// Restore the saved drawing state
	ctx.restore();	
}

function draw_alu(ctx, fromX, fromY, width, heigth, heigth2, detailsize, linecolor, lineWidth, fillcolor){
	// Save the current drawing state
	ctx.save();

	// Set styling properties
	ctx.strokeStyle = linecolor || 'black';
	ctx.lineWidth = lineWidth || 2;
	ctx.fillStyle = fillcolor || 'black';

	// Drawing
	ctx.beginPath();
	ctx.moveTo(fromX, fromY);
	ctx.lineTo(fromX, fromY+(heigth-detailsize)/2);
	ctx.lineTo(fromX+detailsize, fromY+heigth/2);
	ctx.lineTo(fromX, fromY+(heigth+detailsize)/2);
	ctx.lineTo(fromX, fromY+heigth);
	ctx.lineTo(fromX+width, fromY+(heigth+heigth2)/2);
	ctx.lineTo(fromX+width, fromY+(heigth-heigth2)/2);
	ctx.closePath();

	ctx.fill();
	ctx.stroke();

	// Restore the saved drawing state
	ctx.restore();	
}

function draw_reg(ctx, fromX, fromY, width, heigth, linecolor, lineWidth, fillcolor, name){
	// Save the current drawing state
	ctx.save();

	// Set styling properties
	ctx.strokeStyle = linecolor || 'black';
	ctx.lineWidth = lineWidth || 2;
	ctx.fillStyle = fillcolor || 'black';

	// Drawing
	ctx.fillRect(fromX, fromY, width, heigth);
	ctx.strokeRect(fromX, fromY, width, heigth);
	ctx.fillStyle = "black";
	ctx.font = '18px serif';
	ctx.textAlign = 'center';
	ctx.fillText(name, fromX+width/2, fromY-5);

	// Restore the saved drawing state
	ctx.restore();	
}


