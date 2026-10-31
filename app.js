let aktualnePytania = [];
let aktualnyIndeks = 0;
let odpowiedziUzytkownika = [];
let czas = 1800; // 30 minut w sekundach
let timerInterval;

// Funkcja tasująca tablicę
function potasuj(tablica) {
    return tablica.sort(() => Math.random() - 0.5);
}

// Nawigacja między ekranami
function pokazEkran(id) {
    document.querySelectorAll('.ekran').forEach(e => e.classList.remove('aktywny'));
    document.getElementById(id).classList.add('aktywny');
}

// Start egzaminu
document.getElementById('btn-start').addEventListener('click', () => {
    // Pobierz z localStorage zablokowane pytania
    const ukryte = JSON.parse(localStorage.getItem('ukrytePytaniaKPP')) || [];
    
    // Filtruj bazę i wylosuj 30 pytań
    let dostepne = bazaPytan.filter(p => !ukryte.includes(p.id));
    if (dostepne.length < 30) {
        alert("Brakuje pytań w bazie! Masz za dużo ukrytych pytań.");
        return;
    }
    aktualnePytania = potasuj(dostepne).slice(0, 30);
    
    aktualnyIndeks = 0;
    odpowiedziUzytkownika = [];
    czas = 1800;
    
    startTimer();
    pokazPytanie();
    pokazEkran('ekran-egzaminu');
});

// Timer
function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        czas--;
        let min = Math.floor(czas / 60);
        let sec = czas % 60;
        document.getElementById('licznik-czasu').innerText = `${min}:${sec < 10 ? '0' : ''}${sec}`;
        if (czas <= 0) zakonczEgzamin();
    }, 1000);
}

// Wyświetlanie pytania
function pokazPytanie() {
    let pytanie = aktualnePytania[aktualnyIndeks];
    document.getElementById('licznik-pytan').innerText = `Pytanie ${aktualnyIndeks + 1} z 30`;
    document.getElementById('tresc-pytania').innerText = pytanie.tresc;
    
    let pojemnik = document.getElementById('opcje-odpowiedzi');
    pojemnik.innerHTML = '';
    document.getElementById('btn-nastepne').disabled = true;

    pytanie.odpowiedzi.forEach((odp, index) => {
        let div = document.createElement('div');
        div.className = 'opcja';
        div.innerText = odp;
        div.onclick = () => {
            document.querySelectorAll('.opcja').forEach(o => o.classList.remove('zaznaczona'));
            div.classList.add('zaznaczona');
            odpowiedziUzytkownika[aktualnyIndeks] = index;
            document.getElementById('btn-nastepne').disabled = false;
        };
        pojemnik.appendChild(div);
    });
}

// Następne pytanie / Zakończenie
document.getElementById('btn-nastepne').addEventListener('click', () => {
    aktualnyIndeks++;
    if (aktualnyIndeks < 30) {
        pokazPytanie();
    } else {
        zakonczEgzamin();
    }
});

function zakonczEgzamin() {
    clearInterval(timerInterval);
    let bledy = 0;
    
    aktualnePytania.forEach((pyt, i) => {
        if (odpowiedziUzytkownika[i] !== pyt.poprawna) bledy++;
    });

    let naglowek = document.getElementById('wynik-naglowek');
    if (bledy <= 3) {
        naglowek.innerText = "EGZAMIN ZDANY";
        naglowek.className = "zdany";
    } else {
        naglowek.innerText = "EGZAMIN NIEZALICZONY";
        naglowek.className = "niezaliczony";
    }
    
    document.getElementById('wynik-punkty').innerText = `Poprawne odpowiedzi: ${30 - bledy} / 30 (Błędy: ${bledy})`;
    pokazEkran('ekran-wynikow');
}

// Przegląd odpowiedzi i ukrywanie pytań
document.getElementById('btn-przeglad').addEventListener('click', () => {
    let lista = document.getElementById('lista-przegladu');
    lista.innerHTML = '';
    let ukryte = JSON.parse(localStorage.getItem('ukrytePytaniaKPP')) || [];

    aktualnePytania.forEach((pyt, i) => {
        let czyDobrze = odpowiedziUzytkownika[i] === pyt.poprawna;
        let div = document.createElement('div');
        div.className = `przeglad-pytanie ${czyDobrze ? 'dobrze' : 'zle'}`;
        
        let html = `<strong>${pyt.tresc}</strong><br>`;
        html += `Twój wybór: ${pyt.odpowiedzi[odpowiedziUzytkownika[i]] || 'Brak'}<br>`;
        html += `Poprawna odpowiedź: ${pyt.odpowiedzi[pyt.poprawna]}<br>`;
        
        // Checkbox "Nie zadawaj więcej"
        let isChecked = ukryte.includes(pyt.id) ? 'checked' : '';
        html += `<div class="checkbox-container">
            <input type="checkbox" id="ukryj-${pyt.id}" onchange="toggleUkryte(${pyt.id}, this.checked)" ${isChecked}>
            <label for="ukryj-${pyt.id}">NIE ZADAWAJ WIĘCEJ TEGO PYTANIA</label>
        </div>`;
        
        div.innerHTML = html;
        lista.appendChild(div);
    });
    pokazEkran('ekran-przegladu');
});

// Zapisywanie ukrytych pytań do localStorage
window.toggleUkryte = function(id, dodaj) {
    let ukryte = JSON.parse(localStorage.getItem('ukrytePytaniaKPP')) || [];
    if (dodaj && !ukryte.includes(id)) ukryte.push(id);
    if (!dodaj) ukryte = ukryte.filter(pid => pid !== id);
    localStorage.setItem('ukrytePytaniaKPP', JSON.stringify(ukryte));
};

document.getElementById('btn-powrot').addEventListener('click', () => pokazEkran('ekran-startowy'));
document.getElementById('btn-zakoncz-przeglad').addEventListener('click', () => pokazEkran('ekran-startowy'));
