const apiURL = "https://mindicador.cl/api/";
let myChart = null;

// Lista estática con códigos y nombres para evitar errores
const monedasPermitidas = [
  { codigo: "dolar", nombre: "Dólar" },
  { codigo: "euro", nombre: "Euro" },
  { codigo: "uf", nombre: "UF" },
  { codigo: "utm", nombre: "UTM" },
  { codigo: "ivp", nombre: "IVP" },
];

// Renderiza las opciones de monedas en el select
function renderCoinOptions() {
  const select = document.getElementById("select_coin");
  monedasPermitidas.forEach(({ codigo, nombre }) => {
    const option = document.createElement("option");
    option.value = codigo;
    option.innerText = nombre;
    select.appendChild(option);
  });
}

// Obtiene el valor actual de la moneda seleccionada
async function getCoinDetails(url, coinID) {
  try {
    const res = await fetch(`${url}${coinID}`);
    const { serie } = await res.json();
    const [{ valor: coinValue }] = serie;
    return coinValue;
  } catch (error) {
    console.error(error);
    alert("Error al obtener el valor de la moneda.");
  }
}

// Obtiene datos para el gráfico
async function getAndCreateDataToChart(url, coinID) {
  try {
    const res = await fetch(`${url}${coinID}`);
    const { serie } = await res.json();
    const datosRecientes = serie.slice(0, 10).reverse();

    const labels = datosRecientes.map(({ fecha }) =>
      moment(fecha).format("DD/MM/YYYY")
    );
    const data = datosRecientes.map(({ valor }) => valor);

    return {
      labels,
      datasets: [
        {
          label: `Valor últimos 10 días (${coinID.toUpperCase()})`,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          fill: true,
          tension: 0.3,
          data,
        },
      ],
    };
  } catch (error) {
    console.error(error);
    alert("Error al cargar el gráfico.");
  }
}

// Renderiza el gráfico
async function renderGrafica() {
  const option_selected = document.getElementById("select_coin").value;
  const data = await getAndCreateDataToChart(apiURL, option_selected);
  const config = {
    type: "line",
    data,
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" },
        title: {
          display: true,
          text: "Variación últimos 10 días",
        },
      },
    },
  };

  const canvas = document.getElementById("chart");

  if (myChart) {
    myChart.destroy();
  }

  myChart = new Chart(canvas, config);
}

// Conversión
document.getElementById("search").addEventListener("click", async () => {
  const coinID = document.getElementById("select_coin").value;
  const inputPesos = parseFloat(document.getElementById("inputPesos").value);
  const answer = document.getElementById("answerDivisa");

  if (!coinID) return alert("Selecciona una moneda");
  if (!inputPesos || inputPesos <= 0)
    return alert("Ingresa un monto válido en pesos.");

  const coinValue = await getCoinDetails(apiURL, coinID);
  const resultado = (inputPesos / coinValue).toFixed(2);
  answer.innerHTML = `<strong>Resultado:</strong> ${resultado} ${coinID.toUpperCase()}`;

  await renderGrafica();
});

// Inicializa las opciones
renderCoinOptions();
