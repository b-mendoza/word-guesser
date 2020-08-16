{
	// esta función se encarga de generar un número aleatorio que será ocupado para seleccionar de manera aleatoria una de las letras de la palabra
	const getRandomNumber = word => {
		// esta variable se encarga de almacenar el número aleatorio, que dicho número se encontrará dentro del rango del array de la palabra
		const randomLetterIndex = Math.floor(Math.random() * (word.length - 1)) + 0;

		return randomLetterIndex;
	};

	// esta función se encarga de obtener una palabra aleatoria de la API
	const getRandomWord = async () => {
		const response = await fetch(
			'https://random-word-api.herokuapp.com/word?swear=0'
		);

		const word = await response.json();

		console.log(word);

		return word;
	};

	// esta función se encarga de obtener el input del usuario
	const getUserAnswer = word => {
		gotItAnswer = true;

		// mediante el uso del método from() de la clase Array podemos convertir el NodeList a un array
		const userField = Array.from(
			document.querySelectorAll('.user-fields__input')
		);

		// en esta variable se almacena la respuesta del usuario
		// primero se itera sobre cada letra y la función map() nos retorna un array que compone cada una de las letras de la palabra
		// después se le realiza un join() al array que contiene cada una de las letras para formar el string que contiene el input del usuario
		// finalmente para que no sea Case Sensitive se pasa a minúsculas el string
		const userAnswer = userField
			.map(inputField => inputField.value)
			.join('')
			.toLowerCase();

		checkAnswer(word, userAnswer);
	};

	// esta función se encarga de generar los input del usuario y los input donde se colocaran las letras que se irán dando como pistas de la palabra
	// además también se encarga de asignarle sus respectivos atríbutos y clase
	const createInputFields = word => {
		const wordHintFields = document.querySelector('.word-hint-fields');
		const userFields = document.querySelector('.user-fields');

		for (let i = 0; i < word.length; i++) {
			const wordHintField = document.createElement('input');
			const userField = document.createElement('input');

			wordHintField.classList.add('word-hint-fields__input');
			wordHintField.setAttribute('type', 'text');
			wordHintField.setAttribute('disabled', '');

			wordHintFields.appendChild(wordHintField);

			userField.classList.add('user-fields__input');
			userField.setAttribute('type', 'text');
			userField.setAttribute('maxlength', '1');

			userFields.appendChild(userField);
		}
	};

	// esta función se encarga de administrar todo lo relacionado a la cuenta regresiva
	const timer = word => {
		// la variable _remainingSeconds_ es en dónde se asigna la cantidad de tiempo que se le quiere dar al usuario para que adivine la palabra
		// la variable _giveLetterEach_ es en dónde se asigna el valor de cada cuántos segundos se dará una nueva pista
		let remainingSeconds = 30;
		const giveLetterEach = 7;
		const timerSeconds = document.querySelector('.timer__seconds');

		// esta función se encarga de las acciones que se realizan cada segundo
		const timerActions = () => {
			timerSeconds.innerText = remainingSeconds;

			// en la siguiente línea, mediante una variable de estado se realiza una comprobación para saber si ya se obtuvo una respuesta o no
			if (!gotItAnswer) {
				// en la siguiente línea se realiza una comprobación para saber si los segundos faltantes son diferentes a cero
				if (!(remainingSeconds === 0)) {
					// en la siguiente línea se realiza una comprobación para saber si el segundo por el cual se va es múltiplo de la variable _giveLetterEach_ y así dar una de las letras cuando lo sea
					if (remainingSeconds % giveLetterEach === 0) {
						deployHints(word);
					}

					remainingSeconds--;
					// mediante la función setTimeout() se vuelve a llamar a la función timerActions()
					setTimeout(timerActions, 1e3);
				} else {
					getUserAnswer(word);
				}
			}
		};

		return timerActions();
	};

	// esta función se encarga de comparar la respuesta del usuario con la palabra
	const checkAnswer = (word, userAnswer) => {
		const resultElement = document.querySelector('.result');
		let result;

		word === userAnswer ? (result = true) : result === false;

		if (result) {
			resultElement.classList.add('success');
			resultElement.innerText = 'Nice, you got it :D';
		} else {
			resultElement.classList.add('failed');
			resultElement.innerText = 'Sadly, you failed :(';
		}
	};

	// esta función se encarga de desplegar las pistas
	const deployHints = word => {
		if (document.querySelector('.word-length').innerText === '') {
			document.querySelector(
				'.word-length'
			).innerText = `${word.length} letters`;
		}

		// mediante el uso del método from() de la clase Array podemos convertir el NodeList a un array
		const hintFields = Array.from(
			document.querySelectorAll('.word-hint-fields__input')
		);

		// en esta varaible mediante la función split() partimos en un array cada una de las letras que contiene la palabra
		const wordArr = word.split('');

		// en esta variable se manda a llamar la función getRandomNumber()
		let randomLetterIndex = getRandomNumber(word);

		// en la siguiente línea se realiza una comprobación para saber si el número de iteraciones realizadas no es el mismo que la longitud de la palabra
		// de esta manera se evita que en dado caso a la pista le haga falta solamente una letra para ser completada no se le brinde al usuario
		if (!(numberOfIterations === wordArr.length)) {
			// en la siguiente línea se realiza una comprobación para saber si el input al cual ingresaremos la pista está vacio
			if (hintFields[randomLetterIndex].value === '') {
				hintFields[randomLetterIndex].value = wordArr[randomLetterIndex];
			} else {
				// si el input no se encuentra vacio se realizará una nueva llamada a la función hasta obtener un índice no repetido
				// de esta manera se evita desplegar la misma letra
				do {
					randomLetterIndex = getRandomNumber(word);
				} while (!(hintFields[randomLetterIndex].value === ''));

				hintFields[randomLetterIndex].value = wordArr[randomLetterIndex];
			}
		}

		numberOfIterations++;
	};

	// en esta función se encarga de controlar los llamados principales a cada una de las funciones
	const appController = async () => {
		const [word] = await getRandomWord();

		document.querySelector('.btn-submit').addEventListener('click', () => {
			getUserAnswer(word);
		});

		timer(word);

		createInputFields(word);
	};

	// -------------------------------------------------------------------------
	// VARIABLES
	// -------------------------------------------------------------------------

	const form = document.querySelector('form');
	form.addEventListener('submit', function (e) {
		e.preventDefault();
	});

	// la variable _numberOfIterations_ es la encarga de llevar la cuenta de las veces que se le han brindado pistas al usuario
	// la variable _gotItAnswer_ es la encarga de informar sobre si se ha obtenido un input del usuario
	let numberOfIterations = 1;
	let gotItAnswer = false;

	appController();
}
