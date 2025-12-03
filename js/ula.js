let x_value = 0, y_value = 0, zx_out = 0, zy_out = 0, nx_out = 0, ny_out = 0, and_out = 0, add_out = 0, mux_out = 0, no_out = 0;
let zx = 0, zy = 0, nx = 0, ny = 0, f = 0, no = 0, zr = 0, ng = 0;

draw_alu(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);

function update_values(){			
	x_value = parseInt(document.getElementById("X").value,2);
	y_value = parseInt(document.getElementById("Y").value,2);

	if (document.getElementById("zx").checked){
		zx_out = 0;
		zx = 1;
	} else {
		zx_out = x_value;
		zx = 0;
	}
	if (document.getElementById("zy").checked){
		zy_out = 0;
		zy = 1;
	} else {
		zy_out = y_value;
		zy = 0;
	}
	if (document.getElementById("nx").checked){
		nx_out = 65536 - zx_out -1;
		nx = 1;
	} else {
		nx_out = zx_out;
		nx = 0;
	}
	if (document.getElementById("ny").checked){
		ny_out = 65536 - zy_out -1;
		ny = 1;
	} else {
		ny_out = zy_out;
		ny = 0;
	}
	add_out = nx_out + ny_out;
	if (add_out > 65535){
		add_out -= 65536;
	}
	and_out = nx_out & ny_out;
	if (document.getElementById("f").checked){
		mux_out = add_out;
		f = 1;
	} else {
		mux_out = and_out;
		f = 0;
	}
	if (document.getElementById("no").checked){
		no_out = 65536 - mux_out -1;
		no = 1;
	} else {
		no_out = mux_out;
		no = 0;
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
	
	draw_alu(x_value,y_value,zx,zx_out,zy,zy_out,nx,nx_out,ny,ny_out,and_out,add_out,f,mux_out,no,no_out,zr,ng);
}

function draw_alu(x_value,y_value,zx,zx_out,zy,zy_out,nx,nx_out,ny,ny_out,and_out,add_out,f,mux_out,no,no_out,zr,ng){
	const canvas = document.getElementById("DiagramaCanvas");
	const ctx = canvas.getContext("2d");

	ctx.fillStyle = "darkgray";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	/*Zx*/
	draw_ret(ctx, 200, 50, 100, 40, "darkgreen", 2, "lightgreen", "Zerador");
	/*Zy*/
	draw_ret(ctx, 200, 210, 100, 40, "darkgreen", 2, "lightgreen", "Zerador");
	/*Nx*/
	draw_ret(ctx, 400, 50, 100, 40, "darkgreen", 2, "lightgreen", "Inversor");
	/*Ny*/
	draw_ret(ctx, 400, 210, 100, 40, "darkgreen", 2, "lightgreen", "Inversor");
	/*And*/
	draw_ret(ctx, 600, 50, 60, 80, "darkgreen", 2, "lightgreen", "And");
	/*Add*/
	draw_ret(ctx, 600, 170, 60, 80, "darkgreen", 2, "lightgreen", "Add");
	/*Mux*/
	draw_mux(ctx, 770, 110, 30, 80, 36, 'black', 2, "purple");
	/*no*/
	draw_ret(ctx, 900, 130, 100, 40, "darkgreen", 2, "lightgreen", "Inversor");
	/*Comparador*/
	draw_ret(ctx, 1000, 210, 100, 40, "darkgreen", 2, "lightgreen", "Comparador");

	/*Linha inputX*/
	draw_arrow(ctx, 120, 70, 200, 70, 14, 'black', 2);
	/*Linha inputY*/
	draw_arrow(ctx, 120, 230, 200, 230, 14, 'black', 2);
	/*Linha Zx-Nx*/
	draw_arrow(ctx, 300, 70, 400, 70, 14, 'blue', 2);
	/*Arrow Zx*/
	draw_arrow(ctx, 250, 120, 250, 90, 14, 'black', 2);
	/*Arrow Nx*/
	draw_arrow(ctx, 450, 120, 450, 90, 14, 'black', 2);
	/*Linha Zy-Ny*/
	draw_arrow(ctx, 300, 230, 400, 230, 14, 'blue', 2);
	/*Arrow Zy*/
	draw_arrow(ctx, 250, 280, 250, 250, 14, 'black', 2);
	/*Arrow Ny*/
	draw_arrow(ctx, 450, 280, 450, 250, 14, 'black', 2);
	/*Linha Nx-And*/
	draw_arrow(ctx, 500, 70, 600, 70, 14, 'black', 2);
	/*Linha Nx-Add*/
	draw_line(ctx, 500, 70, 520, 70, 'black', 2);
	draw_dot(ctx, 520, 70, 'black', 5);
	draw_line(ctx, 520, 70, 520, 190, 'black', 2);
	draw_arrow(ctx, 520, 190, 600, 190, 14, 'black', 2);
	/*Linha Ny-Add*/
	draw_arrow(ctx, 500, 230, 600, 230, 14, 'black', 2);
	/*Linha Ny-And*/
	draw_line(ctx, 500, 230, 540, 230, 'black', 2);
	draw_dot(ctx, 540, 230, 'black', 5);
	draw_line(ctx, 540, 230, 540, 110, 'black', 2);
	draw_arrow(ctx, 540, 110, 600, 110, 14, 'black', 2);
	/*Linha And-Mux*/
	draw_line(ctx, 660, 90, 710, 90, 'black', 2);
	draw_line(ctx, 710, 90, 710, 130, 'black', 2);
	draw_arrow(ctx, 710, 130, 770, 130, 14, 'black', 2);
	/*Linha Add-Mux*/
	draw_line(ctx, 660, 210, 710, 210, 'black', 2);
	draw_line(ctx, 710, 210, 710, 170, 'black', 2);
	draw_arrow(ctx, 710, 170, 770, 170, 14, 'black', 2);
	/*Linha Mux-no*/
	draw_arrow(ctx, 800, 150, 900, 150, 14, 'blue', 2);
	/*Arrow Mux*/
	draw_arrow(ctx, 785, 210, 785, 181, 14, 'black', 2);
	/*Arrow no*/
	draw_arrow(ctx, 950, 200, 950, 170, 14, 'black', 2);
	/*Linha out*/
	draw_arrow(ctx, 1000, 150, 1100, 150, 14, 'blue', 2);
	/*Linha out-comparador*/
	draw_dot(ctx, 1050, 150, 'blue', 5);
	draw_arrow(ctx, 1050, 150, 1050, 210, 14, 'blue', 2);
	draw_arrow(ctx, 1025, 250, 1025, 280, 14, 'black', 2);
	draw_arrow(ctx, 1075, 250, 1075, 280, 14, 'black', 2);

	if (zx == 0){
		/*Linha inputX*/
		draw_arrow(ctx, 120, 70, 200, 70, 14, 'blue', 2);
	} else{
		/*Arrow Zx*/
		draw_arrow(ctx, 250, 120, 250, 90, 14, 'blue', 2);
	}
	if (zy == 0){
		/*Linha inputY*/
		draw_arrow(ctx, 120, 230, 200, 230, 14, 'blue', 2);	
	} else{
		/*Arrow Zy*/
		draw_arrow(ctx, 250, 280, 250, 250, 14, 'blue', 2);
	}
	if (nx == 1){
		/*Arrow Nx*/
		draw_arrow(ctx, 450, 120, 450, 90, 14, 'blue', 2);
	}
	if (ny == 1){
		/*Arrow Ny*/
		draw_arrow(ctx, 450, 280, 450, 250, 14, 'blue', 2);
	}
	if (f == 0){
		/*Linha Nx-And*/
		draw_arrow(ctx, 500, 70, 600, 70, 14, 'blue', 2);
		/*Linha Ny-And*/
		draw_line(ctx, 500, 230, 540, 230, 'blue', 2);
		draw_dot(ctx, 540, 230, 'blue', 5);
		draw_line(ctx, 540, 230, 540, 110, 'blue', 2);
		draw_arrow(ctx, 540, 110, 600, 110, 14, 'blue', 2);
		/*Linha And-Mux*/
		draw_line(ctx, 660, 90, 710, 90, 'blue', 2);
		draw_line(ctx, 710, 90, 710, 130, 'blue', 2);
		draw_arrow(ctx, 710, 130, 770, 130, 14, 'blue', 2);
	} else{
		/*Linha Nx-Add*/
		draw_line(ctx, 500, 70, 520, 70, 'blue', 2);
		draw_dot(ctx, 520, 70, 'blue', 5);
		draw_line(ctx, 520, 70, 520, 190, 'blue', 2);
		draw_arrow(ctx, 520, 190, 600, 190, 14, 'blue', 2);
		/*Linha Ny-Add*/
		draw_arrow(ctx, 500, 230, 600, 230, 14, 'blue', 2);
		/*Linha Add-Mux*/
		draw_line(ctx, 660, 210, 710, 210, 'blue', 2);
		draw_line(ctx, 710, 210, 710, 170, 'blue', 2);
		draw_arrow(ctx, 710, 170, 770, 170, 14, 'blue', 2);
		/*Arrow Mux*/
		draw_arrow(ctx, 785, 210, 785, 181, 14, 'blue', 2);
	}
	if (no == 1){
		/*Arrow no*/
		draw_arrow(ctx, 950, 200, 950, 170, 14, 'blue', 2);
	}
	if (ng == 1){
		draw_arrow(ctx, 1025, 250, 1025, 280, 14, 'blue', 2);
	}
	if (zr == 1){
		draw_arrow(ctx, 1075, 250, 1075, 280, 14, 'blue', 2);
	}


	/*Writing values*/
	ctx.fillStyle = "black";
	ctx.font = '14px serif';
	ctx.textAlign = 'center';
	ctx.fillText( "X = " + x_value.toString(16).padStart(4, '0'), 80, 70);
	ctx.fillText( "Y = " + y_value.toString(16).padStart(4, '0'), 80, 230);
	ctx.fillText( zx_out.toString(16).padStart(4, '0'), 350, 60);
	ctx.fillText( zy_out.toString(16).padStart(4, '0'), 350, 250);
	ctx.fillText( nx_out.toString(16).padStart(4, '0'), 550, 60);
	ctx.fillText( ny_out.toString(16).padStart(4, '0'), 550, 250);
	ctx.fillText( and_out.toString(16).padStart(4, '0'), 690, 80);
	ctx.fillText( add_out.toString(16).padStart(4, '0'), 690, 230);
	ctx.fillText( mux_out.toString(16).padStart(4, '0'), 850, 170);
	ctx.fillText( no_out.toString(16).padStart(4, '0'), 1120, 150);
	/*Writing bits*/
	ctx.fillText( zx, 250, 135);
	ctx.fillText( zy, 250, 295);
	ctx.fillText( nx, 450, 135);
	ctx.fillText( ny, 450, 295);
	ctx.fillText( f,  785, 225);
	ctx.fillText( no, 950, 215);
	ctx.fillText( "ng=" + ng, 1025, 295);
	ctx.fillText( "zr=" + zr, 1075, 295);

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

function draw_ret(ctx, fromX, fromY, width, heigth, linecolor, lineWidth, fillcolor, name){
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
	ctx.font = '16px serif';
	ctx.textAlign = 'center';
	ctx.fillText(name, fromX+width/2, fromY+30);

	// Restore the saved drawing state
	ctx.restore();	
}