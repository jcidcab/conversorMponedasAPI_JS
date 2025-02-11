const apiURL = "https://mindicador.cl/api/";
let myChart = null;

// Obtiene las monedas disponibles desde la API
async function getCoins(url){
    try{
        const monedas = await fetch(url);
        const {dolar, ivp, euro, uf, utm } = await monedas.json();
        return [dolar, ivp, euro, uf, utm];
    }catch(error){
        console.log(error);
    }   
}

// Renderiza las opciones de monedas en el select
async function renderCoinOptions(url){
    try {
        const select_container = document.getElementById("select_coin");
        const coins = await getCoins(url);

        coins.forEach((coin_info)=>{
            const option = document.createElement('option');
            option.value = coin_info['codigo'];
            option.innerText = coin_info['nombre'];
            select_container.appendChild(option);
        });
    } catch (error){
        throw new Error(error);
    }
}

// Obtiene el valor actual de la moneda seleccionada
async function getCoinDetails(url, coinID){
    try{
        if(coinID){
            const coin = await fetch(`${url}${coinID}`);
            const {serie} = await coin.json();
            console.log(serie);
            const [{ valor: coinValue }] = serie;
            return coinValue;
        }else{
            alert("Selecciona una moneda");
        }
    }catch (error) {
        throw new Error(error);
    }
}

// Obtiene los datos históricos para el gráfico
async function getAndCreateDataToChart(url, coinID) {
    const coin = await fetch(`${url}${coinID}`);
    const {serie} = await coin.json();

    // Se toman los últimos 10 días
    const firstTenDays = serie.slice(0, 10);

    const labels = firstTenDays.map(({ fecha }) => moment(fecha).format('DD/MM/YYYY'));
    const data = serie.map(({valor}) => valor);
    
    return { 
        labels, 
        datasets: [{
            label: "Valores de los últimos días",
            borderColor: "rgb(255, 99, 132)",
            data,
        }]
    };
}

// Renderiza el gráfico con los datos de la moneda seleccionada
async function renderGrafica() {
    const option_selected = document.getElementById('select_coin').value;
    const data = await getAndCreateDataToChart(apiURL, option_selected);
    const config = {
        type: "line",
        data,
    };
    const canvas = document.getElementById("chart");
    
    if(myChart){
        myChart.destroy();
    }
    
    myChart = new Chart(canvas, config);
}

// Maneja la conversión al hacer clic en el botón
document.getElementById('search').addEventListener('click', async () => {
    const option_selected = document.getElementById('select_coin').value;
    const coinValue = await getCoinDetails(apiURL, option_selected);
    const inputPesos = document.getElementById("inputPesos").value;
    const answerTotal = document.getElementById("answerDivisa");
    
    const conversion = (inputPesos / coinValue).toFixed(2);
    answerTotal.innerHTML = `Resultado: ${conversion}`;
    
    renderGrafica();
});

// Inicializa las opciones de moneda
renderCoinOptions(apiURL);
