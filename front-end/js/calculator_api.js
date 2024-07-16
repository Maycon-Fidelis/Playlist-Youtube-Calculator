// Pegando os valores que serão impressos no front-end //

const titulo_youtube = document.getElementById('titulo_youtube');
const criador = document.getElementById('criador');
const videos = document.getElementById('videos');
const link = document.getElementById('link');
const img = document.getElementById('img');

const select1 = document.getElementById('select1');
const value1 = document.getElementById('value1');

const select2 = document.getElementById('select2');
const value2 = document.getElementById('value2');

var btn_search = document.getElementById('btn-search');
var form_youtube = document.getElementById('search_youtube');

const block = document.getElementById('block');
const block1 = document.getElementById('block1');
const block2 = document.getElementById('block2');

const tempo = document.getElementById('tempo');
const quantiade_videos = document.getElementById('quantiade_videos');

const select1_video = document.getElementById('select1_video');
const select2_video = document.getElementById('select2_video');
var array;
// Pegando os valores que serão impressos no front-end //

// Fazendo a requisição pelo back-end //

function requisicao_informacoes(url) {

    fetch(`https://playlist-youtube-calculator-production.up.railway.app?url=${(url)}`)
        .then(response => response.json())
        .then(data => {
            if ('error' in data) {
                block.style.display = 'block';
                block1.style.display = 'none';
                block2.style.display = 'none';
            } else {
                block.style.display = 'none';
                block1.style.display = 'block';
                block2.style.display = 'block';
                titulo_youtube.textContent = data.titulo;
                criador.textContent = data.criador;
                videos.textContent = data.QntdVideo;
                link.href = data.playlistLink;
                img.src = data.thumbnail;
                array = data.videoDetails;
                adicionando_valores_ao_select(array);
                calcular_tempo_playlist(0, array.length, array);
            }
        }).catch(error => {
            block.style.display = 'block';
            block1.style.display = 'none';
            block2.style.display = 'none';
            if (error.response && error.response.status === 404) {
                block.style.display = 'block';
                block1.style.display = 'none';
                block2.style.display = 'none';
            }
        })
}

// Fazendo a requisição pelo back-end //

// Ativar a função quando clicar no botão de enviar //
btn_search.addEventListener('click', function () {
    var link = form_youtube.value;
    const playlistURL = new URL(link);
    const playlistId = playlistURL.searchParams.get('list');
    if (playlistId) {
        requisicao_informacoes(link);
    } else {
        block.style.display = 'block';
    }
})
// Ativar a função quando clicar no botão de enviar //

// Adicionando valores ao select //
function adicionando_valores_ao_select(array) {

    for (var i = 1; i <= (array.length) - 1; i++) {
        var option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        select1.appendChild(option);
    }

    for (var i = 2; i <= array.length; i++) {
        var option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        select2.appendChild(option);
    }

    select2.value = parseInt(array.length);

    // Alterando valores do outro select quando um é selecionado //
    select1.addEventListener("change", function () {

        for (let i = 0; i < select2.options.length; i++) {
            if (parseInt(select1.value) >= parseInt(select2.options[i].value)) {
                select2.options[i].style.display = 'none';
            } else {
                select2.options[i].style.display = 'block';
            }
        }
        
        if (parseInt(select1.value) === parseInt(select2.value)) {
            select2.value = parseInt(select2.value) + 1;
        }

        calcular_tempo_playlist(parseInt(select1.value) - 1, parseInt(select2.value), array);

        select1_video.textContent = select1.value;
        select2_video.textContent = select2.value;

    });

    select2.addEventListener("change", function () {

        for (let i = 0; i < select1.options.length; i++) {
            if (parseInt(select2.value) <= parseInt(select1.options[i].value)) {
                select1.options[i].style.display = 'none';
            } else {
                select1.options[i].style.display = 'block';
            }
        }

        if (parseInt(select1.value) === parseInt(select2.value)) {
            select2.value = parseInt(select2.value) + 1;
        }

        calcular_tempo_playlist(parseInt(select1.value) - 1, parseInt(select2.value), array);

        select1_video.textContent = select1.value;
        select2_video.textContent = select2.value;

    });
    // Alterando valores do outro select quando um é selecionado //
    select1_video.textContent = select1.value;
    select2_video.textContent = select2.value;
}
// Adicionando valores ao select //

// Função para fazer o calculo do tempo da playlist //
function calcular_tempo_playlist(primeiro_video, ultimo_video, vetor) {

    let total_dias = 0;
    let total_horas = 0;
    let total_minutos = 0;
    let total_segundos = 0;

    for (primeiro_video; primeiro_video < ultimo_video; primeiro_video++) {
        const DuracaoIso = vetor[primeiro_video];

        const pegarDias = DuracaoIso.match(/(\d+)D/);
        const pegarHoras = DuracaoIso.match(/(\d+)H/);
        const pegarMinutos = DuracaoIso.match(/(\d+)M/);
        const pegarSegundos = DuracaoIso.match(/(\d+)S/);

        const dias = pegarDias ? parseInt(pegarDias[1]) : 0;
        const horas = pegarHoras ? parseInt(pegarHoras[1]) : 0;
        const minutos = pegarMinutos ? parseInt(pegarMinutos[1]) : 0;
        const segundos = pegarSegundos ? parseInt(pegarSegundos[1]) : 0;

        total_segundos += segundos;

        if (total_segundos >= 60) {
            total_segundos = total_segundos % 60;
            total_minutos++;
        }

        total_minutos += minutos;

        if (total_minutos >= 60) {
            total_minutos = total_minutos % 60;
            total_horas++;
        }

        total_horas += horas;

        if (total_horas >= 24) {
            total_horas = total_horas % 24;
            total_dias++;
        }

        total_dias += dias;
    
        imprimir_tempo_playlist(total_dias, total_horas, total_minutos, total_segundos);
    }
}

function imprimir_tempo_playlist(dias, horas, minutos, segundos) {
    if (minutos === 0 || minutos == null) {
        tempo.textContent = `${segundos} segundos`;
    } else if (horas === 0 || horas == null) {
        tempo.textContent = `${minutos} minutos, ${segundos} segundos`;
    } else if (dias === 0 || dias == null) {
        tempo.textContent = `${horas} horas, ${minutos} minutos, ${segundos} segundos`;
    } else {
        tempo.textContent = `${dias} dias, ${horas} horas, ${minutos} minutos, ${segundos} segundos`;
    }

}
// Função para fazer o calculo do tempo da playlist //

// Código para que os valores do select não sejam iguais //
