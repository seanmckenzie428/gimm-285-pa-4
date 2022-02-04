let dropdown = document.getElementById('find');
let numberOfOptions = 100000;
let correctIndex = 50;
for (let i = 0; i < numberOfOptions; i++) {
    let option = document.createElement('option');
    if ( i === correctIndex) {
        option.innerText = 'Steelblue';
        option.style.color = 'steelblue';
        option.value = 'correct-color';
    }
    dropdown.appendChild(option);
}