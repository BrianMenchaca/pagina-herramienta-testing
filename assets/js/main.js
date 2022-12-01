const miModulo = (() => {
	'use strict';

	const mostrarMetricas = (codigoRaw) => {
		if (codigoRaw.length == 0) { alert("Ingrese un codigo por favor"); return }

		codigoRaw = codigoRaw.toLowerCase();
		var lineas_del_archivo = codigoRaw.split('\n').length - 1;
		var lineas_comentarios_simples = codigoRaw.split('//').length - 1;
		var lineas_de_codigo = codigoRaw.split('\n').filter(linea => linea !== "").length;
		var porcentaje_lineas_comentadas = (parseFloat((parseInt(lineas_comentarios_simples) / parseInt(lineas_de_codigo)) * 100).toFixed(2)) + "%";
		if (!isNaN(porcentaje_lineas_comentadas)) porcentaje_lineas_comentadas = 0 + "%";
		var complejidad_ciclomatica = complejidadCiclomatica(codigoRaw);
		var halstead = halsteadMetodo(codigoRaw);
		var longitudHalstead = halstead[0];
		var volumenHalstead = halstead[1];

		document.getElementById("lineastotales").textContent = lineas_del_archivo + 1;
		document.getElementById("lineascodigo").textContent = lineas_de_codigo;
		document.getElementById("lineascomentadas").textContent = lineas_comentarios_simples;
		document.getElementById("lineasporcentaje").textContent = porcentaje_lineas_comentadas;
		document.getElementById("complejidad").textContent = complejidad_ciclomatica;
		document.getElementById("longitud").textContent = longitudHalstead;
		document.getElementById("volumen").textContent = volumenHalstead;

		document.getElementById("fanIn").textContent = fanIn(codigoRaw);
		document.getElementById("fanOut").textContent = fanOut(codigoRaw);

		const recomendacion = document.getElementById("rec-list");
		let rec = document.getElementById("rec");
		while (rec !== null) {
			rec.remove();
			rec = document.getElementById("rec");
		}

		if (complejidad_ciclomatica >= 10) {
			recomendacion.innerHTML = "<li id='rec'>Se recomienda modularizar el programa</li>";
		}
		if ((parseInt(lineas_comentarios_simples) / parseInt(lineas_de_codigo)) < 0.1) {
			recomendacion.innerHTML = "<li id='rec'>Se recomienda agregar más comentarios</li>";
		}
	}

	function complejidadCiclomatica(texto) {
		var c = 0;
		var textoCopia = texto
		c += textoCopia.split("else if").length - 1;
		if (c != 0)
			textoCopia = textoCopia.replace('else if', '')
		c += textoCopia.split('if').length - 1;
		c += textoCopia.split('else').length - 1;
		c += textoCopia.split('for').length - 1;
		c += textoCopia.split('while').length - 1;
		c += textoCopia.split('||').length - 1;
		c += textoCopia.split('&&').length - 1;
		return c;
	}

	function halsteadMetodo(texto) {
		var textosSinComentarios = texto.replace(/(\/\*([\s\S]*?)\*\/)|(\/\/(.*)$)/gm, '');
		var cantidadOperadoresTotales = 0;
		var cantidadOperandosTotales = 0;
		var cantidadOperadoresUnicos = 0;
		var cantidadOperandosUnicos = 0;
		var operadores = ["+", "-", "/", "*", "int", "double", "float", ";", ":", "public", "static", "void", "&&", "||", "<=", ">=", "<", ">"];
		var operandosUnicos = [];
		var i;
		//OPERADORES UNICOS Y TOTALES.
		for (i = 0; i < operadores.length; i++) {
			if (textosSinComentarios.indexOf(operadores[i]) != -1)
				cantidadOperadoresUnicos++;
			cantidadOperadoresTotales += texto.split(operadores[i]).length - 1;
		}

		//OPERADORES TOTALES

		//OPERANDOS UNICOS Y TOTALES.
		var aAnalizar = textosSinComentarios.split(' ');
		var hasta = textosSinComentarios.split(' ').length;
		for (let j = 0; j < hasta; j++) {
			//Si no es un operador y todavia no esta en el array de operandos unicos.
			if (operadores.indexOf(aAnalizar[j]) == -1 && operandosUnicos.indexOf(aAnalizar[j]) == -1) {
				operandosUnicos.push(aAnalizar[j]);
				cantidadOperandosUnicos++;
			}
			//Si no es un operador.
			if (operadores.indexOf(aAnalizar[j]) == -1)
				cantidadOperandosTotales++;
		}
		var longitudHalstead = parseInt(cantidadOperadoresUnicos * Math.log2(cantidadOperadoresUnicos) + cantidadOperandosUnicos * Math.log2(cantidadOperandosUnicos));
		var volumenHalstead = parseFloat((cantidadOperadoresTotales + cantidadOperandosTotales) * Math.log2(cantidadOperadoresUnicos + cantidadOperandosUnicos)).toFixed(2);
		return [longitudHalstead, volumenHalstead];
	}

	function fanIn(texto) {
		var textoBuscado = document.getElementById("funciones").value;
		if (textoBuscado != undefined && textoBuscado != null && textoBuscado != "")
			return texto.split(textoBuscado.toLowerCase() + '(').length - 2;
		return 0;
	}

	function fanOut(texto) {
		var textoBuscado = document.getElementById("funciones").value;
		var textoSinEspacios = texto.trim();

		let posicionFuncion = 0;
		let posicionFin = 0;
		let cantCorchetes = 0;
		let stringFuncion = "";

		if (textoBuscado != undefined) {
			var listaCoincidencias = textoSinEspacios.split(textoBuscado.toLowerCase() + '(');
			listaCoincidencias.forEach(element => {
				let cantParentesis = 0;
				var i = 0;
				while (i < element.length && posicionFin == 0) {
					if (posicionFuncion == 0) {
						if (element[i] == ')') {
							cantParentesis++;
							if (cantParentesis > 1)
								i = element.length;
							else
								i++;
						}
						else if (element[i] == ';')
							i = element.length;
						else if (element[i] == '{')
							posicionFuncion = i;
						else
							i++;
					} else {
						if (element[i] == '{')
							cantCorchetes++;
						else if (element[i] == '}')
							cantCorchetes--;

						if (cantCorchetes == 0)
							posicionFin = i;
						i++;
					}
				}
				if (posicionFuncion != 0)
					stringFuncion = element.substring(posicionFuncion, posicionFin);
			});
		}

		var functionNames = amountDifferentFunctionCalls(stringFuncion);
		var functionNamesJoined = []
		functionNames.forEach(function (element) {
			functionNamesJoined.push(element.join(""))
		})
		var setFunctionNames = new Set(functionNamesJoined)
		var contResponse = 0
		setFunctionNames.forEach(function (element) {
			if (!(element == "if" || element == "do" || element == "while" || element == "for" || element == "switch")) {
				contResponse++;
			}
		})
		return contResponse;
	}

	function amountDifferentFunctionCalls(texto) {
		var i = 0
		var posToReturn
		var functionName = []
		var functionNames = []
		while (i < texto.length) {
			while (i < texto.length && texto[i] != '(') {
				i++;
			}
			if (texto[i] == '(') {
				posToReturn = i + 1;
				i--;
			}
			while (i < texto.length && (texto[i] == ' ' || texto[i] == '\t' || texto[i] == '\n' || texto[i] == '\r')) {
				i--;
			}

			while (i < texto.length && (texto[i] != ' ' && texto[i] != '\t' && texto[i] != '\n' && texto[i] != '\r' && texto[i] != '(' && texto[i] != '[') && i >= 0) {
				functionName.push(texto[i]);
				i--;
			}
			if (i == texto.length) {
				posToReturn = i;
			}
			if (functionName.length > 0) {
				functionNames.push(functionName.reverse())
				functionName = [];
				i = posToReturn;
			}
		}
		return functionNames;
	}

	return {
		nuevoArchivo: mostrarMetricas
	};

})();